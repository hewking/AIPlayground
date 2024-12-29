from typing import List, Dict, Any
import gitlab
from ..core.base import BaseLLM
import difflib
import re

class GitLabCodeReviewer:
    def __init__(
        self, 
        gitlab_url: str,
        private_token: str,
        project_id: int,
        llm: BaseLLM
    ):
        self.gl = gitlab.Gitlab(gitlab_url, private_token=private_token)
        self.project = self.gl.projects.get(project_id)
        self.llm = llm

    async def review_merge_request(self, mr_iid: int) -> None:
        """审查指定的合并请求"""
        mr = self.project.mergerequests.get(mr_iid)
        changes = mr.changes()
        
        for change in changes.get('changes', []):
            await self._review_file_changes(mr, change)

    async def _review_file_changes(self, mr: Any, change: Dict[str, Any]) -> None:
        """审查单个文件的变更"""
        file_path = change.get('new_path')
        if not self._should_review_file(file_path):
            return

        diff = change.get('diff', '')
        if not diff:
            return

        # 准备代码上下文
        context = self._extract_diff_context(diff)
        
        # 生成审查提示
        prompt = self._create_review_prompt(file_path, context)
        
        # 获取 AI 反馈
        try:
            review_comment = await self.llm.generate(prompt)
            if review_comment.strip():
                self._post_review_comment(mr, file_path, review_comment)
        except Exception as e:
            print(f"Error reviewing {file_path}: {str(e)}")

    def _should_review_file(self, file_path: str) -> bool:
        """判断文件是否需要审查"""
        if not file_path:
            return False
            
        # 忽略的文件类型
        ignore_patterns = [
            r'\.lock$',
            r'\.json$',
            r'\.md$',
            r'\.txt$',
            r'\.yaml$',
            r'\.yml$',
            r'package-lock\.json$',
            r'yarn\.lock$',
            r'\.gitignore$',
            r'\.env.*',
        ]
        
        return not any(re.search(pattern, file_path) for pattern in ignore_patterns)

    def _extract_diff_context(self, diff: str) -> Dict[str, Any]:
        """提取差异上下文"""
        lines = diff.split('\n')
        added_lines = []
        removed_lines = []
        
        for line in lines:
            if line.startswith('+') and not line.startswith('+++'):
                added_lines.append(line[1:])
            elif line.startswith('-') and not line.startswith('---'):
                removed_lines.append(line[1:])
                
        return {
            'added': added_lines,
            'removed': removed_lines,
            'full_diff': diff
        }

    def _create_review_prompt(self, file_path: str, context: Dict[str, Any]) -> str:
        """创建代码审查提示"""
        return f"""请作为高级开发工程师审查以下代码变更:

文件: {file_path}

变更内容:
{context['full_diff']}
"""
