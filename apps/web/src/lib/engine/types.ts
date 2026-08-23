import type { Localized } from "@/lib/demo";

/**
 * MOTEUR CLIENT (interim sans backend) — types alignés sur les contrats
 * /api/v1 (docs/04-api.md) pour que le branchement backend soit mécanique.
 * Persisté en localStorage ; matching/réponses/messagerie simulés (simulator.ts).
 */

export type LocalRequestStatus = "active" | "matched" | "completed" | "cancelled";

export interface PlannedResponse {
  proId: string;
  dueAt: number;
  price: number;
  priceTo?: number;
  templateIdx: number;
  availabilityIdx: number;
}

export interface LocalResponse {
  id: string;
  proId: string;
  price: number;
  priceTo?: number;
  message: Localized;
  availability: Localized;
  respondedMin: number;
  createdAt: number;
  status: "pending" | "accepted" | "not_selected";
}

export interface LocalRequest {
  id: string;
  title: string;
  description: string;
  categorySlug?: string;
  subSlug?: string;
  citySlug?: string;
  /** "sot" | "neser" | "kete-jave" | "s-e-di" | date ISO (YYYY-MM-DD) */
  dateChoice?: string;
  timeChoice?: string;
  urgent: boolean;
  budgetMin?: number;
  budgetMax?: number;
  photosCount: number;
  status: LocalRequestStatus;
  createdAt: number;
  publishedAt: number;
  selectedResponseId?: string;
  planned: PlannedResponse[];
  responses: LocalResponse[];
}

export interface LocalMessage {
  id: string;
  from: "me" | "pro" | "system";
  text: string | Localized;
  at: number;
}

export interface LocalConversation {
  id: string;
  requestId: string;
  proId: string;
  messages: LocalMessage[];
  /** Réponse du pro planifiée (simulée) */
  pendingReplyAt?: number;
  pendingReplyIdx?: number;
  lastReadAt: number;
  createdAt: number;
}

export type LocalNotificationType =
  | "request_published"
  | "response_received"
  | "provider_selected"
  | "message_received";

export interface LocalNotification {
  id: string;
  type: LocalNotificationType;
  at: number;
  read: boolean;
  requestId?: string;
  conversationId?: string;
  proId?: string;
}

export interface EngineState {
  requests: LocalRequest[];
  conversations: LocalConversation[];
  notifications: LocalNotification[];
}

export const EMPTY_STATE: EngineState = {
  requests: [],
  conversations: [],
  notifications: []
};
