export default function DashboardPage() {
  return (
    <main>
      <div className="shell stack">
        <div className="topbar">
          <h2>Revenue Dashboard</h2>
          <a href="/">Back home</a>
        </div>

        <div className="grid cols3">
          <div className="card stack">
            <span className="label">Today</span>
            <span className="metric">$0</span>
            <p className="label">Phase 3 will calculate daily witnessing-fee revenue here.</p>
          </div>
          <div className="card stack">
            <span className="label">This Week</span>
            <span className="metric">$0</span>
            <p className="label">This becomes the running counter shop staff sees every day.</p>
          </div>
          <div className="card stack">
            <span className="label">Total Found</span>
            <span className="metric">$0</span>
            <p className="label">This is the scoreboard that makes the tool feel valuable fast.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
