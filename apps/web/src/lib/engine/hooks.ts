"use client";

import { useEffect, useSyncExternalStore } from "react";
import { tick } from "./simulator";
import { getServerState, getState, subscribe } from "./store";
import type { EngineState } from "./types";

/** État du moteur, réactif (SSR-safe : vide côté serveur). */
export function useEngine(): EngineState {
  return useSyncExternalStore(subscribe, getState, getServerState);
}

/**
 * Fait vivre la simulation tant que la page est ouverte (réponses qui
 * arrivent, pro qui répond). À monter une fois, dans le shell de l'app.
 */
export function useEngineTicker() {
  useEffect(() => {
    tick();
    const id = setInterval(tick, 2000);
    return () => clearInterval(id);
  }, []);
}

/** Badges de navigation : messages non lus + notifications non lues. */
export function useUnreadCounts(): { messages: number; notifications: number } {
  const state = useEngine();
  const messages = state.conversations.reduce((acc, c) => {
    const unread = c.messages.some((m) => m.from === "pro" && m.at > c.lastReadAt);
    return acc + (unread ? 1 : 0);
  }, 0);
  const notifications = state.notifications.reduce((acc, n) => acc + (n.read ? 0 : 1), 0);
  return { messages, notifications };
}
