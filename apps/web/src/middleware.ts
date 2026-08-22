import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Tout sauf les internals Next, l'API et les fichiers statiques.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)"
};
