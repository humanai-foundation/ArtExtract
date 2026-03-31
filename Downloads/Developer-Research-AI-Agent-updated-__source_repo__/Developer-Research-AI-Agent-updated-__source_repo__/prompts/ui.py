import streamlit as st
from datetime import datetime
import streamlit.components.v1 as components
import re

def apply_custom_css():
    """Applies custom CSS for professional styling."""
    st.markdown("""
    <style>
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@300;400;600;700&display=swap');

        html, body, [class*="css"] {
            font-family: 'IBM Plex Sans', sans-serif;
        }

        .main-header {
            font-size: 2.5rem;
            font-weight: 700;
            background: linear-gradient(120deg, #2E86AB 0%, #06BCC1 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem;
        }
        .subtitle {
            font-size: 1.1rem;
            color: #888;
            margin-bottom: 2rem;
        }
        .stTextInput > div > div > input {
            border-radius: 10px;
        }
        .node-badge {
            display: inline-block;
            padding: 0.2rem 0.65rem;
            border-radius: 12px;
            font-size: 0.78rem;
            font-weight: 600;
            margin: 0.2rem;
            font-family: 'IBM Plex Mono', monospace;
            letter-spacing: 0.02em;
        }
        .node-guard            { background-color: #E3F2FD; color: #1565C0; }
        .node-context          { background-color: #F3E5F5; color: #6A1B9A; }
        .node-intentorchestrator { background-color: #E8F5E9; color: #2E7D32; }
        .node-planner          { background-color: #FFF3E0; color: #E65100; }
        .node-quickmode        { background-color: #E0F2F1; color: #00695C; }
        .node-deepresearch     { background-color: #FCE4EC; color: #AD1457; }
        .node-gapanalysis      { background-color: #FFF9C4; color: #F57F17; }
        .node-synthesize       { background-color: #EDE7F6; color: #4527A0; }
        .node-formatter        { background-color: #C5CAE9; color: #283593; }
        .node-clarifyuser      { background-color: #FBE9E7; color: #BF360C; }

        .clarification-card {
            background: linear-gradient(135deg, #fff8e1 0%, #fff3e0 100%);
            border-left: 4px solid #FF8F00;
            border-radius: 8px;
            padding: 1rem 1.25rem;
            margin: 0.5rem 0;
        }
        .clarification-card .clarification-title {
            font-size: 1rem;
            font-weight: 700;
            color: #E65100;
            margin-bottom: 0.5rem;
        }
        .token-box {
            padding: 0.75rem;
            border-radius: 8px;
            margin: 0.5rem 0;
            font-size: 0.9rem;
        }
        .token-current {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .token-total {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
        }

        /* Mermaid diagram container */
        .mermaid-wrapper {
            border: 1px solid #e0e0e0;
            border-radius: 10px;
            padding: 1rem;
            margin: 1rem 0;
            background: #0d1117;
        }
    </style>
    """, unsafe_allow_html=True)

def render_header():
    """Renders the main application header."""
    st.markdown('<h1 class="main-header">🔍 Developer Research AI Agent</h1>', unsafe_allow_html=True)
    st.markdown('<p class="subtitle">Ask complex technical questions and get detailed, research-backed answers</p>', unsafe_allow_html=True)

def render_node_badge(node_name):
    """Renders a styled badge for a node."""
    css_key = node_name.lower().replace("_", "").replace(" ", "")
    return f'<span class="node-badge node-{css_key}">{node_name}</span>'

def render_execution_path(nodes):
    """Renders the execution path of nodes."""
    if not nodes:
        return
    nodes_html = " → ".join([render_node_badge(node) for node in nodes])
    st.markdown(f"**Execution Path:** {nodes_html}", unsafe_allow_html=True)

def render_message_metadata(mode, confidence, tokens):
    """Renders metadata for a message."""
    col1, col2, col3 = st.columns(3)
    with col1:
        st.caption(f"🎯 Mode: {mode}")
    with col2:
        st.caption(f"📊 Confidence: {confidence:.2f}")
    with col3:
        st.caption(f"🔢 Tokens: {tokens}")

def render_clarification_request(message: str):
    """Renders a styled clarification request card."""
    st.markdown(
        """
        <div class='clarification-card'>
            <div class='clarification-title'>🔍 Clarification Needed</div>
        </div>
        """,
        unsafe_allow_html=True
    )
    st.markdown(message)

