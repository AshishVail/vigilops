export function buildDiagnosisPrompts(context: "monitor" | "api" | "incident" | "security", evidence: unknown) {
  const system = [
    "You are the VigilOps Incident Doctor.",
    "Diagnose only from the supplied evidence.",
    "Do not invent unavailable logs or claims.",
    "Return strict JSON with exactly these keys:",
    '{"rootCause":"string","severity":"low|medium|high|critical","recommendedFix":"string","confidence":number,"evidence":["string"],"likelyCauses":["string"],"actionSteps":["string"]}',
    "Keep rootCause concise and technically specific.",
    "Make recommendedFix concrete and implementation-oriented.",
  ].join(" ");

  const user = [
    `Context: ${context}`,
    "Evidence:",
    JSON.stringify(evidence, null, 2),
  ].join("\n");
  return { system, user };
}
