/**
 * DONNÉES DE DÉMONSTRATION — v1 vitrine.
 * Remplacées par l'API (/api/v1) dès que le backend est branché ; toute la
 * navigation passe par ces types pour que le câblage soit mécanique.
 */

export type VerificationKind = "phone" | "email" | "identity" | "business";
export type Localized = { sq: string; en: string };

export interface DemoService {
  name: Localized;
  priceFrom?: number;
  priceTo?: number;
  unit?: "hour" | "job" | "m2" | "day";
}

export interface DemoReview {
  id: string;
  author: string;
  rating: number;
  daysAgo: number;
  text: Localized;
  reply?: Localized;
}

export interface DemoPro {
  id: string;
  name: string;
  headline: Localized;
  citySlug: string;
  radiusKm: number;
  rating: number;
  ratingCount: number;
  jobsDone: number;
  responseRate: number;
  avgResponseMin: number;
  categorySlug: string;
  subSlugs: string[];
  verified: VerificationKind[];
  availableNow: boolean;
  memberSince: number;
  distanceKm: number;
  about: Localized;
  services: DemoService[];
  breakdown: { quality: number; punctuality: number; communication: number; value: number; professionalism: number };
  reviews: DemoReview[];
}

export interface DemoRequest {
  id: string;
  title: Localized;
  description: Localized;
  categorySlug: string;
  subSlug?: string;
  citySlug: string;
  hoursAgo: number;
  urgent: boolean;
  budgetMin?: number;
  budgetMax?: number;
  offersCount: number;
  distanceKm: number;
  authorName: string;
  neededOn: Localized;
}

export interface DemoOffer {
  id: string;
  requestId: string;
  proId: string;
  price: number;
  priceTo?: number;
  unit?: "hour" | "job";
  availability: Localized;
  duration: Localized;
  message: Localized;
  respondedMin: number;
}

export interface DemoRental {
  id: string;
  title: Localized;
  categorySlug: string;
  subSlug: string;
  citySlug: string;
  pricePerDay: number;
  deposit?: number;
  year?: number;
  distanceKm: number;
  ownerName: string;
  rating?: number;
  ratingCount?: number;
}

