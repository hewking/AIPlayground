import asyncio
import sys
import os

# 添加项目根目录到 Python 路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.models.openai_llm import OpenAILLM
from src.models.gemini_llm import GeminiLLM
from src.core.exceptions import APIKeyNotFoundError

async def test_completion(llm, prompt: str):
    """测试基础文本生成"""
    try:
        response = await llm.generate(prompt)
        print(f"\n{llm.__class__.__name__} 响应:")
        print("-" * 50)
        print(response)
        print("-" * 50)
    except Exception as e:
        print(f"错误: {str(e)}")

async def test_streaming(llm, prompt: str):
    """测试流式输出"""
    try:
        print(f"\n{llm.__class__.__name__} 流式响应:")
        print("-" * 50)
        async for chunk in llm.stream(prompt):
            print(chunk, end="", flush=True)
        print("\n" + "-" * 50)
    except Exception as e:
        print(f"错误: {str(e)}")

async def main():
    # 测试提示语
    prompts = {
        "basic": "请用简短的话介绍下你自己。",
        "creative": "写一个关于未来科技的短故事，不超过100字。",
        "stream": "请从1数到5，每个数字单独一行。"
    }

    try:
        # 初始化模型
        openai_llm = OpenAILLM()
        gemini_llm = GeminiLLM()

        # 测试基础文本生成
        print("\n=== 基础文本生成测试 ===")
        for llm in [openai_llm, gemini_llm]:
            await test_completion(llm, prompts["basic"])

        # 测试创意写作
        print("\n=== 创意写作测试 ===")
        for llm in [openai_llm, gemini_llm]:
            await test_completion(llm, prompts["creative"])

        # 测试流式输出
        print("\n=== 流式输出测试 ===")
        for llm in [openai_llm, gemini_llm]:
            await test_streaming(llm, prompts["stream"])

    except APIKeyNotFoundError as e:
        print(f"API密钥错误: {str(e)}")
    except Exception as e:
        print(f"发生错误: {str(e)}")

if __name__ == "__main__":
    print("开始AI模型测试...")
    asyncio.run(main()) 