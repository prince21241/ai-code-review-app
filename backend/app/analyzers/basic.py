from __future__ import annotations

from typing import List, Dict


def generate_basic_review(code: str, language: str | None = None) -> str:
    issues: List[str] = []

    if not code or code.strip() == "":
        issues.append("Code is empty.")

    # Language-agnostic simple heuristics
    if len(code) < 20:
        issues.append("Code is very short; add more context or tests.")
    if "TODO" in code or "todo" in code.lower():
        issues.append("Found TODOs; resolve or track them explicitly.")

    risky_calls = ["eval(", "exec(", "os.system(", "subprocess.Popen(", "rm -rf", "drop table"]
    if any(token in code.lower() for token in [t.lower() for t in risky_calls]):
        issues.append("Potentially dangerous calls detected; review security implications.")

    # Language-aware checks
    lang = (language or "").lower()
    if lang in ("javascript", "js"):
        if " var " in f" {code} ":
            issues.append("JavaScript: Avoid 'var'; prefer 'let' or 'const'.")
        # naive missing semicolon check for simple statements
        lines = [ln.strip() for ln in code.splitlines() if ln.strip() and not ln.strip().startswith("//")]
        missing_semis = [ln for ln in lines if ln[-1].isalpha() and "function" not in ln and not ln.endswith(";")]
        if missing_semis:
            issues.append("JavaScript: Some statements may be missing semicolons.")
    elif lang in ("python", "py"):
        if "\t" in code:
            issues.append("Python: Mixed tabs in indentation; use spaces consistently.")
        if "print(" in code:
            issues.append("Python: 'print' found; avoid prints in production code.")
    elif lang in ("java"):
        import re
        empty_catch = re.search(r"catch\s*\([^)]*\)\s*\{\s*\}", code, flags=re.IGNORECASE | re.MULTILINE)
        if empty_catch:
            issues.append("Java: Empty catch block; handle or log exceptions.")

    header = "Basic Review"
    if language:
        header += f" ({language})"

    if not issues:
        return f"{header}: No obvious issues detected. Consider adding docstrings and tests."

    bullets = "\n".join(f"- {msg}" for msg in issues)
    return f"{header}:\n{bullets}"


def generate_basic_issues(code: str, language: str | None = None) -> List[Dict[str, str]]:
    """Return structured issues for live review consumption."""
    issues: List[Dict[str, str]] = []

    def add(msg: str, severity: str = "info", rule: str = "general") -> None:
        issues.append({"message": msg, "severity": severity, "rule": rule})

    if not code or code.strip() == "":
        add("Code is empty.", "warn", "empty")

    # Language-agnostic
    if len(code) < 20:
        add("Code is very short; add more context or tests.", "info", "short")
    if "TODO" in code or "todo" in code.lower():
        add("Found TODOs; resolve or track them explicitly.", "info", "todo")

    risky_calls = ["eval(", "exec(", "os.system(", "subprocess.Popen(", "rm -rf", "drop table"]
    if any(token in code.lower() for token in [t.lower() for t in risky_calls]):
        add("Potentially dangerous calls detected; review security implications.", "danger", "risky")

    # Language-aware
    lang = (language or "").lower()
    if lang in ("javascript", "js"):
        if " var " in f" {code} ":
            add("Avoid 'var'; prefer 'let' or 'const'.", "warn", "js.var")
        lines = [ln.strip() for ln in code.splitlines() if ln.strip() and not ln.strip().startswith("//")]
        missing_semis = [ln for ln in lines if ln[-1].isalpha() and "function" not in ln and not ln.endswith(";")]
        if missing_semis:
            add("Some statements may be missing semicolons.", "info", "js.semi")
    elif lang in ("python", "py"):
        if "\t" in code:
            add("Mixed tabs in indentation; use spaces consistently.", "warn", "py.indent")
        if "print(" in code:
            add("'print' found; avoid prints in production code.", "info", "py.print")
    elif lang in ("java"):
        import re
        empty_catch = re.search(r"catch\s*\([^)]*\)\s*\{\s*\}", code, flags=re.IGNORECASE | re.MULTILINE)
        if empty_catch:
            add("Empty catch block; handle or log exceptions.", "warn", "java.catch")

    return issues