export const demoPros: DemoPro[] = [
  {
    id: "ardi-elektro",
    name: "Ardi Elektro",
    headline: { sq: "Instalime dhe riparime elektrike", en: "Electrical installation and repair" },
    citySlug: "prishtine",
    radiusKm: 30,
    rating: 4.9,
    ratingCount: 152,
    jobsDone: 187,
    responseRate: 98,
    avgResponseMin: 14,
    categorySlug: "ndertim",
    subSlugs: ["elektricist", "ndricim"],
    verified: ["phone", "email", "identity", "business"],
    availableNow: true,
    memberSince: 2026,
    distanceKm: 3.2,
    about: {
      sq: "12 vjet përvojë në instalime elektrike për banesa dhe lokale. Punojmë me materiale të certifikuara dhe japim garanci për çdo punë.",
      en: "12 years of experience in electrical installations for homes and businesses. We use certified materials and guarantee every job."
    },
    services: [
      { name: { sq: "Instalim elektrik komplet", en: "Full electrical installation" }, priceFrom: 8, priceTo: 12, unit: "m2" },
      { name: { sq: "Riparime & defekte", en: "Repairs & faults" }, priceFrom: 15, priceTo: 30, unit: "hour" },
      { name: { sq: "Montim ndriçimi", en: "Lighting installation" }, priceFrom: 10, unit: "job" },
      { name: { sq: "Tabela elektrike", en: "Electrical panels" }, priceFrom: 80, priceTo: 200, unit: "job" }
    ],
    breakdown: { quality: 4.9, punctuality: 4.8, communication: 5.0, value: 4.7, professionalism: 4.9 },
    reviews: [
      {
        id: "r1",
        author: "Vjosa H.",
        rating: 5,
        daysAgo: 3,
        text: {
          sq: "Erdhi brenda orës, e gjeti defektin menjëherë dhe çmimi ishte ai që u premtua. Shumë korrekt.",
          en: "Arrived within the hour, found the fault right away and the price was as promised. Very professional."
        },
        reply: { sq: "Faleminderit, Vjosa! Na kontaktoni kurdo.", en: "Thank you, Vjosa! Contact us anytime." }
      },
      {
        id: "r2",
        author: "Driton M.",
        rating: 5,
        daysAgo: 11,
        text: {
          sq: "Instalimi i banesës 75 m² u krye për tri ditë, punë shumë e pastër.",
          en: "Wired our 75 m² flat in three days, very clean work."
        }
      },
      {
        id: "r3",
        author: "Arben Z.",
        rating: 4,
        daysAgo: 24,
        text: { sq: "Punë e mirë, pak vonesë në fillim por komunikimi ishte i qartë.", en: "Good work, a small delay at the start but communication was clear." }
      }
    ]
  },
  {
    id: "hidro-fix",
    name: "Hidro Fix",
    headline: { sq: "Hidraulik — intervenime urgjente 24/7", en: "Plumbing — 24/7 emergency call-outs" },
    citySlug: "prishtine",
    radiusKm: 25,
    rating: 4.8,
    ratingCount: 96,
    jobsDone: 124,
    responseRate: 95,
    avgResponseMin: 9,
    categorySlug: "ndertim",
    subSlugs: ["hidraulik"],
    verified: ["phone", "email", "identity"],
    availableNow: true,
    memberSince: 2026,
    distanceKm: 1.8,
    about: {
      sq: "Rrjedhje, bojlerë, gypa të bllokuar — vijmë shpejt dhe e zgjidhim me një vizitë ku është e mundur.",
      en: "Leaks, boilers, blocked pipes — we come fast and fix it in one visit where possible."
    },
    services: [
      { name: { sq: "Intervenim urgjent", en: "Emergency call-out" }, priceFrom: 20, priceTo: 40, unit: "job" },
      { name: { sq: "Montim bojleri", en: "Boiler installation" }, priceFrom: 30, priceTo: 60, unit: "job" },
      { name: { sq: "Zhbllokim gypash", en: "Pipe unblocking" }, priceFrom: 25, unit: "job" }
    ],
    breakdown: { quality: 4.8, punctuality: 4.9, communication: 4.7, value: 4.6, professionalism: 4.8 },
    reviews: [
      {
        id: "r1",
        author: "Elira B.",
        rating: 5,
        daysAgo: 1,
        text: { sq: "Rrjedhja u riparua për 40 minuta, të shtunën në mbrëmje. Faleminderit!", en: "Leak fixed in 40 minutes, on a Saturday evening. Thank you!" }
      },
      {
        id: "r2",
        author: "Fatos Sh.",
        rating: 5,
        daysAgo: 9,
        text: { sq: "Profesionist i vërtetë, çmim i drejtë.", en: "A true professional, fair price." }
      }
    ]
  },
  {
    id: "ngjyra-pro",
    name: "Ngjyra Pro",
    headline: { sq: "Lyerje banesash dhe lokalesh", en: "Painting flats and commercial spaces" },
    citySlug: "fushe-kosove",
    radiusKm: 20,
    rating: 4.7,
    ratingCount: 63,
    jobsDone: 81,
    responseRate: 92,
    avgResponseMin: 25,
    categorySlug: "ndertim",
    subSlugs: ["piktor", "gips"],
    verified: ["phone", "email"],
    availableNow: false,
    memberSince: 2026,
    distanceKm: 6.4,
    about: {
      sq: "Ekip prej tre personash, lyerje me cilësi dhe afate të sakta. Materiali sipas dëshirës suaj ose i yni.",
      en: "A team of three: quality painting and reliable deadlines. Your materials or ours."
    },
    services: [
      { name: { sq: "Lyerje banese", en: "Flat painting" }, priceFrom: 2, priceTo: 4, unit: "m2" },
      { name: { sq: "Gletim + lyerje", en: "Skim coat + paint" }, priceFrom: 4, priceTo: 6, unit: "m2" }
    ],
    breakdown: { quality: 4.8, punctuality: 4.5, communication: 4.7, value: 4.8, professionalism: 4.7 },
    reviews: [
      {
        id: "r1",
        author: "Liridon B.",
        rating: 5,
        daysAgo: 6,
        text: { sq: "Banesa 80 m² u lye për dy ditë, shumë pastër.", en: "80 m² flat painted in two days, very tidy." }
      }
    ]
  },
  {
    id: "driton-transport",
    name: "Driton Transport",
    headline: { sq: "Furgon + 2 punëtorë për shpërngulje", en: "Van + 2 workers for moving" },
    citySlug: "prishtine",
    radiusKm: 50,
    rating: 4.8,
    ratingCount: 74,
    jobsDone: 102,
    responseRate: 97,
    avgResponseMin: 12,
    categorySlug: "transport",
    subSlugs: ["furgon", "shperngulje"],
    verified: ["phone", "identity"],
    availableNow: true,
    memberSince: 2026,
    distanceKm: 4.1,
    about: {
      sq: "Shpërngulje banesash dhe zyrash në gjithë Kosovën. Furgon 12 m³, mbulesa mbrojtëse, montim/çmontim mobiljesh.",
      en: "Home and office moves across Kosovo. 12 m³ van, protective covers, furniture assembly/disassembly."
    },
    services: [
      { name: { sq: "Shpërngulje brenda qytetit", en: "Move within the city" }, priceFrom: 40, priceTo: 80, unit: "job" },
      { name: { sq: "Transport Prishtinë–Ferizaj", en: "Transport Prishtina–Ferizaj" }, priceFrom: 35, unit: "job" }
    ],
    breakdown: { quality: 4.8, punctuality: 4.9, communication: 4.8, value: 4.7, professionalism: 4.8 },
    reviews: [
      {
        id: "r1",
        author: "Arta K.",
        rating: 5,
        daysAgo: 2,
        text: { sq: "Të përpiktë dhe të kujdesshëm me mobiljet. Rekomandoj!", en: "Punctual and careful with the furniture. Recommended!" }
      }
    ]
  },
  {
    id: "foto-lensa",
    name: "Lensa Studio",
    headline: { sq: "Fotografi dasmash dhe eventesh", en: "Wedding and event photography" },
    citySlug: "prizren",
    radiusKm: 60,
    rating: 5.0,
    ratingCount: 41,
    jobsDone: 48,
    responseRate: 90,
    avgResponseMin: 45,
    categorySlug: "evente",
    subSlugs: ["fotograf-eventesh", "kamerman"],
    verified: ["phone", "email", "identity"],
    availableNow: false,
    memberSince: 2026,
    distanceKm: 2.5,
    about: {
      sq: "Fotografi natyrale, jo poza të ngurta. Dorëzim brenda 10 ditësh, galeri online për familjen.",
      en: "Natural photography, no stiff poses. Delivery within 10 days, online gallery for the family."
    },
    services: [
      { name: { sq: "Dasmë (ditë e plotë)", en: "Wedding (full day)" }, priceFrom: 350, priceTo: 600, unit: "job" },
      { name: { sq: "Fejesë / ditëlindje", en: "Engagement / birthday" }, priceFrom: 120, priceTo: 250, unit: "job" }
    ],
    breakdown: { quality: 5.0, punctuality: 4.9, communication: 5.0, value: 4.8, professionalism: 5.0 },
    reviews: [
      {
        id: "r1",
        author: "Blerta & Getoar",
        rating: 5,
        daysAgo: 15,
        text: { sq: "Fotot më të bukura që kemi parë, faleminderit nga zemra!", en: "The most beautiful photos we've seen, thank you from the heart!" }
      }
    ]
  },
  {
    id: "auto-gashi",
    name: "Auto Servis Gashi",
    headline: { sq: "Mekanik i përgjithshëm & diagnostikë", en: "General mechanic & diagnostics" },
    citySlug: "ferizaj",
    radiusKm: 15,
    rating: 4.6,
    ratingCount: 58,
    jobsDone: 77,
    responseRate: 88,
    avgResponseMin: 30,
    categorySlug: "automjete",
    subSlugs: ["mekanik", "diagnostike"],
    verified: ["phone", "business"],
    availableNow: true,
    memberSince: 2026,
    distanceKm: 1.2,
    about: {
      sq: "Servis me 15 vjet përvojë. Diagnostikë kompjuterike, servisim i rregullt dhe riparime motori.",
      en: "A workshop with 15 years of experience. Computer diagnostics, regular servicing and engine repairs."
    },
    services: [
      { name: { sq: "Diagnostikë kompjuterike", en: "Computer diagnostics" }, priceFrom: 10, unit: "job" },
      { name: { sq: "Servis i vogël", en: "Minor service" }, priceFrom: 25, priceTo: 60, unit: "job" }
    ],
    breakdown: { quality: 4.6, punctuality: 4.5, communication: 4.6, value: 4.7, professionalism: 4.6 },
    reviews: [
      {
        id: "r1",
        author: "Leon R.",
        rating: 5,
        daysAgo: 4,
        text: { sq: "E gjeti problemin që dy servise s'e gjetën dot.", en: "Found the problem two other garages couldn't." }
      }
    ]
  },
  {
    id: "kopshti-jone",
    name: "Kopshti Jonë",
    headline: { sq: "Kopshtari dhe mirëmbajtje oborresh", en: "Gardening and yard maintenance" },
    citySlug: "gjilan",
    radiusKm: 20,
    rating: 4.7,
    ratingCount: 33,
    jobsDone: 45,
    responseRate: 93,
    avgResponseMin: 40,
    categorySlug: "shtepia",
    subSlugs: ["kopshtari"],
    verified: ["phone", "email"],
    availableNow: false,
    memberSince: 2026,
    distanceKm: 3.9,
    about: {
      sq: "Krasitje, mbjellje, bar dhe sisteme ujitjeje — oborri juaj në duar të sigurta.",
      en: "Pruning, planting, lawns and irrigation systems — your yard in safe hands."
    },
    services: [
      { name: { sq: "Mirëmbajtje mujore oborri", en: "Monthly yard maintenance" }, priceFrom: 40, priceTo: 90, unit: "job" },
      { name: { sq: "Krasitje pemësh", en: "Tree pruning" }, priceFrom: 15, unit: "hour" }
    ],
    breakdown: { quality: 4.8, punctuality: 4.6, communication: 4.7, value: 4.7, professionalism: 4.7 },
    reviews: [
      {
        id: "r1",
        author: "Shpresa L.",
        rating: 5,
        daysAgo: 8,
        text: { sq: "Oborri s'ka qenë kurrë më i bukur.", en: "Our yard has never looked better." }
      }
    ]
  },
  {
    id: "pixel-riparime",
    name: "Pixel Riparime",
    headline: { sq: "Riparim telefonash dhe laptopësh", en: "Phone and laptop repair" },
    citySlug: "prishtine",
    radiusKm: 10,
    rating: 4.9,
    ratingCount: 121,
    jobsDone: 260,
    responseRate: 99,
    avgResponseMin: 7,
    categorySlug: "digjitale",
    subSlugs: ["riparim-telefonash", "informatike"],
    verified: ["phone", "email", "identity", "business"],
    availableNow: true,
    memberSince: 2026,
    distanceKm: 0.9,
    about: {
      sq: "Ekrane, bateri, porte karikimi — shumica e riparimeve brenda ditës, me garanci 6 muaj.",
      en: "Screens, batteries, charging ports — most repairs done the same day, with a 6-month warranty."
    },
    services: [
      { name: { sq: "Ndërrim ekrani", en: "Screen replacement" }, priceFrom: 25, priceTo: 120, unit: "job" },
      { name: { sq: "Ndërrim baterie", en: "Battery replacement" }, priceFrom: 20, priceTo: 60, unit: "job" }
    ],
    breakdown: { quality: 4.9, punctuality: 4.9, communication: 4.8, value: 4.8, professionalism: 4.9 },
    reviews: [
      {
        id: "r1",
        author: "Erza T.",
        rating: 5,
        daysAgo: 1,
        text: { sq: "Ekrani u ndërrua për 45 minuta. Super!", en: "Screen replaced in 45 minutes. Great!" }
      }
    ]
  }
];

