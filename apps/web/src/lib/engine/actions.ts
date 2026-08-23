import { demoPros } from "@/lib/demo";
import { planResponses } from "./simulator";
import { uid, update } from "./store";
import type { EngineState, LocalConversation, LocalRequest } from "./types";

/** Écritures du moteur — l'équivalent client des endpoints /api/v1. */

export interface PublishInput {
  title: string;
  description: string;
  categorySlug?: string;
  subSlug?: string;
  citySlug?: string;
  dateChoice?: string;
  timeChoice?: string;
  urgent: boolean;
  budgetMin?: number;
  budgetMax?: number;
  photosCount: number;
}

export function publishRequest(input: PublishInput): string {
  const id = uid();
  const publishedAt = Date.now();
  const request: LocalRequest = {
    id,
    ...input,
    status: "active",
    createdAt: publishedAt,
    publishedAt,
    planned: planResponses({ id, categorySlug: input.categorySlug, budgetMin: input.budgetMin, budgetMax: input.budgetMax, publishedAt }),
    responses: []
  };
  update((prev) => ({
    ...prev,
    requests: [request, ...prev.requests],
    notifications: [
      { id: uid(), type: "request_published", at: publishedAt, read: false, requestId: id },
      ...prev.notifications
    ]
  }));
  return id;
}

export function cancelRequest(requestId: string) {
  update((prev) => ({
    ...prev,
    requests: prev.requests.map((r) =>
      r.id === requestId && r.status === "active" ? { ...r, status: "cancelled", planned: [] } : r
    )
  }));
}

function seedConversation(prev: EngineState, requestId: string, proId: string): { state: EngineState; id: string } {
  const existing = prev.conversations.find((c) => c.requestId === requestId && c.proId === proId);
  if (existing) return { state: prev, id: existing.id };
  const request = prev.requests.find((r) => r.id === requestId);
  const response = request?.responses.find((r) => r.proId === proId);
  const now = Date.now();
  const conversation: LocalConversation = {
    id: uid(),
    requestId,
    proId,
    createdAt: now,
    lastReadAt: now,
    messages: [
      { id: uid(), from: "system", text: request?.title ?? "", at: now },
      ...(response
        ? [{ id: uid(), from: "pro" as const, text: response.message, at: now }]
        : [])
    ]
  };
  return {
    state: { ...prev, conversations: [conversation, ...prev.conversations] },
    id: conversation.id
  };
}

/** Ouvre (ou crée) la conversation demande↔pro. Retourne son id. */
export function openConversation(requestId: string, proId: string): string {
  let convId = "";
  update((prev) => {
    const { state, id } = seedConversation(prev, requestId, proId);
    convId = id;
    return state;
  });
  return convId;
}

/** Choix du prestataire (écran 022/023 → statut MATCHED). */
export function selectResponse(requestId: string, responseId: string): string {
  let convId = "";
  update((prev) => {
    const request = prev.requests.find((r) => r.id === requestId);
    const response = request?.responses.find((x) => x.id === responseId);
    if (!request || !response) return prev;
    const requests = prev.requests.map((r) =>
      r.id !== requestId
        ? r
        : {
            ...r,
            status: "matched" as const,
            selectedResponseId: responseId,
            planned: [],
            responses: r.responses.map((x) => ({
              ...x,
              status: x.id === responseId ? ("accepted" as const) : ("not_selected" as const)
            }))
          }
    );
    const { state, id } = seedConversation({ ...prev, requests }, requestId, response.proId);
    convId = id;
    return {
      ...state,
      notifications: [
        { id: uid(), type: "provider_selected", at: Date.now(), read: false, requestId, proId: response.proId, conversationId: id },
        ...state.notifications
      ]
    };
  });
  return convId;
}

export function sendMessage(conversationId: string, text: string) {
  const clean = text.trim();
  if (!clean) return;
  const now = Date.now();
  update((prev) => ({
    ...prev,
    conversations: prev.conversations.map((c) =>
      c.id !== conversationId
        ? c
        : {
            ...c,
            lastReadAt: now,
            pendingReplyAt: now + 2500 + (clean.length % 5) * 700,
            messages: [...c.messages, { id: uid(), from: "me", text: clean, at: now }]
          }
    )
  }));
}

export function markConversationRead(conversationId: string) {
  update((prev) => ({
    ...prev,
    conversations: prev.conversations.map((c) =>
      c.id === conversationId ? { ...c, lastReadAt: Date.now() } : c
    ),
    notifications: prev.notifications.map((n) =>
      n.conversationId === conversationId ? { ...n, read: true } : n
    )
  }));
}

export function markAllNotificationsRead() {
  update((prev) => ({
    ...prev,
    notifications: prev.notifications.map((n) => ({ ...n, read: true }))
  }));
}

export function proById(proId: string) {
  return demoPros.find((p) => p.id === proId);
}
