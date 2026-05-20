import React, { useState, useEffect, useRef } from 'react';
import { SAMPLES, runZeroShotSimulation } from '../utils/mockAnomalyData';

export default function UploadWorkflow() {
  const [selectedPreset, setSelectedPreset] = useState('pcb');
  const [customImage, setCustomImage] = useState(null);
  const [customImageName, setCustomImageName] = useState('');
  const [prompts, setPrompts] = useState('solder bridge, missing component, scratch');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [detections, setDetections] = useState(null);
  const [hoveredBoxIdx, setHoveredBoxIdx] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const scanTimerRef = useRef(null);

  // Sync prompts with preset selection
  useEffect(() => {
    if (selectedPreset) {
      if (selectedPreset === 'pcb') {
        setPrompts('solder bridge, missing component, scratch');
      } else if (selectedPreset === 'turbine') {
        setPrompts('crack, rust, corrosion');
      } else if (selectedPreset === 'solar') {
        setPrompts('microcrack, dust, stain');
      }
      setCustomImage(null);
      setCustomImageName('');
      setDetections(null);
    }
  }, [selectedPreset]);

  // Handle local image file uploads
  const handleFileUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setCustomImage(e.target.result);
      setCustomImageName(file.name);
      setSelectedPreset(null);
      setDetections(null);
      
      // Seed a default prompt for custom upload
      setPrompts('surface scratch, crack, defect');
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setDetections(null);
    setAnalyzeProgress(0);

    let progress = 0;
    clearInterval(scanTimerRef.current);
    scanTimerRef.current = setInterval(() => {
      progress += 4;
      setAnalyzeProgress(progress);
      if (progress >= 100) {
        clearInterval(scanTimerRef.current);
        setIsAnalyzing(false);

        // Process analysis
        if (selectedPreset) {
          const sim = runZeroShotSimulation(selectedPreset, prompts);
          setDetections(sim.detections);
        } else {
          // Custom uploaded image simulator: dynamically match whatever prompts the user typed
          const userWords = prompts.split(',').map(p => p.trim()).filter(p => p.length > 0);
          if (userWords.length > 0) {
            // Generate a simulated box based on their first tag
            const label = userWords[0].charAt(0).toUpperCase() + userWords[0].slice(1);
            setDetections([
              {
                label: label,
                confidence: 0.912 + Math.random() * 0.06,
                severity: prompts.toLowerCase().includes('crack') || prompts.toLowerCase().includes('short') ? 'critical' : 'warning',
                box: { x: 30, y: 35, width: 25, height: 22 },
                details: `Simulated zero-shot visual alignment detected features matching target criteria "${userWords[0]}" in center-left quadrant.`
              }
            ]);
          } else {
            setDetections([]);
          }
        }
      }
    }, 35);
  };

  const handleAction = (type) => {
    alert(`Telemetry update: Item flagged as [${type.toUpperCase()}] and logged in system registry.`);
  };

  return (
    <div className="upload-tab">
      <div className="tab-header">
        <div>
          <h2>Zero-Shot Inspection Portal</h2>
          <p className="tab-subtitle">Upload sample images and define target query tags for immediate classification.</p>
        </div>
      </div>

      <div className="upload-workflow-container">
        {/* Left Side: Upload Zone & Configuration */}
        <div className="config-column glass-card">
          <div className="workflow-sub-title">1. Load Visual Subject</div>
          
          {/* Drag & Drop Upload Zone */}
          <div 
            className={`dropzone ${isDragOver ? 'dragover' : ''} ${customImage ? 'has-file' : ''}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            {customImage ? (
              <div className="uploaded-preview-container">
                <img src={customImage} alt="Custom upload" className="uploaded-thumbnail" />
                <div className="file-info-bar">
                  <span className="file-name">{customImageName}</span>
                  <button className="clear-file-btn" onClick={() => { setCustomImage(null); setSelectedPreset('pcb'); }}>Remove</button>
                </div>
              </div>
            ) : (
              <label className="dropzone-label">
                <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" fill="none" strokeWidth="1.5" style={{ color: 'var(--primary)', marginBottom: '12px' }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
                <span className="drop-title">Drag & drop image here</span>
                <span className="drop-sub">PNG, JPG, TIFF (Max 20MB)</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])} 
                />
                <span className="btn-secondary btn-sm" style={{ marginTop: '12px', pointerEvents: 'none' }}>Browse Files</span>
              </label>
            )}
          </div>

          {/* Preset Buttons */}
          <div className="preset-selector-group">
            <span className="preset-header-label">Or Select Standard Template Preset:</span>
            <div className="preset-buttons">
              {Object.keys(SAMPLES).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`preset-btn ${selectedPreset === key ? 'active' : ''}`}
                  onClick={() => setSelectedPreset(key)}
                  disabled={isAnalyzing}
                >
                  {SAMPLES[key].name.replace("Industrial ", "").replace("Photovoltaic ", "")}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt definitions */}
          <div className="prompt-block" style={{ marginTop: '24px' }}>
            <div className="workflow-sub-title">2. Classify Defect Queries</div>
            <p className="block-tip">Add custom defect names. The AI searches this specific image for semantic matching features without training.</p>
            <textarea
              className="input-field prompts-textarea"
              value={prompts}
              onChange={(e) => setPrompts(e.target.value)}
              placeholder="e.g. crack, corrosion, solder blob, scratch"
              disabled={isAnalyzing}
              rows="3"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !prompts.trim()}
            className="btn-primary analyze-submit-btn"
            style={{ width: '100%', justifyContent: 'center', marginTop: '24px' }}
          >
            {isAnalyzing ? (
              <>
                <svg className="spinner" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" strokeWidth="3">
                  <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8" />
                </svg>
                Running Model ({analyzeProgress}%)
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                Inference Trigger
              </>
            )}
          </button>
        </div>

        {/* Right Side: Viewport with Overlays & Telemetry */}
        <div className="viewport-column glass-card">
          <div className="viewport-header">
            <span>VISUAL INSPECT VIEWPORT</span>
            <div className="telemetry-badges">
              <span>ISO-9001</span>
              <span className="cyan-dot-label"><span className="dot"></span> Edge Latency: 11.2ms</span>
            </div>
          </div>

          <div className="viewport-stage-container">
            <div className="viewport-stage-grid"></div>

            <div className="stage-frame">
              {/* Display custom image or SVG presets */}
              {customImage ? (
                <div className="viewport-image-wrapper">
                  <img src={customImage} alt="Target stream" className="stage-image-tag" />
                </div>
              ) : selectedPreset ? (
                <div className={`viewport-image-wrapper ${selectedPreset}`}>
                  {selectedPreset === 'pcb' && (
                    <svg viewBox="0 0 500 350" className="viewport-svg-render">
                      <rect x="10" y="10" width="480" height="330" rx="15" fill="#1b4332" stroke="#2d6a4f" strokeWidth="4" />
                      <path d="M 30 50 L 100 50 L 100 120 L 180 120 M 180 80 L 250 80" stroke="#d4af37" strokeWidth="2" fill="none" />
                      <path d="M 300 200 L 300 280 L 400 280 L 440 240" stroke="#d4af37" strokeWidth="2.5" fill="none" opacity="0.8" />
                      <path d="M 80 200 L 220 200" stroke="#d4af37" strokeWidth="2" fill="none" />
                      <rect x="180" y="100" width="100" height="100" rx="6" fill="#111" stroke="#333" strokeWidth="2" />
                      <text x="212" y="154" fill="#666" fontSize="12" fontFamily="monospace" fontWeight="bold">U3</text>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <g key={i}>
                          <rect x="165" y={110 + i * 14} width="15" height="6" fill="#b0b0b0" />
                          <rect x="280" y={110 + i * 14} width="15" height="6" fill="#b0b0b0" />
                        </g>
                      ))}
                      {/* Solder Bridge defect overlay */}
                      <path d="M 168 165 C 172 165, 172 181, 168 181" stroke="#a0a0a0" strokeWidth="8" strokeLinecap="round" fill="none" />
                      <rect x="360" y="80" width="40" height="20" rx="2" fill="#5c677d" />
                      <rect x="360" y="140" width="30" height="15" fill="none" stroke="#666" strokeDasharray="3 3" />
                      <text x="364" y="130" fill="#666" fontSize="9" fontFamily="monospace">C18</text>
                      <path d="M 80 240 Q 110 245 150 242" stroke="#52b788" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
                    </svg>
                  )}
                  {selectedPreset === 'turbine' && (
                    <svg viewBox="0 0 500 350" className="viewport-svg-render">
                      <rect x="10" y="10" width="480" height="330" rx="10" fill="#20222a" stroke="#2e313b" strokeWidth="2" />
                      <path d="M 180 300 C 180 180, 240 80, 320 40 C 270 90, 240 180, 230 300 Z" fill="url(#metalGrad2)" stroke="#4e5461" strokeWidth="3" />
                      <path d="M 230 300 C 240 180, 270 90, 320 40" stroke="rgba(255,255,255,0.15)" strokeWidth="2" fill="none" />
                      <path d="M 235 150 Q 237 180 234 200 T 238 230" stroke="#111" strokeWidth="1.5" fill="none" />
                      <ellipse cx="300" cy="80" rx="15" ry="10" fill="#8b5e3c" opacity="0.55" filter="blur(2px)" />
                      <defs>
                        <linearGradient id="metalGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#2c302e" />
                          <stop offset="50%" stopColor="#8d99ae" />
                          <stop offset="100%" stopColor="#edf2f4" />
                        </linearGradient>
                      </defs>
                    </svg>
                  )}
                  {selectedPreset === 'solar' && (
                    <svg viewBox="0 0 500 350" className="viewport-svg-render">
                      <rect x="10" y="10" width="480" height="330" rx="10" fill="#03045e" stroke="#0077b6" strokeWidth="3" />
                      {Array.from({ length: 4 }).map((_, i) => (
                        <line key={i} x1={20 + i * 115} y1="10" x2={20 + i * 115} y2="340" stroke="#caf0f8" strokeWidth="1.5" opacity="0.4" />
                      ))}
                      {Array.from({ length: 5 }).map((_, i) => (
                        <line key={i} x1="10" y1={20 + i * 62} x2="490" y2={20 + i * 62} stroke="#caf0f8" strokeWidth="0.8" opacity="0.3" />
                      ))}
                      <path d="M 120 180 L 135 190 L 140 182 L 155 205" stroke="#100" strokeWidth="2" strokeLinecap="round" fill="none" />
                      <path d="M 280 60 Q 300 50 330 70 T 360 65 T 320 110 Z" fill="#7f5539" opacity="0.5" filter="blur(3px)" />
                    </svg>
                  )}
                </div>
              ) : (
                <div className="no-visual-state">No Visual Target Loaded</div>
              )}

              {/* Scanning Overlay Line */}
              {isAnalyzing && (
                <div 
                  className="stage-scan-bar"
                  style={{ top: `${analyzeProgress}%` }}
                ></div>
              )}

              {/* Bounding box projections */}
              {!isAnalyzing && detections && detections.map((det, index) => {
                const isHovered = hoveredBoxIdx === index;
                return (
                  <div
                    key={index}
                    className={`detection-box ${det.severity} ${isHovered ? 'hover' : ''}`}
                    style={{
                      left: `${det.box.x}%`,
                      top: `${det.box.y}%`,
                      width: `${det.box.width}%`,
                      height: `${det.box.height}%`
                    }}
                    onMouseEnter={() => setHoveredBoxIdx(index)}
                    onMouseLeave={() => setHoveredBoxIdx(null)}
                  >
                    <div className="detection-label-tag">
                      <span className="det-text">{det.label}</span>
                      <span className="det-conf">{(det.confidence * 100).toFixed(0)}%</span>
                    </div>

                    {isHovered && (
                      <div className="detection-popover-card">
                        <div className="popover-header">
                          <span className={`bullet-severity ${det.severity}`}></span>
                          <span>{det.label}</span>
                          <span className="popover-conf">{(det.confidence * 100).toFixed(1)}% Match</span>
                        </div>
                        <p className="popover-desc">{det.details}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Telemetry panel */}
          <div className="telemetry-panel-results">
            {detections === null ? (
              <div className="telemetry-empty-state">
                <p>Awaiting model analysis trigger...</p>
              </div>
            ) : (
              <div className="telemetry-active-results">
                {/* Result header */}
                <div className="results-status-summary">
                  <div>
                    <span className="results-title">AI INSPECTION RESULTS</span>
                    <h3 style={{ color: '#fff', marginTop: '4px' }}>
                      {detections.length === 0 ? (
                        <span style={{ color: 'var(--accent)' }}>✓ NOMINAL STRUCTURE PASSED</span>
                      ) : (
                        <span style={{ color: 'var(--error)' }}>⚠️ ANOMALY DETECTED ({detections.length})</span>
                      )}
                    </h3>
                  </div>
                  <div className={`status-badge-overall ${detections.length === 0 ? 'pass' : 'fail'}`}>
                    {detections.length === 0 ? 'NOMINAL' : 'FAULT'}
                  </div>
                </div>

                {/* Details grid list */}
                {detections.length > 0 ? (
                  <div className="detections-detail-list">
                    {detections.map((det, idx) => (
                      <div key={idx} className={`detection-detail-card ${det.severity}`}>
                        <div className="detail-head">
                          <strong style={{ color: '#fff', fontSize: '0.85rem' }}>{det.label}</strong>
                          <span className="detail-badge-sev">{det.severity.toUpperCase()}</span>
                        </div>
                        <p className="detail-desc">{det.details}</p>
                        <div className="detail-meta">
                          <span>Confidence score: <strong>{(det.confidence*100).toFixed(2)}%</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="success-nominal-tip">The zero-shot contrastive encoder did not identify any structures or irregularities deviating from standard configurations matching the active search parameters.</p>
                )}

                {/* System actions */}
                <div className="actions-button-row">
                  {detections.length > 0 ? (
                    <>
                      <button className="btn-secondary" style={{ borderColor: 'var(--error)', color: 'var(--error)', background: 'rgba(255, 42, 95, 0.05)' }} onClick={() => handleAction('quarantine')}>
                        Route to Quarantine
                      </button>
                      <button className="btn-secondary" onClick={() => handleAction('bypass')}>
                        Override Pass
                      </button>
                      <button className="btn-primary" onClick={() => handleAction('sql-log')}>
                        Log to Database
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn-secondary" onClick={() => handleAction('report')}>Export Report</button>
                      <button className="btn-primary" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #10b981 100%)', boxShadow: '0 4px 15px rgba(57,255,20,0.1)' }} onClick={() => handleAction('approve')}>
                        Approve & Log
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .upload-tab {
          animation: fadeIn 0.4s ease-in-out;
        }

        .upload-workflow-container {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 24px;
          align-items: stretch;
          margin-top: 20px;
        }

        @media (max-width: 900px) {
          .upload-workflow-container {
            grid-template-columns: 1fr;
          }
        }

        .config-column {
          padding: 24px;
          display: flex;
          flex-direction: column;
        }

        .workflow-sub-title {
          font-size: 0.85rem;
          font-family: var(--font-mono);
          color: var(--text-heading);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 12px;
          font-weight: 700;
        }

        /* Dropzone styles */
        .dropzone {
          border: 2px dashed var(--border);
          border-radius: 10px;
          padding: 30px 16px;
          text-align: center;
          background: rgba(255,255,255,0.01);
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          position: relative;
        }

        .dropzone:hover, .dropzone.dragover {
          border-color: var(--primary);
          background: rgba(0, 242, 254, 0.03);
        }

        .dropzone-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
        }

        .drop-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-heading);
        }

        .drop-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .uploaded-preview-container {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .uploaded-thumbnail {
          max-width: 100%;
          max-height: 120px;
          border-radius: 6px;
          object-fit: contain;
          border: 1px solid var(--border);
        }

        .file-info-bar {
          display: flex;
          justify-content: space-between;
          width: 100%;
          align-items: center;
          font-size: 0.75rem;
        }

        .file-name {
          color: var(--text-heading);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 180px;
        }

        .clear-file-btn {
          background: none;
          border: none;
          color: var(--error);
          cursor: pointer;
          font-family: var(--font-sans);
          font-weight: 600;
        }

        /* Preset buttons selector */
        .preset-selector-group {
          margin-top: 20px;
        }

        .preset-header-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: 8px;
          display: block;
        }

        .preset-buttons {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .preset-btn {
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border);
          color: var(--text-main);
          font-family: var(--font-sans);
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 0.8rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .preset-btn:hover {
          background: rgba(255,255,255,0.05);
          border-color: var(--border-hover);
          color: #fff;
        }

        .preset-btn.active {
          border-color: var(--primary);
          color: var(--primary);
          background: rgba(0, 242, 254, 0.05);
        }

        .block-tip {
          font-size: 0.78rem;
          color: var(--text-muted);
          line-height: 1.4;
          margin-bottom: 8px;
        }

        .prompts-textarea {
          width: 100%;
          font-size: 0.85rem;
          background: rgba(0,0,0,0.25);
          resize: vertical;
        }

        /* Viewport column styles */
        .viewport-column {
          display: flex;
          flex-direction: column;
        }

        .telemetry-badges {
          display: flex;
          gap: 12px;
          font-size: 0.7rem;
          font-family: var(--font-mono);
          color: var(--text-muted);
        }

        .cyan-dot-label {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--primary);
        }
        .cyan-dot-label .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--primary);
          animation: pulseGlow 1.5s infinite ease;
        }

        .viewport-stage-container {
          flex: 1;
          background: #020306;
          border-bottom: 1px solid var(--border);
          position: relative;
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 380px;
        }

        .viewport-stage-grid {
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

        .stage-frame {
          position: relative;
          z-index: 5;
          width: 100%;
          max-width: 500px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 12px 36px rgba(0,0,0,0.6);
          border: 1px solid rgba(255, 255, 255, 0.04);
        }

        .viewport-image-wrapper {
          width: 100%;
          aspect-ratio: 500 / 350;
          background: #0d0f17;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .viewport-image-wrapper.pcb {
          background-image: url('/samples/pcb.png');
          background-size: cover;
          background-position: center;
        }

        .viewport-image-wrapper.turbine {
          background-image: url('/samples/turbine.png');
          background-size: cover;
          background-position: center;
        }

        .stage-image-tag {
          width: 100%;
          height: 100%;
          object-fit: contain;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 1;
        }

        .viewport-svg-render {
          width: 100%;
          height: 100%;
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          opacity: 0.28;
          z-index: 2;
          pointer-events: none;
        }

        .no-visual-state {
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          font-family: var(--font-mono);
          font-size: 0.85rem;
        }

        .stage-scan-bar {
          position: absolute;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, transparent, var(--primary), transparent);
          box-shadow: 0 0 12px 2px var(--primary);
          z-index: 10;
          pointer-events: none;
          transition: top 0.05s linear;
        }

        /* Telemetry active outputs */
        .telemetry-panel-results {
          padding: 24px;
          background: rgba(255, 255, 255, 0.005);
        }

        .telemetry-empty-state {
          color: var(--text-muted);
          font-size: 0.85rem;
          text-align: center;
          font-family: var(--font-mono);
        }

        .results-status-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border);
          padding-bottom: 16px;
          margin-bottom: 16px;
        }

        .results-title {
          font-size: 0.7rem;
          font-family: var(--font-mono);
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        .status-badge-overall {
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 0.8rem;
          padding: 6px 14px;
          border-radius: 6px;
        }
        .status-badge-overall.pass {
          background: rgba(57, 255, 20, 0.1);
          color: var(--accent);
          border: 1px solid rgba(57, 255, 20, 0.3);
        }
        .status-badge-overall.fail {
          background: rgba(255, 42, 95, 0.1);
          color: var(--error);
          border: 1px solid rgba(255, 42, 95, 0.3);
        }

        .success-nominal-tip {
          color: var(--text-main);
          font-size: 0.85rem;
          line-height: 1.5;
        }

        .detections-detail-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .detection-detail-card {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid var(--border);
          padding: 12px;
          border-radius: 6px;
        }
        
        .detection-detail-card.critical {
          border-color: rgba(255, 42, 95, 0.2);
          background: rgba(255, 42, 95, 0.02);
        }
        .detection-detail-card.warning {
          border-color: rgba(255, 183, 3, 0.2);
          background: rgba(255, 183, 3, 0.02);
        }

        .detail-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .detail-badge-sev {
          font-size: 0.65rem;
          font-family: var(--font-mono);
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .critical .detail-badge-sev {
          background: rgba(255, 42, 95, 0.15);
          color: var(--error);
        }
        .warning .detail-badge-sev {
          background: rgba(255, 183, 3, 0.15);
          color: var(--warning);
        }

        .detail-desc {
          font-size: 0.8rem;
          line-height: 1.4;
          margin-bottom: 8px;
        }

        .detail-meta {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .detail-meta strong {
          color: var(--text-heading);
        }

        .actions-button-row {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 16px;
        }

        @media (max-width: 500px) {
          .actions-button-row {
            flex-direction: column;
          }
          .actions-button-row button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
