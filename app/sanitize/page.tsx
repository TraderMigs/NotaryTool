export default function SanitizePage() {
  return (
    <main>
      <div className="shell stack">
        <div className="topbar">
          <h2>Sanitize Document</h2>
          <a href="/">Back home</a>
        </div>

        <section className="card stack">
          <p className="eyebrow">Phase 2 Placeholder</p>
          <h3>Upload box goes here</h3>
          <p className="subtext">
            This page is reserved for PDF upload, temporary memory processing, metadata scrubbing,
            and clean-file generation.
          </p>
          <div className="placeholder">
            <div className="stack">
              <strong>No upload logic yet</strong>
              <span>Phase 2 will add real sanitize processing here.</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
