import { createFileRoute } from "@tanstack/react-router";

import RifansApp from "@/RifansApp";
import { getPageMeta } from "@/lib/routeMeta";
import { SITE_URL } from "@/lib/routes";

// Every clean path (/about, /services/<id>, ...) renders the same app shell;
// head() gives each URL its own share preview, rendered on the server.
export const Route = createFileRoute("/$")({
  ssr: false,
  head: ({ params }) => {
    const path = "/" + (params._splat || "");
    const m = getPageMeta(path);
    const url = `${SITE_URL}${path}`;
    return {
      meta: [
        { title: m.title },
        { name: "description", content: m.description },
        { property: "og:title", content: m.title },
        { property: "og:description", content: m.description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { property: "og:image", content: m.image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: m.image },
        ...(m.private ? [{ name: "robots", content: "noindex, nofollow" }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: RifansApp,
});
