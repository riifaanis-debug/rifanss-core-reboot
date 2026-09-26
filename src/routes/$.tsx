import { createFileRoute } from "@tanstack/react-router";

import RifansApp from "@/RifansApp";

// The app routes internally through the URL hash; any non-root path still
// renders the same application shell.
export const Route = createFileRoute("/$")({
  ssr: false,
  component: RifansApp,
});
