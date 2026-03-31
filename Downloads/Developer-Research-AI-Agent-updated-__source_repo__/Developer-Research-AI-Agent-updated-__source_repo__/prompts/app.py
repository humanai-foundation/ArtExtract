import streamlit as st
import uuid
import threading
import time
from datetime import datetime
from main import build_agent
from config import Config
from utils.streaming import get_streaming_buffer, clear_streaming_buffer
import ui

# --- State Management ---
def init_state():
    """Initialize session state variables."""
    if 'threads' not in st.session_state:
        st.session_state.threads = {}
        create_new_thread()

    if 'agent' not in st.session_state:
        st.session_state.agent = build_agent()

    if 'current_thread_id' not in st.session_state:
        if st.session_state.threads:
            st.session_state.current_thread_id = list(st.session_state.threads.keys())[0]
        else:
            create_new_thread()


def create_new_thread():
    """Create a new chat thread."""
    new_thread_id = str(uuid.uuid4())
    st.session_state.threads[new_thread_id] = {
        'title': 'New Chat',
        'created': datetime.now().strftime("%Y-%m-%d %H:%M"),
        'messages': [],
        'total_tokens': 0,
    }
    st.session_state.current_thread_id = new_thread_id


def get_current_thread():
    """Get the current active thread."""
    return st.session_state.threads[st.session_state.current_thread_id]


def update_thread_title(thread_id, query):
    """Update thread title based on first query."""
    thread = st.session_state.threads[thread_id]
    if thread['title'] == 'New Chat' and query:
        thread['title'] = query[:50] + "..." if len(query) > 50 else query


def switch_thread(thread_id):
    st.session_state.current_thread_id = thread_id
    st.rerun()


def delete_thread(thread_id):
    if len(st.session_state.threads) > 1:
        del st.session_state.threads[thread_id]
        if st.session_state.current_thread_id == thread_id:
            st.session_state.current_thread_id = list(st.session_state.threads.keys())[0]
        st.rerun()


# --- Agent Interaction ---
def run_agent_in_thread(agent, query, status_container, nodes_container, report_container, conversation_history, thread_id):
    """Runs the agent in a separate thread to allow UI updates."""

    initial_state = {"query": query, "history": conversation_history}
    config = {"configurable": {"thread_id": thread_id}}

    shared_state = {
        'nodes_executed': [],
        'final_report': '',
        'final_state': {},
        'query_id': None,
        'streaming_content': '',
        'agent_complete': False,
        'error': None,
    }

    def target():
        try:
            for output in agent.stream(initial_state, config=config):
                for key, value in output.items():
                    shared_state["nodes_executed"].append(key)

                    # Capture query_id from guard node (needed for streaming buffer)
                    if key == "guard" and isinstance(value, dict) and "query_id" in value:
                        shared_state["query_id"] = value["query_id"]

                    # Capture final state from formatter (normal flow)
                    if key == "formatter":
                        shared_state["final_report"] = value.get("final_report", "")
                        shared_state["final_state"] = value

                    # Capture clarification response (clarify_user → END)
                    if key == "clarify_user":
                        shared_state["final_report"] = value.get("final_report", "")
                        shared_state["final_state"] = value

            shared_state["agent_complete"] = True
        except Exception as e:
            import traceback
            shared_state["error"] = f"{e}\n{traceback.format_exc()}"
            shared_state["agent_complete"] = True

    agent_thread = threading.Thread(target=target, daemon=True)
    agent_thread.start()

    # UI Loop: Poll shared state while agent runs
    poll_interval = 0.05  # 50ms

    while not shared_state["agent_complete"]:
        # Update execution path display
        if shared_state["nodes_executed"]:
            with nodes_container.container():
                ui.render_execution_path(shared_state["nodes_executed"])
            status_container.info(f"⚡ Processing: **{shared_state['nodes_executed'][-1]}**")

        # Handle streaming tokens (non-blocking)
        q_id = shared_state.get("query_id")
        if q_id:
            try:
                buffer = get_streaming_buffer(q_id)
                # Drain all available chunks this tick
                drained = False
                while not buffer.queue.empty():
                    chunk = buffer.queue.get_nowait()
                    if chunk is not None:
                        shared_state["streaming_content"] += chunk
                        drained = True
                if drained:
                    report_container.markdown(shared_state["streaming_content"] + " ▌")
            except Exception:
                pass

        time.sleep(poll_interval)

    agent_thread.join(timeout=5)

    # Show error if any
    if shared_state["error"]:
        st.error(f"❌ Agent Error:\n```\n{shared_state['error']}\n```")
        return None, None, []

    # Cleanup streaming buffer
    q_id = shared_state.get("query_id")
    if q_id:
        clear_streaming_buffer(q_id)

    # Prefer final_report from agent state; fall back to streamed content
    final_report = shared_state["final_report"] or shared_state["streaming_content"]

    return final_report, shared_state["final_state"], shared_state["nodes_executed"]


