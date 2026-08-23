import { EMPTY_STATE, type EngineState } from "./types";

/**
 * Persistance + pub/sub du moteur client. Toutes les écritures passent par
 * update(). SSR-safe : côté serveur, l'état est toujours EMPTY_STATE.
 */

const KEY = "allopuno:v1";

let state: EngineState | null = null;
const listeners = new Set<() => void>();

function load(): EngineState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY_STATE };
    const parsed = JSON.parse(raw) as EngineState;
    return {
      requests: Array.isArray(parsed.requests) ? parsed.requests : [],
      conversations: Array.isArray(parsed.conversations) ? parsed.conversations : [],
      notifications: Array.isArray(parsed.notifications) ? parsed.notifications : []
    };
  } catch {
    return { ...EMPTY_STATE };
  }
}

function persist(next: EngineState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // stockage indisponible (navigation privée…) — l'état vit en mémoire
  }
}

export function getState(): EngineState {
  if (typeof window === "undefined") return EMPTY_STATE;
  if (state === null) state = load();
  return state;
}

export function getServerState(): EngineState {
  return EMPTY_STATE;
}

/** Applique une mutation immuable et notifie les abonnés. */
export function update(mutator: (prev: EngineState) => EngineState) {
  const next = mutator(getState());
  state = next;
  persist(next);
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function uid(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
