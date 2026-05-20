import React, { useState } from 'react';
import LiveFeed from './LiveFeed';
import UploadWorkflow from './UploadWorkflow';

export default function Dashboard({ onReturnToLanding }) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, live, upload, config

  // Mock statistics for the overview page
  const stats = [
    { label: 'Total Inspected (24h)', value: '142,891', sub: '+12.4% vs yesterday', color: 'var(--primary)' },
    { label: 'Avg Inference Speed', value: '11.8 ms', sub: 'Edge execution latency', color: 'var(--primary)' },
    { label: 'Active Camera Lines', value: '8 / 8', sub: '99.98% system uptime', color: 'var(--accent)' },
    { label: 'Defect Capture Rate', value: '1.42%', sub: '2,028 flags quarantined', color: 'var(--warning)' }
  ];

  // Latest inspection events history list
  const recentInspections = [
    { id: 'IN-90812', part: 'Steel Roller Panel', status: 'pass', confidence: 99.4, timestamp: '10:14:02' },
    { id: 'IN-90811', part: 'PCB Assembly Module', status: 'fail', error: 'Solder bridge', confidence: 94.8, timestamp: '10:12:35' },
    { id: 'IN-90810', part: 'Silicon Cell Grid', status: 'pass', confidence: 97.2, timestamp: '10:09:55' },
    { id: 'IN-90809', part: 'Gas Turbine Segment', status: 'fail', error: 'Hairline crack', confidence: 96.2, timestamp: '10:05:11' },
    { id: 'IN-90808', part: 'Aluminium Extrusion', status: 'pass', confidence: 99.1, timestamp: '09:58:30' }
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar Panel */}
      <aside className="sidebar glass-card">
        <div className="sidebar-brand" onClick={onReturnToLanding}>
          <div className="logo-icon">V</div>
          <span>VisionInspect<span style={{ color: 'var(--primary)' }}>AI</span></span>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="9"></rect>
              <rect x="14" y="3" width="7" height="5"></rect>
              <rect x="14" y="12" width="7" height="9"></rect>
              <rect x="3" y="16" width="7" height="5"></rect>
            </svg>
            Overview Panel
          </button>
          
          <button 
            className={`nav-item-btn ${activeTab === 'live' ? 'active' : ''}`}
            onClick={() => setActiveTab('live')}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 7l-7 5 7 5V7z"></path>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
            Real-Time Stream
          </button>

          <button 
            className={`nav-item-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"></path>
            </svg>
            Diagnostic Upload
          </button>

          <button 
            className={`nav-item-btn ${activeTab === 'config' ? 'active' : ''}`}
            onClick={() => setActiveTab('config')}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
            Model API Config
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item-btn return-btn" onClick={onReturnToLanding}>
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Landing Page
          </button>
        </div>
      </aside>

      {/* Main Panel Viewport */}
      <main className="dashboard-main">
        {/* Top Navbar */}
        <header className="dashboard-header glass-card">
          <div className="header-search">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search serial numbers, models, or camera ID..." className="search-input" />
          </div>
          <div className="header-actions">
            <div className="sys-status">
              <span className="dot pulse-green"></span>
              <span>All Edge Nodes Active</span>
            </div>
            <div className="user-profile">
              <div className="avatar">QA</div>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Renderer */}
        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <div className="overview-tab-view animate-fade-in">
              {/* Stat Tiles */}
              <div className="stats-row">
                {stats.map((stat, i) => (
                  <div key={i} className="stat-card glass-card">
                    <span className="stat-label">{stat.label}</span>
                    <h2 className="stat-value" style={{ color: '#fff' }}>{stat.value}</h2>
                    <span className="stat-sub" style={{ color: stat.color }}>{stat.sub}</span>
                  </div>
                ))}
              </div>

              {/* Charts or Activity Logs */}
              <div className="dashboard-logs-row">
                {/* Visual Telemetry Chart Placeholder */}
                <div className="overview-graph-card glass-card">
                  <div className="card-header-inner">
                    <span>ANOMALY telemetry WEEKLY RATE</span>
                  </div>
                  <div className="graph-visualization">
                    {/* Simulated SVG Graph */}
                    <svg viewBox="0 0 500 200" className="chart-svg">
                      <defs>
                        <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {/* Grid lines */}
                      <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      <line x1="0" y1="150" x2="500" y2="150" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      
                      {/* Area Fill */}
                      <path d="M 0 160 Q 70 140 100 110 T 200 150 T 300 80 T 400 90 T 500 60 L 500 200 L 0 200 Z" fill="url(#chartGrad)" />
                      {/* Plot line */}
                      <path d="M 0 160 Q 70 140 100 110 T 200 150 T 300 80 T 400 90 T 500 60" stroke="var(--primary)" strokeWidth="2.5" fill="none" />
                      
                      {/* Scatter points */}
                      <circle cx="100" cy="110" r="4" fill="var(--primary)" />
                      <circle cx="300" cy="80" r="4" fill="var(--primary)" />
                      <circle cx="500" cy="60" r="4" fill="var(--primary)" />
                    </svg>
                    <div className="graph-x-axis">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                  </div>
                </div>

                {/* Latest Check list */}
                <div className="recent-inspections-card glass-card">
                  <div className="card-header-inner">
                    <span>LATEST RUN CHECKPOINTS</span>
                  </div>
                  <div className="inspections-table-container">
                    <table className="inspections-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Subject Part</th>
                          <th>Status</th>
                          <th>Score</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentInspections.map((row, idx) => (
                          <tr key={idx}>
                            <td className="mono">{row.id}</td>
                            <td>{row.part}</td>
                            <td>
                              <span className={`badge-status ${row.status}`}>
                                {row.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="mono">
                              {row.status === 'fail' ? (
                                <span style={{ color: 'var(--error)' }}>{row.error}</span>
                              ) : (
                                <span>{row.confidence.toFixed(1)}% Match</span>
                              )}
                            </td>
                            <td className="mono text-muted">{row.timestamp}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'live' && <LiveFeed />}

          {activeTab === 'upload' && <UploadWorkflow />}

          {activeTab === 'config' && (
            <div className="config-tab-view glass-card animate-fade-in">
              <div className="config-header">
                <h2>Developer SDK Integration</h2>
                <p>Query the VisionInspect zero-shot models directly using REST APIs or the CLI client. Initialize pipeline cameras locally.</p>
              </div>

              <div className="code-integration-section">
                <span className="code-lang-tab">Python SDK Integration</span>
                <pre className="code-container">
                  <code>{`import visioninspect_ai as vi

# Initialize edge inference client local to camera feed
client = vi.EdgeClient(api_key="vi_live_0f2a74cde78a")

# Define target zero-shot labels in code (no retraining required)
detector = client.load_model(
    model_id="zero-shot-anomaly-v2",
    prompt_classes=[
        "hairline crack",
        "surface corrosion",
        "bent terminal connector"
    ]
)

# Run inference loop
for frame in client.stream_camera(line_id="L-14"):
    results = detector.analyze(frame)
    if results.has_anomalies:
        print(f"Defect found: {results.detections[0].label} ({results.detections[0].confidence:.2%})")
        client.flag_quarantine(frame.serial, reason=results.detections[0].label)`}</code>
                </pre>
              </div>

              <div className="edge-nodes-list" style={{ marginTop: '32px' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Configured Industrial Gateway Bridges:</h3>
                <div className="edge-node-row">
                  <span className="node-icon">🖥️</span>
                  <div className="node-details">
                    <strong>Conveyor-Belt-Intel-NUC-4</strong>
                    <span>Edge server IP: 192.168.1.114 | Active streams: Camera L-14</span>
                  </div>
                  <span className="node-status active">ONLINE</span>
                </div>
                <div className="edge-node-row" style={{ marginTop: '12px' }}>
                  <span className="node-icon">🖥️</span>
                  <div className="node-details">
                    <strong>Turbine-Module-Nvidia-Jetson-1</strong>
                    <span>Edge server IP: 192.168.1.185 | Active streams: Camera L-02, L-03</span>
                  </div>
                  <span className="node-status active">ONLINE</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .dashboard-container {
          display: grid;
          grid-template-columns: 260px 1fr;
          min-height: 100vh;
          background: #040508;
          width: 100%;
        }

        @media (max-width: 900px) {
          .dashboard-container {
            grid-template-columns: 1fr;
          }
          .sidebar {
            display: none !important;
          }
        }

        /* Sidebar styles */
        .sidebar {
          height: 100vh;
          position: sticky;
          top: 0;
          border-radius: 0;
          border-top: none;
          border-bottom: none;
          border-left: none;
          display: flex;
          flex-direction: column;
          padding: 24px;
          background: rgba(8, 10, 18, 0.7);
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 800;
          color: var(--text-heading);
          font-size: 1.15rem;
          cursor: pointer;
          margin-bottom: 40px;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .nav-item-btn {
          background: none;
          border: 1px solid transparent;
          color: var(--text-main);
          padding: 12px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-family: var(--font-sans);
          font-weight: 500;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s ease;
          width: 100%;
          text-align: left;
        }

        .nav-item-btn:hover {
          background: rgba(255, 255, 255, 0.03);
          color: #fff;
        }

        .nav-item-btn.active {
          background: rgba(0, 242, 254, 0.06);
          border-color: rgba(0, 242, 254, 0.15);
          color: var(--primary);
        }

        .sidebar-footer {
          margin-top: auto;
          border-top: 1px solid var(--border);
          padding-top: 20px;
        }

        .return-btn {
          color: var(--text-muted);
        }
        .return-btn:hover {
          color: #fff;
        }

        /* Main Viewport Panel styling */
        .dashboard-main {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          overflow-y: auto;
        }

        .dashboard-header {
          height: 70px;
          border-radius: 0;
          border-top: none;
          border-left: none;
          border-right: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          background: rgba(8, 10, 18, 0.4);
        }

        .header-search {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 320px;
          background: rgba(0,0,0,0.15);
          border: 1px solid var(--border);
          padding: 6px 12px;
          border-radius: 6px;
        }

        .search-icon {
          font-size: 0.85rem;
        }

        .search-input {
          background: none;
          border: none;
          outline: none;
          color: #fff;
          font-size: 0.85rem;
          width: 100%;
          font-family: var(--font-sans);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .sys-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          font-family: var(--font-mono);
          color: var(--accent);
          border: 1px solid rgba(57, 255, 20, 0.2);
          background: rgba(57, 255, 20, 0.05);
          padding: 4px 10px;
          border-radius: 4px;
        }

        .sys-status .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
          display: inline-block;
          animation: pulseGlow 1.5s infinite ease;
        }

        .avatar {
          width: 32px;
          height: 32px;
          background: var(--secondary);
          border-radius: 50%;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .dashboard-content {
          flex: 1;
          padding: 32px;
        }

        @media (max-width: 768px) {
          .dashboard-header {
            padding: 0 16px;
          }
          .header-search {
            display: none;
          }
          .dashboard-content {
            padding: 16px;
          }
        }

        /* Overview Tab Panel styles */
        .overview-tab-view {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }

        .stat-card {
          padding: 20px;
        }

        .stat-label {
          font-size: 0.75rem;
          font-family: var(--font-mono);
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-value {
          font-size: 1.8rem;
          font-weight: 700;
          margin: 6px 0;
          font-family: var(--font-mono);
        }

        .stat-sub {
          font-size: 0.75rem;
          font-weight: 600;
        }

        .dashboard-logs-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .dashboard-logs-row {
            grid-template-columns: 1fr;
          }
        }

        .overview-graph-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
        }

        .card-header-inner {
          font-size: 0.75rem;
          font-family: var(--font-mono);
          color: var(--text-muted);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 12px;
        }

        .graph-visualization {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .chart-svg {
          width: 100%;
          height: auto;
          overflow: visible;
        }

        .graph-x-axis {
          display: flex;
          justify-content: space-between;
          padding-top: 12px;
          font-size: 0.75rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }

        .recent-inspections-card {
          padding: 24px;
        }

        .inspections-table-container {
          overflow-x: auto;
        }

        .inspections-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .inspections-table th {
          font-size: 0.7rem;
          font-family: var(--font-mono);
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 10px 12px;
          border-bottom: 1px solid var(--border);
        }

        .inspections-table td {
          font-size: 0.85rem;
          padding: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.02);
          color: var(--text-main);
        }

        .inspections-table tbody tr:hover {
          background: rgba(255,255,255,0.01);
        }

        .inspections-table td.mono {
          font-family: var(--font-mono);
          font-size: 0.8rem;
        }

        /* Config Developer tab styles */
        .config-tab-view {
          padding: 32px;
        }

        .config-header {
          margin-bottom: 24px;
        }

        .config-header p {
          color: var(--text-main);
          margin-top: 6px;
        }

        .code-integration-section {
          background: #020306;
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
          margin-top: 20px;
        }

        .code-lang-tab {
          display: block;
          background: rgba(255,255,255,0.015);
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--text-muted);
          padding: 8px 16px;
          border-bottom: 1px solid var(--border);
        }

        .code-container {
          padding: 16px 20px;
          margin: 0;
          overflow-x: auto;
        }

        .code-container code {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          color: var(--primary);
          line-height: 1.5;
        }

        .edge-node-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.01);
        }

        .node-icon {
          font-size: 1.25rem;
        }

        .node-details {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .node-details strong {
          color: #fff;
          font-size: 0.88rem;
        }

        .node-details span {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .node-status.active {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--accent);
          background: rgba(57, 255, 20, 0.08);
          border: 1px solid rgba(57, 255, 20, 0.2);
          padding: 4px 10px;
          border-radius: 4px;
        }

        /* Animations */
        .animate-fade-in {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}
