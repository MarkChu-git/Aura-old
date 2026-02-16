"""
Mock AI Adapter.

This module provides a mock implementation of the `AIAdapter` interface.
It is used for testing and development environments where a real AI service
is not required or configured. It returns deterministic or semi-random data
to simulate AI responses without making external API calls.
"""

import random
from typing import List, Optional, Dict, Any
from app.ai.adapters import AIAdapter


class MockAIAdapter(AIAdapter):
    """
    A mock implementation of the AIAdapter for testing purposes.
    """

    async def extract_imagery(
        self, text: Optional[str] = None, image_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Simulates the extraction of imagery and tags from input.

        Logic:
        - If 'rain' is in the text, returns a specific set of keywords.
        - Otherwise, returns random choices from predefined lists.

        Args:
            text (Optional[str]): User input text.
            image_key (Optional[str]): Image file key (ignored in mock).

        Returns:
            Dict[str, Any]: Simulated extracted tags.
        """
        # Deterministic-ish mock based on input length or random
        return {
            "primary_scent_family": random.choice(
                ["Floral", "Woody", "Fresh", "Oriental"]
            ),
            "mood": random.choice(["Calm", "Energizing", "Romantic", "Mysterious"]),
            "extracted_keywords": (
                ["rain", "forest", "morning"]
                if "rain" in (text or "").lower()
                else ["sun", "beach", "warm"]
            ),
            "intensity_preference": random.randint(1, 5),
        }

    async def embed(self, text: str) -> List[float]:
        """
        Simulates vector embedding generation.

        Returns:
            List[float]: A list of 1536 random floats (simulating OpenAI dimensions).
        """
        # Return a random vector normalized (simplified)
        # 1536 dim for OpenAI compatibility
        return [random.uniform(-1, 1) for _ in range(1536)]

    async def explain(self, sku_name: str, sku_tags: Dict, user_context: Dict) -> str:
        """
        Simulates generating an explanation.

        Returns:
            str: A random template string filled with provided context.
        """
        templates = [
            f"Because you asked for {user_context.get('mood', 'something special')}, we chose {sku_name}.",
            f"{sku_name} perfectly captures the essence of your request with its {sku_tags.get('family', 'unique')} notes.",
            f"This scent evokes the feeling of {user_context.get('primary_scent_family', 'nature')} that you described.",
        ]
        return random.choice(templates)
