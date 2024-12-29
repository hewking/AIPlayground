from ..core.base import BaseLLM
from ..core.exceptions import APIKeyNotFoundError, ModelNotAvailableError
from ..config.settings import DEEPSEEK_API_KEY
import asyncio
import httpx
import json

class DeepSeekLLM(BaseLLM):
    def __init__(
        self, 
        api_key: str = DEEPSEEK_API_KEY, 
        max_retries: int = 3,
        timeout: float = 60.0  # 增加超时配置
    ):
        if not api_key:
            raise APIKeyNotFoundError("DeepSeek API key not found")
        super().__init__(api_key)
        self.base_url = "https://api.deepseek.com/v1"
        self.headers = {"Authorization": f"Bearer {api_key}"}
        self.max_retries = max_retries
        self.timeout = timeout

    async def _make_request(self, prompt: str, stream: bool = False, **kwargs):
        # 配置 httpx 客户端
        client_settings = {
            "base_url": self.base_url,
            "timeout": httpx.Timeout(
                connect=10.0,  # 连接超时
                read=self.timeout,  # 读取超时
                write=10.0,  # 写入超时
                pool=10.0  # 连接池超时
            ),
            "limits": httpx.Limits(
                max_keepalive_connections=5,
                max_connections=10,
                keepalive_expiry=30.0
            )
        }

        async with httpx.AsyncClient(**client_settings) as client:
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
                except httpx.TimeoutException as e:
                    print(f"Request timeout on attempt {attempt + 1}/{self.max_retries}")
                    if attempt == self.max_retries - 1:
                        raise ModelNotAvailableError(f"DeepSeek API timeout after {self.max_retries} attempts")
                    wait_time = (2 ** attempt) + 1
                    await asyncio.sleep(wait_time)
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
        try:
            response = await self._make_request(prompt, stream=False, **kwargs)
            return response.json()["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"Error in generate: {str(e)}")
            raise

    async def stream(self, prompt: str, **kwargs):
        try:
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
        except Exception as e:
            print(f"Error in stream: {str(e)}")
            raise 