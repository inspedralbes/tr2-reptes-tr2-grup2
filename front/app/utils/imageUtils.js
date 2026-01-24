const BACK_URL = import.meta.env.VITE_URL_BACK;

export const getImageUrl = (source) => {
  const DEFAULT_IMG = "/files/images/example.png";

  if (!source) return DEFAULT_IMG;

  let path = null;
  if (typeof source === "string") {
    path = source;
  } else if (typeof source === "object") {
    path =
      source.imatge ||
      source.image ||
      source.foto ||
      source.url ||
      source.path ||
      null;
  }

  if (!path) return DEFAULT_IMG;

  if (path.startsWith("/")) return `${BACK_URL}${path}`;

  // path no empieza por slash -> normalizar
  return `${BACK_URL}/${path}`;
};
