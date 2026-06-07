import React from 'react';
import { ShieldAlert, Compass } from 'lucide-react';

export default function Navbar({ currentPage, onChangePage, onScrollToSection }) {
  
  const handleLinkClick = (e, sectionId) => {
    e.preventDefault();
    if (currentPage !== 'landing') {
      onChangePage('landing');
      // Wait a moment for page rendering to complete, then scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-dark-deep/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => onChangePage('landing')}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-glow to-purple-glow flex items-center justify-center shadow-[0_0_15px_rgba(0,242,254,0.3)] group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-4 h-4 text-dark-deep font-bold" />
          </div>
          <span className="font-mono text-lg font-bold tracking-tight text-white group-hover:text-cyan-glow transition-colors">
            VisionInspect<span className="text-cyan-glow font-normal">.AI</span>
          </span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a 
            href="#hero" 
            onClick={(e) => handleLinkClick(e, 'hero')}
            className="hover:text-white transition-colors"
          >
            Home
          </a>
          <a 
            href="#architecture" 
            onClick={(e) => handleLinkClick(e, 'architecture')}
            className="hover:text-white transition-colors"
          >
            Architecture
          </a>
          <a 
            href="#how-it-works" 
            onClick={(e) => handleLinkClick(e, 'how-it-works')}
            className="hover:text-white transition-colors"
          >
            How It Works
          </a>
          <a 
            href="#features" 
            onClick={(e) => handleLinkClick(e, 'features')}
            className="hover:text-white transition-colors"
          >
            Features
          </a>
          <a 
            href="#applications" 
            onClick={(e) => handleLinkClick(e, 'applications')}
            className="hover:text-white transition-colors"
          >
            Applications
          </a>
          <a 
            href="#about" 
            onClick={(e) => handleLinkClick(e, 'about')}
            className="hover:text-white transition-colors"
          >
            About
          </a>
        </div>

        {/* CTA Button */}
        <div>
          {currentPage === 'landing' ? (
            <button
              onClick={() => onChangePage('playground')}
              className="relative px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-dark-deep bg-cyan-glow rounded-md overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,242,254,0.5)] cursor-pointer active:scale-95"
            >
              Launch Playground
            </button>
          ) : (
            <button
              onClick={() => onChangePage('landing')}
              className="flex items-center gap-2 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-md text-xs font-mono text-white transition-all cursor-pointer active:scale-95"
            >
              <Compass className="w-3.5 h-3.5" />
              Return Home
            </button>
          )}
        </div>

      </div>
    </nav>
  );
}
