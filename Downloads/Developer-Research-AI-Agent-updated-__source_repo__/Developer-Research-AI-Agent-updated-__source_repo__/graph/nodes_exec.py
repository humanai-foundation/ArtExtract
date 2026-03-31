# graph/nodes_exec.py
from langchain_ollama import ChatOllama
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage, HumanMessage
from state import AgentState
from config import Config
import os
import re
from prompts.research_prompts import GAP_ANALYSIS_PROMPT, RESEARCH_SYNTHESIS_PROMPT
from utils.streaming import get_streaming_buffer

llm = ChatOllama(model=Config.MODEL_NAME)

# Custom DDG Tool to bypass langchain-community import issues
from duckduckgo_search import DDGS

class CustomDuckDuckGoSearch:
    def invoke(self, query):
        try:
            with DDGS() as ddgs:
                results = list(ddgs.text(query, max_results=3))
                return str(results)
        except Exception as e:
            return f"Search error: {e}"

# Initialize Search Tools
tavily_api_key = os.getenv("TAVILY_API_KEY")
if tavily_api_key:
    search_tool = TavilySearchResults(max_results=3)
else:
    search_tool = CustomDuckDuckGoSearch()


def planner_router(state: AgentState):
    """
    Planner and router. Decides between 'quick' and 'deep' mode.
    """
    history = state.get("history", [])
    history_text = ""
    if history:
        history_text = "\n\nPrevious conversation:\n" + "\n".join([
            f"{msg['role'].capitalize()}: {msg['content']}" for msg in history[-4:]
        ]) + "\n"

    prompt = ChatPromptTemplate.from_template(
        "Analyze the query complexity. "
        "If it requires simple fact checking or a short code snippet, choose 'quick'. "
        "If it requires extensive research, comparison, or architectural design, choose 'deep'. "
        "Return ONLY the single word: 'quick' or 'deep'.\n\n"
        "{history_context}"
        "Current Query: {query}"
    )
    chain = prompt | llm
    response = chain.invoke({"query": state["query"], "history_context": history_text})
    mode_raw = response.content.strip().lower()

    tokens_used = 0
    if hasattr(response, 'usage_metadata') and response.usage_metadata:
        tokens_used = response.usage_metadata.get('total_tokens', 0)

    mode = "deep" if "deep" in mode_raw else "quick"
    return {"mode": mode, "token_usage": state.get("token_usage", 0) + tokens_used}


def quick_mode_executor(state: AgentState):
    """
    Quick mode executor with token-by-token streaming.
    """
    query_id = state.get("query_id", "")
    buffer = get_streaming_buffer(query_id) if query_id else None

    full_response = ""

    # Build conversation history for context
    history = state.get("history", [])
    messages = []

    # Add conversation history (skip the very last user message — it's the current query)
    for msg in history[-6:]:
        if msg['role'] == 'user':
            messages.append(HumanMessage(content=msg['content']))
        elif msg['role'] == 'assistant':
            messages.append(SystemMessage(content=msg['content']))

    # Add current query if not already last in history
    if not messages or not isinstance(messages[-1], HumanMessage) or messages[-1].content != state["query"]:
        messages.append(HumanMessage(content=state["query"]))

    # Stream response
    for chunk in llm.stream(messages):
        token = chunk.content
        full_response += token
        if buffer:
            buffer.add_chunk(token)

    if buffer:
        buffer.mark_complete()

    tokens_used = len(full_response.split()) * 2  # Rough estimate

    return {
        "research_data": [{"content": full_response, "source": "LLM Knowledge"}],
        "final_report": full_response,
        "token_usage": state.get("token_usage", 0) + tokens_used,
        "confidence_score": 0.9,  # Quick mode is always confident
    }


def deep_mode_orchestrator(state: AgentState):
    """
    Deep mode executor: performs web search and evidence gathering.
    """
    query = state["query"]
    iteration = state.get("iterations", 0)
    gaps = state.get("gaps", [])
    history = state.get("history", [])

    # Build context-aware search query
    search_query = query
    if gaps:
        search_query = f"{query} focusing on: {', '.join(gaps[:3])}"
    elif history:
        last_user_msgs = [msg['content'] for msg in history[-2:] if msg['role'] == 'user']
        if last_user_msgs:
            search_query = query + " (context: " + "; ".join(last_user_msgs) + ")"

    print(f"DEBUG [deep_mode]: Searching for: {search_query!r} (iteration {iteration})")

    try:
        if isinstance(search_tool, TavilySearchResults):
            results = search_tool.invoke({"query": search_query})
            if isinstance(results, list):
                formatted_content = []
                for r in results:
                    if isinstance(r, dict):
                        title = r.get('title', r.get('url', 'Untitled'))
                        content_text = r.get('content', r.get('snippet', ''))
                        url = r.get('url', '')
                        formatted_content.append(f"**{title}**\n{content_text}\nSource: {url}\n")
                content = "\n---\n".join(formatted_content) if formatted_content else str(results)
            else:
                content = str(results)
        else:
            content = search_tool.invoke(search_query)
    except Exception as e:
        content = f"Search failed: {e}"

    existing_data = state.get("research_data", [])
    return {
        "research_data": existing_data + [{"content": content, "source": "Web Search"}],
        "iterations": iteration + 1,
    }


