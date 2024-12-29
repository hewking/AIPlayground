from ..core.base import BaseLLM
from ..core.exceptions import APIKeyNotFoundError, ModelNotAvailableError
from ..config.settings import DEEPSEEK_API_KEY
import asyncio
import httpx
import json

class DeepSeekLLM(BaseLLM):
    def __init__(self, api_key: str = DEEPSEEK_API_KEY, max_retries: int = 3):
        if not api_key:
            raise APIKeyNotFoundError("DeepSeek API key not found")
        super().__init__(api_key)
        self.base_url = "https://api.deepseek.com/v1"
        self.headers = {"Authorization": f"Bearer {api_key}"}
        self.max_retries = max_retries

    async def _make_request(self, prompt: str, stream: bool = False, **kwargs):
        async with httpx.AsyncClient(base_url=self.base_url) as client:
            for attempt in range(self.max_retries):
                try:
                    response = await client.post(
                        "/chat/completions",
                        headers=self.headers,
                        json={
                            "model": "deepseek-chat",
                            "messages": [{"role": "user", "content": prompt}],
                            "temperature": kwargs.get("temperature", 0.7),
                            "max_tokens": kwargs.get("max_tokens", 2000),
                            "stream": stream
                        }
                    )
                    response.raise_for_status()
                    return response
                except httpx.HTTPError as e:
                    error_msg = str(e)
                    if "quota exceeded" in error_msg.lower():
                        raise ModelNotAvailableError("DeepSeek API quota exceeded")
                    if "rate limit" in error_msg.lower():
                        if attempt == self.max_retries - 1:
                            raise
                        wait_time = (2 ** attempt) + 1
                        print(f"Rate limit hit, waiting {wait_time} seconds...")
                        await asyncio.sleep(wait_time)
                        continue
                    raise

    async def generate(self, prompt: str, **kwargs) -> str:
        response = await self._make_request(prompt, stream=False, **kwargs)
        return response.json()["choices"][0]["message"]["content"]

    async def stream(self, prompt: str, **kwargs):
        response = await self._make_request(prompt, stream=True, **kwargs)
        async for line in response.aiter_lines():
            if line.startswith("data: "):
                line = line[6:].strip()  # Remove "data: " prefix
                if line and line != "[DONE]":
                    try:
                        data = json.loads(line)
                        if content := data.get("choices", [{}])[0].get("delta", {}).get("content"):
                            yield content
                    except json.JSONDecodeError:
                        continue 