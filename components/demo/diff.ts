// Leaf paths whose value differs between two policies. Path scheme matches the
// renderers: object -> `${path}.${key}`, array -> `${path}.${index}`. The
// rationales subtree is excluded: it is prose that always changes, which would be
// noise, and it keeps the phase-two rationale attach from flashing.
export function diffPaths(
  a: unknown,
  b: unknown,
  path = "",
  acc = new Set<string>(),
): Set<string> {
  if (path === "rationales") return acc;
  if (a === b) return acc;
  if (
    typeof a !== "object" ||
    typeof b !== "object" ||
    a === null ||
    b === null
  ) {
    acc.add(path);
    return acc;
  }
  const keys = new Set([
    ...Object.keys(a as object),
    ...Object.keys(b as object),
  ]);
  for (const k of keys) {
    diffPaths(
      (a as Record<string, unknown>)[k],
      (b as Record<string, unknown>)[k],
      path ? `${path}.${k}` : k,
      acc,
    );
  }
  return acc;
}

// True if `path` itself or any descendant of it changed.
export function changedUnder(changed: Set<string>, path: string): boolean {
  for (const p of changed) {
    if (p === path || p.startsWith(`${path}.`)) return true;
  }
  return false;
}
