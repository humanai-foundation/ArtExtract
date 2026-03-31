from langchain_ollama import ChatOllama
from state import AgentState
from config import Config
from memory import memory
from prompts.clarification_prompts import INTENT_ORCHESTRATOR_PROMPT
# Removed unused import: from prompts.analysis_prompts import QUERY_INTEGRITY_PROMPT
import uuid
import json
import re

llm = ChatOllama(model=Config.MODEL_NAME)

def guard_layer(state: AgentState):
    """
    Guard Budget and Token and telemetry.
    Initializes the state if needed.
    """
    return {
        "token_usage": 0,
        "budget_limit": 5000,
        "research_data": [],
        "gaps": [],
        "iterations": 0,
        "clarification_question": "",
        "history": [{"role": "user", "content": state["query"]}],
        "query_id": str(uuid.uuid4())  # Generate unique ID for streaming
    }




def intent_orchestrator(state: AgentState):
    """
    Unified Intent classification, scoring, and clarification orchestration.
    """
    history = state.get("history", [])
    history_text = "\n".join([f"{msg['role']}: {msg['content']}" for msg in history[-5:]]) if history else "No history."

    chain = INTENT_ORCHESTRATOR_PROMPT | llm
    response = chain.invoke({"query": state["query"], "history": history_text})

    tokens_used = 0
    if hasattr(response, 'usage_metadata') and response.usage_metadata:
        tokens_used = response.usage_metadata.get('total_tokens', 0)

    content = response.content.strip()
    print(f"DEBUG [intent_orchestrator] Raw LLM output: {content}")

    # Standardized Parsing with Heuristic Fallbacks
    intent = "Research"
    score = 0.5
    is_clarified = True
    clarification_question = ""

    try:
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        parsed = json.loads(json_match.group() if json_match else content)

        score = float(parsed.get("confidence_score", 0.5))
        is_clarified = bool(parsed.get("is_clear", score >= 0.8))
        clarification_question = parsed.get("clarification_question", "").strip()
        raw_category = parsed.get("category", "Research")

        category_map = {
            "BUG": "Bug Fix",
            "ARCHITECTURE": "Architecture",
            "CONCEPT": "General Question",
            "COMPARISON": "Research",
            "RESEARCH": "Research",
            "GENERAL": "General Question",
            "NON_TECHNICAL": "Non-Technical",
        }
        intent = category_map.get(raw_category.upper(), "Research")

    except (json.JSONDecodeError, ValueError) as e:
        print(f"DEBUG [intent_orchestrator] Parse failed ({e}), using fallback.")
        # Minimal fallback logic
        if score < 0.8: is_clarified = False

    if not is_clarified and not clarification_question:
        clarification_question = "Could you please provide more context about your query?"

    return {
        "confidence_score": score,
        "intent": intent,
        "is_clarified": is_clarified,
        "clarification_question": clarification_question,
        "token_usage": state.get("token_usage", 0) + tokens_used,
    }

def context_retrieval(state: AgentState):
    """
    Memory and context retrieval vector DB.
    """
    query = state["query"]
    print(f"DEBUG: Retrieving context for: {query}")

    context_docs = memory.get_context(query)
    formatted_context = "\n".join(context_docs) if context_docs else "No prior context found."

    return {"context": [formatted_context]}

# Removed intent_classifier as it is merged into intent_orchestrator