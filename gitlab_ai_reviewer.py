import gitlab
from datetime import datetime
import os
from typing import Optional, List, Dict, Any
from src.models.openai_llm import OpenAILLM
from src.models.deepseek_llm import DeepSeekLLM
from src.core.base import BaseLLM
from src.core.exceptions import APIKeyNotFoundError, ModelNotAvailableError
import asyncio
import re


class GitLabAIReviewer:
    def __init__(
        self,
        gitlab_url: str,
        private_token: str,
        project_id: int,
        model_type: str = "deepseek",  # 默认使用 deepseek
        max_files: int = 10,
        max_lines: int = 500,
    ):
        self.gl = gitlab.Gitlab(gitlab_url, private_token=private_token)
        self.project = self.gl.projects.get(project_id)
        self.max_files = max_files
        self.max_lines = max_lines
        self.llm = self._init_llm(model_type)

    def _init_llm(self, model_type: str) -> BaseLLM:
        """初始化 LLM 模型"""
        if model_type == "deepseek":
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

    async def get_merge_requests(self, state: str = "opened") -> List[Any]:
        """获取待审查的合并请求"""
        return self.project.mergerequests.list(state=state)

    def get_changes(self, mr: Any) -> List[Dict[str, Any]]:
        """获取合并请求的具体改动"""
        changes = mr.changes()
        return changes["changes"][: self.max_files]  # 限制文件数量

    def _should_review_file(self, file_path: str) -> bool:
        """判断文件是否需要审查"""
        ignore_patterns = [
            r"\.lock$",
            r"package-lock\.json$",
            r"yarn\.lock$",
            r"\.gitignore$",
            r"\.env.*",
            r"\.md$",
            r"\.txt$",
            r"\.csv$",
            r"\.json$",
            r"\.yaml$",
            r"\.yml$",
        ]
        return not any(re.search(pattern, file_path) for pattern in ignore_patterns)

    def _prepare_review_prompt(self, change: Dict[str, Any]) -> str:
        """准备代码审查提示"""
        file_path = change.get("new_path", "")
        diff = change.get("diff", "")
        file_extension = os.path.splitext(file_path)[1] if file_path else ""

        if len(diff.split("\n")) > self.max_lines:
            diff = (
                "\n".join(diff.split("\n")[: self.max_lines])
                + "\n... (diff too long, truncated)"
            )

        # 根据文件类型调整审查重点
        language_specific_checks = {
            ".py": """Python 特定检查点:
- 代码是否遵循 PEP 8 规范
- 是否正确处理异常
- 是否有适当的类型注解
- 是否有必要的文档字符串
- 是否正确使用异步特性""",
            ".js": """JavaScript 特定检查点:
- 是否使用现代 ES6+ 特性
- 是否正确处理异步操作
- 是否有潜在的内存泄漏
- 是否考虑浏览器兼容性
- 是否遵循项目的 ESLint 规则""",
            ".go": """Go 特定检查点:
- 是否遵循 Go 的代码规范
- 错误处理是否合适
- 是否有潜在的并发问题
- 是否正确使用 defer
- 性能优化建议""",
        }.get(file_extension, "")

        security_checks = """安全检查:
1. 是否存在潜在的安全漏洞
2. 敏感信息是否得到保护
3. 输入验证是否充分
4. 是否有权限控制问题
5. 是否有潜在的注入风险"""

        performance_checks = """性能检查:
1. 算法复杂度是否合理
2. 是否有性能瓶颈
3. 资源使用是否高效
4. 是否有不必要的计算
5. 缓存策略是否合适"""

        maintainability_checks = """可维护性检查:
1. 代码结构是否清晰
2. 命名是否符合规范
3. 是否有重复代码
4. 是否有适当的注释
5. 是否遵循 SOLID 原则"""

        return f"""作为高级开发工程师，请对以下代码变更进行全面审查。

文件信息:
- 路径: {file_path}
- 类型: {file_extension}

代码变更:
{diff}

请根据以下准则进行审查：
1. 确保代码改动符合项目规范和最佳实践。
2. 检查是否存在潜在的错误或改进空间。
3. 提供详细的审查意见和建议。

{language_specific_checks}

{security_checks}

{performance_checks}

{maintainability_checks}
"""

    async def review_code(self, change: Dict[str, Any]) -> Optional[str]:
        """使用 LLM 审查代码"""
        try:
            if not self._should_review_file(change.get("new_path", "")):
                print(f"Skipping file: {change.get('new_path', '')}")
                return None

            prompt = self._prepare_review_prompt(change)
            print(f"Reviewing file: {change.get('new_path', '')}")
            print(f"Prompt length: {len(prompt)} characters")

            review_comment = await self.llm.generate(prompt)
            if not review_comment:
                print("Warning: Empty review comment received")
            return review_comment
        except Exception as e:
            print(f"Error reviewing code: {str(e)}")
            print(f"Error type: {type(e)}")
            import traceback

            print(f"Traceback: {traceback.format_exc()}")
            return None

    def post_review_comment(self, mr: Any, file_path: str, review_comment: str) -> None:
        """发布审查评论"""
        comment = (
            f"## AI 代码审查意见 - `{file_path}`\n\n"
            f"{review_comment}\n\n"
            f"---\n"
            f"_自动审查时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}_"
        )
        mr.notes.create({"body": comment})

    async def run(self, mr_iid: Optional[int] = None) -> None:
        """运行审查流程"""
        try:
            if mr_iid:
                mr = self.project.mergerequests.get(mr_iid)
                mrs = [mr]
            else:
                mrs = self.get_merge_requests()

            for mr in mrs:
                print(f"Reviewing MR: {mr.iid}")
                if not mr.has_conflicts:
                    changes = self.get_changes(mr)
                    print(f"Found {len(changes)} files to review")
                    for change in changes:
                        review_comment = await self.review_code(change)
                        if review_comment:
                            self.post_review_comment(mr, change["new_path"], review_comment)
                            print(f"Posted review for {change['new_path']}")
                        else:
                            print(f"No review comment generated for {change['new_path']}")
                else:
                    print(f"MR {mr.iid} has conflicts, skipping")
        except Exception as e:
            print(f"Error in review process: {str(e)}")
            import traceback

            print(f"Traceback: {traceback.format_exc()}")
            raise