export const demoRequests: DemoRequest[] = [
  {
    id: "kerkesa-hidraulik-prishtine",
    title: { sq: "Më duhet një hidraulik — rrjedhje nën lavaman", en: "Need a plumber — leak under the sink" },
    description: {
      sq: "Ka filluar një rrjedhje nën lavamanin e kuzhinës, uji po del te dollapi. Duhet intervenim sa më shpejt, mundësisht sot ose nesër në mëngjes.",
      en: "A leak started under the kitchen sink, water is reaching the cabinet. Needs fixing as soon as possible, ideally today or tomorrow morning."
    },
    categorySlug: "ndertim",
    subSlug: "hidraulik",
    citySlug: "prishtine",
    hoursAgo: 2,
    urgent: true,
    budgetMin: 20,
    budgetMax: 50,
    offersCount: 4,
    distanceKm: 2.1,
    authorName: "Vjosa H.",
    neededOn: { sq: "Sot / nesër", en: "Today / tomorrow" }
  },
  {
    id: "kerkesa-lyerje-banese",
    title: { sq: "Lyerje banese 80 m²", en: "Painting an 80 m² flat" },
    description: {
      sq: "Banesë 80 m², dy dhoma + sallon. Muret janë në gjendje të mirë, duhet vetëm lyerje e bardhë. Materiali mund të jetë i juaji ose i imi.",
      en: "80 m² flat, two bedrooms + living room. Walls are in good shape, just needs white paint. Materials can be yours or mine."
    },
    categorySlug: "ndertim",
    subSlug: "piktor",
    citySlug: "prishtine",
    hoursAgo: 5,
    urgent: false,
    budgetMin: 150,
    budgetMax: 300,
    offersCount: 6,
    distanceKm: 3.7,
    authorName: "Driton M.",
    neededOn: { sq: "Këtë javë", en: "This week" }
  },
  {
    id: "kerkesa-furgon-ferizaj",
    title: { sq: "Furgon për shpërngulje Prishtinë → Ferizaj", en: "Van for moving Prishtina → Ferizaj" },
    description: {
      sq: "Shpërngulje banese njëdhomëshe të shtunën. Rreth 15 kuti, një divan, një krevat dhe një frigorifer. Kati i dytë pa ashensor.",
      en: "Moving a one-bedroom flat on Saturday. About 15 boxes, a sofa, a bed and a fridge. Second floor, no lift."
    },
    categorySlug: "transport",
    subSlug: "furgon",
    citySlug: "prishtine",
    hoursAgo: 8,
    urgent: false,
    budgetMin: 40,
    budgetMax: 80,
    offersCount: 3,
    distanceKm: 1.4,
    authorName: "Arben Z.",
    neededOn: { sq: "Të shtunën", en: "Saturday" }
  },
  {
    id: "kerkesa-mini-eskavator",
    title: { sq: "Kërkoj mini-eskavator me operator, 2 ditë", en: "Looking for a mini excavator with operator, 2 days" },
    description: {
      sq: "Gërmim për themele garazhi, rreth 30 m³ dhe kanal 15 m për ujësjellës. Terreni i qasshëm lehtë.",
      en: "Digging garage foundations, about 30 m³, plus a 15 m water-pipe trench. Easily accessible terrain."
    },
    categorySlug: "qira-vegla",
    subSlug: "mini-eskavator",
    citySlug: "gjilan",
    hoursAgo: 12,
    urgent: false,
    budgetMin: 200,
    budgetMax: 400,
    offersCount: 2,
    distanceKm: 5.2,
    authorName: "Fatos Sh.",
    neededOn: { sq: "Javën e ardhshme", en: "Next week" }
  },
  {
    id: "kerkesa-fotograf-dasme",
    title: { sq: "Fotograf për dasmë në Prizren", en: "Photographer for a wedding in Prizren" },
    description: {
      sq: "Dasmë me rreth 250 mysafirë më 12 shtator. Duam foto natyrale gjatë gjithë ditës dhe një video të shkurtër highlights.",
      en: "A wedding with around 250 guests on 12 September. We want natural photos all day and a short highlights video."
    },
    categorySlug: "evente",
    subSlug: "fotograf-eventesh",
    citySlug: "prizren",
    hoursAgo: 20,
    urgent: false,
    budgetMin: 300,
    budgetMax: 600,
    offersCount: 5,
    distanceKm: 2.8,
    authorName: "Blerta K.",
    neededOn: { sq: "12 shtator", en: "12 September" }
  },
  {
    id: "kerkesa-montim-mobiljesh",
    title: { sq: "Montim i mobiljeve të dhomës së fëmijëve", en: "Assembling children's room furniture" },
    description: {
      sq: "Tri elemente: krevat, dollap dhe tavolinë studimi. Të gjitha të reja, në kuti. Duhen veglat tuaja.",
      en: "Three pieces: bed, wardrobe and study desk. All new, still boxed. Bring your own tools."
    },
    categorySlug: "shtepia",
    subSlug: "montim",
    citySlug: "ferizaj",
    hoursAgo: 26,
    urgent: false,
    budgetMin: 20,
    budgetMax: 40,
    offersCount: 1,
    distanceKm: 0.8,
    authorName: "Elira B.",
    neededOn: { sq: "Këtë fundjavë", en: "This weekend" }
  },
  {
    id: "kerkesa-riparim-telefoni",
    title: { sq: "Ndërrim ekrani iPhone 13", en: "iPhone 13 screen replacement" },
    description: {
      sq: "Ekrani i thyer nga rënia, telefoni punon normalisht. Preferoj ekran origjinal ose cilësi e lartë.",
      en: "Screen cracked from a fall, phone works fine. I'd prefer an original or high-quality screen."
    },
    categorySlug: "digjitale",
    subSlug: "riparim-telefonash",
    citySlug: "prishtine",
    hoursAgo: 30,
    urgent: false,
    budgetMin: 40,
    budgetMax: 90,
    offersCount: 3,
    distanceKm: 1.1,
    authorName: "Erza T.",
    neededOn: { sq: "Sa më parë", en: "As soon as possible" }
  },
  {
    id: "kerkesa-instruktor-matematike",
    title: { sq: "Instruktor matematike për maturën", en: "Maths tutor for the matura exam" },
    description: {
      sq: "Djali im është në vitin e fundit dhe i duhet përgatitje për maturën, dy herë në javë, mundësisht në shtëpi ose online.",
      en: "My son is in his final year and needs matura preparation, twice a week, at home or online."
    },
    categorySlug: "personale",
    subSlug: "mesime",
    citySlug: "gjilan",
    hoursAgo: 44,
    urgent: false,
    budgetMin: 8,
    budgetMax: 15,
    offersCount: 4,
    distanceKm: 4.5,
    authorName: "Shpresa L.",
    neededOn: { sq: "Nga tetori", en: "From October" }
  }
];

