import sqlite3
from langgraph.checkpoint.sqlite import SqliteSaver

def get_checkpointer(db_path="checkpoints.sqlite"):
    """
    Initializes and returns a SQLite checkpointer for LangGraph.
    """
    conn = sqlite3.connect(db_path, check_same_thread=False)
    return SqliteSaver(conn)
