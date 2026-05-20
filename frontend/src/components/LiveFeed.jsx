import React, { useState, useEffect, useRef } from 'react';
import { generateLiveConveyorItem } from '../utils/mockAnomalyData';

export default function LiveFeed() {
  const [isRunning, setIsRunning] = useState(true);
  const [conveyorItems, setConveyorItems] = useState([]);
  const [scanLogs, setScanLogs] = useState([
    { serial: "SN-981242", name: "Aluminium Bracket", status: "pass", confidence: 0.985, timestamp: "09:42:01" },
    { serial: "SN-102931", name: "Cast Iron Rod", status: "pass", confidence: 0.991, timestamp: "09:42:15" },
    { serial: "SN-843212", name: "Microprocessor Module", status: "fail", anomalyType: "Bent pin", confidence: 0.884, timestamp: "09:42:33" }
  ]);
  const [activeAlert, setActiveAlert] = useState(null);
  const timerRef = useRef(null);
  const itemCounterRef = useRef(0);

  // Spawn new items moving on the conveyor belt
  useEffect(() => {
    if (!isRunning) {
      clearInterval(timerRef.current);
      return;
    }

    const spawnItem = () => {
      const newItem = generateLiveConveyorItem();
      const uniqueId = `item-${Date.now()}-${itemCounterRef.current++}`;
      
      const itemWithId = {
        ...newItem,
        id: uniqueId,
        scanned: false,
        position: -120 // start off screen left
      };

      setConveyorItems(prev => [...prev, itemWithId]);
    };

    // Spawn an item every 2.5 seconds
    timerRef.current = setInterval(spawnItem, 2500);
    // Spawn first item immediately
    spawnItem();

    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  // Tick function to move items across conveyor belt
  useEffect(() => {
    if (!isRunning) return;

    const tick = setInterval(() => {
      setConveyorItems(prevItems => {
        return prevItems
          .map(item => {
            const newPos = item.position + 3; // speed increment
            
            // Check if passing the scanner zone (around center, say pos = 220)
            let updatedItem = { ...item, position: newPos };
            if (!item.scanned && newPos >= 220 && newPos <= 250) {
              updatedItem.scanned = true;
              
              // Trigger detection actions
              handleInferenceEvent(item);
            }
            return updatedItem;
          })
          // Filter items that have moved completely off-screen (pos > 520)
          .filter(item => item.position < 520);
      });
    }, 30); // 33 fps

    return () => clearInterval(tick);
  }, [isRunning]);

  const handleInferenceEvent = (item) => {
    // Add to logs panel
    setScanLogs(prev => [
      {
        serial: item.serial,
        name: item.name,
        status: item.status,
        anomalyType: item.anomalyType,
        confidence: item.confidence,
        timestamp: item.timestamp
      },
      ...prev.slice(0, 19) // Cap logs at 20 entries
    ]);

    // If fail, trigger visual alert card
    if (item.status === 'fail') {
      setActiveAlert({
        serial: item.serial,
        name: item.name,
        type: item.anomalyType,
        confidence: item.confidence,
        time: item.timestamp
      });
      
      // Clear alert after 2 seconds
      setTimeout(() => {
        setActiveAlert(null);
      }, 2000);
    }
  };

  return (
    <div className="live-feed-tab">
      <div className="tab-header">
        <div>
          <h2>Real-Time Edge Camera Stream</h2>
          <p className="tab-subtitle">Conveyor Line 4 Anomaly Scanner feed (Local inference model active)</p>
        </div>
        <div className="feed-controls">
          <div className="stream-indicator active">
            <span className="pulse-green"></span> STREAM LIVE
          </div>
          <button 
            onClick={() => setIsRunning(!isRunning)} 
            className={`btn-secondary btn-sm ${isRunning ? 'active' : ''}`}
          >
            {isRunning ? 'Pause Scanner' : 'Resume Scanner'}
          </button>
        </div>
      </div>

      <div className="live-feed-grid">
        {/* Conveyor Belt Visualizer Panel */}
        <div className="conveyor-card glass-card">
          <div className="viewport-header">
            <span>BELT CAMERA FEED L-14 (60 FPS)</span>
            <span style={{ color: isRunning ? 'var(--accent)' : 'var(--error)' }}>
              {isRunning ? 'SYSTEM RUNNING' : 'SYSTEM PAUSED'}
            </span>
          </div>

          <div className="conveyor-viewport">
            {/* Overlay grid lines */}
            <div className="viewport-grid"></div>

            {/* Static scanner laser lines */}
            <div className={`laser-scanner-line ${activeAlert ? 'alert' : ''}`}>
              <div className="laser-glow"></div>
              <span className="scanner-badge">{activeAlert ? 'DEFECT DETECTED' : 'SCANNING'}</span>
            </div>

            {/* Moving Conveyor Belt Background */}
            <div className={`conveyor-belt-strip ${isRunning ? 'moving' : ''}`}></div>

            {/* Conveyor items container */}
            <div className="conveyor-items-stage">
              {conveyorItems.map((item) => {
                // Determine CSS style based on coordinate
                const style = {
                  transform: `translateX(${item.position}px)`,
                };

                let scanClass = '';
                if (item.scanned) {
                  scanClass = item.status === 'pass' ? 'scanned-pass' : 'scanned-fail';
                }

                return (
                  <div 
                    key={item.id} 
                    className={`conveyor-item-box ${scanClass}`}
                    style={style}
                  >
                    <div className="item-art">
                      {item.name.includes("Bracket") && (
                        <svg viewBox="0 0 40 40" className="item-svg">
                          <rect x="5" y="5" width="30" height="30" rx="3" fill="#64748b" />
                          <circle cx="20" cy="20" r="10" fill="#334155" />
                          <circle cx="20" cy="20" r="4" fill="#0f172a" />
                        </svg>
                      )}
                      {item.name.includes("Module") && (
                        <svg viewBox="0 0 40 40" className="item-svg">
                          <rect x="5" y="8" width="30" height="24" rx="2" fill="#1e293b" stroke="#475569" />
                          <rect x="12" y="14" width="16" height="12" fill="#111827" />
                          {Array.from({ length: 4 }).map((_, i) => (
                            <line key={i} x1={8 + i * 8} y1="4" x2={8 + i * 8} y2="8" stroke="#94a3b8" strokeWidth="2" />
                          ))}
                        </svg>
                      )}
                      {item.name.includes("Rod") && (
                        <svg viewBox="0 0 40 40" className="item-svg">
                          <rect x="8" y="15" width="24" height="10" rx="4" fill="#94a3b8" />
                          <line x1="8" y1="20" x2="32" y2="20" stroke="#cbd5e1" strokeWidth="2" />
                        </svg>
                      )}
                      {item.name.includes("Insulator") && (
                        <svg viewBox="0 0 40 40" className="item-svg">
                          <circle cx="20" cy="20" r="14" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" />
                          <circle cx="20" cy="20" r="8" fill="#cbd5e1" />
                        </svg>
                      )}
                    </div>
                    <div className="item-serial">{item.serial}</div>
                  </div>
                );
              })}
            </div>

            {/* Floating Alert HUD */}
            {activeAlert && (
              <div className="hud-alert-overlay">
                <div className="hud-alert-inner">
                  <div className="hud-alert-icon">⚠️</div>
                  <div className="hud-alert-text">
                    <div className="hud-title">DEFECT ISOLATED</div>
                    <div className="hud-sub">{activeAlert.name} - {activeAlert.type} ({(activeAlert.confidence * 100).toFixed(1)}%)</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Real-time scanning events log */}
        <div className="scrolling-logs-card glass-card">
          <div className="logs-header">
            <span>LIVE DETECTION LOG</span>
            <span className="log-counter">{scanLogs.length} Checked</span>
          </div>
          <div className="logs-scroller">
            {scanLogs.length === 0 ? (
              <p className="no-logs-msg">Awaiting scan telemetry...</p>
            ) : (
              scanLogs.map((log, idx) => (
                <div key={idx} className={`log-row-item ${log.status}`}>
                  <div className="log-row-head">
                    <span className={`badge-status ${log.status}`}>
                      {log.status.toUpperCase()}
                    </span>
                    <span className="log-timestamp">{log.timestamp}</span>
                  </div>
                  <div className="log-row-body">
                    <span className="log-part-name">{log.name}</span>
                    <span className="log-serial">{log.serial}</span>
                  </div>
                  {log.status === 'fail' && (
                    <div className="log-row-defect-tag">
                      Found: <strong>{log.anomalyType}</strong> ({(log.confidence*100).toFixed(1)}% match)
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        .live-feed-tab {
          animation: fadeIn 0.4s ease-in-out;
        }
        
        .tab-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .tab-subtitle {
          color: var(--text-main);
          font-size: 0.9rem;
          margin-top: 4px;
        }

        .feed-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stream-indicator {
          font-size: 0.75rem;
          font-family: var(--font-mono);
          font-weight: 700;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid var(--border);
          padding: 6px 12px;
          border-radius: 6px;
        }

        .stream-indicator.active {
          color: var(--accent);
          border-color: rgba(57, 255, 20, 0.25);
          background: rgba(57, 255, 20, 0.04);
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 0.8rem;
        }

        .live-feed-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          height: 480px;
        }

        @media (max-width: 900px) {
          .live-feed-grid {
            grid-template-columns: 1fr;
            height: auto;
          }
          .conveyor-card {
            height: 380px;
          }
          .scrolling-logs-card {
            height: 300px;
          }
        }

        .conveyor-card {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .conveyor-viewport {
          flex: 1;
          background: #020305;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
        }

        .viewport-grid {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.008) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.008) 1px, transparent 1px);
          background-size: 25px 25px;
          z-index: 1;
        }

        /* Conveyor Belt Strip Animation */
        .conveyor-belt-strip {
          position: absolute;
          bottom: 60px;
          left: 0;
          width: 200%;
          height: 16px;
          background-image: repeating-linear-gradient(
            90deg,
            #1e293b,
            #1e293b 15px,
            #0f172a 15px,
            #0f172a 30px
          );
          border-top: 2px solid #475569;
          border-bottom: 2px solid #0f172a;
          z-index: 2;
        }

        .conveyor-belt-strip.moving {
          animation: beltScroll 1s linear infinite;
        }

        @keyframes beltScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-30px); }
        }

        /* Laser Scanner Area */
        .laser-scanner-line {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 240px; /* Center-ish */
          width: 2px;
          background-color: var(--primary);
          box-shadow: 0 0 10px 1px var(--primary);
          z-index: 10;
          pointer-events: none;
          transition: all 0.2s ease;
        }

        .laser-scanner-line.alert {
          background-color: var(--error);
          box-shadow: 0 0 14px 2px var(--error);
        }

        .laser-glow {
          position: absolute;
          top: 0;
          bottom: 0;
          left: -40px;
          width: 80px;
          background: radial-gradient(ellipse at center, rgba(0, 242, 254, 0.06) 0%, transparent 70%);
          pointer-events: none;
        }
        .laser-scanner-line.alert .laser-glow {
          background: radial-gradient(ellipse at center, rgba(255, 42, 95, 0.12) 0%, transparent 70%);
        }

        .scanner-badge {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(4, 5, 8, 0.85);
          border: 1px solid var(--border);
          color: var(--text-main);
          font-family: var(--font-mono);
          font-size: 0.65rem;
          padding: 2px 8px;
          border-radius: 4px;
          white-space: nowrap;
          z-index: 12;
        }
        .laser-scanner-line.alert .scanner-badge {
          border-color: var(--error);
          color: var(--error);
          background: rgba(255, 42, 95, 0.1);
        }

        /* Items stage & Box styling */
        .conveyor-items-stage {
          position: absolute;
          bottom: 76px; /* Sits right on top of the belt strip */
          left: 0;
          width: 100%;
          height: 90px;
          z-index: 5;
        }

        .conveyor-item-box {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 80px;
          height: 80px;
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.5);
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .item-art {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .item-svg {
          width: 100%;
          height: 100%;
        }

        .item-serial {
          font-family: var(--font-mono);
          font-size: 0.6rem;
          color: var(--text-muted);
          margin-top: 6px;
        }

        /* Scanning Flash highlights */
        .conveyor-item-box.scanned-pass {
          border-color: var(--accent);
          box-shadow: 0 0 15px rgba(57, 255, 20, 0.2);
        }

        .conveyor-item-box.scanned-fail {
          border-color: var(--error);
          box-shadow: 0 0 20px rgba(255, 42, 95, 0.35);
          background: rgba(30, 9, 15, 0.95);
        }

        /* Floating Alert Overlays */
        .hud-alert-overlay {
          position: absolute;
          top: 50px;
          right: 20px;
          z-index: 100;
          animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hud-alert-inner {
          background: rgba(255, 42, 95, 0.1);
          border: 1px solid var(--error);
          backdrop-filter: blur(10px);
          border-radius: 8px;
          padding: 12px 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.4);
        }

        .hud-alert-icon {
          font-size: 1.5rem;
        }

        .hud-alert-text {
          display: flex;
          flex-direction: column;
        }

        .hud-title {
          font-family: var(--font-mono);
          font-weight: 700;
          color: var(--error);
          font-size: 0.8rem;
          letter-spacing: 0.05em;
        }

        .hud-sub {
          color: #fff;
          font-size: 0.8rem;
          margin-top: 2px;
        }

        /* Scrolling logs panel */
        .scrolling-logs-card {
          display: flex;
          flex-direction: column;
          max-height: 100%;
        }

        .logs-header {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          font-family: var(--font-mono);
          color: var(--text-muted);
        }

        .log-counter {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-main);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .logs-scroller {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .no-logs-msg {
          color: var(--text-muted);
          font-size: 0.8rem;
          text-align: center;
          padding-top: 40px;
        }

        .log-row-item {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .log-row-item.fail {
          background: rgba(255, 42, 95, 0.02);
          border-color: rgba(255, 42, 95, 0.15);
        }

        .log-row-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .log-timestamp {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .log-row-body {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
        }

        .log-part-name {
          color: #fff;
          font-weight: 500;
        }

        .log-serial {
          font-family: var(--font-mono);
          color: var(--text-muted);
          font-size: 0.75rem;
        }

        .log-row-defect-tag {
          font-size: 0.75rem;
          background: rgba(255, 42, 95, 0.08);
          border: 1px solid rgba(255, 42, 95, 0.2);
          color: #fff;
          padding: 4px 8px;
          border-radius: 4px;
        }
        
        .log-row-defect-tag strong {
          color: var(--error);
        }
      `}</style>
    </div>
  );
}