export const demoOffers: DemoOffer[] = [
  {
    id: "of1",
    requestId: "kerkesa-hidraulik-prishtine",
    proId: "hidro-fix",
    price: 30,
    unit: "job",
    availability: { sq: "Sot në 17:00", en: "Today at 17:00" },
    duration: { sq: "~1 orë", en: "~1 hour" },
    message: {
      sq: "Përshëndetje! Mund të vij sot pasdite. Nëse është guarnicioni ose sifoni, e riparoj me një vizitë — pjesët i kam me vete.",
      en: "Hi! I can come this afternoon. If it's the seal or the trap, I'll fix it in one visit — I carry the parts with me."
    },
    respondedMin: 6
  },
  {
    id: "of2",
    requestId: "kerkesa-hidraulik-prishtine",
    proId: "ardi-elektro",
    price: 25,
    priceTo: 45,
    unit: "job",
    availability: { sq: "Nesër 09:00–12:00", en: "Tomorrow 09:00–12:00" },
    duration: { sq: "1–2 orë", en: "1–2 hours" },
    message: {
      sq: "Mirëdita! Bashkëpunoj me një hidraulik të licencuar — vijmë nesër në mëngjes dhe e verifikojmë edhe instalimin përreth.",
      en: "Hello! I work with a licensed plumber — we can come tomorrow morning and also check the surrounding installation."
    },
    respondedMin: 18
  },
  {
    id: "of3",
    requestId: "kerkesa-hidraulik-prishtine",
    proId: "driton-transport",
    price: 35,
    unit: "job",
    availability: { sq: "Nesër pasdite", en: "Tomorrow afternoon" },
    duration: { sq: "~2 orë", en: "~2 hours" },
    message: {
      sq: "Mund ta shoh nesër pas orës 14:00. Çmimi përfshin materialin bazë.",
      en: "I can look at it tomorrow after 14:00. The price includes basic materials."
    },
    respondedMin: 41
  },
  {
    id: "of4",
    requestId: "kerkesa-hidraulik-prishtine",
    proId: "pixel-riparime",
    price: 28,
    unit: "job",
    availability: { sq: "Të premten", en: "On Friday" },
    duration: { sq: "~1 orë", en: "~1 hour" },
    message: {
      sq: "Përshëndetje, i marr edhe punë të vogla hidraulike gjatë fundjavës. Të premten jam i lirë gjithë ditën.",
      en: "Hi, I also take small plumbing jobs on weekends. I'm free all day Friday."
    },
    respondedMin: 95
  }
];

