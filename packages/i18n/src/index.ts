import sqCommon from "./messages/sq/common.json";
import sqHome from "./messages/sq/home.json";
import sqPublish from "./messages/sq/publish.json";
import sqSearch from "./messages/sq/search.json";
import sqCategories from "./messages/sq/categories.json";
import sqPro from "./messages/sq/pro.json";
import sqRequest from "./messages/sq/request.json";
import sqAuth from "./messages/sq/auth.json";
import sqRentals from "./messages/sq/rentals.json";
import sqPages from "./messages/sq/pages.json";
import sqWorkspace from "./messages/sq/workspace.json";

import enCommon from "./messages/en/common.json";
import enHome from "./messages/en/home.json";
import enPublish from "./messages/en/publish.json";
import enSearch from "./messages/en/search.json";
import enCategories from "./messages/en/categories.json";
import enPro from "./messages/en/pro.json";
import enRequest from "./messages/en/request.json";
import enAuth from "./messages/en/auth.json";
import enRentals from "./messages/en/rentals.json";
import enPages from "./messages/en/pages.json";
import enWorkspace from "./messages/en/workspace.json";

export const locales = ["sq", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "sq";

const catalogs: Record<Locale, Record<string, unknown>> = {
  sq: {
    common: sqCommon,
    home: sqHome,
    publish: sqPublish,
    search: sqSearch,
    categories: sqCategories,
    pro: sqPro,
    request: sqRequest,
    auth: sqAuth,
    rentals: sqRentals,
    pages: sqPages,
    workspace: sqWorkspace
  },
  en: {
    common: enCommon,
    home: enHome,
    publish: enPublish,
    search: enSearch,
    categories: enCategories,
    pro: enPro,
    request: enRequest,
    auth: enAuth,
    rentals: enRentals,
    pages: enPages,
    workspace: enWorkspace
  }
};

export function getMessages(locale: string): Record<string, unknown> {
  return catalogs[(locales as readonly string[]).includes(locale) ? (locale as Locale) : defaultLocale];
}
