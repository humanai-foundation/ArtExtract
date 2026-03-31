# prompts/research_prompts.py
from langchain_core.prompts import ChatPromptTemplate

# ─────────────────────────────────────────────────────────────────────────────
# Gap Analysis Prompt
# ─────────────────────────────────────────────────────────────────────────────
GAP_ANALYSIS_PROMPT = ChatPromptTemplate.from_template("""
You are a technical analyst evaluating research completeness.

Current Research Findings:
{research_data}

Evaluate how well the research answers this query: "{query}"

Return ONLY a valid JSON object with NO extra text, in this exact format:
{{
  "confidence_score": <float between 0.0 and 1.0>,
  "gaps": ["<missing topic 1>", "<missing topic 2>"],
  "contradictions": ["<contradiction if any>"]
}}

Scoring guide:
- 0.9–1.0: Research fully answers the query with strong evidence
- 0.7–0.8: Mostly answered, minor gaps
- 0.4–0.6: Significant gaps remain
- 0.0–0.3: Barely relevant data found

Return ONLY the JSON object, nothing else.
""")


# ─────────────────────────────────────────────────────────────────────────────
# Research Synthesis Prompt
# ─────────────────────────────────────────────────────────────────────────────
RESEARCH_SYNTHESIS_PROMPT = ChatPromptTemplate.from_template("""
You are a world-class Technical Documentation Engineer.
Synthesize the following research data into a production-grade report for a senior developer.

Research Context:
{context}

Original Query: {query}

═══════════════════════════════════════════════════
OUTPUT RULES — READ EVERY RULE CAREFULLY
═══════════════════════════════════════════════════

1. MANDATORY REPORT STRUCTURE — use exactly these headings:

   # Executive Summary
   (High-level answer to the query — 3–5 sentences)

   # Technical Deep Analysis
   (In-depth exploration of the technologies, architectures, or concepts involved)

   # Key Findings & Trade-offs
   (Critical insights, pros/cons, recommendations)

   # Evidence Trace
   (List of sources used — see Rule 5 below)

2. OUTPUT FORMAT:
   - Output plain markdown directly. Do NOT wrap your entire response in any code fence.
   - WRONG: ```markdown\\n# Executive Summary\\n...\\n```
   - RIGHT:  # Executive Summary\\n...

3. MERMAID DIAGRAMS — only include when a diagram genuinely adds clarity.

   Correct format:
   ```mermaid
   flowchart TD
       A["Start"] --> B["Process Data"]
       B --> C["End"]
   ```

   ═══ ABSOLUTE MERMAID RULES (violations cause render failure) ═══

   a) Opening fence must be exactly:  ```mermaid  (three backticks + the word mermaid, nothing else on that line)
   b) Prefer `flowchart TD` over `graph TD` — it is more compatible.
   c) Node IDs: simple alphanumeric only — A, B, C1, NodeA. NO spaces, NO special chars in IDs.
   d) Node labels MUST be quoted when they contain ANY of: spaces, slashes, parentheses, commas, colons, hyphens, math symbols.
      WRONG:  A[Retrieve Documents]   A[foo/bar]   A[foo(bar)]
      RIGHT:  A["Retrieve Documents"] A["foo/bar"] A["foo(bar)"]
   e) NEVER use \\n inside a label — labels must be single-line strings.
      WRONG:  A["Retrieve\\nDocuments"]
      RIGHT:  A["Retrieve Documents"]
   f) Edge labels: the pipe syntax MUST be on the SAME LINE as the arrow and destination.
      WRONG (split across lines):
          C -->
          |High| D
      RIGHT (all on one line):
          C -->|High| D["Use nDocs"]
   g) Each edge definition must be complete on a single line.
   h) DO NOT use `style`, `classDef`, `class`, or `linkStyle` — they break rendering.
   i) Every node ID used in an edge must have been defined with a label first.
   j) DO NOT nest code blocks inside a mermaid block.

4. TONE: Senior developer readability. High signal-to-noise. No filler phrases.

5. EVIDENCE TRACE RULES — produce real, clickable hyperlinks:
   - For every source URL found in the research context, create a markdown hyperlink.
   - Format each source as:  - [Title or Domain](URL)
   - If you have the actual URL from search results, use it verbatim.
   - If only a domain/title is known (no URL), write the source name plainly without a fake link.
   - DO NOT invent or fabricate URLs. Only link to URLs explicitly present in the research context.
   - Example of correct Evidence Trace section:
     # Evidence Trace
     - [LangChain Documentation](https://python.langchain.com/docs/introduction)
     - [Tavily AI Search](https://tavily.com)
     - LLM Knowledge Base (no URL available)

═══════════════════════════════════════════════════
""")

