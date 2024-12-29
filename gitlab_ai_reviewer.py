import gitlab
import openai
import os
from datetime import datetime

class GitLabAIReviewer:
    def __init__(self, gitlab_url, private_token, project_id, openai_key):
        self.gl = gitlab.Gitlab(gitlab_url, private_token=private_token)
        self.project = self.gl.projects.get(project_id)
        openai.api_key = openai_key

    def get_merge_requests(self, state='opened'):
        """获取待审查的合并请求"""
        return self.project.mergerequests.list(state=state)

    def get_changes(self, mr):
        """获取合并请求的具体改动"""
        changes = mr.changes()
        return changes['changes']

    def review_code(self, code_diff):
        """使用 OpenAI API 审查代码"""
        prompt = f"""
        请审查以下代码改动,重点关注:
        1. 代码质量和最佳实践
        2. 潜在的 bug
        3. 安全隐患
        4. 性能问题
        5. 可维护性

        代码改动:
        {code_diff}
        """

        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "你是一个专业的代码审查助手,请提供详细的代码审查意见。"},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message['content']

    def post_review_comment(self, mr, review_comment):
        """发布审查评论"""
        mr.notes.create({
            'body': f"AI 代码审查意见:\n\n{review_comment}\n\n"
                   f"_自动审查时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}_"
        })

    def run(self):
        """运行审查流程"""
        mrs = self.get_merge_requests()
        for mr in mrs:
            if not mr.has_conflicts:
                changes = self.get_changes(mr)
                for change in changes:
                    review_comment = self.review_code(change['diff'])
                    self.post_review_comment(mr, review_comment)