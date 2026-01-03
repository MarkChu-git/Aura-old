import random
from typing import List, Optional, Dict, Any
from app.ai.adapters import AIAdapter

class MockAIAdapter(AIAdapter):
    async def extract_imagery(self, text: Optional[str] = None, image_key: Optional[str] = None) -> Dict[str, Any]:
        # Deterministic-ish mock based on input length or random
        return {
            "primary_scent_family": random.choice(["Floral", "Woody", "Fresh", "Oriental"]),
            "mood": random.choice(["Calm", "Energizing", "Romantic", "Mysterious"]),
            "extracted_keywords": ["rain", "forest", "morning"] if "rain" in (text or "").lower() else ["sun", "beach", "warm"],
            "intensity_preference": random.randint(1, 5)
        }

    async def embed(self, text: str) -> List[float]:
        # Return a random vector normalized (simplified)
        # 1536 dim for OpenAI compatibility
        return [random.uniform(-1, 1) for _ in range(1536)]

    async def explain(self, sku_name: str, sku_tags: Dict, user_context: Dict) -> str:
        templates = [
            f"Because you asked for {user_context.get('mood', 'something special')}, we chose {sku_name}.",
            f"{sku_name} perfectly captures the essence of your request with its {sku_tags.get('family', 'unique')} notes.",
            f"This scent evokes the feeling of {user_context.get('primary_scent_family', 'nature')} that you described."
        ]
        return random.choice(templates)
