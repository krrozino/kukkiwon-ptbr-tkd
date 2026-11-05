import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createCatalogClient, fetchPublic } from "./catalog-api";
import { parseCurriculum, type Curriculum } from "./curriculum";
import type { SchoolMedia } from "../components/MediaPlayer";
let instance: SupabaseClient | undefined;
export function schoolClient() {
  if (!instance) {
    const config = {
      url: import.meta.env.PUBLIC_SUPABASE_URL || "",
      key: import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY || "",
    };
    createCatalogClient(config);
    instance = createClient(config.url, config.key);
  }
  return instance;
}
export function schoolConfigured() {
  try {
    schoolClient();
    return true;
  } catch {
    return false;
  }
}
export type School = { id: string; name: string; slug: string };
export type SchoolTerm = {
  id: string;
  title: string;
  description: string;
  hangul: string | null;
  romanization: string | null;
  visibility: "private" | "public";
};
export type SavedCurriculum = {
  id: string;
  school_id: string;
  title: string;
  content: Curriculum;
  visibility: "private" | "public";
  updated_at: string;
};
export const mediaFields =
  "id,school_id,title,description,term_slug,creator,media_kind,media_url,caption,credits,visibility";
export function schoolError(error: unknown) {
  const e = error as { message?: string; code?: string };
  if (["42P01", "PGRST205"].includes(e?.code || ""))
    return "A estrutura de escolas ainda não foi aplicada ao Supabase. A migração da Sprint 02 aguarda autorização.";
  return e?.message || "Não foi possível concluir a operação.";
}
export async function saveSchoolCurriculum(
  schoolId: string,
  value: Curriculum,
  visibility: "private" | "public",
  existing: SavedCurriculum | null,
) {
  parseCurriculum(value);
  const payload = {
    school_id: schoolId,
    title: value.title,
    content: value,
    visibility,
  };
  const db = schoolClient();
  const query = existing
    ? db
        .from("school_curricula")
        .update(payload)
        .eq("id", existing.id)
        .eq("updated_at", existing.updated_at)
    : db.from("school_curricula").insert(payload);
  const { data, error } = await query
    .select("id,school_id,title,content,visibility,updated_at")
    .maybeSingle();
  if (error) throw error;
  if (!data)
    throw new Error(
      "O currículo mudou em outra sessão. Reabra a versão salva antes de editar.",
    );
  return data as SavedCurriculum;
}
export async function publicSchoolCurriculum(id: string, signal?: AbortSignal) {
  if (!/^[0-9a-f-]{36}$/i.test(id))
    throw new Error("Link de currículo inválido.");
  const rows = await fetchPublic<SavedCurriculum[]>(
    "school_curricula",
    new URLSearchParams({
      select: "id,school_id,title,content,visibility,updated_at",
      id: "eq." + id,
      visibility: "eq.public",
      limit: "1",
    }),
    signal,
  );
  const c = rows[0];
  if (!c) return null;
  parseCurriculum(c.content);
  const [schools, media, terms] = await Promise.all([
    fetchPublic<School[]>(
      "schools",
      new URLSearchParams({
        select: "id,name,slug",
        id: "eq." + c.school_id,
        limit: "1",
      }),
      signal,
    ),
    fetchPublic<SchoolMedia[]>(
      "school_media",
      new URLSearchParams({
        select: mediaFields,
        school_id: "eq." + c.school_id,
        visibility: "eq.public",
      }),
      signal,
    ),
    fetchPublic<SchoolTerm[]>(
      "school_terms",
      new URLSearchParams({
        select: "id,title,description,hangul,romanization,visibility",
        school_id: "eq." + c.school_id,
        visibility: "eq.public",
      }),
      signal,
    ),
  ]);
  return { curriculum: c, school: schools[0], media, terms };
}
export async function publicTermMedia(slug: string, signal?: AbortSignal) {
  return fetchPublic<SchoolMedia[]>(
    "school_media",
    new URLSearchParams({
      select: mediaFields,
      term_slug: "eq." + slug,
      visibility: "eq.public",
      limit: "20",
    }),
    signal,
  );
}
