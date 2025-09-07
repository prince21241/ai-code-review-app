#!/usr/bin/env python3
import uvicorn
from fastapi import FastAPI

app = FastAPI(title="ACRA Backend")

@app.get("/")
async def root():
    return {"message": "ACRA Backend is running!"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True
    )
