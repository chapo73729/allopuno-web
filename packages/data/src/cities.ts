export interface City {
  slug: string;
  name: { sq: string; en: string };
  lat: number;
  lng: number;
  /** Villes de lancement (CDC §99) — actives dès l'année 1. */
  launch: boolean;
}

export const cities: City[] = [
  { slug: "prishtine", name: { sq: "Prishtinë", en: "Pristina" }, lat: 42.6629, lng: 21.1655, launch: true },
  { slug: "fushe-kosove", name: { sq: "Fushë Kosovë", en: "Fushë Kosova" }, lat: 42.6403, lng: 21.0961, launch: true },
  { slug: "ferizaj", name: { sq: "Ferizaj", en: "Ferizaj" }, lat: 42.3702, lng: 21.1483, launch: true },
  { slug: "gjilan", name: { sq: "Gjilan", en: "Gjilan" }, lat: 42.4635, lng: 21.4694, launch: true },
  { slug: "prizren", name: { sq: "Prizren", en: "Prizren" }, lat: 42.2139, lng: 20.7397, launch: true },
  { slug: "peje", name: { sq: "Pejë", en: "Peja" }, lat: 42.6593, lng: 20.2887, launch: false },
  { slug: "gjakove", name: { sq: "Gjakovë", en: "Gjakova" }, lat: 42.3803, lng: 20.4308, launch: false },
  { slug: "mitrovice", name: { sq: "Mitrovicë", en: "Mitrovica" }, lat: 42.8914, lng: 20.8660, launch: false },
  { slug: "podujeve", name: { sq: "Podujevë", en: "Podujeva" }, lat: 42.9106, lng: 21.1933, launch: false },
  { slug: "vushtrri", name: { sq: "Vushtrri", en: "Vushtrria" }, lat: 42.8231, lng: 20.9675, launch: false },
  { slug: "suhareke", name: { sq: "Suharekë", en: "Suhareka" }, lat: 42.3586, lng: 20.8253, launch: false },
  { slug: "rahovec", name: { sq: "Rahovec", en: "Rahovec" }, lat: 42.3994, lng: 20.6547, launch: false },
  { slug: "lipjan", name: { sq: "Lipjan", en: "Lipjan" }, lat: 42.5217, lng: 21.1258, launch: false },
  { slug: "obiliq", name: { sq: "Obiliq", en: "Obiliq" }, lat: 42.6869, lng: 21.0700, launch: false },
  { slug: "drenas", name: { sq: "Drenas", en: "Drenas" }, lat: 42.6244, lng: 20.8964, launch: false },
  { slug: "kamenice", name: { sq: "Kamenicë", en: "Kamenica" }, lat: 42.5781, lng: 21.5803, launch: false },
  { slug: "decan", name: { sq: "Deçan", en: "Deçan" }, lat: 42.5403, lng: 20.2875, launch: false },
  { slug: "istog", name: { sq: "Istog", en: "Istog" }, lat: 42.7808, lng: 20.4869, launch: false },
  { slug: "kline", name: { sq: "Klinë", en: "Klina" }, lat: 42.6217, lng: 20.5778, launch: false },
  { slug: "skenderaj", name: { sq: "Skenderaj", en: "Skenderaj" }, lat: 42.7469, lng: 20.7889, launch: false },
  { slug: "malisheve", name: { sq: "Malishevë", en: "Malisheva" }, lat: 42.4828, lng: 20.7458, launch: false },
  { slug: "viti", name: { sq: "Viti", en: "Vitia" }, lat: 42.3214, lng: 21.3583, launch: false },
  { slug: "shtime", name: { sq: "Shtime", en: "Shtime" }, lat: 42.4331, lng: 21.0397, launch: false },
  { slug: "kacanik", name: { sq: "Kaçanik", en: "Kaçanik" }, lat: 42.2319, lng: 21.2594, launch: false },
  { slug: "dragash", name: { sq: "Dragash", en: "Dragash" }, lat: 42.0617, lng: 20.6533, launch: false }
];

export const launchCities = cities.filter((c) => c.launch);

export function findCity(slug: string): City | undefined {
  return cities.find((c) => c.slug === slug);
}
