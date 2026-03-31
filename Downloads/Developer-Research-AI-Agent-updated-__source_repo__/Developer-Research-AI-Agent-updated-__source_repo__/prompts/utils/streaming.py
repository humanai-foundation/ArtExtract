"""
Streaming utilities for real-time LLM token display.
"""
import queue
import threading
from typing import Iterator, Optional


class StreamingBuffer:
    """Thread-safe buffer for streaming LLM tokens."""
    
    def __init__(self):
        self.queue = queue.Queue()
        self.complete = False
        self.full_content = ""
    
    def add_chunk(self, chunk: str):
        """Add a token chunk to the buffer."""
        self.queue.put(chunk)
        self.full_content += chunk
    
    def mark_complete(self):
        """Mark streaming as complete."""
        self.complete = True
        self.queue.put(None)  # Sentinel value
    
    def get_chunks(self) -> Iterator[str]:
        """Get streaming chunks as they arrive."""
        while True:
            chunk = self.queue.get()
            if chunk is None:
                break
            yield chunk
    
    def get_full_content(self) -> str:
        """Get the complete accumulated content."""
        return self.full_content


# Global streaming buffer (shared across nodes and Streamlit)
_streaming_buffers = {}

def get_streaming_buffer(query_id: str) -> StreamingBuffer:
    """Get or create a streaming buffer for a query."""
    if query_id not in _streaming_buffers:
        _streaming_buffers[query_id] = StreamingBuffer()
    return _streaming_buffers[query_id]

def clear_streaming_buffer(query_id: str):
    """Clear a streaming buffer."""
    if query_id in _streaming_buffers:
        del _streaming_buffers[query_id]
