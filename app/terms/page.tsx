import LegalPage from "@/components/LegalPage";

export default function TermsPage() {
  return (
    <LegalPage
      label="Terms"
      title="Use the utility responsibly."
      intro="Specterfy helps prepare cleaner copies before later workflow handling. It does not replace user judgment or legal obligations."
      points=[{"'Not a journal or RON platform.','Not legal advice or a compliance guarantee.','Users remain responsible for suitability, review, and use.'"}]
    />
  );
}
