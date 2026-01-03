import json
import logging
from typing import List, Optional, Dict, Any
from app.ai.adapters import AIAdapter
from app.core.config import settings
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

class RealAIAdapter(AIAdapter):
    def __init__(self):
        # Initialize OpenAI client pointing to DeepSeek
        self.client = AsyncOpenAI(
            base_url="https://api.deepseek.com",
            api_key=settings.DEEPSEEK_API_KEY,
        )
        # Default models (can be overridden by config)
        self.model_chat = settings.DEEPSEEK_MODEL
        self.model_embedding = "openai/text-embedding-3-small" # DeepSeek doesn't offer embedding endpoint compatible out of box mostly, staying with mock fallback or openai if needed.
        # DeepSeek V3 is primarily chat.

    async def extract_imagery(self, text: Optional[str] = None, image_key: Optional[str] = None) -> Dict[str, Any]:
        """
        Multimodal extraction using OpenRouter (GPT-4o or similar).
        """
        messages = [
            {
                "role": "system", 
                "content": (
                    "You are a professional perfumer and visual analyst. "
                    "Analyze the input (text and/or image) and extract the following JSON fields: "
                    "primary_scent_family (Floral, Woody, Fresh, Oriental), "
                    "mood (Calm, Energizing, Romantic, Mysterious), "
                    "extracted_keywords (list of 3-5 visual/scent adjectives), "
                    "intensity_preference (1-10 integer). "
                    "Return ONLY valid JSON."
                )
            }
        ]

        user_content = []
        if text:
            user_content.append({"type": "text", "text": text})
        
        if image_key:
             # DeepSeek is text-only. We log a warning.
             logger.warning("DeepSeek does not support image input. Skipping image analysis for key: %s", image_key)
             if not text:
                 user_content.append({"type": "text", "text": "Analyze this imaginary scent."})
        
        # DeepSeek might prefer standard string content rather than list of dicts if single text
        # But OpenAI SDK usually handles list of text types fine.
        # Simplified:
        if not user_content and not text:
             user_content.append({"type": "text", "text": "Describe a generic pleasant scent."})

        if not user_content:
             # Fallback if empty
             user_content.append({"type": "text", "text": "Describe a generic pleasant scent."})

        messages.append({"role": "user", "content": user_content})

        try:
            response = await self.client.chat.completions.create(
                model=self.model_chat,
                messages=messages,
                response_format={"type": "json_object"}
            )
            content = response.choices[0].message.content
            # Clean markdown code blocks if present
            if content.strip().startswith("```"):
                content = content.strip().split("\n", 1)[-1].rsplit("\n", 1)[0]
                if content.startswith("json"):
                    content = content[4:].strip()
            
            # Log the raw content for debugging if parsing fails
            try:
                return json.loads(content)
            except json.JSONDecodeError as e:
                logger.error(f"JSON Parse Error. Raw content: {content}")
                raise e
                raise e
        except Exception as e:
            logger.error(f"AI Extraction Failed: {e}")
            raise e

    async def embed(self, text: str) -> List[float]:
        """
        Generate embeddings. OpenRouter supports this via standard endpoint usually, 
        or we might need a specific model.
        """
        try:
            # Note: OpenRouter might route embeddings differently or strict OpenAI compatibility.
            # If this fails, we might need a direct OpenAI key or a different provider.
            # Trying standard call first.
            response = await self.client.embeddings.create(
                input=text,
                model=self.model_embedding
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Embedding Failed: {e}")
            # Fallback mock for MVP stability if API key doesn't support embeddings
            return [0.0] * 1536 

    async def explain(self, sku_name: str, sku_tags: Dict, user_context: Dict) -> str:
        """
        Generate explanation.
        """
        prompt = (
            f"Explain why the perfume '{sku_name}' (Tags: {sku_tags}) matches "
            f"the user's request: {user_context}. "
            "Keep it poetic, short (2 sentences), and persuasive."
        )
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model_chat,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content
        except Exception as e:
             logger.error(f"Explanation Failed: {e}")
             return f"A perfect match for your {user_context.get('mood', 'unique')} vibe."

    async def chat(self, messages: List[Dict[str, str]]) -> str:
        """
        Direct chat completion.
        messages: [{"role": "user", "content": "..."}]
        """
        try:
            response = await self.client.chat.completions.create(
                model=self.model_chat,
                messages=messages
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Chat Completion Failed: {e}")
            raise e
