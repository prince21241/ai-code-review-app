import json
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import WebSocket, WebSocketDisconnect
from app.api.submissions import router as submissions_router
from app.analyzers.basic import generate_basic_issues

app = FastAPI(title="ACRA Backend")

logging.basicConfig(level=logging.INFO)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(submissions_router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.websocket("/ws/review")
async def ws_review(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            data = await ws.receive_text()
            try:
                payload = json.loads(data)
                code = payload.get("code", "")
                language = payload.get("language")
                issues = generate_basic_issues(code, language)
                await ws.send_text(json.dumps({"issues": issues}))
            except Exception as e:
                await ws.send_text(json.dumps({"error": str(e)}))
    except WebSocketDisconnect:
        return