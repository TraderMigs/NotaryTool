import PublicFooter from "./PublicFooter";
import PublicHeader from "./PublicHeader";

type LegalPageProps = {
  label: string;
  title: string;
  intro: string;
  paragraphs: string[];
};

export default function LegalPage({
  label,
  title,
  intro,
  paragraphs,
}: LegalPageProps) {
  return (
    <main className="site-shell legal-shell">
      <PublicHeader />
      <section className="legal-hero">
        <div className="update-pill">{label}</div>
        <h1 className="legal-title">{title}</h1>
        <p className="legal-intro">{intro}</p>
      </section>

      <section className="legal-body">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="legal-paragraph">
            {paragraph}
          </p>
        ))}
      </section>

      <PublicFooter />
    </main>
  );
}
