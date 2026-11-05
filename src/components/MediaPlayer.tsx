import { useEffect, useState } from "react";
import { safeMediaUrl } from "../lib/curriculum";
import { downloadSchoolImage } from "../lib/school-images";
export type SchoolMedia = {
  id: string;
  school_id: string;
  title: string;
  description: string;
  term_slug: string | null;
  creator: string;
  media_kind: "video" | "image";
  media_url: string | null;
  storage_path?: string | null;
  license_name?: string;
  caption: string;
  credits: string;
  visibility: "private" | "public";
};
export default function MediaPlayer({ media, ownerAccess = false }: { media: SchoolMedia; ownerAccess?: boolean }) {
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(""), [error, setError] = useState("");
  useEffect(() => {
    if (!open || !media.storage_path) return;
    let live = true, objectUrl = "";
    setError(""); setImageUrl("");
    downloadSchoolImage(media.storage_path, ownerAccess).then(blob => {
      if (live) { objectUrl = URL.createObjectURL(blob); setImageUrl(objectUrl); }
    }).catch(() => { if (live) setError("Imagem privada, indisponível ou compartilhamento revogado."); });
    return () => { live = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [open, media.storage_path, ownerAccess]);
  const url = media.storage_path ? imageUrl : safeMediaUrl(media.media_url || "");
  if (!media.storage_path && !url) return <p>Mídia indisponível.</p>;
  let embed = "";
  const u = new URL(url || "https://example.invalid");
  if (["www.youtube.com", "youtube.com", "youtu.be"].includes(u.hostname)) {
    const id =
      u.hostname === "youtu.be" ? u.pathname.slice(1) : u.searchParams.get("v");
    if (id && /^[a-zA-Z0-9_-]{11}$/.test(id))
      embed = "https://www.youtube-nocookie.com/embed/" + id;
  }
  if (
    ["vimeo.com", "www.vimeo.com"].includes(u.hostname) &&
    /^\/\d+$/.test(u.pathname)
  )
    embed = "https://player.vimeo.com/video" + u.pathname;
  return (
    <figure className="media-player">
      <figcaption>
        <strong>{media.title}</strong>
        <p>{media.description}</p>
      </figcaption>
      {!open ? (
        <button onClick={() => setOpen(true)}>Carregar demonstração</button>
      ) : error ? <p role="alert">{error}</p> : !url ? <p role="status">Carregando imagem…</p> : media.media_kind === "image" ? (
        <img
          src={url}
          alt={media.caption || media.title}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : embed ? (
        <iframe
          title={media.title}
          src={embed}
          allowFullScreen
          referrerPolicy="no-referrer"
        />
      ) : /\.(mp4|webm|ogg)(\?|$)/i.test(url) ? (
        <video controls preload="metadata" src={url} aria-label={media.title} />
      ) : (
        <a href={url} target="_blank" rel="noreferrer">
          Abrir vídeo na origem
        </a>
      )}
      <p className="fine-print">
        {media.caption} · {media.creator}
        {media.credits && " · " + media.credits} · Demonstração própria da
        escola {media.license_name && " · " + media.license_name}
      </p>
    </figure>
  );
}
