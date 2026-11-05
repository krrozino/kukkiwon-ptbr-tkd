import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { schoolClient } from "./school-api";
export const schoolImageBucket = "school-images";
export async function validateSchoolImage(file: File): Promise<string> {
  if (!file.size || file.size > 5 * 1024 * 1024)
    throw new Error("Escolha uma imagem de até 5 MiB, com conteúdo.");
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const starts = (signature: number[], at = 0) => signature.every((b, i) => bytes[at + i] === b);
  if (file.type === "image/jpeg" && starts([255,216,255])) return "jpg";
  if (file.type === "image/png" && starts([137,80,78,71,13,10,26,10])) return "png";
  if (file.type === "image/webp" && starts([82,73,70,70]) && starts([87,69,66,80], 8)) return "webp";
  throw new Error("Use uma imagem JPEG, PNG ou WebP válida. Vídeos continuam disponíveis por URL HTTPS.");
}
export async function uploadSchoolImage(schoolId: string, file: File) {
  const extension = await validateSchoolImage(file);
  const path = `${schoolId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await schoolClient().storage.from(schoolImageBucket)
    .upload(path, file, { contentType: file.type, cacheControl: "0", upsert: false });
  if (error) throw error;
  return path;
}
let publicStorage: SupabaseClient | undefined;
export async function downloadSchoolImage(path: string, ownerAccess = false) {
  // Shared views must never inherit the teacher's authenticated session.
  if (!ownerAccess && !publicStorage) publicStorage = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
  );
  const db = ownerAccess ? schoolClient() : publicStorage!;
  const { data, error } = await db.storage.from(schoolImageBucket).download(path);
  if (error) throw error;
  return data;
}
