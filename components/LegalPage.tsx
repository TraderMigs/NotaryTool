import PublicFooter from "./PublicFooter";
import PublicHeader from "./PublicHeader";

type LegalPageProps = {
  label: string;
  title: string;
  intro: string;
  points: string[];
};

export default function LegalPage({
  label,
  title,
  intro,
  points,
}: LegalPageProps) {
  return (
    <main className="shell">
      <section className="hero-panel hero-panel-legal">
        <PublicHeader compact />
        <div className="legal-wrap">
          <span className="eyebrow">{label}</span>
          <h1 className="legal-title">{title}</h1>
          <p className="hero-support hero-support-legal">{intro}</p>

          <div className="legal-list">
            {points.map((point) => (
              <div key={point} className="legal-item">
                {point}
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
