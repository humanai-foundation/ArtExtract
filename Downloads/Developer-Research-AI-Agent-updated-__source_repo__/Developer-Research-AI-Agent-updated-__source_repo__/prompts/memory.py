import os
import uuid
from datetime import datetime
from config import Config
from qdrant_client import QdrantClient
from qdrant_client.http import models

class MemoryManager:
    def __init__(self):
        # Initialize Qdrant client with local storage
        self.client = QdrantClient(path=Config.QDRANT_PATH)
        self.collection_name = "research_memory"
        
        

    def add_memory(self, text: str, metadata: dict = None):
        """
        Save a text blob (e.g., report, interaction) to memory.
        """
        if metadata is None:
            metadata = {}
        
        metadata["timestamp"] = str(datetime.now())
        
        # Add document (FastEmbed will handle embedding automatically)
        self.client.add(
            collection_name=self.collection_name,
            documents=[text],
            metadata=[metadata],
            ids=[str(uuid.uuid4())]
        )
        print(f"DEBUG: Saved to memory: {text[:50]}...")

    def get_context(self, query: str, n_results: int = 2):
        """
        Retrieve relevant context for a query.
        """
        results = self.client.query(
            collection_name=self.collection_name,
            query_text=query,
            limit=n_results
        )
        
        # Extract document content from results
        documents = [hit.document for hit in results]
        return documents

# Singleton instance
memory = MemoryManager()
