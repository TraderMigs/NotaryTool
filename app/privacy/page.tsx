import LegalPage from "@/components/LegalPage";

export default function PrivacyPage() {
  return (
    <LegalPage
      label="Privacy"
      title="Privacy-first by design."
      intro="Specterfy is positioned as a privacy pre-processor utility, not a notarization platform or compliance guarantee product."
      points=[{"'Keep claims narrow and defensible.','Users remain responsible for final review and downstream use.','Public product language stays utility-first, not approval-first.'"}]
    />
  );
}
