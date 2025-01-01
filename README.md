# GitLab AI Code Review

基于 GitLab + LLM 的智能代码审查工具，支持多种 AI 模型，可通过 CI/CD 或 Webhook 触发。

## 特性

- 多模型支持：OpenAI、DeepSeek、Gemini
- 多种触发方式：GitLab CI/CD、Webhook
- 智能代码分析：基于文件类型的差异化审查
- 异步处理：高效的并发审查机制
- 自动重试：API 调用失败时的指数退避重试
- 文件过滤：智能忽略不需要审查的文件类型

## 安装

```bash
git clone https://gitlab.com/your-username/gitlab-ai-reviewer.git
cd gitlab-ai-reviewer
pip install -r requirements.txt
```

## 环境变量配置

创建 `.env` 文件：

```bash
# GitLab 配置
GITLAB_URL=https://gitlab.com
GITLAB_TOKEN=your_gitlab_token
GITLAB_PROJECT_ID=your_project_id

# AI 模型配置 (至少配置一个)
OPENAI_API_KEY=your_openai_key
DEEPSEEK_API_KEY=your_deepseek_key
GEMINI_API_KEY=your_gemini_key

# Webhook 配置 (可选)
WEBHOOK_SECRET=your_webhook_secret
```

## GitLab CI/CD 配置

在项目中添加 `.gitlab-ci.yml`：

```yaml
include:
  - local: ".gitlab-ci.yml"
```

在 GitLab 项目设置中配置 CI/CD 变量：

```
Settings > CI/CD > Variables
```

## 使用方式

### 1. CI/CD 触发

- 创建 Merge Request 时自动触发代码审查
- 审查结果作为评论直接显示在 MR 中

### 2. Webhook 触发

```bash
# 启动 Webhook 服务器
uvicorn src.gitlab.webhook_handler:app --host 0.0.0.0 --port 8000
```

## 开发指南

### 添加新的 LLM 支持

1. 在 `src/models` 创建新模型类
2. 继承 `BaseLLM` 并实现必要方法
3. 在 `GitLabAIReviewer` 中添加模型支持

```python
class NewLLM(BaseLLM):
    async def generate(self, prompt: str, **kwargs) -> str:
        # 实现生成方法
        pass

    async def stream(self, prompt: str, **kwargs) -> AsyncIterator[str]:
        # 实现流式输出
        pass
```

### 自定义审查规则

在 `_prepare_review_prompt` 方法中添加新的检查规则：

```73:120:gitlab_ai_reviewer.py
    def _prepare_review_prompt(self, change: Dict[str, Any]) -> str:
        """准备代码审查提示"""
        file_path = change.get("new_path", "")
        diff = change.get("diff", "")
        file_extension = os.path.splitext(file_path)[1] if file_path else ""
        is_react_native = "react-native" in file_path.lower() or "/rn/" in file_path.lower()

        if len(diff.split("\n")) > self.max_lines:

2. 检查是否存在潜在的错误或改进空间。
                + "\n... (diff too long, truncated)"
            )
    """CI 环境中的入口函数"""
        # 根据文件类型调整审查重点
        language_specific_checks = {
            ".py": """Python 特定检查点:
- 代码是否遵循 PEP 8 规范
- 是否正确处理异常
- 是否有适当的类型注解
- 是否有必要的文档字符串
- 是否正确使用异步特性""",
            ".ts": """TypeScript 特定检查点:
- 类型定义是否准确和完整
- 是否正确使用 TypeScript 特性（泛型、接口、类型守卫等）
- 是否避免了 any 类型的滥用
- 是否正确处理 null/undefined
- 是否使用了合适的类型推导
- 是否遵循项目的 TSConfig 配置
- 是否有不必要的类型断言
- 错误处理是否完善
- 是否考虑了类型的向后兼容性""" + ("""
        reviewer = GitLabAIReviewer(
React Native 类型检查点:
- 原生模块类型定义是否完整
- 平台特定类型是否正确处理
- 事件类型是否准确定义
- 样式类型是否符合 React Native 规范
- 导航参数类型是否完整
- 第三方库类型集成是否正确""" if is_react_native else ""),
            ".tsx": """React TypeScript 特定检查点:
- 组件 Props 和 State 的类型定义是否完整
- 是否正确使用 React.FC 或函数组件声明
- 事件处理器的类型是否正确
- 是否正确使用 React Hooks 的类型
- 是否避免了不必要的重渲
        raise
- 是否正确处理异步状态和加载状态
- 是否遵循 React 最佳实践
```

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Merge Request

## 许可证

MIT License

## 作者

Your Name <your.email@example.com>

## 更新日志

### v1.0.0

- 初始版本发布
- 支持 OpenAI、DeepSeek、Gemini
- CI/CD 和 Webhook 集成

### v1.1.0 (计划中)

- 支持更多 AI 模型
- 自定义规则引擎
- 审查报告优化
- 团队协作增强