def render_mermaid(mermaid_code: str, height: int = 520):
    """
    Renders a Mermaid diagram with full pan + zoom + fit-to-screen controls.
    Sanitizes the code before rendering to fix common LLM syntax errors.
    """
    import json
    code = _sanitize_mermaid_code(mermaid_code)
    js_code = json.dumps(code)

    html_code = f"""
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}

  body {{
    background: #0d1117;
    font-family: 'Segoe UI', system-ui, sans-serif;
    overflow: hidden;
    height: {height}px;
  }}

  /* ── Toolbar ── */
  #toolbar {{
    position: absolute;
    top: 10px;
    right: 12px;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(22, 27, 34, 0.92);
    border: 1px solid #30363d;
    border-radius: 10px;
    padding: 5px 8px;
    backdrop-filter: blur(6px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.5);
  }}

  .tb-btn {{
    background: transparent;
    border: 1px solid transparent;
    border-radius: 6px;
    color: #8b949e;
    cursor: pointer;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
    user-select: none;
  }}
  .tb-btn:hover {{
    background: #21262d;
    border-color: #388bfd;
    color: #c9d1d9;
  }}
  .tb-btn:active {{
    background: #388bfd22;
  }}

  #zoom-label {{
    font-size: 11px;
    color: #8b949e;
    min-width: 36px;
    text-align: center;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.02em;
  }}

  .tb-divider {{
    width: 1px;
    height: 20px;
    background: #30363d;
    margin: 0 2px;
  }}

  /* ── Viewport (clipping area) ── */
  #viewport {{
    position: absolute;
    inset: 0;
    overflow: hidden;
    cursor: grab;
  }}
  #viewport.dragging {{ cursor: grabbing; }}

  /* ── Canvas (pan/zoom target) ── */
  #canvas {{
    position: absolute;
    top: 0; left: 0;
    transform-origin: 0 0;
    will-change: transform;
  }}

  /* ── SVG overrides ── */
  #canvas svg {{
    display: block;
    max-width: none !important;
    height: auto;
  }}

  /* ── Error / raw code boxes ── */
  #error-box {{
    display: none;
    position: absolute;
    inset: 10px;
    background: #1a0a0a;
    border: 1px solid #f44336;
    border-radius: 8px;
    padding: 14px;
    color: #f44336;
    font-family: monospace;
    font-size: 13px;
    white-space: pre-wrap;
    overflow: auto;
    z-index: 200;
  }}
  #raw-code {{
    display: none;
    position: absolute;
    bottom: 10px; left: 10px; right: 10px;
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 8px;
    padding: 12px;
    color: #c9d1d9;
    font-family: monospace;
    font-size: 12px;
    white-space: pre-wrap;
    max-height: 180px;
    overflow: auto;
    z-index: 200;
  }}

  /* ── Hint ── */
  #hint {{
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 11px;
    color: #484f58;
    pointer-events: none;
    white-space: nowrap;
  }}
</style>
</head>
<body>

<!-- Toolbar -->
<div id="toolbar">
  <button class="tb-btn" id="btn-zoom-in"  title="Zoom in">＋</button>
  <button class="tb-btn" id="btn-zoom-out" title="Zoom out">－</button>
  <span id="zoom-label">100%</span>
  <div class="tb-divider"></div>
  <button class="tb-btn" id="btn-fit"    title="Fit to screen">⊡</button>
  <button class="tb-btn" id="btn-reset"  title="Reset (100%)">↺</button>
</div>

<!-- Pan/zoom viewport -->
<div id="viewport">
  <div id="canvas">
    <div id="mermaid-div"></div>
  </div>
</div>

<!-- Error overlays -->
<div id="error-box"></div>
<div id="raw-code"></div>

<div id="hint">Scroll to zoom · Drag to pan</div>

<script type="module">
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

const diagramCode = {js_code};

// ── Mermaid init ──────────────────────────────────────────────────────────────
mermaid.initialize({{
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  logLevel: 'error',
  themeVariables: {{
    primaryColor: '#1f6feb',
    primaryTextColor: '#c9d1d9',
    primaryBorderColor: '#388bfd',
    lineColor: '#8b949e',
    secondaryColor: '#21262d',
    tertiaryColor: '#0d1117',
    background: '#0d1117',
    mainBkg: '#161b22',
    nodeBorder: '#388bfd',
    clusterBkg: '#161b22',
    titleColor: '#e6edf3',
    edgeLabelBackground: '#0d1117',
    attributeBackgroundColorEven: '#161b22',
    attributeBackgroundColorOdd: '#0d1117'
  }},
  flowchart: {{ useMaxWidth: false, htmlLabels: true, curve: 'basis' }},
  sequence: {{ useMaxWidth: false, htmlLabels: true, actorMargin: 50 }},
  gantt:    {{ useMaxWidth: false }},
  er:       {{ useMaxWidth: false }},
  journey:  {{ useMaxWidth: false }},
  class:    {{ useMaxWidth: false }}
}});

// ── State ─────────────────────────────────────────────────────────────────────
let scale    = 1;
let offsetX  = 0;
let offsetY  = 0;
const MIN_SCALE = 0.1;
const MAX_SCALE = 5;
const STEP      = 0.15;

const viewport  = document.getElementById('viewport');
const canvas    = document.getElementById('canvas');
const zoomLabel = document.getElementById('zoom-label');

// ── Transform apply ───────────────────────────────────────────────────────────
function applyTransform() {{
  canvas.style.transform = `translate(${{offsetX}}px, ${{offsetY}}px) scale(${{scale}})`;
  zoomLabel.textContent  = Math.round(scale * 100) + '%';
}}

// ── Fit diagram to viewport ───────────────────────────────────────────────────
function fitToScreen() {{
  const svgEl = canvas.querySelector('svg');
  if (!svgEl) return;
  const vw = viewport.clientWidth;
  const vh = viewport.clientHeight;
  const sw = svgEl.getBoundingClientRect().width  / scale;
  const sh = svgEl.getBoundingClientRect().height / scale;
  const newScale = Math.min(vw / sw, vh / sh, MAX_SCALE) * 0.92;
  scale   = Math.max(MIN_SCALE, newScale);
  offsetX = (vw - sw * scale) / 2;
  offsetY = Math.max(16, (vh - sh * scale) / 2);
  applyTransform();
}}

// ── Zoom around a point ───────────────────────────────────────────────────────
function zoomAround(newScale, cx, cy) {{
  newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
  const factor = newScale / scale;
  offsetX = cx - factor * (cx - offsetX);
  offsetY = cy - factor * (cy - offsetY);
  scale   = newScale;
  applyTransform();
}}

// ── Toolbar buttons ───────────────────────────────────────────────────────────
document.getElementById('btn-zoom-in').addEventListener('click', () => {{
  const cx = viewport.clientWidth  / 2;
  const cy = viewport.clientHeight / 2;
  zoomAround(scale + STEP, cx, cy);
}});
document.getElementById('btn-zoom-out').addEventListener('click', () => {{
  const cx = viewport.clientWidth  / 2;
  const cy = viewport.clientHeight / 2;
  zoomAround(scale - STEP, cx, cy);
}});
document.getElementById('btn-fit').addEventListener('click', fitToScreen);
document.getElementById('btn-reset').addEventListener('click', () => {{
  scale   = 1;
  offsetX = (viewport.clientWidth  - canvas.querySelector('svg')?.getBoundingClientRect().width  / 1 ?? 0) / 2;
  offsetY = 20;
  applyTransform();
}});

// ── Mouse wheel zoom ──────────────────────────────────────────────────────────
viewport.addEventListener('wheel', (e) => {{
  e.preventDefault();
  const rect    = viewport.getBoundingClientRect();
  const cx      = e.clientX - rect.left;
  const cy      = e.clientY - rect.top;
  const delta   = -e.deltaY * 0.001;
  zoomAround(scale * (1 + delta), cx, cy);
}}, {{ passive: false }});

// ── Drag to pan ───────────────────────────────────────────────────────────────
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

viewport.addEventListener('mousedown', (e) => {{
  if (e.button !== 0) return;
  isDragging = true;
  dragStartX = e.clientX - offsetX;
  dragStartY = e.clientY - offsetY;
  viewport.classList.add('dragging');
}});
window.addEventListener('mousemove', (e) => {{
  if (!isDragging) return;
  offsetX = e.clientX - dragStartX;
  offsetY = e.clientY - dragStartY;
  applyTransform();
}});
window.addEventListener('mouseup', () => {{
  isDragging = false;
  viewport.classList.remove('dragging');
}});

// ── Touch pinch-zoom + drag ───────────────────────────────────────────────────
let lastTouchDist = null;
let lastTouchX    = null;
let lastTouchY    = null;

viewport.addEventListener('touchstart', (e) => {{
  if (e.touches.length === 2) {{
    lastTouchDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
  }} else if (e.touches.length === 1) {{
    lastTouchX = e.touches[0].clientX - offsetX;
    lastTouchY = e.touches[0].clientY - offsetY;
  }}
}}, {{ passive: true }});

viewport.addEventListener('touchmove', (e) => {{
  e.preventDefault();
  if (e.touches.length === 2) {{
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - viewport.getBoundingClientRect().left;
    const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - viewport.getBoundingClientRect().top;
    if (lastTouchDist) zoomAround(scale * (dist / lastTouchDist), cx, cy);
    lastTouchDist = dist;
  }} else if (e.touches.length === 1 && lastTouchX !== null) {{
    offsetX = e.touches[0].clientX - lastTouchX;
    offsetY = e.touches[0].clientY - lastTouchY;
    applyTransform();
  }}
}}, {{ passive: false }});

viewport.addEventListener('touchend', () => {{
  lastTouchDist = null; lastTouchX = null; lastTouchY = null;
}});

// ── Render ────────────────────────────────────────────────────────────────────
async function renderDiagram() {{
  const container = document.getElementById('mermaid-div');
  const errorBox  = document.getElementById('error-box');
  const rawBox    = document.getElementById('raw-code');

  try {{
    const {{ svg }} = await mermaid.render('mermaid-svg', diagramCode);
    container.innerHTML = svg;

    // Let the SVG paint, then fit
    requestAnimationFrame(() => {{
      requestAnimationFrame(() => {{
        const svgEl = container.querySelector('svg');
        if (svgEl) {{
          // Remove hard-coded width/height so our transform can control size
          svgEl.removeAttribute('width');
          svgEl.style.maxWidth = 'none';
        }}
        fitToScreen();
      }});
    }});
  }} catch (err) {{
    container.style.display = 'none';
    errorBox.style.display  = 'block';
    errorBox.textContent    = '⚠️ Diagram render error:\\n' + (err.message || String(err));
    rawBox.style.display    = 'block';
    rawBox.textContent      = diagramCode;
  }}
}}

renderDiagram();
</script>
</body>
</html>
"""
    components.html(html_code, height=height, scrolling=False)


