from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.submissions import router as submissions_router
from app.database import Base, engine

# Load environment variables from .env file
load_dotenv()


app = FastAPI(title="ACRA Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Create database tables on startup if they don't exist."""
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created/verified successfully")
    except Exception as e:
        print(f"⚠️  Warning: Could not connect to database: {e}")
        print("   The server will start, but database operations will fail until PostgreSQL is running.")

app.include_router(submissions_router, prefix="/api")


