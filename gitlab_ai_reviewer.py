import gitlab
from datetime import datetime
import os
from typing import Optional, List, Dict, Any
from src.models.openai_llm import OpenAILLM
from src.models.deepseek_llm import DeepSeekLLM
from src.core.base import BaseLLM
from src.core.exceptions import APIKeyNotFoundError, ModelNotAvailableError
import asyncio

class GitLabAIReviewer:
    def __init__(
        self, 
        gitlab_url: str, 
        private_token: str, 
        project_id: int,
        model_type: str = "deepseek",  # 默认使用 deepseek
        max_files: int = 10,
        max_lines: int = 500
    ):
        self.gl = gitlab.Gitlab(gitlab_url, private_token=private_token)
        self.project = self.gl.projects.get(project_id)
        self.max_files = max_files
        self.max_lines = max_lines
        self.llm = self._init_llm(model_type)

    def _init_llm(self, model_type: str) -> BaseLLM:
        """初始化 LLM 模型"""
        if model_type == "deepseek":
            # 优先使用 CI 环境变量中的 API key
            api_key = os.getenv("DEEPSEEK_API_KEY")
            if not api_key:
                raise ValueError("DEEPSEEK_API_KEY not found in environment variables")
            return DeepSeekLLM(api_key=api_key)
        elif model_type == "openai":
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise ValueError("OPENAI_API_KEY not found in environment variables")
            return OpenAILLM(api_key=api_key)
        else:
            raise ValueError(f"Unsupported model type: {model_type}")

    async def get_merge_requests(self, state: str = 'opened') -> List[Any]:
        """获取待审查的合并请求"""
        return self.project.mergerequests.list(state=state)

    def get_changes(self, mr: Any) -> List[Dict[str, Any]]:
        """获取合并请求的具体改动"""
        changes = mr.changes()
        return changes['changes'][:self.max_files]  # 限制文件数量

    def _should_review_file(self, file_path: str) -> bool:
        """判断文件是否需要审查"""
        ignore_patterns = [
            r'\.lock$',
            r'package-lock\.json$',
            r'yarn\.lock$',
            r'\.gitignore$',
            r'\.env.*',
            r'\.md$',
            r'\.txt$',
            r'\.csv$',
            r'\.json$',
            r'\.yaml$',
            r'\.yml$',
        ]
        return not any(re.search(pattern, file_path) for pattern in ignore_patterns)

    def _prepare_review_prompt(self, change: Dict[str, Any]) -> str:
        """准备代码审查提示"""
        file_path = change.get('new_path', '')
        diff = change.get('diff', '')
        
        if len(diff.split('\n')) > self.max_lines:
            diff = '\n'.join(diff.split('\n')[:self.max_lines]) + "\n... (diff too long, truncated)"

        return f"""作为高级开发工程师，请审查以下代码改动。

文件路径: {file_path}

代码改动:
{diff}

请根据以下准则进行审查：
1. 确保代码改动符合项目规范和最佳实践。
2. 检查是否存在潜在的错误或改进空间。
3. 提供详细的审查意见和建议。
"""

async def main():
    """CI 环境中的入口函数"""
    try:
        # 从 CI 环境变量获取值
        if os.getenv("CI_SERVER_URL"):  # 检查是否在 CI 环境中
            gitlab_url = os.getenv("CI_SERVER_URL")
            # 尝试两个可能的变量名
            gitlab_token = os.getenv("GITLAB_API_TOKEN") or os.getenv("GITLAB_TOKEN")
            project_id = os.getenv("CI_PROJECT_ID")
            mr_iid = os.getenv("CI_MERGE_REQUEST_IID")
        else:
            # 从 .env 文件获取本地开发环境的值
            gitlab_url = os.getenv("GITLAB_URL")
            gitlab_token = os.getenv("GITLAB_TOKEN")
            project_id = os.getenv("GITLAB_PROJECT_ID")
            mr_iid = os.getenv("REVIEW_MR_IID")

        model_type = os.getenv("REVIEW_MODEL", "deepseek")
        
        # 打印调试信息
        print(f"GitLab URL: {gitlab_url}")
        print(f"Project ID: {project_id}")
        print(f"MR IID: {mr_iid}")
        
        # 验证必要的环境变量
        if not all([gitlab_url, gitlab_token, project_id, mr_iid]):
            missing_vars = []
            if not gitlab_url: missing_vars.append("GITLAB_URL/CI_SERVER_URL")
            if not gitlab_token: missing_vars.append("GITLAB_TOKEN/GITLAB_API_TOKEN")
            if not project_id: missing_vars.append("GITLAB_PROJECT_ID/CI_PROJECT_ID")
            if not mr_iid: missing_vars.append("REVIEW_MR_IID/CI_MERGE_REQUEST_IID")
            
            raise ValueError(
                f"Missing required environment variables: {', '.join(missing_vars)}"
            )

        print(f"Starting code review for MR !{mr_iid}")
        
        reviewer = GitLabAIReviewer(
            gitlab_url=gitlab_url,
            private_token=gitlab_token,
            project_id=int(project_id),
            model_type=model_type,
            max_files=int(os.getenv("REVIEW_MAX_FILES", "10")),
            max_lines=int(os.getenv("REVIEW_MAX_LINES", "500"))
        )

        await reviewer.run(mr_iid=int(mr_iid))
        print("Code review completed successfully")
        
    except Exception as e:
        print(f"Error during code review: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(main())