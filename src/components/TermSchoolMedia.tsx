import { useEffect, useState } from "react";
import { publicTermMedia } from "../lib/school-api";
import MediaPlayer, { type SchoolMedia } from "./MediaPlayer";
export default function TermSchoolMedia({ slug }: { slug: string }) {
  const [media, setMedia] = useState<SchoolMedia[]>([]);
  useEffect(() => {
    const c = new AbortController();
    publicTermMedia(slug, c.signal)
      .then((d) => {
        if (!c.signal.aborted) setMedia(d);
      })
      .catch(() => {});
    return () => c.abort();
  }, [slug]);
  return (
    <>
      {media.map((m) => (
        <MediaPlayer key={m.id} media={m} />
      ))}
    </>
  );
}
