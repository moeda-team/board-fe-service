export type Locale = "en" | "id";

export const locales: Locale[] = ["en", "id"];
export const defaultLocale: Locale = "en";

/**
 * Build a locale-aware path for the marketing pages.
 * English lives at the root ("/", "/pricing", "/faq").
 * Indonesian lives under "/id" ("/id", "/id/pricing", "/id/faq").
 *
 * @param locale target locale
 * @param path   path without locale prefix, e.g. "/", "/pricing", "/faq"
 */
export function localizedPath(locale: Locale, path: string): string {
  const clean = path === "/" ? "" : path;
  if (locale === "id") {
    return `/id${clean}` || "/id";
  }
  return clean || "/";
}

/** Returns the path on the marketing site with the opposite locale. */
export function switchLocalePath(current: Locale, path: string): string {
  const target: Locale = current === "en" ? "id" : "en";
  // Strip any leading "/id" from the current path to get the base path.
  const base = path.replace(/^\/id(?=\/|$)/, "") || "/";
  return localizedPath(target, base);
}
