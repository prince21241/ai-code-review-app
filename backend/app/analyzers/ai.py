"""
AI-powered code review using free APIs.
Supports Groq, Ollama, and Hugging Face.
"""
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Try to import optional dependencies
try:
    import requests
except ImportError:
    requests = None

try:
    from groq import Groq
except ImportError:
    Groq = None

try:
    import google.generativeai as genai
except ImportError:
    genai = None


def generate_ai_review_groq(code: str, language: Optional[str] = None) -> str:
    """
    Generate code review using Groq API (free tier: 14,400 requests/day).
    Get API key: https://console.groq.com/
    """
    if not Groq:
        raise ImportError("Install groq: pip install groq")
    
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable not set")
    
    client = Groq(api_key=api_key)
    
    language_str = f" ({language})" if language else ""
    prompt = f"""Review the following{language_str} code and provide constructive feedback:

```{language or 'code'}
{code}
```

Provide a code review covering:
1. Code quality and best practices
2. Potential bugs or issues
3. Security concerns
4. Performance improvements
5. Code style and readability

Format as a clear, structured review."""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-70b-versatile",  # or "mixtral-8x7b-32768" or "codellama-70b-instruct"
            messages=[
                {"role": "system", "content": "You are an expert code reviewer. Provide clear, actionable feedback."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=2000,
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Groq API error: {e}")
        raise


def generate_ai_review_ollama(code: str, language: Optional[str] = None) -> str:
    """
    Generate code review using Ollama (completely free, runs locally).
    Install: https://ollama.ai/
    Run: ollama pull codellama
    """
    if not requests:
        raise ImportError("Install requests: pip install requests")
    
    ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
    model = os.getenv("OLLAMA_MODEL", "codellama")  # or "deepseek-coder", "mistral"
    
    language_str = f" ({language})" if language else ""
    prompt = f"""Review the following{language_str} code and provide constructive feedback:

```{language or 'code'}
{code}
```

Provide a code review covering:
1. Code quality and best practices
2. Potential bugs or issues
3. Security concerns
4. Performance improvements
5. Code style and readability

Format as a clear, structured review."""

    try:
        response = requests.post(
            f"{ollama_url}/api/generate",
            json={
                "model": model,
                "prompt": prompt,
                "stream": False,
            },
            timeout=120,
        )
        response.raise_for_status()
        return response.json()["response"]
    except Exception as e:
        logger.error(f"Ollama error: {e}")
        raise


def generate_ai_review_gemini(code: str, language: Optional[str] = None) -> str:
    """
    Generate code review using Google Gemini (free tier).
    Get API key: https://aistudio.google.com/app/apikey
    """
    if not genai:
        raise ImportError("Install google-generativeai: pip install google-generativeai")
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable not set")
    
    # Configure the API
    genai.configure(api_key=api_key)
    
    language_str = f" ({language})" if language else ""
    prompt = f"""Review the following{language_str} code and provide constructive feedback:

```{language or 'code'}
{code}
```

Provide a code review covering:
1. Code quality and best practices
2. Potential bugs or issues
3. Security concerns
4. Performance improvements
5. Code style and readability

Format as a clear, structured review."""

    try:
        # Use gemini-2.5-flash (fastest, free) or gemini-2.5-pro (more capable)
        # Available models: gemini-2.5-flash, gemini-2.5-pro, gemini-flash-latest, gemini-pro-latest
        model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        model = genai.GenerativeModel(model_name)
        
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.3,
                "max_output_tokens": 2000,
            }
        )
        
        return response.text
    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        raise


def generate_ai_review(code: str, language: Optional[str] = None) -> str:
    """
    Main entry point - tries AI providers in order of preference.
    Falls back to basic review if all fail.
    """
    # Check which provider to use (priority order)
    provider = os.getenv("AI_REVIEW_PROVIDER", "gemini").lower()
    
    try:
        if provider == "groq":
            return generate_ai_review_groq(code, language)
        elif provider == "ollama":
            return generate_ai_review_ollama(code, language)
        elif provider == "gemini":
            return generate_ai_review_gemini(code, language)
        else:
            raise ValueError(f"Unknown provider: {provider}")
    except Exception as e:
        logger.warning(f"AI review failed ({provider}): {e}, falling back to basic review")
        # Fallback to basic review
        from app.analyzers.basic import generate_basic_review
        return generate_basic_review(code, language)

