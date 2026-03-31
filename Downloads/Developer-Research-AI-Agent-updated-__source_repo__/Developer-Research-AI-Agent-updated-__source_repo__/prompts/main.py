# main.py
import sys
from langgraph.graph import StateGraph, END
from state import AgentState

# Import node functions
from graph.nodes_pre import guard_layer, context_retrieval, intent_orchestrator
from graph.nodes_exec import (
    planner_router,
    quick_mode_executor,
    deep_mode_orchestrator,
    gap_analysis_node,
    structured_synthesis_node
)
from graph.nodes_post import format_output
from langchain_ollama import ChatOllama
from prompts.clarification_prompts import CLARIFICATION_RESPONSE_PROMPT
from config import Config
from persistence import get_checkpointer


_llm = ChatOllama(model=Config.MODEL_NAME)



def build_agent():
    """Compiles the Phase 1-4 logic into a LangGraph workflow."""
    workflow = StateGraph(AgentState)

    # --- Phase 1: Pre-Processing ---
    workflow.add_node("guard", guard_layer)
    workflow.add_node("context", context_retrieval)
    workflow.add_node("intent_orchestrator", intent_orchestrator)

    # --- Phase 2: Planning ---
    workflow.add_node("planner", planner_router)

    # --- Phase 3: Execution (Dual Mode) ---
    workflow.add_node("quick_mode", quick_mode_executor)
    workflow.add_node("deep_research", deep_mode_orchestrator)
    workflow.add_node("gap_analysis", gap_analysis_node)
    workflow.add_node("synthesize", structured_synthesis_node)

    # --- Phase 4: Output ---
    workflow.add_node("formatter", format_output)

    # --- Define Logic Flow (Edges) ---
    workflow.set_entry_point("guard")
    workflow.add_edge("guard", "context")
    workflow.add_edge("context", "intent_orchestrator")


    # ── Clarification Node ────────────────────────────────────────────────
    def ask_user_node(state: AgentState):
        """
        Generates a friendly, context-specific clarification request using
        the clarification_question produced by the intent_classifier.
        Stops execution and returns mode='clarification' so the UI can
        render it with a special styled card.
        """
        clarification_question = state.get(
            "clarification_question",
            "Could you provide more context about your query?"
        )
        query = state.get("query", "")

        # Use LLM to phrase a polished, friendly clarification response
        try:
            chain = CLARIFICATION_RESPONSE_PROMPT | _llm
            response = chain.invoke({
                "query": query,
                "clarification_question": clarification_question,
            })
            msg = response.content.strip()
        except Exception as e:
            # Safe fallback if LLM call fails
            msg = (
                f"🔍 **Clarification Needed**\n\n"
                f"I need a bit more context to answer your question well.\n\n"
                f"**{clarification_question}**"
            )
            print(f"DEBUG [clarify_user] LLM call failed: {e}")

        tokens_used = 0
        if hasattr(response if 'response' in dir() else object(), 'usage_metadata') and getattr(response, 'usage_metadata', None):
            tokens_used = response.usage_metadata.get('total_tokens', 0)

        return {
            "final_report": msg,
            "is_clarified": False,   # stays False — user hasn't answered yet
            "mode": "clarification",
            "token_usage": state.get("token_usage", 0) + tokens_used,
            "history": [{"role": "assistant", "content": msg}]
        }


    # ── Intent Router ─────────────────────────────────────────────────────
    def intent_route(state):
        """Route based on clarity."""
        if state.get("is_clarified") and state.get("confidence_score", 0.0) >= 0.8:
            return "planner"
        return "clarify_user"

    workflow.add_node("clarify_user", ask_user_node)

    workflow.add_conditional_edges(
        "intent_orchestrator",
        intent_route,
        {
            "planner": "planner",
            "clarify_user": "clarify_user",
        }
    )

    workflow.add_edge("clarify_user", END)

    # Planner Router: Choose between Quick Mode and Deep Mode
    def mode_route(state):
        return "quick_mode" if state.get("mode") == "quick" else "deep_research"

    workflow.add_conditional_edges("planner", mode_route)

    # Deep Mode Loop: Research -> Analyze -> (Loop or Synthesize)
    workflow.add_edge("deep_research", "gap_analysis")
    
    def gap_route(state):
        confidence = state.get("confidence_score", 0.0)
        iterations = state.get("iterations", 0)
        if confidence < 0.8 and iterations < 3:
            return "deep_research"
        return "synthesize"

    workflow.add_conditional_edges("gap_analysis", gap_route)

    # Close the paths to Formatter
    workflow.add_edge("quick_mode", "formatter")
    workflow.add_edge("synthesize", "formatter")
    workflow.add_edge("formatter", END)

    # Use checkpointer for persistence
    checkpointer = get_checkpointer()
    return workflow.compile(checkpointer=checkpointer)


def main():
    """Main execution loop for the agent."""
    app = build_agent()
    
    from config import Config
    print(f"\n🚀 Developer Research Agent ({Config.MODEL_NAME}) Initialized.")
    print("Type 'exit' to quit.\n")
    
    while True:
        try:
            user_query = input("🔍 Enter your technical research query: ")
            if user_query.strip().lower() in ["exit", "quit"]:
                print("Goodbye!")
                break
            
            if not user_query.strip():
                continue

            initial_state = {
                "query": user_query,
                "history": [], # In a real app, persistent history
            }
            
            # Use a static thread_id for local CLI testing
            config = {"configurable": {"thread_id": "cli_session"}}


            print("\nProcessing...")
            final_report = ""
            
            # Stream updates
            for output in app.stream(initial_state, config=config):
                for key, value in output.items():

                    print(f"✅ Completed Node: [{key}]")
                    if key == "formatter":
                        final_report = value.get("final_report", "")

            print("\n" + "="*60)
            print(final_report)
            print("="*60 + "\n")
            
        except KeyboardInterrupt:
            print("\nExiting...")
            break
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    main()