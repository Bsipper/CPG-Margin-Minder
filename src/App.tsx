import React, { useState, useEffect } from 'react';
import { ScenarioProvider } from './context/ScenarioContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { LandingPage } from './features/Landing/LandingPage';
import { Login } from './features/Auth/Login';
import { TermsOfUse } from './features/Auth/TermsOfUse';
import { CompanyDashboard } from './features/Company/CompanyDashboard';
import { SuperAdminDashboard } from './features/SuperAdmin/SuperAdminDashboard';
import { MockDB } from './api/mockDb';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);

  useEffect(() => {
    // Both admin and super_admin should auto-select a product to land on the dashboard
    if (user && (user.role === 'admin' || user.role === 'super_admin') && !hasAutoSelected) {
      // For super admin, we can just grab the very first product in the DB to show the dashboard
      const companyIdToUse = user.role === 'super_admin' ? '' : user.companyId;
      const userProducts = MockDB.getProducts(companyIdToUse);
      if (userProducts.length > 0) {
        setActiveProductId(userProducts[0].id);
      }
      setHasAutoSelected(true);
    }
  }, [user, hasAutoSelected]);

  if (isLoading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-background)' }}>Loading...</div>;
  }

  if (!user) {
    if (showLogin) {
      return <Login onBack={() => setShowLogin(false)} />;
    }
    return <LandingPage onLoginClick={() => setShowLogin(true)} />;
  }

  if (user.hasAcceptedTerms === false || user.hasAcceptedTerms === undefined) {
    return <TermsOfUse />;
  }

  // If no product is selected, show the Company Portfolio (which now acts as the Client selector for Super Admin)
  if (!activeProductId) {
    return <CompanyDashboard onSelectProduct={setActiveProductId} />;
  }

  // Both Super Admin and regular users now use Main Layout
  return (
    <ScenarioProvider productId={activeProductId}>
      <MainLayout onBackToProducts={() => setActiveProductId(null)} />
    </ScenarioProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
