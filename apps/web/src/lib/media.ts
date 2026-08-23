/**
 * MÉDIA — visuels du site.
 *
 * ⚠️ INTERIM : ces images sont générées par IA et servies depuis le CDN de
 * génération. Elles se chargent côté visiteur, mais ne sont pas hébergées sur
 * notre infrastructure. AVANT un vrai trafic de production, migrer ces fichiers
 * vers un stockage possédé (Vercel Blob, S3/R2, ou apps/web/public) et remplacer
 * uniquement les URL ci-dessous — le reste du code n'a pas à changer.
 *
 * `undefined` ⇒ la tuile/section retombe proprement sur un rendu dégradé + icône
 * (voir PhotoTile / composants). Aucune image cassée : tout a un fallback.
 */

const CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_3EovsQbkKYXo0iKPC9zMeUUO8qV";

export const media = {
  hero: `${CDN}/hf_20260823_185256_18e26f20-f33c-43c2-a32a-6eada7fab9ae_min.webp`,
  proCta: `${CDN}/hf_20260823_185256_dabbfe5c-80e1-427c-a037-64b5bade8e9b_min.webp`
} as const;

/** Photo par catégorie (slug). Absente ⇒ fallback dégradé + icône. */
export const categoryPhotos: Record<string, string | undefined> = {
  automjete: `${CDN}/hf_20260823_185256_35f31af2-9e37-4932-ab1c-aa0e260e9fed_min.webp`,
  transport: `${CDN}/hf_20260823_185256_ea8ddaf6-2d81-4788-962c-580f18458f09_min.webp`,
  personale: `${CDN}/hf_20260823_185256_dabbfe5c-80e1-427c-a037-64b5bade8e9b_min.webp`,
  "qira-vegla": `${CDN}/hf_20260823_185256_caeaec13-8224-4d70-96a2-4814cd574549_min.webp`
};

export function categoryPhoto(slug: string): string | undefined {
  return categoryPhotos[slug];
}