def _sanitize_mermaid_code(code: str) -> str:
    """
    Comprehensive sanitizer for LLM-generated Mermaid code.
    Fixes every known pattern that causes parse errors.
    """
    code = code.strip()

    # ── Step 1: Strip any stray backtick fences ──────────────────────────────
    code = re.sub(r'^```(?:mermaid)?\s*\n?', '', code, flags=re.IGNORECASE)
    code = re.sub(r'\n?```\s*$', '', code)
    code = code.strip()

    # ── Step 2: Replace literal \n inside quoted strings with <br/> ──────────
    # LLMs often write  A["Retrieve\nDocuments"]  — the \n is a literal
    # two-char sequence, not a real newline, inside the label.
    # We must replace it with a space (or <br/>) so the label is single-line.
    def replace_literal_newlines_in_label(m):
        inner = m.group(1)
        # Replace literal backslash-n with a space
        inner = inner.replace('\\n', ' ').replace('\\t', ' ')
        return f'["{inner}"]'

    # Handle ["..."] labels
    code = re.sub(r'\["([^"]*?)"\]', replace_literal_newlines_in_label, code)
    # Handle also real \n (actual newlines) inside quoted labels  A["foo
    #   bar"] — collapse to space
    def collapse_real_newlines_in_label(m):
        inner = m.group(1)
        inner = re.sub(r'\s*\n\s*', ' ', inner)
        return f'["{inner}"]'
    code = re.sub(r'\["(.*?)"\]', collapse_real_newlines_in_label, code, flags=re.DOTALL)

    # ── Step 3: Fix broken edge-label lines ──────────────────────────────────
    # Pattern 1:  "A -->\n|High| B"  (arrow then newline then |label| dest)
    #   Mermaid requires  A -->|High| B  all on one line.
    code = re.sub(r'(--[->\.]+)\s*\n\s*(\|[^|]+\|)', r'\1\2', code)

    # Pattern 2:  "C -->"  alone on a line, label on next line as  "|High| D"
    # Already handled above, but also handle  "C --> \n |High|"
    code = re.sub(r'(-{2,}>)\s*\n\s*\|', r'\1|', code)

    # Pattern 3: space between arrow and pipe:  C --> |High| D  →  C -->|High| D
    code = re.sub(r'(--[->\.]+)\s+\|', r'\1|', code)
    code = re.sub(r'(---)\s+\|', r'\1|', code)

    # Pattern 4:  C --->|High|  (triple dashes) — normalise to -->
    code = re.sub(r'--->', '-->', code)

    # ── Step 4: Remove style / classDef / class lines ────────────────────────
    lines = code.split('\n')
    cleaned_lines = []
    for line in lines:
        stripped = line.strip()
        if re.match(r'^(style|classDef|class)\s+', stripped, re.IGNORECASE):
            continue
        # Remove linkStyle lines too
        if re.match(r'^linkStyle\s+', stripped, re.IGNORECASE):
            continue
        cleaned_lines.append(line)
    code = '\n'.join(cleaned_lines)

    # ── Step 5: Auto-quote unquoted labels with special chars ────────────────
    # Matches:  NodeID["label"]  NodeID[label]  NodeID{label}  NodeID(label)
    # We only touch square-bracket labels here as they are most common.
    def quote_sq_label(m):
        node_id = m.group(1)
        label = m.group(2)
        # Already quoted
        if (label.startswith('"') and label.endswith('"')) or \
           (label.startswith("'") and label.endswith("'")):
            return m.group(0)
        # Contains chars that require quoting
        if re.search(r'[(){}|<>:/\\,]', label):
            label = '"' + label.replace('"', "'") + '"'
        return f'{node_id}[{label}]'

    code = re.sub(r'(\b\w+)\[([^\[\]]+)\]', quote_sq_label, code)

    # ── Step 6: Ensure valid diagram type header ─────────────────────────────
    valid_starts = (
        'graph ', 'graph\n', 'flowchart ', 'flowchart\n',
        'sequencediagram', 'classdiagram', 'statediagram',
        'erdiagram', 'gantt', 'pie', 'journey', 'gitgraph',
        'mindmap', 'timeline', 'quadrantchart', 'xychart',
        'block-beta', 'packet-beta', 'architecture-beta',
        'zenuml', 'sankey-beta', 'requirementdiagram',
    )
    first_line = code.split('\n')[0].strip().lower()
    if not any(first_line.startswith(v) for v in valid_starts):
        code = 'flowchart TD\n' + code

    return code.strip()


