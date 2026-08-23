import { demoPros } from "@/lib/demo";
import type { Localized } from "@/lib/demo";
import { getState, uid, update } from "./store";
import type {
  EngineState,
  LocalConversation,
  LocalNotification,
  LocalRequest,
  PlannedResponse
} from "./types";

/**
 * SIMULATION (interim sans backend) — reproduit côté client le comportement
 * du Matching/Response/Messaging Service : après publication, des réponses
 * « arrivent » de pros démo pertinents ; en conversation, le pro « répond ».
 * Un tick() périodique matérialise ce qui est dû — robuste aux rechargements.
 */

const OFFER_TEMPLATES: Localized[] = [
  {
    sq: "Përshëndetje! E pashë kërkesën tuaj — mund të vij ta shoh dhe ta kryej punën. Çmimi përfshin materialin bazë.",
    en: "Hi! I saw your request — I can come take a look and get the job done. The price includes basic materials."
  },
  {
    sq: "Mirëdita! Kam përvojë pikërisht me punë të tilla. Mund të nis shpejt dhe jap garanci për punën.",
    en: "Hello! I have experience with exactly this kind of work. I can start quickly and I guarantee the work."
  },
  {
    sq: "Përshëndetje! Jam në zonën tuaj këto ditë — mund ta kryej me çmim të mirë. Më shkruani për detajet.",
    en: "Hi! I'm in your area these days — I can do it at a good price. Message me for the details."
  },
  {
    sq: "Mirëdita! Mund t'ju dërgoj një ofertë të saktë pasi t'i shoh fotot ose ta vizitoj vendin. Çmimi këtu është orientues.",
    en: "Hello! I can send you an exact quote after seeing the photos or visiting. This price is indicative."
  }
];

const AVAILABILITY: Localized[] = [
  { sq: "Sot pasdite", en: "Today afternoon" },
  { sq: "Nesër paradite", en: "Tomorrow morning" },
  { sq: "Nesër 17:00", en: "Tomorrow 17:00" },
  { sq: "Këtë fundjavë", en: "This weekend" }
];

const CHAT_REPLIES: Localized[] = [
  {
    sq: "Faleminderit për mesazhin! Po, jam i disponueshëm — a mund të më tregoni pak më shumë detaje?",
    en: "Thanks for your message! Yes, I'm available — could you tell me a bit more detail?"
  },
  {
    sq: "Në rregull. A keni foto të vendit? Kështu ju jap çmim më të saktë.",
    en: "Alright. Do you have photos of the spot? That way I can give you a more exact price."
  },
  {
    sq: "Mund të vij ta shoh pa pagesë dhe ju them saktë sa kushton.",
    en: "I can come take a look for free and tell you exactly how much it costs."
  },
  {
    sq: "Dakord, më përshtatet. Ta caktojmë një orar që ju konvenon juve.",
    en: "Agreed, that works for me. Let's set a time that suits you."
  },
  {
    sq: "Po ju dërgoj një ofertë të detajuar këtu në bisedë sapo t'i kem të gjitha detajet.",
    en: "I'll send you a detailed quote right here in the chat as soon as I have all the details."
  }
];

const CATEGORY_DEFAULT_PRICE: Record<string, [number, number]> = {
  ndertim: [30, 120],
  shtepia: [25, 80],
  automjete: [20, 90],
  transport: [30, 80],
  digjitale: [25, 100],
  personale: [10, 30],
  evente: [120, 450],
  "qira-vegla": [60, 200],
  "qira-automjete": [25, 90],
  "qira-pajisje": [25, 90]
};

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Pros pertinents pour une demande (catégorie d'abord, complétés au besoin). */
function matchPros(categorySlug: string | undefined, seed: string): string[] {
  const inCat = demoPros.filter((p) => p.categorySlug === categorySlug).map((p) => p.id);
  const others = demoPros.filter((p) => p.categorySlug !== categorySlug).map((p) => p.id);
  const h = hash(seed);
  const rotated = [...others.slice(h % others.length), ...others.slice(0, h % others.length)];
  return [...inCat, ...rotated].slice(0, Math.min(4, 2 + (h % 3)));
}

export function planResponses(request: {
  id: string;
  categorySlug?: string;
  budgetMin?: number;
  budgetMax?: number;
  publishedAt: number;
}): PlannedResponse[] {
  const proIds = matchPros(request.categorySlug, request.id);
  const [dLo, dHi] = CATEGORY_DEFAULT_PRICE[request.categorySlug ?? ""] ?? [25, 100];
  const lo = request.budgetMin ?? dLo;
  const hi = request.budgetMax ?? Math.max(dHi, lo + 10);
  const delays = [5000, 11000, 19000, 31000];
  return proIds.map((proId, i) => {
    const h = hash(request.id + proId);
    const span = Math.max(1, hi - lo);
    const price = Math.max(5, Math.round((lo + (h % span)) / 5) * 5);
    return {
      proId,
      dueAt: request.publishedAt + delays[i % delays.length],
      price,
      priceTo: h % 3 === 0 ? price + Math.max(10, Math.round(price * 0.3 / 5) * 5) : undefined,
      templateIdx: h % OFFER_TEMPLATES.length,
      availabilityIdx: h % AVAILABILITY.length
    };
  });
}

export function chatReplyText(idx: number): Localized {
  return CHAT_REPLIES[idx % CHAT_REPLIES.length];
}

function notif(partial: Omit<LocalNotification, "id" | "at" | "read">): LocalNotification {
  return { id: uid(), at: Date.now(), read: false, ...partial };
}

/** Matérialise tout ce qui est dû (réponses planifiées, répliques de chat). */
export function tick() {
  const now = Date.now();
  const s = getState();
  const hasDueResponse = s.requests.some(
    (r) => r.status === "active" && r.planned.some((p) => p.dueAt <= now)
  );
  const hasDueReply = s.conversations.some((c) => c.pendingReplyAt !== undefined && c.pendingReplyAt <= now);
  if (!hasDueResponse && !hasDueReply) return;

  update((prev): EngineState => {
    const notifications = [...prev.notifications];

    const requests = prev.requests.map((r): LocalRequest => {
      if (r.status !== "active") return r;
      const due = r.planned.filter((p) => p.dueAt <= now);
      if (due.length === 0) return r;
      const rest = r.planned.filter((p) => p.dueAt > now);
      const newResponses = due.map((p) => {
        notifications.push(notif({ type: "response_received", requestId: r.id, proId: p.proId }));
        return {
          id: uid(),
          proId: p.proId,
          price: p.price,
          priceTo: p.priceTo,
          message: OFFER_TEMPLATES[p.templateIdx],
          availability: AVAILABILITY[p.availabilityIdx],
          respondedMin: Math.max(1, Math.round((p.dueAt - r.publishedAt) / 60000) + (hash(p.proId) % 18)),
          createdAt: p.dueAt,
          status: "pending" as const
        };
      });
      return { ...r, planned: rest, responses: [...r.responses, ...newResponses] };
    });

    const conversations = prev.conversations.map((c): LocalConversation => {
      if (c.pendingReplyAt === undefined || c.pendingReplyAt > now) return c;
      notifications.push(notif({ type: "message_received", conversationId: c.id, proId: c.proId }));
      return {
        ...c,
        pendingReplyAt: undefined,
        pendingReplyIdx: (c.pendingReplyIdx ?? 0) + 1,
        messages: [
          ...c.messages,
          { id: uid(), from: "pro", text: chatReplyText(c.pendingReplyIdx ?? 0), at: now }
        ]
      };
    });

    return { requests, conversations, notifications };
  });
}
