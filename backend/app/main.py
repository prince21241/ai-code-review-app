from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.submissions import router as submissions_router


app = FastAPI(title="ACRA Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(submissions_router, prefix="/api")


