# graph/nodes_post.py
from state import AgentState
from memory import memory
import os
from datetime import datetime
from config import Config
from prompts.report_templates import OUTPUT_WRAPPER


def format_output(state: AgentState):
    """
    Formats the final output report and saves it to disk and memory.
    """
    report = state.get("final_report", "No report generated.")
    sources = list({d.get("source", "Unknown") for d in state.get("research_data", [])})
    confidence = state.get("confidence_score", 0.0)
    mode = state.get("mode", "unknown")
    token_usage = state.get("token_usage", 0)

    # Safely format the wrapper (sources is already a list, convert to string)
    formatted = OUTPUT_WRAPPER.format(
        report=report,
        sources=", ".join(sources) if sources else "LLM Knowledge",
        confidence_score=float(confidence),
        mode=mode,
        token_usage=int(token_usage),
    )

    # Save interaction to long-term memory (Qdrant)
    try:
        memory.add_memory(
            text=f"Query: {state.get('query')}\nResponse: {report[:2000]}",
            metadata={
                "intent_confidence": float(confidence),
                "research_confidence": float(state.get("research_confidence_score", 0.0)),
                "mode": mode,
            }
        )
    except Exception as e:
        print(f"⚠️ Memory save failed: {e}")

    # Save to Markdown file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"research_report_{timestamp}.md"
    filepath = os.path.join(Config.OUTPUT_DIR, filename)

    try:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(formatted)
        print(f"✅ Report saved to: {filepath}")
    except Exception as e:
        print(f"⚠️ Report file save failed: {e}")

    return {
        "final_report": formatted,
        "token_usage": token_usage,
        "mode": mode,
        "confidence_score": confidence,
        "history": [{"role": "assistant", "content": formatted}],
    }
