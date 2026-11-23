import "server-only";

export type GroqDiagnosisMessage = {
  rootCause: string;
  severity: "low" | "medium" | "high" | "critical";
  recommendedFix: string;
  confidence: number;
  evidence: string[];
  likelyCauses: string[];
  actionSteps: string[];
};

export async function diagnoseWithGroq(system: string, user: string): Promise<{ content: string; model: string }> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return {
      model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
      content: JSON.stringify({
        rootCause: "Groq diagnosis is unavailable because GROQ_API_KEY is not configured.",
        severity: "medium",
        recommendedFix: "Configure GROQ_API_KEY in Vercel Environment Variables and retry the diagnosis.",
        confidence: 0,
        evidence: ["Groq API key missing"],
        likelyCauses: ["Missing AI provider credential"],
        actionSteps: ["Add GROQ_API_KEY", "Redeploy the application", "Retry diagnosis"],
      }),
    };
  }

  const model = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Groq request failed (${response.status}): ${text.slice(0, 500)}`);
  }
  const body = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = body.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq returned an empty diagnosis");
  return { content, model };
}
