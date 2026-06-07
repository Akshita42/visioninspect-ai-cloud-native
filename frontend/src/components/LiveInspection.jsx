import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { 
  Camera, Video, AlertTriangle, CheckCircle, Info, AlertCircle,
  RefreshCw, Trash2, VideoOff, ShieldCheck, Play, Layers, Download, Clock
} from 'lucide-react';
import { API_BASE_URL } from '../config';

// Severity helpers (mirrors Playground.jsx)
function getSeverityConfig(status) {
  switch (status) {
    case 'STRUCTURE VERIFIED':
      return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: <CheckCircle className="w-3.5 h-3.5" />, bar: 'bg-emerald-500', barWidth: '8%' };
    case 'MINOR VISUAL VARIATION':
      return { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', icon: <Info className="w-3.5 h-3.5" />, bar: 'bg-amber-400', barWidth: '35%' };
    case 'MODERATE ANOMALY':
      return { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', icon: <AlertCircle className="w-3.5 h-3.5" />, bar: 'bg-orange-500', barWidth: '65%' };
    case 'SEVERE ANOMALY':
      return { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', icon: <AlertTriangle className="w-3.5 h-3.5" />, bar: 'bg-red-500', barWidth: '95%' };
    default:
      return { bg: 'bg-slate-500/10', border: 'border-slate-500/20', text: 'text-slate-400', icon: <Info className="w-3.5 h-3.5" />, bar: 'bg-slate-500', barWidth: '50%' };
  }
}

async function exportPDF(results, inspectionType = 'Dynamic Inspection') {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210; const margin = 14; let y = 0;
  doc.setFillColor(10, 14, 26); doc.rect(0, 0, W, 297, 'F');
  doc.setFillColor(0, 180, 216); doc.rect(0, 0, W, 28, 'F');
  doc.setFontSize(16); doc.setTextColor(255,255,255); doc.setFont('helvetica','bold');
  doc.text('VisionInspect AI', margin, 11);
  doc.setFontSize(8); doc.setFont('helvetica','normal');
  doc.text('Reference-Based Anomaly Localization System — Academic Research Demo', margin, 17);
  doc.text(`Inspection Report · Generated: ${new Date().toLocaleString()}`, margin, 23); y = 35;
  doc.setFontSize(8); doc.setTextColor(150,180,220); doc.text('INSPECTION TYPE', margin, y);
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.text(inspectionType, margin, y+5); y += 15;
  const colors = {'STRUCTURE VERIFIED':[52,211,153],'MINOR VISUAL VARIATION':[251,191,36],'MODERATE ANOMALY':[249,115,22],'SEVERE ANOMALY':[239,68,68]};
  const [r,g,b] = colors[results.status] || [148,163,184];
  doc.setFillColor(r,g,b,0.15); doc.roundedRect(margin,y-4,W-margin*2,12,2,2,'F');
  doc.setTextColor(r,g,b); doc.setFontSize(10); doc.setFont('helvetica','bold');
  doc.text(`● ${results.status}`, margin+3, y+4); y += 16;
  doc.setFontSize(8); doc.setTextColor(100,140,180); doc.text('SIMILARITY METRICS', margin, y); y += 6;
  const mRows = [['Mean Patch Similarity',results.metrics.mean_similarity.toFixed(4)],['Min Patch Similarity',results.metrics.min_similarity.toFixed(4)],['Anomaly Score',results.anomaly_score.toFixed(4)],['Anomaly Area Ratio',`${(results.metrics.anomaly_pixel_ratio*100).toFixed(2)}%`],['Detected Regions',String(results.detected_regions.length)]];
  mRows.forEach(([label,value],i)=>{ const rY=y+i*7; doc.setFillColor(i%2===0?20:16,i%2===0?25:20,i%2===0?40:35); doc.rect(margin,rY-3,W-margin*2,7,'F'); doc.setTextColor(160,180,210); doc.setFont('helvetica','normal'); doc.text(label,margin+2,rY+1); doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.text(value,W-margin-2,rY+1,{align:'right'}); }); y += mRows.length*7+6;
  doc.setFontSize(8); doc.setTextColor(100,140,180); doc.text('INTERPRETATION LAYER', margin, y); y += 5;
  doc.setFillColor(18,22,40); doc.roundedRect(margin,y,W-margin*2,24,2,2,'F');
  doc.setTextColor(200,215,235); doc.setFont('helvetica','normal'); doc.setFontSize(7.5);
  const wrapped = doc.splitTextToSize(results.explanation, W-margin*2-4); doc.text(wrapped.slice(0,4),margin+2,y+6); y += 30;
  const imgW=(W-margin*2-9)/4; const imgH=imgW;
  doc.setFontSize(8); doc.setTextColor(100,140,180); doc.text('VISUAL OUTPUTS', margin, y); y += 5;
  const imgSrcs=[results.test_image,results.heatmap,results.overlay,results.defect_detection];
  const imgLabels=['Test Image','Heatmap','Overlay Map','Defect Detection'];
  imgSrcs.forEach((src,i)=>{ const x=margin+i*(imgW+3); doc.setFillColor(15,20,38); doc.roundedRect(x,y,imgW,imgH,2,2,'F'); try { doc.addImage(src,src.includes('png')?'PNG':'JPEG',x,y,imgW,imgH); } catch(_){} doc.setTextColor(120,150,190); doc.setFontSize(6.5); doc.text(imgLabels[i],x+imgW/2,y+imgH+4,{align:'center'}); }); y+=imgH+10;
  doc.setFillColor(0,120,160); doc.rect(0,287,W,10,'F'); doc.setTextColor(200,240,255); doc.setFontSize(6.5); doc.setFont('helvetica','normal');
  doc.text('VisionInspect AI · Academic Research Demo · CLIP-Based Visual Anomaly Localization', W/2, 293, {align:'center'});
  doc.save(`VisionInspect_Report_${Date.now()}.pdf`);
}

export default function LiveInspection({ onHistoryUpdate }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
  
  // Captures
  const [refBlob, setRefBlob] = useState(null);
  const [refPreview, setRefPreview] = useState(null);
  const [refTimestamp, setRefTimestamp] = useState(null);
  const [inspectTimestamp, setInspectTimestamp] = useState(null);
  
  // Process states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  // Results
  const [results, setResults] = useState(null);
  const [showLaymanExplanation, setShowLaymanExplanation] = useState(false);

  const steps = [
    "Capturing current webcam frame...",
    "Extracting image patches (64x64 grid)...",
    "Generating CLIP embeddings via PyTorch...",
    "Comparing patch visual similarities...",
    "Generating anomaly heatmap matrices...",
    "Localizing suspicious regions via OpenCV..."
  ];

  // Run progress timer during analysis
  useEffect(() => {
    let interval;
    if (isAnalyzing) {
      setCurrentStep(0);
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            clearInterval(interval);
            return prev;
          }
        });
      }, 750); // Shift step every 750ms for snappy progress feedback
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Clean up camera stream on unmount
  useEffect(() => {
    startWebcam();
    return () => {
      stopWebcam();
    };
  }, []);

  // Bind stream to video element when available
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const startWebcam = async () => {
    try {
      setError(null);
      setCameraPermissionDenied(false);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 } 
        }
      });
      setStream(mediaStream);
      setCameraActive(true);
    } catch (err) {
      console.error(err);
      setError("Failed to access camera. Please verify device permissions and connection.");
      setCameraActive(false);
      setCameraPermissionDenied(true);
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
    }
  };

  const toggleCamera = () => {
    if (cameraActive) {
      stopWebcam();
    } else {
      startWebcam();
    }
  };

  // Helper to grab frame as Blob
  const captureFrameBlob = () => {
    return new Promise((resolve, reject) => {
      if (!videoRef.current || !cameraActive) {
        reject("Webcam stream is not active or ready.");
        return;
      }
      try {
        const canvas = document.createElement("canvas");
        // Square aspect ratio to match backend target (512x512)
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject("Could not get 2D rendering context.");
          return;
        }

        const video = videoRef.current;
        const vWidth = video.videoWidth;
        const vHeight = video.videoHeight;
        
        // Center crop to aspect-square
        const size = Math.min(vWidth, vHeight);
        const sx = (vWidth - size) / 2;
        const sy = (vHeight - size) / 2;

        ctx.drawImage(video, sx, sy, size, size, 0, 0, 512, 512);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject("Failed to serialize canvas to Blob.");
          }
        }, "image/png");
      } catch (err) {
        reject(err.message || "Failed during frame capture canvas serialization.");
      }
    });
  };

  const handleRegisterReference = async () => {
    try {
      setError(null);
      setSuccessMsg(null);
      
      const blob = await captureFrameBlob();
      setRefBlob(blob);
      
      // Revoke old object URL if any
      if (refPreview) {
        URL.revokeObjectURL(refPreview);
      }
      
      setRefPreview(URL.createObjectURL(blob));
      setRefTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setSuccessMsg("Reference sample registered successfully");
      setTimeout(() => setSuccessMsg(null), 3000);
      setResults(null); // Clear previous results
    } catch (err) {
      setError(err.message || "Error capturing reference frame.");
    }
  };

  const handleInspectFrame = async () => {
    if (!refBlob) {
      setError("Reference sample not registered. Please capture a reference sample first.");
      return;
    }
    if (!cameraActive) {
      setError("Webcam stream is inactive. Please activate camera to capture inspection frame.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResults(null);

    try {
      const testBlob = await captureFrameBlob();
      
      // Capture local timestamp immediately upon canvas crop
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setInspectTimestamp(timestamp);

      const formData = new FormData();
      formData.append("reference", refBlob, "reference.png");
      formData.append("test", testBlob, "test.png");

      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server returned status code: ${response.status}. Make sure backend is running.`);
      }

      const data = await response.json();
      setResults(data);
      // Push to shared history
      if (onHistoryUpdate) {
        onHistoryUpdate({
          id: Date.now(),
          timestamp: new Date().toLocaleString(),
          type: 'Dynamic Inspection',
          status: data.status,
          anomaly_score: data.anomaly_score,
          mean_similarity: data.metrics.mean_similarity,
          thumbnail: data.test_image,
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to complete frame analysis. Verify backend server connectivity.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    if (refPreview) {
      URL.revokeObjectURL(refPreview);
    }
    setRefBlob(null);
    setRefPreview(null);
    setRefTimestamp(null);
    setInspectTimestamp(null);
    setResults(null);
    setError(null);
    setSuccessMsg(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Webcam-Based Dynamic Inspection
        </h2>
        <p className="text-slate-400 text-sm mt-2 max-w-3xl">
          Register a baseline reference target, place your test sample in front of the lens, and trigger on-demand live analysis via OpenAI CLIP.
        </p>
      </div>

      {/* ALERTS */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border border-red-500/20 bg-red-950/20 text-red-400 p-4 rounded-lg flex items-start gap-3 text-sm"
          >
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
            <div>
              <strong className="font-bold">Inspection Error:</strong>
              <p className="mt-1 text-slate-300 text-xs">{error}</p>
            </div>
          </motion.div>
        )}

        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border border-emerald-500/20 bg-emerald-950/20 text-emerald-400 p-4 rounded-lg flex items-start gap-3 text-sm font-mono"
          >
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
            <div>
              <p className="text-slate-200 text-xs font-bold">{successMsg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- LIVE INTERACTION GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* WEBCAM PREVIEW (LG: 7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-square w-full max-w-md mx-auto rounded-xl overflow-hidden bg-dark-deep border border-white/5 flex flex-col items-center justify-center pulse-border-glow shadow-[0_0_30px_rgba(0,242,254,0.03)]">
            
            <video 
              ref={videoRef}
              autoPlay 
              playsInline
              muted
              className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
            />
            
            {!cameraActive && (
              <div className="text-center p-6 space-y-3">
                <VideoOff className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-500 font-mono">Webcam stream is currently offline.</p>
              </div>
            )}

            {/* Monospace Camera Status Indicator */}
            {cameraPermissionDenied ? (
              <div className="absolute top-4 left-4 flex items-center gap-2 px-2.5 py-1 rounded bg-black/70 backdrop-blur border border-red-500/20 text-[9px] font-mono text-red-400 font-bold uppercase tracking-wider z-20">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500 animate-pulse"></span>
                </span>
                Camera Access Denied
              </div>
            ) : cameraActive ? (
              <div className="absolute top-4 left-4 flex items-center gap-2 px-2.5 py-1 rounded bg-black/70 backdrop-blur border-emerald-500/20 text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider z-20">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                Camera Active
              </div>
            ) : (
              <div className="absolute top-4 left-4 flex items-center gap-2 px-2.5 py-1 rounded bg-black/70 backdrop-blur border-white/5 text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider z-20">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-slate-500"></span>
                </span>
                Camera Offline
              </div>
            )}

            {/* Horizontal scanner bar active during load */}
            {isAnalyzing && (
              <div className="laser-scan-bar"></div>
            )}

            {/* Hidden canvas element */}
            <div className="hidden-stage absolute w-0 h-0 overflow-hidden">
              <canvas id="hidden-webcam-canvas" width="512" height="512"></canvas>
            </div>
          </div>

          {/* Web Camera Actions */}
          <div className="flex justify-center gap-4 max-w-md mx-auto">
            <button
              onClick={toggleCamera}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer ${cameraActive ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white' : 'bg-cyan-glow/10 border-cyan-glow/20 text-cyan-glow hover:bg-cyan-glow/20'}`}
            >
              {cameraActive ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              {cameraActive ? "Deactivate Cam" : "Activate Cam"}
            </button>

            <button
              onClick={handleRegisterReference}
              disabled={!cameraActive}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyan-glow border border-cyan-glow text-dark-deep font-mono text-xs font-bold hover:shadow-[0_0_15px_rgba(0,242,254,0.4)] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              Register Reference
            </button>
          </div>
        </div>

        {/* WORKSPACE & CAPTURED SNAPSHOTS (LG: 5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Reference sample block */}
          <div className="border border-white/5 bg-white/2 rounded-xl p-5 space-y-4">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest block">Registered Reference Target</span>
            
            {refPreview ? (
              <div className="flex items-center gap-4 border border-cyan-glow/20 bg-cyan-glow/2 p-3 rounded-lg animate-fadeIn">
                <div className="w-16 h-16 rounded overflow-hidden bg-dark-deep border border-white/5 aspect-square shrink-0">
                  <img src={refPreview} alt="Reference Preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-[10px] font-mono text-cyan-glow font-bold uppercase tracking-wider">Ready to Inspect</div>
                  {refTimestamp && (
                    <div className="text-[9px] font-mono text-slate-500">
                      Reference Captured:<br />
                      <span className="text-slate-300 font-semibold">{refTimestamp}</span>
                    </div>
                  )}
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1 text-[10px] font-mono text-red-400 hover:text-red-300 cursor-pointer pt-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Reset Calibration
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-white/5 p-6 rounded-lg text-center text-slate-500 text-xs font-mono">
                No baseline calibration reference target. Align normal object and click "Register Reference" above.
              </div>
            )}
          </div>

          {/* Trigger analysis button */}
          <div className="space-y-3">
            <button
              onClick={handleInspectFrame}
              disabled={!refBlob || !cameraActive || isAnalyzing}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-mono text-sm font-bold uppercase tracking-wide bg-gradient-to-r from-cyan-glow to-purple-glow text-white shadow-[0_0_20px_rgba(0,242,254,0.15)] hover:shadow-[0_0_30px_rgba(157,78,221,0.3)] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer active:scale-[0.99]"
            >
              <Play className="w-4 h-4 fill-current" />
              Inspect Current Frame
            </button>
            <p className="text-[10px] text-slate-500 font-mono text-center">
              *Inspection runs on demand. Continuous video streaming inference is disabled to prevent latency.
            </p>
          </div>

          {/* --- ANALYSIS STEP LOADER --- */}
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="border border-cyan-glow/10 bg-cyan-glow/2 p-5 rounded-xl space-y-5 shadow-[0_0_15px_rgba(0,242,254,0.02)]"
              >
                <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                  <RefreshCw className="w-4 h-4 text-cyan-glow animate-spin" />
                  <span className="text-xs font-mono font-bold tracking-widest text-white uppercase">Inspection Pipeline Processing</span>
                </div>
                
                <div className="space-y-3">
                  {steps.map((step, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center gap-3 text-xs transition-colors font-mono ${currentStep > idx ? 'text-cyan-glow font-bold' : currentStep === idx ? 'text-white' : 'text-slate-600'}`}
                    >
                      <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center border text-[9px] ${currentStep > idx ? 'border-cyan-glow bg-cyan-glow/10 text-cyan-glow' : currentStep === idx ? 'border-white bg-white/5 text-white' : 'border-slate-800 text-slate-700'}`}>
                        {currentStep > idx ? "✓" : idx + 1}
                      </div>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

      {/* --- RESULTS WORKSPACE --- */}
      <AnimatePresence>
        {results && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8 animate-fadeIn pt-4"
          >
            {/* Results Title Section */}
            <div className="border-t border-white/5 pt-8">
              <h3 className="text-xl font-bold text-white tracking-tight mb-2">Visual Inspection Outputs</h3>
              <p className="text-xs text-slate-500">FastAPI backend outputs generated dynamically from OpenAI CLIP similarity comparisons.</p>
            </div>

            {/* 5-Column Responsive Image Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              
              {/* 1. Reference */}
              <div className="border border-white/5 bg-white/2 p-3 rounded-lg flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-2 block">1. Reference</span>
                  <div className="relative aspect-square w-full rounded bg-dark-deep overflow-hidden border border-white/5 flex items-center justify-center">
                    <img src={results.reference_image} alt="Reference" className="w-full h-full object-contain" />
                  </div>
                </div>
                {refTimestamp && (
                  <div className="text-[9px] font-mono text-slate-500 mt-2 text-center">
                    Reference Captured: <span className="text-slate-300 font-semibold">{refTimestamp}</span>
                  </div>
                )}
              </div>

              {/* 2. Test */}
              <div className="border border-white/5 bg-white/2 p-3 rounded-lg flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-2 block">2. Test Image</span>
                  <div className="relative aspect-square w-full rounded bg-dark-deep overflow-hidden border border-white/5 flex items-center justify-center">
                    <img src={results.test_image} alt="Test Subject" className="w-full h-full object-contain" />
                  </div>
                </div>
                {inspectTimestamp && (
                  <div className="text-[9px] font-mono text-slate-500 mt-2 text-center">
                    Inspection Captured: <span className="text-slate-300 font-semibold">{inspectTimestamp}</span>
                  </div>
                )}
              </div>

              {/* 3. Heatmap */}
              <div className="border border-white/5 bg-white/2 p-3 rounded-lg flex flex-col">
                <span className="text-[10px] font-mono font-bold text-cyan-glow uppercase tracking-widest mb-2 block">3. Heatmap</span>
                <div className="relative aspect-square w-full rounded bg-dark-deep overflow-hidden border border-white/5 flex items-center justify-center">
                  <img src={results.heatmap} alt="Anomaly Heatmap" className="w-full h-full object-contain" />
                </div>
              </div>

              {/* 4. Overlay */}
              <div className="border border-white/5 bg-white/2 p-3 rounded-lg flex flex-col">
                <span className="text-[10px] font-mono font-bold text-purple-glow uppercase tracking-widest mb-2 block">4. Overlay Map</span>
                <div className="relative aspect-square w-full rounded bg-dark-deep overflow-hidden border border-white/5 flex items-center justify-center">
                  <img src={results.overlay} alt="Visual Blend" className="w-full h-full object-contain" />
                </div>
              </div>

              {/* 5. Defect Detection */}
              <div className="border border-cyan-glow/10 bg-cyan-glow/2 p-3 rounded-lg flex flex-col relative shadow-[0_0_15px_rgba(0,242,254,0.02)]">
                <span className="text-[10px] font-mono font-bold text-cyan-glow uppercase tracking-widest mb-2 block">5. Defect Detection</span>
                <div className="relative aspect-square w-full rounded bg-dark-deep overflow-hidden border border-cyan-glow/10 flex items-center justify-center">
                  <img src={results.defect_detection} alt="Detection overlay" className="w-full h-full object-contain" />
                </div>
              </div>

            </div>

            {/* --- REPORT & EXPLANATION ROW --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              
              <div className="lg:col-span-2 border border-white/5 bg-white/2 rounded-xl p-6 flex flex-col gap-5">
                {/* Status Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <span className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">Inspection Report Summary</span>
                  {(() => { const sc = getSeverityConfig(results.status); return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold uppercase ${sc.bg} ${sc.text} border ${sc.border}`}>
                      {sc.icon}{results.status}
                    </span>
                  ); })()}
                </div>

                {/* Severity Bar */}
                {(() => { const sc = getSeverityConfig(results.status); return (
                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1.5">
                      <span>Anomaly Severity Level</span>
                      <span className={sc.text}>{results.status}</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${sc.bar} rounded-full transition-all duration-700`} style={{ width: sc.barWidth }} />
                    </div>
                  </div>
                ); })()}

                {/* Interpretation Layer */}
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider block mb-2">Interpretation Layer</span>
                  <div className="p-4 rounded-lg bg-dark-deep/60 border border-white/5">
                    <p className="text-slate-300 text-xs leading-relaxed">{results.explanation}</p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="border border-white/5 bg-dark-deep/40 p-4 rounded-lg">
                    <span className="text-[9px] font-mono text-slate-500 uppercase font-semibold block mb-1">Avg. Patch Similarity</span>
                    <span className="text-lg font-bold text-white font-mono">{results.metrics.mean_similarity.toFixed(4)}</span>
                  </div>
                  <div className="border border-white/5 bg-dark-deep/40 p-4 rounded-lg">
                    <span className="text-[9px] font-mono text-slate-500 uppercase font-semibold block mb-1">Min Patch Similarity</span>
                    <span className="text-lg font-bold text-white font-mono">{results.metrics.min_similarity.toFixed(4)}</span>
                  </div>
                  <div className="border border-white/5 bg-dark-deep/40 p-4 rounded-lg">
                    <span className="text-[9px] font-mono text-slate-500 uppercase font-semibold block mb-1">Anomaly Area Ratio</span>
                    <span className="text-lg font-bold text-white font-mono">{(results.metrics.anomaly_pixel_ratio * 100).toFixed(2)}%</span>
                  </div>
                </div>

                {/* PDF Export */}
                <button
                  onClick={() => exportPDF(results, 'Dynamic Inspection')}
                  className="flex items-center gap-2 px-4 py-2.5 border border-cyan-glow/20 bg-cyan-glow/5 text-cyan-glow hover:bg-cyan-glow/10 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 self-start"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Inspection Report (PDF)
                </button>
              </div>

              {/* Right side: Localized Regions Coordinates */}
              <div className="border border-white/5 bg-white/2 rounded-xl p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="pb-3 border-b border-white/5">
                    <span className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">Localized Coordinates</span>
                  </div>
                  
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {results.detected_regions.length === 0 ? (
                      <p className="text-xs text-slate-500 font-mono italic">No bounding contours detected.</p>
                    ) : (
                      results.detected_regions.map((reg) => (
                        <div key={reg.id} className="border border-white/5 bg-dark-deep/40 p-3 rounded text-[11px] font-mono text-slate-400 leading-normal flex items-center justify-between">
                          <div>
                            <div className="text-white font-bold mb-1">Region #{reg.id + 1}</div>
                            <div>X: {reg.x.toFixed(1)}% | Y: {reg.y.toFixed(1)}%</div>
                            <div>W: {reg.width.toFixed(1)}% | H: {reg.height.toFixed(1)}%</div>
                          </div>
                          <span className="text-[10px] text-cyan-glow font-bold border border-cyan-glow/20 bg-cyan-glow/5 px-2 py-0.5 rounded">
                            {reg.area_px} px²
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-2">
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>Anomaly Score:</span>
                    <span className="text-white font-bold">{results.anomaly_score.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>Anomaly Confidence Estimate:</span>
                    <span className="text-cyan-glow font-bold">{(Math.max(0, (1 - results.metrics.min_similarity) * 100)).toFixed(1)}%</span>
                  </div>
                  <div className="text-[9px] font-mono text-slate-500 leading-normal border-t border-white/5 pt-1.5">
                    *Derived directly from maximum localized patch similarity distance: (1 - Min Patch Similarity) × 100.
                  </div>
                </div>

              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
