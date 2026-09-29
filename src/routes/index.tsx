import { createFileRoute } from "@tanstack/react-router";

import RifansApp from "@/RifansApp";

const title = "ريفانس المالية";
const description =
  "ريفانس المالية ، شركة سعودية ذات مسؤولية محدودة مرخصة من قِبل البنك المركزي السعودي وخاضعة لإشراف ورقابة هيئة السوق المالية";
const socialImage = "https://rifanss.com/og-share.jpg";

// The app is a hash-routed single-page application, so every screen renders
// from this route. It must run client-side only: the app reads
// window.location.hash during its first render.
export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:image", content: socialImage },
      { property: "og:image:width", content: "1672" },
      { property: "og:image:height", content: "941" },
      { property: "og:image:type", content: "image/jpeg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: socialImage },
      {
        name: "domain-verification",
        content: "f611e98333bbd3a199cf29cfe01bce776a08e40996bfdf6bc8816e9c717c0cdb",
      },
    ],
  }),
  component: RifansApp,
});
