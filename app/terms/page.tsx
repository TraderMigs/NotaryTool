import LegalPage from "../../components/LegalPage";

export default function TermsPage() {
  return (
    <LegalPage
      label="Terms"
      title="Use the utility responsibly."
      intro="Specterfy helps prepare cleaner copies before later workflow handling. It does not replace user judgment or legal obligations."
      paragraphs={[
        "The product is a workflow helper and pre-ingestion privacy step.",
        "It is not a journal, not a notarization platform, not a RON platform, and not a government-approved provider.",
        "Users remain responsible for document review, downstream use, compliance choices, and operational decisions."
      ]}
    />
  );
}
