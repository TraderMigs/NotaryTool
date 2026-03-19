import LegalPage from "@/components/LegalPage";

export default function DisclaimerPage() {
  return (
    <LegalPage
      label="Disclaimer"
      title="Tight positioning. Clear boundaries."
      intro="The product is intentionally framed as a workflow helper and pre-ingestion privacy step."
      points=[{"'Not government-approved provider language.','Not a seal, ID verification, or notarization system.','No guarantee of compliance, outcome, or legal sufficiency.'"}]
    />
  );
}
