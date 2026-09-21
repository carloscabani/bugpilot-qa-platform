from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_health():

    response = client.get("/health")

    assert response.status_code == 200

    assert response.json()["status"] == "ok"


def test_critical_bug_priority():

    response = client.post(
        "/api/triage",
        json={
            "severity": "CRITICAL",
            "priority": "HIGH",
            "reproducible": True,
            "user_impact": "HIGH"
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert data["score"] == 100

    assert data["suggested_priority"] == "URGENT"


def test_low_priority_bug():

    response = client.post(
        "/api/triage",
        json={
            "severity": "LOW",
            "priority": "LOW",
            "reproducible": False,
            "user_impact": "LOW"
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert data["score"] == 15

    assert data["suggested_priority"] == "LOW"


def test_invalid_severity():

    response = client.post(
        "/api/triage",
        json={
            "severity": "EXTREME",
            "priority": "HIGH",
            "reproducible": True,
            "user_impact": "HIGH"
        }
    )

    assert response.status_code == 422