// Test-only matchMedia stub — jsdom ships no implementation. Queries share
// state by string, so every MediaQueryList for the same query sees the same
// `matches` and `set()` notifies all of their listeners.

type Entry = { matches: boolean; listeners: Set<EventListener> };

export interface MatchMediaController {
  /** Update a query's result and fire its change listeners. */
  set: (query: string, matches: boolean) => void;
  /** Put back whatever was there before (usually `undefined` in jsdom). */
  restore: () => void;
}

export function installMatchMedia(
  initialMatches: (query: string) => boolean = () => false,
): MatchMediaController {
  const entries = new Map<string, Entry>();
  const original = window.matchMedia;

  const entryFor = (query: string): Entry => {
    let entry = entries.get(query);
    if (!entry) {
      entry = { matches: initialMatches(query), listeners: new Set() };
      entries.set(query, entry);
    }
    return entry;
  };

  window.matchMedia = ((query: string) => {
    const entry = entryFor(query);
    const list = {
      get matches() {
        return entry.matches;
      },
      media: query,
      onchange: null,
      addEventListener: (_type: string, listener: EventListener) => {
        entry.listeners.add(listener);
      },
      removeEventListener: (_type: string, listener: EventListener) => {
        entry.listeners.delete(listener);
      },
      addListener: (listener: EventListener) => {
        entry.listeners.add(listener);
      },
      removeListener: (listener: EventListener) => {
        entry.listeners.delete(listener);
      },
      dispatchEvent: () => false,
    };
    return list as MediaQueryList;
  }) as typeof window.matchMedia;

  return {
    set(query, matches) {
      const entry = entryFor(query);
      if (entry.matches === matches) return;
      entry.matches = matches;
      const event = new Event('change');
      for (const listener of [...entry.listeners]) listener(event);
    },
    restore() {
      window.matchMedia = original;
    },
  };
}
