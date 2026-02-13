"""
AI Adapter Interface.

This module defines the abstract base class `AIAdapter`, which enforces a consistent
interface for all AI service implementations (e.g., Real, Mock). This pattern
allows the application to switch between different AI providers or testing modes
seamlessly.
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any


class AIAdapter(ABC):
    """
    Abstract base class for AI service adapters.
    
    All concrete AI adapters must implement these methods to provide
    extraction, embedding, and explanation capabilities.
    """

    @abstractmethod
    async def extract_imagery(
        self, text: Optional[str] = None, image_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Extract structured tags and sensory data from text or image input.

        Args:
            text (Optional[str]): The user's descriptive text.
            image_key (Optional[str]): The object storage key for an uploaded image.

        Returns:
            Dict[str, Any]: A dictionary containing extracted attributes (e.g., mood, scent family).
        """
        pass

    @abstractmethod
    async def embed(self, text: str) -> List[float]:
        """
        Generate a vector embedding for the given text.

        Args:
            text (str): The text to embed.

        Returns:
            List[float]: A list of floats representing the vector embedding.
        """
        pass

    @abstractmethod
    async def explain(self, sku_name: str, sku_tags: Dict, user_context: Dict) -> str:
        """
        Generate a natural language explanation for why a specific SKU matches the user's context.

        Args:
            sku_name (str): The name of the product.
            sku_tags (Dict): The attributes/tags of the product.
            user_context (Dict): The user's preferences and extracted tags.

        Returns:
            str: A short, persuasive explanation string.
        """
        pass
