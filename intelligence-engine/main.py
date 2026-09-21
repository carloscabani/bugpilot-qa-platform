from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Literal

app = FastAPI(
    title="BugPilot Intelligence Engine",
    version="1.0.0"
)


class BugAnalysisInput(BaseModel):

    severity: Literal[
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL"
    ]

    priority: Literal[
        "LOW",
        "MEDIUM",
        "HIGH",
        "URGENT"
    ]

    reproducible: bool = False

    user_impact: Literal[
        "LOW",
        "MEDIUM",
        "HIGH"
    ] = "MEDIUM"


class BugAnalysisResult(BaseModel):

    score: int

    suggested_priority: str

    reasons: list[str]


@app.get("/health")
def health():

    return {
        "status": "ok",
        "service": "bugpilot-intelligence"
    }


@app.post(
    "/api/triage",
    response_model=BugAnalysisResult
)
def analyze_bug(bug: BugAnalysisInput):

    score = 0

    reasons = []

    severity_weights = {
        "LOW": 5,
        "MEDIUM": 15,
        "HIGH": 30,
        "CRITICAL": 45
    }

    priority_weights = {
        "LOW": 5,
        "MEDIUM": 10,
        "HIGH": 20,
        "URGENT": 30
    }

    impact_weights = {
        "LOW": 5,
        "MEDIUM": 10,
        "HIGH": 20
    }

    score += severity_weights[bug.severity]

    score += priority_weights[bug.priority]

    score += impact_weights[bug.user_impact]

    if bug.reproducible:

        score += 15

        reasons.append(
            "Defect can be reproduced consistently"
        )

    if bug.severity == "CRITICAL":

        reasons.append(
            "Critical technical severity"
        )

    if bug.user_impact == "HIGH":

        reasons.append(
            "High user impact"
        )

    if bug.priority == "URGENT":

        reasons.append(
            "Already marked as urgent"
        )

    score = min(score, 100)

    if score >= 75:

        suggested_priority = "URGENT"

    elif score >= 50:

        suggested_priority = "HIGH"

    elif score >= 25:

        suggested_priority = "MEDIUM"

    else:

        suggested_priority = "LOW"

    return BugAnalysisResult(

        score=score,

        suggested_priority=suggested_priority,

        reasons=reasons

    )