export const demoRentals: DemoRental[] = [
  {
    id: "qira-mini-eskavator-15t",
    title: { sq: "Mini-eskavator 1.5t me operator", en: "1.5t mini excavator with operator" },
    categorySlug: "qira-vegla",
    subSlug: "mini-eskavator",
    citySlug: "prishtine",
    pricePerDay: 120,
    deposit: 200,
    year: 2021,
    distanceKm: 6.3,
    ownerName: "Gërmime Krasniqi",
    rating: 4.8,
    ratingCount: 22
  },
  {
    id: "qira-furgon-12m3",
    title: { sq: "Furgon 12 m³ — ditor ose me orë", en: "12 m³ van — daily or hourly" },
    categorySlug: "qira-automjete",
    subSlug: "furgone",
    citySlug: "prishtine",
    pricePerDay: 45,
    deposit: 100,
    year: 2019,
    distanceKm: 3.5,
    ownerName: "Driton Transport",
    rating: 4.7,
    ratingCount: 31
  },
  {
    id: "qira-rimorkio",
    title: { sq: "Rimorkio 750 kg, e hapur", en: "750 kg open trailer" },
    categorySlug: "qira-automjete",
    subSlug: "rimorkio",
    citySlug: "ferizaj",
    pricePerDay: 15,
    deposit: 50,
    year: 2020,
    distanceKm: 2.2,
    ownerName: "Arben Z.",
    rating: 4.9,
    ratingCount: 14
  },
  {
    id: "qira-gjenerator-5kw",
    title: { sq: "Gjenerator 5 kW, benzinë", en: "5 kW petrol generator" },
    categorySlug: "qira-vegla",
    subSlug: "gjenerator",
    citySlug: "gjilan",
    pricePerDay: 20,
    deposit: 80,
    distanceKm: 4.8,
    ownerName: "Vegla Rent",
    rating: 4.6,
    ratingCount: 9
  },
  {
    id: "qira-skele-100m2",
    title: { sq: "Skele fasade, deri 100 m²", en: "Facade scaffolding, up to 100 m²" },
    categorySlug: "qira-vegla",
    subSlug: "skele",
    citySlug: "prizren",
    pricePerDay: 35,
    deposit: 150,
    distanceKm: 5.9,
    ownerName: "Ndërtimi 2020",
    rating: 4.5,
    ratingCount: 11
  },
  {
    id: "qira-kamera-sony",
    title: { sq: "Sony A7 IV + 2 objektiva", en: "Sony A7 IV + 2 lenses" },
    categorySlug: "qira-pajisje",
    subSlug: "kamera",
    citySlug: "prishtine",
    pricePerDay: 40,
    deposit: 300,
    year: 2023,
    distanceKm: 1.6,
    ownerName: "Lensa Studio",
    rating: 5.0,
    ratingCount: 8
  }
];

export function findPro(id: string): DemoPro | undefined {
  return demoPros.find((p) => p.id === id);
}

export function findRequest(id: string): DemoRequest | undefined {
  return demoRequests.find((r) => r.id === id);
}

export function offersForRequest(requestId: string): DemoOffer[] {
  return demoOffers.filter((o) => o.requestId === requestId);
}
