import LegalPage from "../../components/LegalPage";

export default function DisclaimerPage() {
  return (
    <LegalPage
      label="Disclaimer"
      title="Tight positioning. Clear boundaries."
      intro="The product is intentionally framed as a workflow helper and pre-ingestion privacy step."
      paragraphs={[
        "Specterfy does not provide legal advice, notarizations, identity verification, or compliance guarantees.",
        "The product should not be represented as a state-approved provider or as a substitute for user review and professional judgment.",
        "All claims, descriptions, and user expectations should remain narrow, practical, and accurate."
      ]}
    />
  );
}
