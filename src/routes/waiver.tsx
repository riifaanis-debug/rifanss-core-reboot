import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import HealthDisabilityWaiverPage from "@/components/rifans/HealthDisabilityWaiverPage";
import GuestWaiverForm from "@/components/rifans/GuestWaiverForm";

const title = "طلب الإعفاء من الالتزامات التمويلية بسبب العجز الصحي | ريفانس المالية";
const description = "قدّم طلب الإعفاء من الالتزامات التمويلية بسبب العجز الصحي مع فريق ريفانس المالية المختص، دون الحاجة لتسجيل الدخول.";
const img = "https://rifanss.com/og-share.jpg";

export const Route = createFileRoute("/waiver")({
  ssr: false,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:image", content: img },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: img },
    ],
  }),
  component: WaiverLanding,
});

function WaiverLanding() {
  const [showForm, setShowForm] = useState(false);
  const toggle = (v: boolean) => { setShowForm(v); window.scrollTo({ top: 0 }); };
  return (
    <LanguageProvider><AuthProvider>
      {showForm
        ? <GuestWaiverForm onBack={() => toggle(false)} />
        : <HealthDisabilityWaiverPage landing onApply={() => toggle(true)} />}
    </AuthProvider></LanguageProvider>
  );
}
