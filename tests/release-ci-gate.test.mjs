import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { hasGreenMainValidation } from "../scripts/release-ci-gate.mjs";

const sha = "a".repeat(40);
const accepted = {
  head_sha: sha,
  head_branch: "main",
  event: "push",
  status: "completed",
  conclusion: "success",
};
const response = (run) => ({ workflow_runs: [run] });

describe("preflight de release", () => {
  it("aceita apenas um push bem-sucedido no mesmo SHA da main", () => {
    expect(hasGreenMainValidation(response(accepted), sha)).toBe(true);
  });

  it.each([
    ["SHA antigo", { head_sha: "b".repeat(40) }],
    ["CI de PR", { event: "pull_request" }],
    ["branch diferente", { head_branch: "feat/branch" }],
    ["CI com falha", { conclusion: "failure" }],
    ["CI cancelada", { conclusion: "cancelled" }],
    ["CI em andamento", { status: "in_progress", conclusion: null }],
  ])("recusa %s", (_label, override) => {
    expect(hasGreenMainValidation(response({ ...accepted, ...override }), sha)).toBe(false);
  });

  it("falha fechado para payload inválido ou SHA ausente", () => {
    for (const payload of [null, {}, { workflow_runs: null }, { workflow_runs: [{}] }]) {
      expect(hasGreenMainValidation(payload, sha)).toBe(false);
    }
    expect(hasGreenMainValidation(response(accepted), "")).toBe(false);
  });

  it("não deixa uma execução malsucedida mascarar a validação correta", () => {
    const other = { ...accepted, head_sha: "b".repeat(40) };
    expect(hasGreenMainValidation({ workflow_runs: [other, { ...accepted, conclusion: "failure" }] }, sha)).toBe(false);
    expect(hasGreenMainValidation({ workflow_runs: [other, accepted] }, sha)).toBe(true);
  });

  it("CLI recusa ramo inadequado sem publicar nem acessar a rede", () => {
    const script = fileURLToPath(new URL("../scripts/release-ci-gate.mjs", import.meta.url));
    const result = spawnSync(process.execPath, [script], {
      input: JSON.stringify(response(accepted)),
      env: { ...process.env, GITHUB_REF: "refs/heads/feature", GITHUB_SHA: sha },
      encoding: "utf8",
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("somente a partir da main");
  });

  it("workflow exige o gate antes do deploy e não habilita esquema novo", () => {
    const workflow = readFileSync(new URL("../.github/workflows/deploy-official-cloudflare.yml", import.meta.url), "utf8");
    const gate = workflow.indexOf("node scripts/release-ci-gate.mjs");
    const publish = workflow.indexOf("npx wrangler deploy");
    expect(gate).toBeGreaterThan(-1);
    expect(publish).toBeGreaterThan(gate);
    expect(workflow).toContain("actions: read");
    expect(workflow).toContain('PUBLIC_KNOWLEDGE_SCHEMA: "false"');
    expect(workflow).toContain('if [[ "$CREATE_RELEASE" != "true" ]]');
    expect(workflow).toContain('if [[ "$tag_status" -ne 2 ]]');
    expect(workflow).toContain("npm run research:audit");
    const chromium = workflow.indexOf("npx playwright install --with-deps chromium");
    const isolation = workflow.indexOf("node tools/local-validation/glossary-public.mjs");
    expect(chromium).toBeGreaterThan(-1);
    expect(isolation).toBeGreaterThan(chromium);
    expect(publish).toBeGreaterThan(isolation);
  });
});