def _extract_mermaid_blocks(content: str):
    """
    Extracts mermaid blocks and remaining text from content.
    Returns a list of tuples: ('text'|'mermaid', content_string)
    """
    parts = []

    # Match ```mermaid ... ``` blocks (possibly with or without newline after opening fence)
    pattern = re.compile(
        r'```mermaid\s*\n(.*?)```',
        re.DOTALL | re.IGNORECASE
    )

    last_end = 0
    for match in pattern.finditer(content):
        # Text before this mermaid block
        text_before = content[last_end:match.start()]
        if text_before.strip():
            parts.append(('text', text_before))

        # The mermaid code
        mermaid_code = match.group(1).strip()
        if mermaid_code:
            parts.append(('mermaid', mermaid_code))

        last_end = match.end()

    # Remaining text after last mermaid block
    remaining = content[last_end:]
    if remaining.strip():
        parts.append(('text', remaining))

    return parts


def _clean_markdown_text(text: str) -> str:
    """
    Cleans up text by removing orphaned/wrapping code fences and
    other LLM artifacts that shouldn't appear in rendered output.
    """
    text = text.strip()

    # Remove wrapping ```markdown ... ``` or ``` ... ``` if the ENTIRE text is wrapped
    # Be careful not to remove inner code blocks
    outer_fence_match = re.match(
        r'^```(?:markdown|text)?\s*\n(.*)\n```\s*$',
        text,
        re.DOTALL | re.IGNORECASE
    )
    if outer_fence_match:
        inner = outer_fence_match.group(1)
        # Only unwrap if the inner content doesn't look like it should be a code block
        if not inner.strip().startswith('```'):
            text = inner.strip()

    # Remove trailing orphaned ``` that aren't part of a code block
    # (happens when mermaid block was extracted and left a dangling fence)
    text = re.sub(r'\n```\s*$', '', text)
    text = re.sub(r'^```\s*\n', '', text)

    return text.strip()


