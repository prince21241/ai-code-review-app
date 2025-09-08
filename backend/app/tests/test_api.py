import json
from fastapi.testclient import TestClient

from app.api.main import app

client = TestClient(app)


def test_health():
    res = client.get("/health")
    assert res.status_code == 200


def test_create_and_list_submission():
    payload = {"code": "print('hi')", "language": "python"}
    res = client.post("/api/submissions", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["code"] == payload["code"]
    assert data["language"] == payload["language"]
    assert data["status"] in ("pending", "reviewed")

    res_list = client.get("/api/submissions")
    assert res_list.status_code == 200
    items = res_list.json()
    assert any(item["id"] == data["id"] for item in items)
