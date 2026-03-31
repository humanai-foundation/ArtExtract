# prompts/report_templates.py

# Template for final output formatting.
# IMPORTANT: Do NOT add outer code fences here — it breaks the mermaid renderer.
OUTPUT_WRAPPER = """{report}

---
> **Sources:** {sources}  
> **Confidence:** {confidence_score:.2f}  
> **Mode:** {mode}  
> **Token Usage:** {token_usage:,} tokens
> **Time Taken:** {time_taken:.2f} seconds
> **Cost:** ${cost:.4f}
"""

# Template for the LLM to structure its report (used as reference in prompts)
REPORT_STRUCTURE_INSTRUCTION = """
Follow this structure for the report:
1. Executive Summary
2. Technical Deep Analysis
3. Key Findings & Trade-offs
4. Evidence Trace (Citations)
"""
