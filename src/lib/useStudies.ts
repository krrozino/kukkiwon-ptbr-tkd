import { useEffect, useState } from "react";
import { emptyStudies, parseStudies, type Studies } from "./studies";
const key = "tkd:studies:v1";
export function useStudies() {
  const [state, setState] = useState<Studies>(emptyStudies),
    [ready, setReady] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    const sync = () => {
      try {
        const raw = localStorage.getItem(key);
        setState(raw ? parseStudies(raw) : emptyStudies());
        setError("");
      } catch {
        setError(
          "Não foi possível ler o caderno. Os dados existentes foram preservados.",
        );
      }
      setReady(true);
    };
    sync();
    window.addEventListener("tkd-studies", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("tkd-studies", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const update = (fn: (s: Studies) => Studies) => {
    try {
      const raw = localStorage.getItem(key);
      const next = parseStudies(
        JSON.stringify(fn(raw ? parseStudies(raw) : emptyStudies())),
      );
      localStorage.setItem(key, JSON.stringify(next));
      setState(next);
      setError("");
      window.dispatchEvent(new Event("tkd-studies"));
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível salvar.");
      return false;
    }
  };
  return { state, ready, error, update };
}
