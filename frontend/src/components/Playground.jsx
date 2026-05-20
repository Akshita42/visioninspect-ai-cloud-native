import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Trash2, Play, RefreshCw, Layers, ShieldCheck, 
  HelpCircle, Info, ChevronRight, AlertTriangle, CheckCircle, 
  FileText, Activity, BookOpen
} from 'lucide-react';

export default function Playground() {
  const [activeTab, setActiveTab] = useState('upload'); // 'dashboard', 'upload', 'how-it-works', 'about'
  
  // Image Upload states
  const [refFile, setRefFile] = useState(null);
  const [refPreview, setRefPreview] = useState(null);
  const [testFile, setTestFile] = useState(null);
  const [testPreview, setTestPreview] = useState(null);

  // Analysis process states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [analysisError, setAnalysisError] = useState(null);
  
  // Results states
  const [results, setResults] = useState(null);
  
  // Explanation toggle
  const [showLaymanExplanation, setShowLaymanExplanation] = useState(false);

  const steps = [
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
      }, 900); // Shift step every 900ms
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Handle file uploads
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    processFile(file, type);
  };

  const processFile = (file, type) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === 'ref') {
        setRefFile(file);
        setRefPreview(e.target.result);
      } else {
        setTestFile(file);
        setTestPreview(e.target.result);
      }
    };
    reader.readAsDataURL(file);
    setResults(null);
    setAnalysisError(null);
  };

  // Drag and Drop handlers
  const [dragActive, setDragActive] = useState({ ref: false, test: false });

  const handleDrag = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(prev => ({ ...prev, [type]: true }));
    } else if (e.type === "dragleave") {
      setDragActive(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0], type);
    }
  };

  const handleReset = () => {
    setRefFile(null);
    setRefPreview(null);
    setTestFile(null);
    setTestPreview(null);
    setResults(null);
    setAnalysisError(null);
    setIsAnalyzing(false);
  };

  // Execute FastAPI POST /analyze
  const handleAnalyze = async () => {
    if (!refFile || !testFile) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setResults(null);

    const formData = new FormData();
    formData.append("reference", refFile);
    formData.append("test", testFile);

    try {
      const response = await fetch("/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server returned status code: ${response.status}. Make sure backend server is running.`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      setAnalysisError(err.message || "Failed to establish a connection with the Python FastAPI backend.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-dark-deep flex z-10 pt-16">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 border-r border-white/5 bg-dark-deep/50 shrink-0 hidden md:flex flex-col p-6">
        <div className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase mb-8">
          Project Panel
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-mono tracking-tight transition-all cursor-pointer ${activeTab === 'upload' ? 'bg-cyan-glow/5 border border-cyan-glow/20 text-cyan-glow font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Upload className="w-4 h-4" />
            Upload Inspection
          </button>
          
          <button
            onClick={() => setActiveTab('how-it-works')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-mono tracking-tight transition-all cursor-pointer ${activeTab === 'how-it-works' ? 'bg-cyan-glow/5 border border-cyan-glow/20 text-cyan-glow font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Layers className="w-4 h-4" />
            How It Works
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-mono tracking-tight transition-all cursor-pointer ${activeTab === 'about' ? 'bg-cyan-glow/5 border border-cyan-glow/20 text-cyan-glow font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <BookOpen className="w-4 h-4" />
            About Project
          </button>
        </nav>

        <div className="border-t border-white/5 pt-4 text-[10px] font-mono text-slate-600">
          <div>Status: API Ready</div>
          <div className="mt-1">Host: 127.0.0.1:8000</div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto overflow-y-auto w-full">
        
        {/* TAB 1: UPLOAD INSPECTION (CORE PLAYGROUND) */}
        {activeTab === 'upload' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Page Header */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Reference-Based Defect Inspection
              </h2>
              <p className="text-slate-400 text-sm mt-2 max-w-3xl">
                Compare a test image against a defect-free reference image to detect anomalies using OpenAI CLIP visual semantic embeddings.
              </p>
            </div>

            {/* ERROR CARD */}
            {analysisError && (
              <div className="border border-red-500/20 bg-red-950/20 text-red-400 p-4 rounded-lg flex items-start gap-3 text-sm animate-fadeIn">
                <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
                <div>
                  <strong className="font-bold">Backend Connection Failed:</strong>
                  <p className="mt-1 text-slate-300 text-xs">
                    {analysisError} Ensure your FastAPI backend server is running (`python backend/app.py` or uvicorn command) and that you have loaded the python virtual environment.
                  </p>
                </div>
              </div>
            )}

            {/* --- UPLOAD ZONE ROW --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* UPLOADER 1: REFERENCE */}
              <div 
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragActive.ref ? 'border-cyan-glow bg-cyan-glow/5' : 'border-white/5 bg-white/2 hover:border-white/10'} ${refPreview ? 'border-cyan-glow/20' : ''}`}
                onDragEnter={(e) => handleDrag(e, 'ref')}
                onDragOver={(e) => handleDrag(e, 'ref')}
                onDragLeave={(e) => handleDrag(e, 'ref')}
                onDrop={(e) => handleDrop(e, 'ref')}
              >
                {refPreview ? (
                  <div className="space-y-4">
                    <div className="relative aspect-video rounded-lg overflow-hidden max-w-sm mx-auto border border-white/10 bg-dark-deep">
                      <img src={refPreview} alt="Reference preview" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex items-center justify-between text-xs max-w-sm mx-auto font-mono text-slate-400">
                      <span className="truncate pr-4">{refFile?.name}</span>
                      <button 
                        onClick={() => { setRefFile(null); setRefPreview(null); setResults(null); }}
                        className="text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Clear
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer group py-6">
                    <Upload className="w-8 h-8 text-cyan-glow mb-4 group-hover:scale-105 transition-transform" />
                    <span className="text-sm font-semibold text-white">Upload Reference Image</span>
                    <span className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Upload a normal defect-free reference image.<br />Supports JPG, PNG, JPEG.
                    </span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleFileChange(e, 'ref')} 
                    />
                  </label>
                )}
              </div>

              {/* UPLOADER 2: TEST SUBJECT */}
              <div 
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragActive.test ? 'border-purple-glow bg-purple-glow/5' : 'border-white/5 bg-white/2 hover:border-white/10'} ${testPreview ? 'border-purple-glow/20' : ''}`}
                onDragEnter={(e) => handleDrag(e, 'test')}
                onDragOver={(e) => handleDrag(e, 'test')}
                onDragLeave={(e) => handleDrag(e, 'test')}
                onDrop={(e) => handleDrop(e, 'test')}
              >
                {testPreview ? (
                  <div className="space-y-4">
                    <div className="relative aspect-video rounded-lg overflow-hidden max-w-sm mx-auto border border-white/10 bg-dark-deep">
                      <img src={testPreview} alt="Test preview" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex items-center justify-between text-xs max-w-sm mx-auto font-mono text-slate-400">
                      <span className="truncate pr-4">{testFile?.name}</span>
                      <button 
                        onClick={() => { setTestFile(null); setTestPreview(null); setResults(null); }}
                        className="text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Clear
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer group py-6">
                    <Upload className="w-8 h-8 text-purple-glow mb-4 group-hover:scale-105 transition-transform" />
                    <span className="text-sm font-semibold text-white">Upload Test Image</span>
                    <span className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Upload the image to inspect for anomalies.<br />Supports JPG, PNG, JPEG.
                    </span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleFileChange(e, 'test')} 
                    />
                  </label>
                )}
              </div>

            </div>

            {/* ACTION TRIGGERS */}
            <div className="flex items-center justify-center gap-4 py-4">
              <button
                onClick={handleAnalyze}
                disabled={!refFile || !testFile || isAnalyzing}
                className={`flex items-center gap-2 px-8 py-4 text-xs font-mono font-bold uppercase tracking-wider text-dark-deep bg-cyan-glow rounded-md cursor-pointer transition-all shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:shadow-[0_0_30px_rgba(0,242,254,0.5)] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Analyze Image
              </button>

              {(refFile || testFile) && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 border border-white/5 bg-white/2 hover:bg-white/5 hover:border-white/10 px-6 py-4 rounded-md text-xs font-mono text-slate-300 transition-all cursor-pointer active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset
                </button>
              )}
            </div>

            {/* LOADING STATE ACCORDION */}
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="max-w-xl mx-auto border border-white/5 bg-slate-950/60 backdrop-blur rounded-xl p-6 space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <span className="text-xs font-mono text-cyan-glow uppercase tracking-wider font-bold">Processing Pipeline</span>
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-glow animate-ping"></span>
                    </span>
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
                    <div className="border border-white/5 bg-white/2 p-3 rounded-lg flex flex-col">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-2 block">1. Reference</span>
                      <div className="relative aspect-square w-full rounded bg-dark-deep overflow-hidden border border-white/5 flex items-center justify-center">
                        <img src={results.reference_image} alt="Reference" className="w-full h-full object-contain" />
                      </div>
                    </div>

                    {/* 2. Test */}
                    <div className="border border-white/5 bg-white/2 p-3 rounded-lg flex flex-col">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-2 block">2. Test Image</span>
                      <div className="relative aspect-square w-full rounded bg-dark-deep overflow-hidden border border-white/5 flex items-center justify-center">
                        <img src={results.test_image} alt="Test Subject" className="w-full h-full object-contain" />
                      </div>
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
                    
                    {/* Left & Middle: System Report Panel */}
                    <div className="lg:col-span-2 border border-white/5 bg-white/2 rounded-xl p-6 flex flex-col justify-between">
                      <div className="space-y-6">
                        
                        <div className="flex items-center justify-between pb-4 border-b border-white/5">
                          <span className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">Inspection Report Summary</span>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold uppercase ${results.status === 'POSSIBLE ANOMALY DETECTED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                            {results.status === 'POSSIBLE ANOMALY DETECTED' ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            {results.status}
                          </span>
                        </div>

                        {/* Explain Result Accordion Button */}
                        <div className="flex justify-between items-center bg-dark-deep/40 p-3 rounded-lg border border-white/5 text-xs">
                          <span className="text-slate-400 font-mono">Translate metrics into readable text:</span>
                          <button
                            onClick={() => setShowLaymanExplanation(!showLaymanExplanation)}
                            className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded font-mono border border-white/5 cursor-pointer active:scale-95 transition-all"
                          >
                            {showLaymanExplanation ? "Hide Summary" : "Interpret Metrics"}
                          </button>
                        </div>

                        {/* EXPLANATION AREA */}
                        <div className="p-4 rounded-lg bg-dark-deep/60 border border-white/5">
                          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider block mb-2">
                            {showLaymanExplanation ? "Rule-Based Summary" : "Interpretation Layer Analysis"}
                          </span>
                          <p className="text-slate-300 text-sm leading-relaxed">
                            {showLaymanExplanation 
                              ? "The patch comparison module evaluated local variations against your baseline reference. Regions containing significant similarity deviations (e.g., structural variations, scratches, or deformations) have been identified and highlighted." 
                              : results.explanation
                            }
                          </p>
                        </div>

                        {/* Technical similarity indices */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="border border-white/5 bg-dark-deep/40 p-4 rounded-lg">
                            <span className="text-[9px] font-mono text-slate-500 uppercase font-semibold block mb-1">Average Patch Similarity</span>
                            <span className="text-xl font-bold text-white font-mono">{results.metrics.mean_similarity.toFixed(4)}</span>
                          </div>
                          <div className="border border-white/5 bg-dark-deep/40 p-4 rounded-lg">
                            <span className="text-[9px] font-mono text-slate-500 uppercase font-semibold block mb-1">Min Patch Similarity</span>
                            <span className="text-xl font-bold text-white font-mono">{results.metrics.min_similarity.toFixed(4)}</span>
                          </div>
                          <div className="border border-white/5 bg-dark-deep/40 p-4 rounded-lg">
                            <span className="text-[9px] font-mono text-slate-500 uppercase font-semibold block mb-1">Anomaly Area Ratio</span>
                            <span className="text-xl font-bold text-white font-mono">{(results.metrics.anomaly_pixel_ratio * 100).toFixed(2)}%</span>
                          </div>
                        </div>

                      </div>
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
        )}

        {/* TAB 2: HOW IT WORKS WORKFLOW */}
        {activeTab === 'how-it-works' && (
          <div className="space-y-8 animate-fadeIn max-w-4xl">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">How VisionInspect AI Works</h2>
              <p className="text-slate-400 text-sm mt-2">
                VisionInspect compares a defect-free reference image with a test image to identify anomalous visual patterns. Here is a review of the underlying algorithms.
              </p>
            </div>

            <div className="space-y-6">
              
              <div className="border border-white/5 bg-white/2 p-6 rounded-xl space-y-3">
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-cyan-glow/10 border border-cyan-glow/20 text-cyan-glow flex items-center justify-center text-xs font-mono">1</span>
                  Image Patches Extraction
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed pl-7">
                  Standard neural network architectures compute visual representations for the entire image as a single vector. However, this global feature projection tends to average out microscopic local changes like scratches or stains. To resolve this, VisionInspect breaks the image down into overlapping 64x64 sub-regions (patches) and analyzes each patch independently.
                </p>
              </div>

              <div className="border border-white/5 bg-white/2 p-6 rounded-xl space-y-3">
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-purple-glow/10 border border-purple-glow/20 text-purple-glow flex items-center justify-center text-xs font-mono">2</span>
                  Contrastive Semantic Embeddings
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed pl-7">
                  Each extracted sub-patch is passed to the pretrained OpenAI CLIP vision transformer (`openai/clip-vit-base-patch32`). CLIP produces a dense 512-dimensional vector embedding for the patch. These embeddings are robust against slight lighting differences and lens alignments while preserving high-level semantic structures.
                </p>
              </div>

              <div className="border border-white/5 bg-white/2 p-6 rounded-xl space-y-3">
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-cyan-glow/10 border border-cyan-glow/20 text-cyan-glow flex items-center justify-center text-xs font-mono">3</span>
                  Cosine Similarity Mapping
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed pl-7">
                  For each test patch, we calculate its Cosine Similarity index compared directly against the corresponding patch at the same spatial coordinates in the defect-free reference image. The score maps the distance between the two vectors. Subtracting the similarity from 1 yields a distance matrix where higher values denote severe structural deviations.
                </p>
              </div>

              <div className="border border-white/5 bg-white/2 p-6 rounded-xl space-y-3">
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-purple-glow/10 border border-purple-glow/20 text-purple-glow flex items-center justify-center text-xs font-mono">4</span>
                  Morphological Postprocessing & Bounding Boxes
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed pl-7">
                  The computed patch distances are interpolated back into a 2D matrix shape, normalized, and smoothed with a Gaussian filter to generate a continuous heatmap. We then apply binary thresholding to isolate outliers, clean up minor noise using OpenCV morphological opening/closing operations, and extract the bounding boundaries for localized contours.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: ABOUT PROJECT STATS */}
        {activeTab === 'about' && (
          <div className="space-y-8 animate-fadeIn max-w-4xl">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">About VisionInspect AI</h2>
              <p className="text-slate-400 text-sm mt-2">
                This project is a student-built reference-based inspection system demonstrating zero-shot visual anomaly detection, built for academic evaluation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="border border-white/5 bg-white/2 p-6 rounded-xl space-y-4">
                <h3 className="text-white font-bold text-base">Algorithm Specifications</h3>
                <div className="space-y-3 font-mono text-xs text-slate-400">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Backbone Model:</span>
                    <span className="text-white">CLIP ViT-B/32 (OpenAI)</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Image Resolution:</span>
                    <span className="text-white">512 &times; 512 pixels</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Sub-Patch Size:</span>
                    <span className="text-white">64 &times; 64 px</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Comparison Metric:</span>
                    <span className="text-white">Cosine Distance (1 - cos(θ))</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Localization Engine:</span>
                    <span className="text-white">OpenCV Contour Bounding Box</span>
                  </div>
                </div>
              </div>

              <div className="border border-white/5 bg-white/2 p-6 rounded-xl space-y-4">
                <h3 className="text-white font-bold text-base">Development Stack</h3>
                <div className="space-y-3 font-mono text-xs text-slate-400">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Model & Processing Stack:</span>
                    <span className="text-white">PyTorch, HuggingFace, OpenCV</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Backend Server:</span>
                    <span className="text-white">FastAPI (Python 3.10+)</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Frontend Client:</span>
                    <span className="text-white">React, Vite, Tailwind CSS v4</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Animation Engine:</span>
                    <span className="text-white">Framer Motion</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="border border-white/5 bg-white/2 p-6 rounded-xl">
              <h3 className="text-white font-bold text-base mb-3">Academic Scope Disclaimer</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                VisionInspect AI is built as a scientific demonstration. It is not currently certified for production environments, nor does it connect to edge PLCs or active factory SCADA loops. All benchmarks and similarity evaluations represent localized calculations running within the host Python runtime.
              </p>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
