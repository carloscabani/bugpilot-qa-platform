interface AnalyzeBugInput {
  severity: string;
  priority: string;
  reproducible: boolean;
  user_impact: string;
}

interface AnalyzeBugResult {
  score: number;
  suggested_priority: string;
  reasons: string[];
}

export async function analyzeBug(
  data: AnalyzeBugInput
): Promise<AnalyzeBugResult> {

  const intelligenceUrl =
    process.env.INTELLIGENCE_URL ||
    "http://127.0.0.1:8000";

  const response = await fetch(
    `${intelligenceUrl}/api/triage`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(data),

      signal: AbortSignal.timeout(5000)
    }
  );

  if (!response.ok) {
    throw new Error(
      `Intelligence service error: ${response.status}`
    );
  }

  return await response.json() as AnalyzeBugResult;
}