import {useEffect,useState} from "react";
import {fetchTermDetails} from "./catalog-api";
export type TermDetail = NonNullable<
  Awaited<ReturnType<typeof fetchTermDetails>>
>;
export function useTermDetail(slug: string | null) {
  const [detail, setDetail] = useState<TermDetail | null>(null),
    [error, setError] = useState(false);
  useEffect(() => {
    setDetail(null);
    setError(false);
    if (!slug) return;
    const c = new AbortController();
    fetchTermDetails(slug, c.signal)
      .then((d) => {
        if (!c.signal.aborted) {
          setDetail(d);
          if (!d) setError(true);
        }
      })
      .catch(() => {
        if (!c.signal.aborted) setError(true);
      });
    return () => c.abort();
  }, [slug]);
  return { detail, error };
}