def render_content_with_mermaid(content: str):
    """
    Robustly renders markdown content that may contain Mermaid diagram blocks.

    Strategy:
    1. Strip any outer wrapping fences the LLM mistakenly added
    2. Extract mermaid blocks and text segments alternately
    3. Render text as st.markdown(), mermaid as HTML component
    4. Never let mermaid extraction corrupt surrounding text
    """
    if not content:
        return

    content = content.strip()

    # Step 1: Remove outer wrapping fences if the ENTIRE response is wrapped
    # This is a common LLM mistake: wrapping the whole report in ```markdown...```
    outer_md_match = re.match(
        r'^```(?:markdown|text)?\s*\n(.*?)\n?```\s*$',
        content,
        re.DOTALL | re.IGNORECASE
    )
    if outer_md_match:
        inner = outer_md_match.group(1).strip()
        # Safety: only unwrap if inner content is substantial and has mermaid or normal prose
        if len(inner) > 50:
            content = inner

    # Step 2: Check if there are any mermaid blocks at all
    if '```mermaid' not in content.lower():
        # No mermaid: just render as plain markdown
        st.markdown(content)
        return

    # Step 3: Extract and render parts alternately
    parts = _extract_mermaid_blocks(content)

    for part_type, part_content in parts:
        if part_type == 'mermaid':
            render_mermaid(part_content)
        else:
            cleaned = _clean_markdown_text(part_content)
            if cleaned:
                st.markdown(cleaned)