# --- Main Application ---
def main():
    st.set_page_config(
        page_title="Developer Research AI Agent",
        page_icon="🔍",
        layout="wide",
        initial_sidebar_state="expanded",
    )

    ui.apply_custom_css()
    init_state()

    # Sidebar
    with st.sidebar:
        ui.render_sidebar_header()

        if st.button("➕ New Chat", use_container_width=True, type="primary"):
            create_new_thread()
            st.rerun()

        st.markdown("---")

        ui.render_thread_list(
            st.session_state.threads,
            st.session_state.current_thread_id,
            switch_thread,
            delete_thread,
        )

        total_session_tokens = sum(t['total_tokens'] for t in st.session_state.threads.values())
        current_thread_tokens = get_current_thread()['total_tokens']

        ui.render_configuration(
            Config.MODEL_NAME,
            Config.MAX_ITERATIONS_DEEP_MODE,
            current_thread_tokens,
            total_session_tokens,
        )

    # Main Content
    ui.render_header()

    current_thread = get_current_thread()
    st.markdown(f"### 💬 {current_thread['title']}")
    st.markdown("---")

    # Render chat history
    ui.render_chat_history(current_thread['messages'])

    # Input
    query = st.chat_input("Enter your technical research query...")

    if query:
        update_thread_title(st.session_state.current_thread_id, query)
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Add user message to thread
        current_thread['messages'].append({
            'role': 'user',
            'timestamp': timestamp,
            'content': query,
        })

        with st.chat_message("user"):
            st.markdown(f"**{timestamp}**")
            st.markdown(query)

        with st.chat_message("assistant"):
            nodes_container = st.empty()
            status_container = st.empty()
            report_container = st.empty()

            # Build conversation history for the agent
            conversation_history = [
                {"role": msg['role'], "content": msg['content']}
                for msg in current_thread['messages']
            ]

            final_report, final_state, executed_nodes = run_agent_in_thread(
                st.session_state.agent,
                query,
                status_container,
                nodes_container,
                report_container,
                conversation_history,
                st.session_state.current_thread_id,
            )

            if final_report and isinstance(final_report, str):
                status_container.empty()
                is_clarification = final_state.get('mode') == 'clarification'

                if is_clarification:
                    with report_container:
                        ui.render_clarification_request(final_report)
                else:
                    report_container.empty()
                    with st.container():
                        ui.render_content_with_mermaid(final_report)

                tokens = final_state.get('token_usage', 0)
                ui.render_message_metadata(
                    final_state.get('mode', 'N/A'),
                    final_state.get('confidence_score', 0),
                    tokens,
                )

                # Save to history
                current_thread['messages'].append({
                    'role': 'assistant',
                    'timestamp': timestamp,
                    'content': final_report,
                    'is_clarification': is_clarification,
                    'nodes': executed_nodes,
                    'mode': final_state.get('mode', 'N/A'),
                    'confidence': final_state.get('confidence_score', 0),
                    'tokens': tokens,
                })
                current_thread['total_tokens'] += tokens

                st.rerun()

    ui.render_footer()


if __name__ == "__main__":
    main()
