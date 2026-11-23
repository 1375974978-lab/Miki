import type { ComparisonData, HistoryEntry } from "./types";

const STORAGE_KEY = "mirra.history.v1";
const MAX_ENTRIES = 12;

function canUseStorage() {
  return typeof window !== "undefined" && "localStorage" in window;
}

export function loadHistory(): HistoryEntry[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const validEntries = parsed
      .filter(
        (entry): entry is HistoryEntry =>
          Boolean(
            entry &&
              typeof entry === "object" &&
              "id" in entry &&
              "aName" in entry &&
              "bName" in entry &&
              "data" in entry,
          ),
      );

    const seen = new Set<string>();
    return validEntries
      .filter((entry) => {
        const signature = `${entry.data.links.a}::${entry.data.links.b}`;
        if (seen.has(signature)) return false;
        seen.add(signature);
        return true;
      })
      .slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

export function saveComparison(data: ComparisonData): HistoryEntry[] {
  if (!canUseStorage()) return [];

  const entry: HistoryEntry = {
    id: data.id,
    createdAt: data.createdAt,
    aName: data.products.a.name,
    bName: data.products.b.name,
    data,
  };
  const next = [
    entry,
    ...loadHistory().filter(
      (item) =>
        item.id !== data.id &&
        !(
          item.data.links.a === data.links.a &&
          item.data.links.b === data.links.b
        ),
    ),
  ].slice(0, MAX_ENTRIES);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    return loadHistory();
  }

  return next;
}

export function removeHistoryEntry(id: string): HistoryEntry[] {
  if (!canUseStorage()) return [];
  const next = loadHistory().filter((entry) => entry.id !== id);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    return loadHistory();
  }
  return next;
}

export function clearHistory(): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be blocked in private browsing or strict privacy modes.
  }
}
