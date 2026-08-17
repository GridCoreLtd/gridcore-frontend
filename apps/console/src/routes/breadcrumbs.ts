import { consoleRoutes, type ConsoleRoute } from "./manifest";

export type Crumb = { label: string; path: string };

const segmentsOf = (path: string) => path.split("/").filter(Boolean);

/** A `:param` segment matches anything; everything else matches literally. */
function matches(route: ConsoleRoute, parts: string[]): boolean {
  const declared = segmentsOf(route.path);
  if (declared.length !== parts.length) return false;
  return declared.every((seg, i) => seg.startsWith(":") || seg === parts[i]);
}

const nameOf = (route: ConsoleRoute) => route.crumb ?? route.label;

const paramCount = (route: ConsoleRoute) =>
  segmentsOf(route.path).filter((s) => s.startsWith(":")).length;

/**
 * The most specific route for a path. `/merchants/:id` and
 * `/merchants/new-applications` both match two segments, so the one with fewer
 * `:param`s wins — otherwise the answer would depend on the manifest's order,
 * and every application id would read "Merchant".
 */
function bestMatch(parts: string[]): ConsoleRoute | undefined {
  return consoleRoutes
    .filter((route) => matches(route, parts))
    .sort((a, b) => paramCount(a) - paramCount(b))[0];
}

/**
 * The trail for a pathname, built from the route manifest so it cannot drift
 * from the router or the sidebar.
 *
 * Every prefix of the path is looked up in turn. A prefix that no route claims
 * is skipped rather than guessed at — `/bulk-messaging/logs/:id` has no route
 * at `/bulk-messaging/logs`, and inventing a "Logs" step would link nowhere.
 */
export function trailFor(pathname: string): Crumb[] {
  const parts = segmentsOf(pathname);

  return parts.reduce<Crumb[]>((trail, _part, index) => {
    const prefix = parts.slice(0, index + 1);
    const route = bestMatch(prefix);
    const label = route && nameOf(route);
    if (route && label) trail.push({ label, path: "/" + prefix.join("/") });
    return trail;
  }, []);
}
