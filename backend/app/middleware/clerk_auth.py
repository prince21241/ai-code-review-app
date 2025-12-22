"""
Clerk authentication middleware for FastAPI.
Verifies JWT tokens from Clerk.
"""
import os
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from typing import Optional

security = HTTPBearer(auto_error=False)

# Get Clerk secret key from environment
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")

if not CLERK_SECRET_KEY:
    print("⚠️  Warning: CLERK_SECRET_KEY not set. Authentication will be optional.")


def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security)
) -> dict:
    """
    Dependency to get current authenticated user (optional).
    Returns user info if token is present, otherwise returns anonymous user.
    
    Note: Full token verification requires Clerk's backend API or JWKS verification.
    For production, implement proper JWT verification using Clerk's public keys.
    """
    if not CLERK_SECRET_KEY:
        # Authentication not configured - allow all requests
        return {"id": "anonymous", "email": None, "username": None}
    
    if not credentials:
        # No token provided - allow request but mark as anonymous
        return {"id": "anonymous", "email": None, "username": None}
    
    # Token is present - in production, verify it properly
    # For now, extract user info from token (basic implementation)
    token = credentials.credentials
    
    # TODO: Implement proper JWT verification using Clerk's JWKS
    # For now, if token exists, assume user is authenticated
    # In production, verify the token signature using Clerk's public keys
    return {
        "id": "authenticated_user",
        "email": None,
        "username": None,
        "token": token[:20] + "..." if len(token) > 20 else token  # For debugging
    }


def get_current_user_required(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security)
) -> dict:
    """
    Dependency to require authentication.
    Raises 401 if not authenticated.
    """
    if not CLERK_SECRET_KEY:
        raise HTTPException(status_code=401, detail="Authentication required but not configured")
    
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required. Please sign in.")
    
    token = credentials.credentials
    
    # TODO: Implement proper token verification
    # For now, if token exists, allow request
    return {
        "id": "authenticated_user",
        "email": None,
        "username": None
    }

