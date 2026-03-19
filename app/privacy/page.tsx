import LegalPage from "../../components/LegalPage";

export default function PrivacyPage() {
  return (
    <LegalPage
      label="Privacy"
      title="Privacy-first by design."
      intro="Specterfy is positioned as a privacy pre-processor utility, not a notarization platform or compliance guarantee product."
      paragraphs={[
        "The product is intended to help operators create cleaner copies before documents move deeper into downstream handling.",
        "Users remain responsible for final review, suitability, workflow use, retention choices, and any legal obligations tied to their work.",
        "Public positioning, product language, and workflow framing should stay narrow, clear, and defensible."
      ]}
    />
  );
}
