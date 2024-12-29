import google.generativeai as genai
from ..core.base import BaseLLM
from ..core.exceptions import APIKeyNotFoundError
from ..config.settings import GEMINI_API_KEY
import asyncio
import time

class GeminiLLM(BaseLLM):
    def __init__(self, api_key: str = GEMINI_API_KEY, max_retries: int = 3):
        if not api_key:
            raise APIKeyNotFoundError("Gemini API key not found")
        super().__init__(api_key)
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')
        self.max_retries = max_retries

    async def _retry_with_backoff(self, func, *args, **kwargs):
        for attempt in range(self.max_retries):
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                if "RATE_LIMIT_EXCEEDED" in str(e):
                    if attempt == self.max_retries - 1:
                        raise
                    wait_time = (2 ** attempt) + 1  # 指数退避
                    print(f"Rate limit hit, waiting {wait_time} seconds...")
                    await asyncio.sleep(wait_time)
                else:
                    raise

    async def generate(self, prompt: str, **kwargs) -> str:
        response = await self._retry_with_backoff(
            self.model.generate_content_async,
            prompt
        )
        return response.text

    async def stream(self, prompt: str, **kwargs):
        response = await self._retry_with_backoff(
            self.model.generate_content_async,
            prompt,
            stream=True
        )
        async for chunk in response:
            if chunk.text:
                yield chunk.text 