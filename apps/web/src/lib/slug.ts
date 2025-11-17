export const normalizeSlug = (input?: string) => {
  const trimmed = (input ?? "").trim();
  if (!trimmed) return "";
  return trimmed
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};
