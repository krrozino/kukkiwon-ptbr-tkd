import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * A release may use only a completed successful push validation for the exact
 * commit on main, never a pull_request run or a validation of an older SHA.
 * The API response is fetched from actions/workflows/check.yml/runs.
 */
export function hasGreenMainValidation(payload, sha) {
  if (!/^[a-f0-9]{40}$/.test(sha || "") || !Array.isArray(payload?.workflow_runs)) {
    return false;
  }
  return payload.workflow_runs.some((run) =>
    run &&
    run.head_sha === sha &&
    run.head_branch === "main" &&
    run.event === "push" &&
    run.status === "completed" &&
    run.conclusion === "success"
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.env.GITHUB_REF !== "refs/heads/main") {
      throw new Error("Publicação permitida somente a partir da main.");
    }
    const response = JSON.parse(readFileSync(0, "utf8"));
    if (!hasGreenMainValidation(response, process.env.GITHUB_SHA)) {
      throw new Error("O SHA selecionado não possui validação push da main concluída com sucesso.");
    }
    console.log("Validação consolidada da main confirmada para o SHA selecionado.");
  } catch (error) {
    console.error("::error::" + (error instanceof Error ? error.message : "Falha no preflight de CI."));
    process.exitCode = 1;
  }
}
