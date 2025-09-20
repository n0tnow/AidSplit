import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Homepage from './components/Homepage';
import FeaturePage from './components/FeaturePage';
import DisasterReliefPage from './components/DisasterReliefPage';
import PayrollSystemPage from './components/PayrollSystemPage';
import NFTReceiptsPage from './components/NFTReceiptsPage';
import './App.css';

function App() {
  // Initialize with hash or default to 'home'
  const [currentView, setCurrentView] = useState<string>(() => {
    const hash = window.location.hash.slice(1); // Remove #
    return hash || 'home';
  });

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      setCurrentView(hash || 'home');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (view: string) => {
    window.location.hash = view;
    setCurrentView(view);
  };

  const handleBack = () => {
    window.location.hash = 'home';
    setCurrentView('home');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <Homepage onNavigate={handleNavigate} />;
      case 'disaster-relief':
        return <DisasterReliefPage onBack={handleBack} />;
      case 'payroll-system':
        return <PayrollSystemPage onBack={handleBack} />;
      case 'nft-receipts':
        return <NFTReceiptsPage onBack={handleBack} />;
      default:
        return <FeaturePage featureId={currentView} onBack={handleBack} />;
    }
  };

  return (
    <div className="App">
      <Header currentView={currentView} onNavigate={handleNavigate} />
      <main className="main-content">
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;