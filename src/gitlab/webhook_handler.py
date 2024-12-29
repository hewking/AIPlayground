from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import hmac
import hashlib
from .code_reviewer import GitLabCodeReviewer
from ..models.openai_llm import OpenAILLM  # 或使用其他 LLM
import os

app = FastAPI()

# CORS 设置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 配置
GITLAB_URL = os.getenv("GITLAB_URL")
GITLAB_TOKEN = os.getenv("GITLAB_TOKEN")
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET")

# 初始化 LLM
llm = OpenAILLM()

@app.post("/webhook/gitlab")
async def handle_webhook(request: Request):
    # 验证 Webhook 签名
    signature = request.headers.get("X-Gitlab-Token")
    if not signature or signature != WEBHOOK_SECRET:
        raise HTTPException(status_code=403, detail="Invalid signature")

    payload = await request.json()
    
    # 只处理合并请求事件
    if payload.get("object_kind") != "merge_request":
        return {"status": "ignored"}

    # 只在开启合并请求时进行审查
    if payload.get("object_attributes", {}).get("action") != "open":
        return {"status": "ignored"}

    try:
        project_id = payload["project"]["id"]
        mr_iid = payload["object_attributes"]["iid"]

        # 初始化代码审查器
        reviewer = GitLabCodeReviewer(
            gitlab_url=GITLAB_URL,
            private_token=GITLAB_TOKEN,
            project_id=project_id,
            llm=llm
        )

        # 执行代码审查
        await reviewer.review_merge_request(mr_iid)
        
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 