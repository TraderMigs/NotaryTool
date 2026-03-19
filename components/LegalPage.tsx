import PublicHeader from './PublicHeader'
import PublicFooter from './PublicFooter'

interface Section {
  title: string
  content: string | string[]
}

interface LegalPageProps {
  title: string
  subtitle: string
  updated: string
  intro?: string
  notice?: string
  sections: Section[]
}

export default function LegalPage({ title, subtitle, updated, intro, notice, sections }: LegalPageProps) {
  return (
    <>
      <PublicHeader />
      <main className="page-wrap">
        <div className="container">
          <div className="legal-page">
            <div className="legal-header">
              <span className="label">{subtitle}</span>
              <h1 className="legal-title">{title}</h1>
              <p className="legal-updated">Last updated: {updated}</p>
            </div>

            <div className="legal-body">
              {notice && (
                <div className="legal-disclaimer-box">
                  <p>{notice}</p>
                </div>
              )}
              {intro && <section><p>{intro}</p></section>}
              {sections.map((s, i) => (
                <section key={i}>
                  <h2>{s.title}</h2>
                  {Array.isArray(s.content) ? (
                    <ul>{s.content.map((item, j) => <li key={j}>{item}</li>)}</ul>
                  ) : (
                    <p>{s.content}</p>
                  )}
                </section>
              ))}
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  )
}
