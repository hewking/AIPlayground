from openai import AsyncOpenAI
from ..core.base import BaseLLM
from ..core.exceptions import APIKeyNotFoundError, ModelNotAvailableError
from ..config.settings import OPENAI_API_KEY, DEFAULT_MODEL
import asyncio

class OpenAILLM(BaseLLM):
    def __init__(self, api_key: str = OPENAI_API_KEY, max_retries: int = 3):
        if not api_key:
            raise APIKeyNotFoundError("OpenAI API key not found")
        super().__init__(api_key)
        self.client = AsyncOpenAI(api_key=api_key)
        self.max_retries = max_retries
        
    async def _handle_api_call(self, func, *args, **kwargs):
        for attempt in range(self.max_retries):
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                error_msg = str(e)
                if "insufficient_quota" in error_msg:
                    raise ModelNotAvailableError("OpenAI API quota exceeded. Please check your billing details.")
                if "rate_limit_exceeded" in error_msg.lower():
                    if attempt == self.max_retries - 1:
                        raise
                    wait_time = (2 ** attempt) + 1
                    print(f"Rate limit hit, waiting {wait_time} seconds...")
                    await asyncio.sleep(wait_time)
                    continue
                raise
        
    async def generate(self, prompt: str, **kwargs) -> str:
        try:
            response = await self._handle_api_call(
                self.client.chat.completions.create,
                model=kwargs.get("model", DEFAULT_MODEL),
                messages=[{"role": "user", "content": prompt}],
                temperature=kwargs.get("temperature", 0.7),
            )
            return response.choices[0].message.content
        finally:
            await self.client.close()

    async def stream(self, prompt: str, **kwargs):
        try:
            response = await self._handle_api_call(
                self.client.chat.completions.create,
                model=kwargs.get("model", DEFAULT_MODEL),
                messages=[{"role": "user", "content": prompt}],
                temperature=kwargs.get("temperature", 0.7),
                stream=True
            )
            async for chunk in response:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        finally:
            await self.client.close() 