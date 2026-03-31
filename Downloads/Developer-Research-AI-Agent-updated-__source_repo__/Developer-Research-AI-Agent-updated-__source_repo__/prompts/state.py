from typing import TypedDict, List, Annotated
import operator

class AgentState(TypedDict):
    query: str
    history: Annotated[list, operator.add]
    context: list
    intent: str
    is_clarified: bool
    clarification_question: str  # LLM-generated question when query is ambiguous
    mode: str
    confidence_score: float
    research_confidence_score: float
    research_data: Annotated[list, operator.add]
    final_report: str
    token_usage: int
    budget_limit: int
    gaps: list
    iterations: int
    streaming_chunk: str  # For real-time token streaming
    query_id: str  # Unique ID for streaming buffer