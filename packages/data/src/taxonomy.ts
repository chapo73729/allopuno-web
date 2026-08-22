export type CategoryKind = "service" | "rental";

export interface Subcategory {
  slug: string;
  name: { sq: string; en: string };
  /** Synonymes de recherche (CDC §77) — albanais courant, fautes fréquentes. */
  synonyms?: string[];
}

export interface Category {
  slug: string;
  kind: CategoryKind;
  /** Nom d'icône lucide-react (rendu côté web). */
  icon: string;
  name: { sq: string; en: string };
  description: { sq: string; en: string };
  children: Subcategory[];
}

/**
 * Taxonomie AlloPuno v1 (CDC §32–33). Éditable en admin à terme ; cette
 * version sert de seed et de source pour le site public.
 */
export const categories: Category[] = [
  {
    slug: "ndertim",
    kind: "service",
    icon: "Hammer",
    name: { sq: "Ndërtim & Rregullime", en: "Construction & Repairs" },
    description: {
      sq: "Hidraulik, elektricist, piktor, murator — mjeshtrit për shtëpinë tënde.",
      en: "Plumbers, electricians, painters, masons — the tradespeople your home needs."
    },
    children: [
      { slug: "hidraulik", name: { sq: "Hidraulik", en: "Plumbing" }, synonyms: ["ujë", "rrjedhje", "bojler", "gypa", "hidraulika"] },
      { slug: "elektricist", name: { sq: "Elektricist", en: "Electrician" }, synonyms: ["rryma", "prizë", "ndriçim", "elektrika"] },
      { slug: "piktor", name: { sq: "Piktor / Lyerje", en: "Painting" }, synonyms: ["lyerje", "bojë", "gëlqere", "moler"] },
      { slug: "murator", name: { sq: "Murator", en: "Masonry" }, synonyms: ["mur", "beton", "themel"] },
      { slug: "pllocat", name: { sq: "Pllaka & Qeramikë", en: "Tiling" }, synonyms: ["pllaka", "qeramikë", "banjo"] },
      { slug: "gips", name: { sq: "Gips & Rigips", en: "Plaster & Drywall" }, synonyms: ["rigips", "knauf", "tavan"] },
      { slug: "zdrukthtari", name: { sq: "Zdrukthtari", en: "Carpentry" }, synonyms: ["dru", "dyer", "dritare", "mobilje"] },
      { slug: "cati", name: { sq: "Çati", en: "Roofing" }, synonyms: ["çati", "tjegulla", "ulluk"] },
      { slug: "izolim", name: { sq: "Izolim", en: "Insulation" }, synonyms: ["izolim", "fasadë", "stiropor"] },
      { slug: "ngrohje", name: { sq: "Ngrohje", en: "Heating" }, synonyms: ["kaldajë", "radiator", "ngrohje qendrore"] },
      { slug: "klima", name: { sq: "Klimatizim", en: "Air conditioning" }, synonyms: ["klimë", "kondicioner", "ftohje"] }
    ]
  },
  {
    slug: "shtepia",
    kind: "service",
    icon: "Home",
    name: { sq: "Shtëpia", en: "Home & Garden" },
    description: {
      sq: "Pastrim, kopshtari, montim mobiljesh, bartje — gjithçka rreth shtëpisë.",
      en: "Cleaning, gardening, furniture assembly, moving — everything around the house."
    },
    children: [
      { slug: "pastrim", name: { sq: "Pastrim", en: "Cleaning" }, synonyms: ["pastrimi", "higjienë", "pastrim i thellë"] },
      { slug: "kopshtari", name: { sq: "Kopshtari", en: "Gardening" }, synonyms: ["kopsht", "bar", "krasitje", "lulishte"] },
      { slug: "montim", name: { sq: "Montim mobiljesh", en: "Furniture assembly" }, synonyms: ["montim", "ikea", "mobilje"] },
      { slug: "shperngulje", name: { sq: "Shpërngulje", en: "Moving" }, synonyms: ["bartje", "transport shtëpie", "kamion"] },
      { slug: "hamallek", name: { sq: "Bartje & Ngarkim", en: "Manual labour" }, synonyms: ["hamall", "ngarkim", "shkarkim"] },
      { slug: "dezinfektim", name: { sq: "Dezinfektim", en: "Pest control" }, synonyms: ["insekte", "minj", "dezinfektim"] }
    ]
  },
  {
    slug: "automjete",
    kind: "service",
    icon: "Car",
    name: { sq: "Automjete", en: "Auto" },
    description: {
      sq: "Mekanik, gomisteri, autolarje, karrotrec — gjithçka për veturën tënde.",
      en: "Mechanics, tyres, car wash, towing — everything for your car."
    },
    children: [
      { slug: "mekanik", name: { sq: "Mekanik", en: "Mechanic" }, synonyms: ["servis", "motor", "defekt"] },
      { slug: "karroceri", name: { sq: "Karroceri & Ngjyrosje", en: "Bodywork & Paint" }, synonyms: ["limari", "ngjyrosje", "gërvishtje"] },
      { slug: "gomisteri", name: { sq: "Gomisteri", en: "Tyres" }, synonyms: ["goma", "vulkanizer", "balancim"] },
      { slug: "autolarje", name: { sq: "Autolarje & Detailing", en: "Car wash & Detailing" }, synonyms: ["larje", "detailing", "poliranje"] },
      { slug: "diagnostike", name: { sq: "Diagnostikë", en: "Diagnostics" }, synonyms: ["kompjuter", "check engine", "diagnoza"] },
      { slug: "karrotrec", name: { sq: "Karrotrec", en: "Towing" }, synonyms: ["tërheqje", "defekt rruge", "karrotreci"] }
    ]
  },
  {
    slug: "transport",
    kind: "service",
    icon: "Truck",
    name: { sq: "Transport", en: "Transport" },
    description: {
      sq: "Furgon, kamion, shofer, dërgesa — kur diçka duhet të lëvizë.",
      en: "Vans, trucks, drivers, deliveries — when something needs to move."
    },
    children: [
      { slug: "furgon", name: { sq: "Furgon", en: "Van" }, synonyms: ["kombi", "furgoni", "transport"] },
      { slug: "kamion", name: { sq: "Kamion", en: "Truck" }, synonyms: ["kamioni", "mall", "ngarkesë"] },
      { slug: "shofer", name: { sq: "Shofer", en: "Driver" }, synonyms: ["vozitës", "shoferi"] },
      { slug: "dergesa", name: { sq: "Dërgesa", en: "Delivery" }, synonyms: ["postë", "dërgesë", "kurier"] }
    ]
  },
  {
    slug: "digjitale",
    kind: "service",
    icon: "Laptop",
    name: { sq: "Digjitale", en: "Digital" },
    description: {
      sq: "Riparim telefonash, web, dizajn, foto e video — bota digjitale.",
      en: "Phone repair, web, design, photo and video — the digital world."
    },
    children: [
      { slug: "riparim-telefonash", name: { sq: "Riparim telefonash", en: "Phone repair" }, synonyms: ["ekran", "bateri", "iphone", "telefon"] },
      { slug: "informatike", name: { sq: "Informatikë & PC", en: "IT & Computers" }, synonyms: ["kompjuter", "laptop", "windows", "format"] },
      { slug: "web", name: { sq: "Web & Aplikacione", en: "Web & Apps" }, synonyms: ["faqe interneti", "aplikacion", "webfaqe"] },
      { slug: "dizajn", name: { sq: "Dizajn grafik", en: "Graphic design" }, synonyms: ["logo", "dizajn", "grafikë"] },
      { slug: "fotografi", name: { sq: "Fotografi", en: "Photography" }, synonyms: ["fotograf", "foto", "studio"] },
      { slug: "video", name: { sq: "Video & Montazh", en: "Video & Editing" }, synonyms: ["kamerman", "montazh", "dron"] },
      { slug: "marketing", name: { sq: "Marketing", en: "Marketing" }, synonyms: ["reklama", "social media", "instagram"] }
    ]
  },
  {
    slug: "personale",
    kind: "service",
    icon: "GraduationCap",
    name: { sq: "Personale", en: "Personal" },
    description: {
      sq: "Mësime private, kujdes, ndihmë — shërbime për njerëzit.",
      en: "Private lessons, care, help — services for people."
    },
    children: [
      { slug: "mesime", name: { sq: "Mësime private", en: "Private lessons" }, synonyms: ["matematikë", "anglisht", "instruktor", "kurse"] },
      { slug: "kujdes-femijesh", name: { sq: "Kujdes për fëmijë", en: "Childcare" }, synonyms: ["dado", "bebisiter", "fëmijë"] },
      { slug: "kujdes-te-moshuar", name: { sq: "Kujdes për të moshuar", en: "Elderly care" }, synonyms: ["kujdestar", "të moshuar"] },
      { slug: "kafshe", name: { sq: "Kujdes për kafshë", en: "Pet care" }, synonyms: ["qen", "mace", "shëtitje"] },
      { slug: "ndihme", name: { sq: "Ndihmë e përgjithshme", en: "General help" }, synonyms: ["ndihmës", "punë të vogla"] }
    ]
  },
  {
    slug: "evente",
    kind: "service",
    icon: "PartyPopper",
    name: { sq: "Evente", en: "Events" },
    description: {
      sq: "DJ, fotograf, katering, dekor — për dasma, festa dhe evente.",
      en: "DJs, photographers, catering, decoration — for weddings, parties and events."
    },
    children: [
      { slug: "dj", name: { sq: "DJ & Muzikë", en: "DJ & Music" }, synonyms: ["muzikë", "dasmë", "dj"] },
      { slug: "fotograf-eventesh", name: { sq: "Fotograf eventesh", en: "Event photographer" }, synonyms: ["dasmë", "fejesë", "foto"] },
      { slug: "kamerman", name: { sq: "Videograf", en: "Videographer" }, synonyms: ["video dasme", "dron", "kamerman"] },
      { slug: "katering", name: { sq: "Katering", en: "Catering" }, synonyms: ["ushqim", "torte", "ëmbëlsira"] },
      { slug: "dekor", name: { sq: "Dekorim", en: "Decoration" }, synonyms: ["dekor", "lule", "ballona"] }
    ]
  },
  {
    slug: "qira-vegla",
    kind: "rental",
    icon: "Wrench",
    name: { sq: "Qira: Vegla & Makineri", en: "Rent: Tools & Machinery" },
    description: {
      sq: "Mini-eskavator, gjeneratorë, vegla pune — merr me qira aty pranë.",
      en: "Mini excavators, generators, power tools — rent nearby."
    },
    children: [
      { slug: "mini-eskavator", name: { sq: "Mini-eskavator", en: "Mini excavator" }, synonyms: ["bager", "eskavator", "gërmim"] },
      { slug: "gjenerator", name: { sq: "Gjenerator", en: "Generator" }, synonyms: ["agregat", "rrymë"] },
      { slug: "vegla-pune", name: { sq: "Vegla pune", en: "Power tools" }, synonyms: ["matkap", "sharrë", "hilti"] },
      { slug: "skele", name: { sq: "Skele", en: "Scaffolding" }, synonyms: ["skela", "platformë"] },
      { slug: "makineri-bujqesore", name: { sq: "Makineri bujqësore", en: "Farm machinery" }, synonyms: ["traktor", "frezë"] }
    ]
  },
  {
    slug: "qira-automjete",
    kind: "rental",
    icon: "CarFront",
    name: { sq: "Qira: Automjete", en: "Rent: Vehicles" },
    description: {
      sq: "Vetura, furgonë, rimorkio — me qira për ditë ose javë.",
      en: "Cars, vans, trailers — rent by the day or week."
    },
    children: [
      { slug: "vetura", name: { sq: "Vetura", en: "Cars" }, synonyms: ["rent a car", "veturë me qira"] },
      { slug: "furgone", name: { sq: "Furgonë", en: "Vans" }, synonyms: ["kombi me qira", "furgon"] },
      { slug: "rimorkio", name: { sq: "Rimorkio", en: "Trailers" }, synonyms: ["rimorkio", "prikolica"] }
    ]
  },
  {
    slug: "qira-pajisje",
    kind: "rental",
    icon: "Camera",
    name: { sq: "Qira: Pajisje", en: "Rent: Equipment" },
    description: {
      sq: "Pajisje eventesh, kamera, audio — gjithçka me qira.",
      en: "Event gear, cameras, audio — everything for rent."
    },
    children: [
      { slug: "pajisje-eventesh", name: { sq: "Pajisje eventesh", en: "Event equipment" }, synonyms: ["karrige", "tavolina", "tenda"] },
      { slug: "kamera", name: { sq: "Kamera & Foto", en: "Cameras" }, synonyms: ["aparat", "objektiv", "dron me qira"] },
      { slug: "audio", name: { sq: "Audio & Ndriçim", en: "Audio & Lighting" }, synonyms: ["zërim", "boks", "drita"] }
    ]
  }
];

export const serviceCategories = categories.filter((c) => c.kind === "service");
export const rentalCategories = categories.filter((c) => c.kind === "rental");

export function findCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function findSubcategory(slug: string): { category: Category; sub: Subcategory } | undefined {
  for (const category of categories) {
    const sub = category.children.find((s) => s.slug === slug);
    if (sub) return { category, sub };
  }
  return undefined;
}

/**
 * Recherche naïve par synonymes pour le stub de parsing NLU côté client.
 * La vraie implémentation vit dans le module AIService de l'API (doc 05 §D5).
 */
export function matchCategoryFromText(text: string): { category: Category; sub?: Subcategory } | undefined {
  const normalized = text.toLowerCase();
  for (const category of categories) {
    for (const sub of category.children) {
      const needles = [sub.slug.replace(/-/g, " "), sub.name.sq.toLowerCase(), ...(sub.synonyms ?? [])];
      if (needles.some((n) => normalized.includes(n.toLowerCase()))) {
        return { category, sub };
      }
    }
  }
  for (const category of categories) {
    if (normalized.includes(category.name.sq.toLowerCase())) return { category };
  }
  return undefined;
}