def render_chat_history(messages):
    """Renders the chat history."""
    for message in messages:
        if message['role'] == 'user':
            with st.chat_message("user"):
                st.markdown(f"**{message['timestamp']}**")
                st.markdown(message['content'])
        else:
            with st.chat_message("assistant"):
                if 'nodes' in message and message['nodes']:
                    render_execution_path(message['nodes'])

                if message.get('is_clarification'):
                    render_clarification_request(message['content'])
                else:
                    # Always use robust renderer for assistant messages
                    render_content_with_mermaid(message['content'])

                render_message_metadata(
                    message.get('mode', 'N/A'),
                    message.get('confidence', 0),
                    message.get('tokens', 0)
                )


def render_sidebar_header():
    """Renders the sidebar header."""
    st.sidebar.markdown("### 💬 Chat Threads")


def render_thread_list(threads, current_thread_id, on_switch, on_delete):
    """Renders the list of threads in the sidebar."""
    sorted_threads = sorted(
        threads.items(),
        key=lambda x: x[1]['created'],
        reverse=True
    )

    for thread_id, thread in sorted_threads:
        is_active = thread_id == current_thread_id

        col1, col2 = st.columns([4, 1])
        with col1:
            if st.button(
                f"{'📌 ' if is_active else '💬 '}{thread['title']}",
                key=f"thread_{thread_id}",
                use_container_width=True,
                type="secondary" if is_active else "tertiary"
            ):
                on_switch(thread_id)

        with col2:
            if st.button("🗑️", key=f"del_{thread_id}", help="Delete thread"):
                on_delete(thread_id)

        st.caption(f"📅 {thread['created']} | 💬 {len(thread['messages'])} msgs")
        st.markdown("---")


def render_configuration(model_name, max_iterations, current_thread_tokens, total_session_tokens):
    """Renders the configuration section with token usage."""
    st.markdown("### ⚙️ Configuration")
    st.info(f"**Model**: {model_name}")
    st.info(f"**Max Iterations**: {max_iterations}")

    st.markdown(f"""
    <div class='token-box token-current'>
        <strong>🎯 Current Chat Tokens</strong><br/>
        <span style='font-size: 1.5rem; font-weight: 700;'>{current_thread_tokens:,}</span>
    </div>
    """, unsafe_allow_html=True)

    st.markdown(f"""
    <div class='token-box token-total'>
        <strong>📊 Total Session Tokens</strong><br/>
        <span style='font-size: 1.5rem; font-weight: 700;'>{total_session_tokens:,}</span>
    </div>
    """, unsafe_allow_html=True)


def render_footer():
    """Renders the application footer."""
    st.markdown("---")
    _, col2, _ = st.columns([1, 2, 1])
    with col2:
        st.markdown("""
        <div style='text-align: center; color: #666; font-size: 0.9rem;'>
            Powered by LangGraph • Qdrant • Ollama
        </div>
        """, unsafe_allow_html=True)
