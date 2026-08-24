"use client";

import { useEngineTicker } from "@/lib/engine";
import { AppNav } from "./AppNav";

/**
 * Fait vivre le moteur client (simulation d'offres/réponses) et monte
 * la barre de navigation basse mobile. À monter une seule fois, dans le layout.
 */
export function EngineBoot() {
  useEngineTicker();
  return <AppNav />;
}
