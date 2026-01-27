from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any


class AIAdapter(ABC):
    @abstractmethod
    async def extract_imagery(
        self, text: Optional[str] = None, image_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Extract structured tags and sensory data from text or image input.
        Returns a dictionary of tags/attributes.
        """
        pass

    @abstractmethod
    async def embed(self, text: str) -> List[float]:
        """
        Generate a vector embedding for the given text.
        """
        pass

    @abstractmethod
    async def explain(self, sku_name: str, sku_tags: Dict, user_context: Dict) -> str:
        """
        Generate a natural language explanation for why this SKU matches the user context.
        """
        pass
