# main.py

from langgraph.graph import StateGraph, END
from state import AgentState
from graph.nodes_pre import guard_layer, context_retrieval, intent_classifier
from graph.nodes_exec import (
    planner_router, 
    quick_mode_executor, 
    deep_mode_orchestrator, 
    gap_analysis_node, 
    structured_synthesis_node
)
from graph.nodes_post import format_output

def build_research_graph():
    # 1. Initialize the State Machine
    workflow = StateGraph(AgentState)

    # 2. Add Nodes from all Phases
    workflow.add_node("guard_layer", guard_layer)
    workflow.add_node("context_retrieval", context_retrieval)
    workflow.add_node("intent_classifier", intent_classifier)
    workflow.add_node("planner_router", planner_router)
    
    # Execution Nodes
    workflow.add_node("quick_mode", quick_mode_executor)
    workflow.add_node("deep_research", deep_mode_orchestrator)
    workflow.add_node("gap_analysis", gap_analysis_node)
    workflow.add_node("synthesize", structured_synthesis_node)
    
    # Output Node
    workflow.add_node("formatter", format_output)

    # 3. Define the Flow (Edges)
    workflow.set_entry_point("guard_layer")
    workflow.add_edge("guard_layer", "context_retrieval")
    workflow.add_edge("context_retrieval", "intent_classifier")

    # Conditional: Ask for clarification or proceed to Planner
    workflow.add_conditional_edges(
        "intent_classifier",
        lambda x: "planner_router" if x["is_clarified"] else END,
        {
            "planner_router": "planner_router",
            "end": END
        }
    )

    # Phase 2: Routing based on Mode (Quick vs Deep)
    workflow.add_conditional_edges(
        "planner_router",
        lambda x: x["mode"],
        {
            "quick": "quick_mode",
            "deep": "deep_research"
        }
    )

    # Phase 3: Deep Mode Loop (Iterative Research)
    workflow.add_edge("deep_research", "gap_analysis")
    workflow.add_conditional_edges(
        "gap_analysis",
        lambda x: "deep_research" if x["confidence_score"] < 0.8 else "synthesize",
        {
            "deep_research": "deep_research",
            "synthesize": "synthesize"
        }
    )

    # Phase 4: Finalize
    workflow.add_edge("quick_mode", "formatter")
    workflow.add_edge("synthesize", "formatter")
    workflow.add_edge("formatter", END)

    return workflow.compile()

# Execution Block
if __name__ == "__main__":
    research_app = build_research_graph()
    
    initial_input = {
        "query": "Explain the trade-offs between Kafka and RabbitMQ for a financial ledger system.",
        "history": [],
        "token_usage": 0
    }
    
    print("--- Starting Developer Research Agent ---")
    for event in research_app.stream(initial_input):
        for node, state in event.items():
            print(f"Node '{node}' completed.")
            if "final_report" in state:
                print(state["final_report"])