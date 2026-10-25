import { createFileRoute } from "@tanstack/react-router";
import { getRouterInstance } from "@tanstack/react-start";
import { sitemapStaticPaths, sitemapPathForLocation, sitemapXML, isSitemapRouteIncluded, type SitemapEntry } from "@/lib/sitemap";
import { getAllSubServices, BUSINESS_FIELDS_DATA } from "@/data/businessFieldsData";
import { SECTIONS } from "@/data/sectionsCatalog";

const BASE_URL = "https://rifanss.com";

// Public pages of the app shell, served by the "/$" route.
const PUBLIC_PAGES = [
  "about", "goal", "vision", "message", "mission", "contact", "complaints", "services",
  "terms", "privacy", "cookies", "acceptable-use", "disclaimer", "data-protection",
  "user-rights", "intellectual-property", "electronic-services", "health-waiver",
];

export const Route = createFileRoute("/sitemap.xml")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async () => {
        const router = await getRouterInstance();
        const entries: SitemapEntry[] = sitemapStaticPaths(router).map((path) => ({ path }));
        const routeId = "/$";
        if (isSitemapRouteIncluded(router.routesById[routeId])) {
          const splats = [
            ...PUBLIC_PAGES,
            ...getAllSubServices().filter((s) => s.id !== "waiver-request").map((s) => `services/${s.id}`),
            ...BUSINESS_FIELDS_DATA.map((f) => `fields/${f.id}`),
            ...SECTIONS.map((s) => `section/${s.id}`),
            ...SECTIONS.flatMap((s) => s.products.filter((p) => p.id !== "bnk-6").map((p) => `product/${p.id}`)),
          ];
          for (const _splat of splats) {
            const location = router.buildLocation({ to: "/$", params: { _splat }, search: () => ({}), hash: "" });
            const path = sitemapPathForLocation(router, location, routeId);
            if (path) entries.push({ path });
          }
        }
        return new Response(sitemapXML(BASE_URL, entries), {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