async def main():
    """CI 环境中的入口函数"""
    try:
        # 从 CI 环境变量获取值
        if os.getenv("CI_SERVER_URL"):  # 检查是否在 CI 环境中
            gitlab_url = os.getenv("CI_SERVER_URL")
            gitlab_token = os.getenv("GITLAB_API_TOKEN")
            project_id = os.getenv("CI_PROJECT_ID")
            mr_iid = os.getenv("CI_MERGE_REQUEST_IID")
        else:
            # 从 .env 文件获取本地开发环境的值
            gitlab_url = os.getenv("GITLAB_URL")
            gitlab_token = os.getenv("GITLAB_API_TOKEN")
            project_id = os.getenv("GITLAB_PROJECT_ID")
            mr_iid = os.getenv("REVIEW_MR_IID")

        model_type = os.getenv("REVIEW_MODEL", "deepseek")

        # 打印调试信息
        print(f"GitLab URL: {gitlab_url}")
        print(f"Project ID: {project_id}")
        print(f"MR IID: {mr_iid}")
        print(f"Model Type: {model_type}")
        print(f"GitLab Token: {gitlab_token}")
        print(f"DeepSeek API Key: {os.getenv('DEEPSEEK_API_KEY')}")
        print(f"OpenAI API Key: {os.getenv('OPENAI_API_KEY')}")

        # 验证必要的环境变量
        if not all([gitlab_url, gitlab_token, project_id, mr_iid]):
            missing_vars = []
            if not gitlab_url:
                missing_vars.append("GITLAB_URL/CI_SERVER_URL")
            if not gitlab_token:
                missing_vars.append("GITLAB_TOKEN/GITLAB_API_TOKEN")
            if not project_id:
                missing_vars.append("GITLAB_PROJECT_ID/CI_PROJECT_ID")
            if not mr_iid:
                missing_vars.append("REVIEW_MR_IID/CI_MERGE_REQUEST_IID")

            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")

        print(f"Starting code review for MR !{mr_iid}")

        reviewer = GitLabAIReviewer(
            gitlab_url=gitlab_url,
            private_token=gitlab_token,
            project_id=int(project_id),
            model_type=model_type,
            max_files=int(os.getenv("REVIEW_MAX_FILES", "10")),
            max_lines=int(os.getenv("REVIEW_MAX_LINES", "500")),
        )

        await reviewer.run(mr_iid=int(mr_iid))
        print("Code review completed successfully")

    except Exception as e:
        print(f"Error during code review: {str(e)}")
        raise


if __name__ == "__main__":
    asyncio.run(main())