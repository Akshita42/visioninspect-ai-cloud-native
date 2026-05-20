import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Playground from './components/Playground';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing' or 'playground'

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-dark-deep text-slate-100 flex flex-col">
      <Navbar 
        currentPage={currentPage} 
        onChangePage={handlePageChange} 
      />
      {currentPage === 'landing' ? (
        <LandingPage onLaunchPlayground={() => handlePageChange('playground')} />
      ) : (
        <Playground />
      )}
    </div>
  );
}
