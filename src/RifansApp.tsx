import { useEffect } from "react";

import App from "./App";
import { initZoomLock } from "./utils/zoomLock";

export default function RifansApp() {
  useEffect(() => {
    // Viewport locking / zoom prevention for the app-like mobile experience.
    initZoomLock();
  }, []);

  return <App />;
}