def gap_analysis_node(state: AgentState):
    """
    Gap analysis: checks research quality and identifies what's still missing.
    Returns 'confidence_score' (not research_confidence_score) so the router works correctly.
    """
    data = state.get("research_data", [])
    # FIX: was using "\\n" (literal backslash-n) — now uses real newline
    combined_content = "\n".join([d["content"] for d in data])

    history = state.get("history", [])
    history_text = ""
    if history:
        history_text = "\nConversation context: " + "; ".join([
            f"{msg['role']}: {msg['content'][:100]}" for msg in history[-3:]
        ])

    chain = GAP_ANALYSIS_PROMPT | llm
    response = chain.invoke({
        "query": state["query"] + history_text,
        "research_data": combined_content[:5000]
    })

    tokens_used = 0
    if hasattr(response, 'usage_metadata') and response.usage_metadata:
        tokens_used = response.usage_metadata.get('total_tokens', 0)

    raw_content = response.content.strip()
    print(f"DEBUG [gap_analysis]: Raw response: {raw_content[:300]}")

    # Parse confidence and gaps
    score = 0.5
    gaps = []

    try:
        import json
        # Try JSON parsing first (preferred — we ask for JSON in the prompt)
        json_match = re.search(r'\{.*\}', raw_content, re.DOTALL)
        if json_match:
            parsed = json.loads(json_match.group())
            score = float(parsed.get("confidence_score", 0.5))
            gaps = parsed.get("gaps", [])
            if isinstance(gaps, list):
                gaps = [str(g) for g in gaps]
        else:
            raise ValueError("No JSON found")
    except Exception:
        # Fallback: look for "Confidence: 0.X" pattern
        score_match = re.search(r'[Cc]onfidence[:\s]+([0-9.]+)', raw_content)
        if score_match:
            score = float(score_match.group(1))
        if "gaps" in raw_content.lower():
            gaps_str = re.split(r'[Gg]aps?:', raw_content)[-1].strip()
            gaps = [g.strip().strip('"-') for g in re.split(r'[,\n]', gaps_str) if g.strip()][:5]

    # Clamp score
    score = max(0.0, min(1.0, score))

    print(f"DEBUG [gap_analysis]: Parsed score={score}, gaps={gaps}")

    return {
        # FIX: Return as 'confidence_score' so gap_route in main.py reads it correctly
        "confidence_score": score,
        "research_confidence_score": score,  # Also set this for completeness
        "gaps": gaps,
        "token_usage": state.get("token_usage", 0) + tokens_used,
    }


def structured_synthesis_node(state: AgentState):
    """
    Structured synthesis with streaming: compiles research data into a final report.
    Passes URLs from search results explicitly so the LLM can produce real hyperlinks.
    """
    query_id = state.get("query_id", "")
    buffer = get_streaming_buffer(query_id) if query_id else None

    data = state.get("research_data", [])

    # Build enriched context: include content AND a URL reference block
    content_parts = []
    url_references = []

    for i, item in enumerate(data):
        content = item.get("content", "")
        source = item.get("source", "Unknown")
        content_parts.append(f"[Source {i+1}: {source}]\n{content}")

        # Extract URLs from the content for the evidence section
        urls_in_content = re.findall(r'https?://[^\s\)\]"\'<>]+', content)
        for url in urls_in_content[:5]:  # Cap per source
            url_references.append(url)

    combined_content = "\n\n---\n\n".join(content_parts)

    # Append a deduplicated URL list at the end of context so LLM can cite them
    if url_references:
        unique_urls = list(dict.fromkeys(url_references))  # deduplicate, preserve order
        url_block = "\n\nAVAILABLE URLS FOR EVIDENCE TRACE (use these verbatim in your links):\n"
        url_block += "\n".join(f"- {u}" for u in unique_urls[:20])
        combined_content += url_block

    history = state.get("history", [])
    history_context = ""
    if history:
        history_context = "\n\nConversation context:\n" + "\n".join([
            f"{msg['role'].capitalize()}: {msg['content']}" for msg in history[-4:]
        ]) + "\n"

    chain = RESEARCH_SYNTHESIS_PROMPT | llm
    query_with_context = state["query"] + history_context

    full_response = ""
    for chunk in chain.stream({"query": query_with_context, "context": combined_content[:9000]}):
        token = chunk.content
        full_response += token
        if buffer:
            buffer.add_chunk(token)

    if buffer:
        buffer.mark_complete()

    cleaned_report = full_response.strip()
    tokens_used = len(cleaned_report.split()) * 2

    return {
        "final_report": cleaned_report,
        "token_usage": state.get("token_usage", 0) + tokens_used,
    }
