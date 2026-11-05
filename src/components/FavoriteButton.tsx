import { useStudies } from "../lib/useStudies";
export default function FavoriteButton({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const { state, ready, error, update } = useStudies();
  const saved = state.items.some((i) => i.slug === slug);
  return (
    <span>
      <button
        disabled={!ready}
        aria-pressed={saved}
        onClick={() =>
          update((s) => ({
            ...s,
            items: saved
              ? s.items.filter((i) => i.slug !== slug)
              : [...s.items, { slug, title, folderId: null, studied: false }],
          }))
        }
      >
        {saved ? "★ Salvo nos estudos" : "☆ Salvar nos estudos"}
      </button>
      {error && <small role="alert">{error}</small>}
    </span>
  );
}
