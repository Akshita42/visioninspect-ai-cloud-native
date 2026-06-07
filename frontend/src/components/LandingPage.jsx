import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Upload, Layers, Cpu, GitCompare, 
  Map, Target, ShieldCheck, Eye, HelpCircle, 
  FileText, Flame, Activity, Hourglass, Globe,
  Server, Cloud, Box, Workflow, Monitor
} from 'lucide-react';

export default function LandingPage({ onLaunchPlayground }) {
  
  const handleLearnMore = () => {
    const el = document.getElementById('how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const steps = [
    {
      icon: <Upload className="w-5 h-5 text-cyan-glow" />,
      title: "Upload Reference Image",
      desc: "Provide a known normal, defect-free master image of the object to establish the baseline configuration."
    },
    {
      icon: <Upload className="w-5 h-5 text-purple-glow" />,
      title: "Upload Test Image",
      desc: "Provide the target image of the object under inspection (which may contain cracks, stains, or deformities)."
    },
    {
      icon: <Layers className="w-5 h-5 text-cyan-glow" />,
      title: "Patch Extraction",
      desc: "Deconstruct both reference and test images into small overlapping patches (e.g. 64x64 grids) to map regional textures."
    },
    {
      icon: <Cpu className="w-5 h-5 text-purple-glow" />,
      title: "CLIP Embedding Generation",
      desc: "Pass extracted image patches through HuggingFace OpenAI CLIP ViT encoder to map high-level semantic vector embeddings."
    },
    {
      icon: <GitCompare className="w-5 h-5 text-cyan-glow" />,
      title: "Similarity Comparison",
      desc: "Compare patch vectors between reference and test sets using Cosine Similarity mapping to find deviations."
    },
    {
      icon: <Map className="w-5 h-5 text-purple-glow" />,
      title: "Heatmap Generation",
      desc: "Translate similarity variance back into a coordinate grid, creating an anomaly density heatmap overlay."
    },
    {
      icon: <Target className="w-5 h-5 text-cyan-glow" />,
      title: "Defect Localization",
      desc: "Threshold the heatmap, clean noise via morphological operations, and compute contours to localize bounding boxes."
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-purple-glow" />,
      title: "Interpretation Layer",
      desc: "Converts similarity metrics into understandable observations and explains localized anomaly regions using rule-based interpretation."
    }
  ];

  const features = [
    {
      icon: <GitCompare className="w-6 h-6 text-cyan-glow" />,
      title: "Reference-Based Inspection",
      desc: "Compares target frames directly against a single baseline image to identify anomalies without large defect datasets."
    },
    {
      icon: <Map className="w-6 h-6 text-purple-glow" />,
      title: "Heatmap Visualization",
      desc: "Generates high-contrast colorized density heatmaps highlighting exactly where and how much patches deviate."
    },
    {
      icon: <Cpu className="w-6 h-6 text-cyan-glow" />,
      title: "CLIP Semantic Embeddings",
      desc: "Leverages HuggingFace CLIP vision models to extract robust, zero-shot features resilient to mild alignment shifts."
    },
    {
      icon: <Target className="w-6 h-6 text-purple-glow" />,
      title: "Defect Localization",
      desc: "Calculates precise bounding boxes using morphological image operations (opening/closing) on similarity masks."
    },
    {
      icon: <FileText className="w-6 h-6 text-cyan-glow" />,
      title: "Interpretation Layer",
      desc: "Translates patch cosine distances into readable summaries and indicates localized variations based on pre-set thresholds."
    },
    {
      icon: <Layers className="w-6 h-6 text-purple-glow" />,
      title: "Patch Similarity Analysis",
      desc: "Breaks analysis into dense overlapping patch vectors to evaluate localized changes rather than global averages."
    },
    {
      icon: <Flame className="w-6 h-6 text-cyan-glow" />,
      title: "Zero-Shot Anomaly Detection",
      desc: "Infers defects without requiring training epochs on defective data, enabling out-of-the-box template inspection."
    },
    {
      icon: <Eye className="w-6 h-6 text-purple-glow" />,
      title: "Visual Inspection Workflow",
      desc: "Provides side-by-side inspection stages (Reference vs Test vs Heatmap vs Overlay) for comparative verification."
    },
    {
      icon: <Box className="w-6 h-6 text-cyan-glow" />,
      title: "Docker Containerization",
      desc: "Microservices packaged in isolated Docker containers for consistent deployment across any environment."
    },
    {
      icon: <Workflow className="w-6 h-6 text-purple-glow" />,
      title: "Jenkins CI/CD",
      desc: "Automated build, test, and deployment pipelines ensuring reliable and continuous delivery updates."
    },
    {
      icon: <Server className="w-6 h-6 text-cyan-glow" />,
      title: "Kubernetes Orchestration",
      desc: "Automated scaling, load balancing, and self-healing of production workloads via K8s clusters."
    },
    {
      icon: <Cloud className="w-6 h-6 text-purple-glow" />,
      title: "Terraform IaC & AWS",
      desc: "Infrastructure as Code provisioning robust AWS cloud environments for scalable platform hosting."
    },
    {
      icon: <Monitor className="w-6 h-6 text-cyan-glow" />,
      title: "Prometheus & Grafana",
      desc: "Real-time system telemetry, metric monitoring, and performance dashboards for cluster health."
    }
  ];

  const applications = [
    {
      title: "Bottle Inspection",
      context: "Verifying liquid volume heights, labeling defects, capping gaps, or identifying surface plastic deformations.",
      dataset: "MVTec AD Bottle Dataset baseline compatible."
    },
    {
      title: "Surface Defect Analysis",
      context: "Scanning sheet metal, glass sheets, or industrial castings for hairline scratches, rust, and micro-cracks.",
      dataset: "Structural patch embedding deviations."
    },
    {
      title: "Manufacturing Quality Inspection",
      context: "Checking alignment of component assembly prints or component positions in sub-assemblies.",
      dataset: "Baseline comparisons against a gold standard."
    },
    {
      title: "Packaging Anomaly Detection",
      context: "Detecting missing product items, packaging punctures, or misaligned adhesive seals.",
      dataset: "Region-of-interest threshold localization."
    },
    {
      title: "Crack/Scratch Visualization",
      context: "Exposing microscopic fissures on high-pressure cast parts which escape standard pixel intensity triggers.",
      dataset: "CLIP semantic patch distance scoring."
    }
  ];

  const futureScopes = [
    {
      icon: <Activity className="w-5 h-5 text-cyan-glow" />,
      title: "Inference Latency Optimization",
      desc: "Optimizing patch extraction bottlenecks and implementing batch inference pipelines to approach real-time FPS."
    },
    {
      icon: <Cpu className="w-5 h-5 text-purple-glow" />,
      title: "GPU Tensor Acceleration",
      desc: "Leveraging TensorRT compilation and PyTorch CUDA optimizations to run CLIP encoders on low-power edge machines."
    },
    {
      icon: <Target className="w-5 h-5 text-cyan-glow" />,
      title: "Refined Localization Resolving",
      desc: "Exploring multi-scale patch resolutions and feature fusion models to detect tiny sub-pixel micro-anomalies."
    },
    {
      icon: <Layers className="w-5 h-5 text-purple-glow" />,
      title: "Industrial Camera Integrations",
      desc: "Designing frame-grabber pipelines to interface with GenICam and GigE industrial lenses for automated image capture."
    },
    {
      icon: <Hourglass className="w-5 h-5 text-cyan-glow" />,
      title: "Adaptive Similarity Calibration",
      desc: "Implementing localized similarity tolerance masks to account for normal lighting gradients and camera shake."
    }
  ];

  return (
    <div className="relative overflow-x-hidden min-h-screen pt-16 bg-dark-deep bg-radial-blur">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-grid-cyber opacity-60 pointer-events-none z-0"></div>

      {/* --- HERO SECTION --- */}
      <section id="hero" className="relative max-w-7xl mx-auto px-6 py-20 md:py-32 flex flex-col items-center justify-center text-center z-10">
        
        {/* Animated Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-glow/20 bg-cyan-glow/5 text-xs font-mono font-bold uppercase tracking-wider text-cyan-glow mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-glow animate-pulse"></span>
          Cloud-Native AI Platform
        </motion.div>

        {/* Main Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-5xl leading-[1.1] mb-6"
        >
          Enterprise-Grade Visual <br />
          <span className="bg-gradient-to-r from-cyan-glow via-teal-300 to-purple-glow bg-clip-text text-transparent">
            Anomaly Detection
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-400 max-w-3xl leading-relaxed mb-12"
        >
          A scalable, orchestrated computer vision system for identifying visual anomalies and defects using AI and modern DevOps practices.
        </motion.p>

        {/* CTA Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 justify-center"
        >
          <button 
            onClick={onLaunchPlayground}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-cyan-glow text-dark-deep font-mono font-bold text-sm uppercase rounded-lg shadow-[0_0_25px_rgba(0,242,254,0.4)] hover:shadow-[0_0_35px_rgba(0,242,254,0.6)] cursor-pointer active:scale-95 transition-all"
          >
            Launch Playground
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button 
            onClick={handleLearnMore}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white font-mono font-bold text-sm uppercase rounded-lg cursor-pointer active:scale-95 transition-all"
          >
            How it works
          </button>
        </motion.div>

        {/* Floating Glass Cards / AI Visuals */}
        <div className="relative mt-20 w-full max-w-4xl mx-auto rounded-2xl border border-white/5 bg-white/2 cursor-pointer pulse-border-glow overflow-hidden p-3 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-t from-dark-deep via-transparent to-transparent z-10"></div>
          <div className="relative z-0 aspect-[16/9] rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center group">
            
            {/* Visual HUD overlay representation */}
            <div className="absolute inset-0 bg-grid-cyber opacity-40 z-1"></div>
            <div className="laser-scan-bar"></div>
            
            {/* Center mockup card */}
            <div className="relative z-2 border border-white/10 bg-dark-deep/90 rounded-lg p-6 max-w-md w-full text-left backdrop-blur-md">
              <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                <span className="text-[10px] font-mono text-cyan-glow font-bold uppercase tracking-wider">Patch Embedding Matrix</span>
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-glow animate-pulse"></span>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-4 font-mono text-[9px] text-slate-500">
                {Array.from({ length: 16 }).map((_, idx) => (
                  <div key={idx} className={`p-1.5 border rounded text-center ${idx === 5 || idx === 10 ? 'border-purple-glow/30 bg-purple-glow/10 text-purple-glow' : 'border-white/5 bg-white/2'}`}>
                    {idx === 5 || idx === 10 ? 'ANOM' : 'PASS'}
                  </div>
                ))}
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Similarity Comparison: <span className="text-white font-bold">94.3%</span> matching rate.
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* --- PROJECT EXPLANATION SECTION --- */}
      <section id="explanation" className="relative max-w-7xl mx-auto px-6 py-24 border-t border-white/5 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div>
            <span className="text-xs font-mono text-cyan-glow uppercase tracking-widest font-bold mb-3 block">Research Concept</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Reference-Based Contrastive Inference
            </h2>
            <p className="text-slate-400 text-base leading-relaxed mb-6">
              Traditional industrial defect inspection systems depend heavily on large datasets consisting of thousands of sample images labeled with specific, known defects. 
            </p>
            <p className="text-slate-400 text-base leading-relaxed mb-6">
              <strong>VisionInspect AI</strong> bypasses this limitation. Our system operates on a zero-shot, reference-based pipeline. It computes semantic similarity differences between a single defect-free reference image and an inspected test subject using HuggingFace CLIP encoders.
            </p>
            <p className="text-slate-400 text-base leading-relaxed mb-8">
              Evolving beyond a standalone ML script, the platform is now a fully orchestrated, <strong>Cloud-Native architecture</strong>. Containerized with Docker, deployed via Terraform onto AWS, managed by Kubernetes, and continuously monitored through Prometheus and Grafana, it represents a production-ready enterprise solution.
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="border border-white/5 bg-white/2 p-5 rounded-lg flex-1">
                <span className="text-xs font-mono text-cyan-glow font-bold uppercase block mb-1">Patch Resolution</span>
                <span className="text-2xl font-bold text-white">64 &times; 64 px</span>
                <p className="text-xs text-slate-500 mt-2">Patches are evaluated independently to prevent global averaging loss.</p>
              </div>
              <div className="border border-white/5 bg-white/2 p-5 rounded-lg flex-1">
                <span className="text-xs font-mono text-purple-glow font-bold uppercase block mb-1">Embedding Space</span>
                <span className="text-2xl font-bold text-white">512 Dim</span>
                <p className="text-xs text-slate-500 mt-2">CLIP vision transformer model yields high-level visual semantic features.</p>
              </div>
            </div>
          </div>

          {/* Graphical comparison columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            <div className="border border-white/5 bg-white/2 rounded-xl p-6 relative">
              <div className="w-8 h-8 rounded bg-red-950 border border-red-500/20 text-red-500 flex items-center justify-center font-bold text-xs mb-4 font-mono">X</div>
              <h3 className="text-white font-bold text-lg mb-2">Traditional Defect Training</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Requires collecting, cataloging, and training deep CNNs on thousands of scratched, cracked, or broken instances for every product profile.
              </p>
            </div>

            <div className="border border-cyan-glow/20 bg-cyan-glow/2 rounded-xl p-6 relative shadow-[0_0_20px_rgba(0,242,254,0.02)]">
              <div className="w-8 h-8 rounded bg-cyan-950 border border-cyan-glow/30 text-cyan-glow flex items-center justify-center font-bold text-xs mb-4 font-mono">✓</div>
              <h3 className="text-white font-bold text-lg mb-2">CLIP Similarity Mapping</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Requires only a single good reference image. Zero-shot CLIP vector mapping flags any visual deviation instantly without training loops.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* --- SYSTEM ARCHITECTURE SECTION --- */}
      <section id="architecture" className="relative max-w-7xl mx-auto px-6 py-24 border-t border-white/5 z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono text-cyan-glow uppercase tracking-widest font-bold mb-3 block">Infrastructure</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Cloud-Native Architecture</h2>
          <p className="text-slate-400 mt-4">
            A resilient, scalable microservices infrastructure deployed using industry-standard DevOps practices.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 relative">
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="border border-white/5 bg-white/2 p-6 rounded-xl flex flex-col items-center w-full max-w-[200px] z-10"
          >
            <Box className="w-8 h-8 text-cyan-glow mb-4" />
            <span className="text-sm font-bold text-white mb-1">React Client</span>
            <span className="text-[10px] text-slate-500 font-mono text-center">Nginx &bull; Vercel</span>
          </motion.div>

          <div className="hidden md:block w-8 h-[1px] bg-white/10 relative">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t border-r border-white/20 rotate-45"></div>
          </div>
          <div className="md:hidden h-8 w-[1px] bg-white/10 relative"></div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="border border-purple-glow/20 bg-purple-glow/5 p-6 rounded-xl flex flex-col items-center w-full max-w-[200px] z-10 shadow-[0_0_15px_rgba(168,85,247,0.05)]"
          >
            <Server className="w-8 h-8 text-purple-glow mb-4" />
            <span className="text-sm font-bold text-white mb-1">FastAPI Backend</span>
            <span className="text-[10px] text-slate-500 font-mono text-center">Docker &bull; Render</span>
          </motion.div>

          <div className="hidden md:block w-8 h-[1px] bg-white/10 relative">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t border-r border-white/20 rotate-45"></div>
          </div>
          <div className="md:hidden h-8 w-[1px] bg-white/10 relative"></div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="border border-white/5 bg-white/2 p-6 rounded-xl flex flex-col items-center w-full max-w-[200px] z-10"
          >
            <Cloud className="w-8 h-8 text-cyan-glow mb-4" />
            <span className="text-sm font-bold text-white mb-1">AWS Cloud</span>
            <span className="text-[10px] text-slate-500 font-mono text-center">EC2 &bull; Terraform</span>
          </motion.div>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          <div className="border border-white/5 bg-slate-950/40 p-5 rounded-lg flex items-center gap-4">
            <Workflow className="w-5 h-5 text-slate-400" />
            <div>
              <div className="text-xs font-bold text-white mb-0.5">Jenkins CI/CD</div>
              <div className="text-[10px] text-slate-500">Automated Pipeline</div>
            </div>
          </div>
          <div className="border border-white/5 bg-slate-950/40 p-5 rounded-lg flex items-center gap-4">
            <div className="w-5 h-5 flex items-center justify-center font-bold text-slate-400 font-mono text-xs border border-slate-500/30 rounded-sm">K8s</div>
            <div>
              <div className="text-xs font-bold text-white mb-0.5">Kubernetes</div>
              <div className="text-[10px] text-slate-500">Cluster Orchestration</div>
            </div>
          </div>
          <div className="border border-white/5 bg-slate-950/40 p-5 rounded-lg flex items-center gap-4">
            <Monitor className="w-5 h-5 text-slate-400" />
            <div>
              <div className="text-xs font-bold text-white mb-0.5">Grafana</div>
              <div className="text-[10px] text-slate-500">Prometheus Telemetry</div>
            </div>
          </div>
        </div>

      </section>

      {/* --- HOW IT WORKS (FLOWCHART SECTION) --- */}
      <section id="how-it-works" className="relative max-w-7xl mx-auto px-6 py-24 border-t border-white/5 z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono text-purple-glow uppercase tracking-widest font-bold mb-3 block">Process Flow</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white">The Inspection Pipeline</h2>
          <p className="text-slate-400 mt-4">
            Follow the flow of data through our visual processing and similarity scoring algorithms.
          </p>
        </div>

        {/* Step-by-step workflow flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="group border border-white/5 bg-white/2 hover:bg-white/5 hover:border-white/10 p-6 rounded-xl transition-all relative flex flex-col"
            >
              <div className="absolute top-4 right-4 font-mono text-slate-600 text-xs group-hover:text-cyan-glow font-bold">
                0{idx + 1}
              </div>
              <div className="w-10 h-10 rounded-lg bg-dark-deep border border-white/5 flex items-center justify-center mb-6">
                {step.icon}
              </div>
              <h3 className="text-white font-bold text-base mb-3">{step.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed flex-1">{step.desc}</p>
            </motion.div>
          ))}
        </div>

      </section>

      {/* --- FEATURES GRID SECTION --- */}
      <section id="features" className="relative max-w-7xl mx-auto px-6 py-24 border-t border-white/5 z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono text-cyan-glow uppercase tracking-widest font-bold mb-3 block">Capabilities</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Real System Features</h2>
          <p className="text-slate-400 mt-4 text-sm max-w-xl mx-auto">
            These features describe the core modules implemented within our research code and PyTorch algorithms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div key={idx} className="border border-white/5 bg-white/2 p-6 rounded-xl flex flex-col hover:border-white/10 transition-colors">
              <div className="mb-4">
                {feature.icon}
              </div>
              <h3 className="text-white font-bold text-base mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

      </section>

      {/* --- APPLICATIONS SECTION --- */}
      <section id="applications" className="relative max-w-7xl mx-auto px-6 py-24 border-t border-white/5 z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono text-purple-glow uppercase tracking-widest font-bold mb-3 block">Use Cases</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Realistic Defect Scenarios</h2>
          <p className="text-slate-400 mt-4 text-sm max-w-xl mx-auto">
            Demonstrating baseline CLIP comparisons in laboratory inspections and production validation settings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {applications.map((app, idx) => (
            <div key={idx} className="border border-white/5 bg-white/2 hover:bg-white/5 p-6 rounded-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <h3 className="text-white font-bold text-lg mb-3">{app.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-6 flex-1">{app.context}</p>
              <div className="mt-auto border-t border-white/5 pt-3">
                <span className="text-[10px] font-mono text-cyan-glow uppercase font-semibold">{app.dataset}</span>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* --- FUTURE SCOPE SECTION --- */}
      <section id="about" className="relative max-w-7xl mx-auto px-6 py-24 border-t border-white/5 z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono text-cyan-glow uppercase tracking-widest font-bold mb-3 block">Roadmap</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Honest Future Scope</h2>
          <p className="text-slate-400 mt-4 text-sm">
            These features list our ongoing developments and target goals, representing future work rather than finished modules.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {futureScopes.map((scope, idx) => (
            <div key={idx} className="border border-white/5 bg-slate-950/40 p-6 rounded-xl flex items-start gap-4">
              <div className="p-2 rounded bg-white/2 border border-white/5">
                {scope.icon}
              </div>
              <div>
                <h3 className="text-white font-bold text-sm mb-1.5">{scope.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{scope.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* --- FOOTER --- */}
      <footer className="relative border-t border-white/5 bg-dark-deep py-12 z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <span className="font-mono text-white font-bold mb-2">VisionInspect AI</span>
            <p className="text-slate-500 text-xs max-w-sm">
              An academic reference-based inspection system leveraging CLIP cosine patch embeddings for zero-shot defect inspection.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end text-center md:text-right gap-2">
            <div className="flex items-center gap-4 text-slate-400">
              <a href="https://github.com" target="_blank" className="hover:text-white flex items-center gap-1.5 text-xs font-mono">
                <Globe className="w-3.5 h-3.5" />
                GitHub Repository
              </a>
            </div>
            <div className="text-[10px] text-slate-600 font-mono">
              Tech Stack: PyTorch • CLIP • FastAPI • React • Docker • Kubernetes • AWS • Terraform
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
