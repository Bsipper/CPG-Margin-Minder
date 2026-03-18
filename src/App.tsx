import React, { useState, useEffect } from 'react';
import { ScenarioProvider } from './context/ScenarioContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { LandingPage } from './features/Landing/LandingPage';
import { Login } from './features/Auth/Login';
import { SignUp } from './features/Auth/SignUp';
import { TermsOfUse } from './features/Auth/TermsOfUse';
import { CompanyDashboard } from './features/Company/CompanyDashboard';
import { SuperAdminDashboard } from './features/SuperAdmin/SuperAdminDashboard';
import { MockDB } from './api/mockDb';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<'none' | 'login' | 'signup'>('none');
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);

  if (isLoading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-background)' }}>Loading...</div>;
  }

  if (!user) {
    if (authMode === 'login') {
      return <Login onBack={() => setAuthMode('none')} onSignUpClick={() => setAuthMode('signup')} />;
    }
    if (authMode === 'signup') {
      return <SignUp onBack={() => setAuthMode('none')} onLoginClick={() => setAuthMode('login')} />;
    }
    return <LandingPage onLoginClick={() => setAuthMode('login')} onSignUpClick={() => setAuthMode('signup')} />;
  }

  if (user.hasAcceptedTerms === false || user.hasAcceptedTerms === undefined) {
    return <TermsOfUse />;
  }

  // If product is selected, show Product Workspace
  if (activeProductId) {
    return (
      <ScenarioProvider productId={activeProductId}>
        <MainLayout 
            onBackToProducts={() => setActiveProductId(null)} 
            onGoToAdmin={user.role === 'super_admin' ? () => { setActiveProductId(null); setActiveCompanyId(null); } : undefined}
        />
      </ScenarioProvider>
    );
  }

  // If Super Admin has NOT selected a company, show Super Admin Dashboard
  if (user.role === 'super_admin' && !activeCompanyId) {
     return <SuperAdminDashboard onSelectCompany={setActiveCompanyId} />;
  }

  // Show Company Dashboard (Product List)
  return (
    <CompanyDashboard 
        overrideCompanyId={activeCompanyId || user.companyId} 
        onSelectProduct={setActiveProductId} 
        onBack={user.role === 'super_admin' ? () => setActiveCompanyId(null) : undefined}
    />
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
