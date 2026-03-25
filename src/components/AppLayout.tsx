import React, { useEffect } from 'react';
import { useStore } from '../lib/store';
import { getFields } from '../lib/services';

import Header from './Header';
import Hero from './Hero';
import Principles from './Principles';
import StatsSection from './StatsSection';
import FieldDashboard from './FieldDashboard';
import PublicArtifacts from './PublicArtifacts';
import GovernanceSection from './GovernanceSection';
import FieldDetail from './FieldDetail';
import ArtifactDetail from './ArtifactDetail';
import CreateArtifact from './CreateArtifact';
import CreateFieldModal from './CreateFieldModal';
import Footer from './Footer';

const AppLayout: React.FC = () => {
  const { currentView, setFields } = useStore();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  useEffect(() => {
    getFields()
      .then(setFields)
      .catch(err => console.error('INIT FIELD LOAD ERROR:', err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />
      <CreateFieldModal />

      {currentView === 'home' && (
        <>
          <Hero />
          <StatsSection />
          <FieldDashboard />
          <PublicArtifacts />
          <Principles />
          <GovernanceSection />
        </>
      )}

      {currentView === 'field-detail' && <FieldDetail />}
      {currentView === 'artifact-detail' && <ArtifactDetail />}
      {currentView === 'create-artifact' && <CreateArtifact />}

      <Footer />
    </div>
  );
};

export default AppLayout;