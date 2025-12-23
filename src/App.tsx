import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LandingPage } from './components/LandingPage';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { DemoPage } from './components/DemoPage';
import { PropertyDetailsModal } from './components/tenant/PropertyDetailsModal';
import { BookingForm } from './components/tenant/BookingForm';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { OwnerDashboard } from './components/owner/OwnerDashboard';
import { TenantDashboard } from './components/tenant/TenantDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { supabase } from './lib/supabase';

// Property Details Page Component
const PropertyDetailsPage: React.FC<{ propertyId: string }> = ({ propertyId }) => {
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data, error } = await supabase
          .from('houses')
          .select('*')
          .eq('id', propertyId)
          .single();

        if (error) throw error;
        setProperty(data);
      } catch (error) {
        console.error('Error fetching property details:', error);
        setProperty({ id: propertyId, title: 'Propriété non trouvée' });
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-ci-orange-600 mb-4"></div>
          <p className="text-slate-600 font-medium">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PropertyDetailsModal
        house={property}
        onClose={() => window.history.back()}
      />
    </div>
  );
};

// Booking Form Page Component
const BookingFormPage: React.FC<{ houseId: string }> = ({ houseId }) => {
  const [house, setHouse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHouse = async () => {
      try {
        const { data, error } = await supabase
          .from('houses')
          .select('*')
          .eq('id', houseId)
          .single();

        if (error) throw error;
        setHouse(data);
      } catch (error) {
        console.error('Error fetching house details:', error);
        setHouse({ id: houseId, title: 'Propriété non trouvée' });
      } finally {
        setLoading(false);
      }
    };

    fetchHouse();
  }, [houseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-ci-orange-600 mb-4"></div>
          <p className="text-slate-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <BookingForm
      house={house}
      onBack={() => window.history.back()}
      onBookingSuccess={(_bookingId) => { }}
    />
  );
};


function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);

  return isLogin ? (
    <Login onToggleMode={() => setIsLogin(false)} />
  ) : (
    <Register onToggleMode={() => setIsLogin(true)} />
  );
}

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [showLanding, setShowLanding] = useState(true);
  const [forceLogin, setForceLogin] = useState(false);

  // Handle URL-based routing first
  const currentPath = window.location.pathname;
  const urlParams = new URLSearchParams(window.location.search);
  const viewParam = urlParams.get('view');
  const loginParam = urlParams.get('login');

  // Handle view parameter logic
  useEffect(() => {
    if (viewParam === 'public' && user && profile) {
      // If user wants to view public site, show landing page
      setShowLanding(true);
      setForceLogin(false);
    } else if (!user || !profile) {
      // If no user, check if we should force login (from property details)
      const returnToProperty = sessionStorage.getItem('returnToProperty');
      if (returnToProperty) {
        setForceLogin(true);
        setShowLanding(false);
        // Don't clear the flag here, let Login component handle it
      } else if (loginParam === 'true') {
        // Force login screen when login=true parameter is present
        setForceLogin(true);
        setShowLanding(false);
      } else if (!forceLogin) {
        // Only set showLanding to true if forceLogin is not already true
        // If forceLogin is true, it means user clicked "Get Started" and we should keep showLanding false
        setShowLanding(true);
        setForceLogin(false);
      }
    } else {
      // User is logged in, show their dashboard
      setShowLanding(false);
      setForceLogin(false);
    }
  }, [user, profile, viewParam, forceLogin, loginParam]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mb-4"></div>
          <p className="text-slate-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  // Handle URL-based routing FIRST - this should take priority over authentication logic
  if (currentPath === '/demo') {
    return <DemoPage />;
  }

  // Handle About and Contact pages - show for all users unless they specifically want to go to dashboard
  if (currentPath === '/about' || currentPath === '/contact') {
    // If user is authenticated and wants to view dashboard (not public pages), redirect to dashboard
    if (user && profile && viewParam === 'dashboard') {
      return <div></div>; // This will fall through to dashboard logic below
    }

    // If authentication is forced, don't show these pages - go to login
    if (forceLogin) {
      return <div></div>; // This will fall through to authentication logic below
    }

    // If user is not authenticated and wants to login, don't show these pages
    if (!showLanding && !user) {
      return <div></div>; // This will fall through to authentication logic below
    }

    // Show the public pages for all users
    if (currentPath === '/about') {
      return <AboutPage />;
    }
    if (currentPath === '/contact') {
      return <ContactPage />;
    }
  }

  // Handle property details page
  const propertyMatch = currentPath.match(/^\/property\/([a-zA-Z0-9-]+)$/);
  if (propertyMatch) {
    const propertyId = propertyMatch[1];
    return <PropertyDetailsPage propertyId={propertyId} />;
  }

  // Handle booking form page
  const bookingMatch = currentPath.match(/^\/booking\/([a-zA-Z0-9-]+)$/);
  if (bookingMatch) {
    const houseId = bookingMatch[1];
    return <BookingFormPage houseId={houseId} />;
  }

  // Suppression des pages de paiement (plus de flux paiement côté utilisateur)

  // Authentication logic - this should execute AFTER URL routing
  if (!user || !profile) {
    if (showLanding && !forceLogin) {
      return <LandingPage />;
    }
    return <AuthScreen />;
  }

  // If user is logged in but viewing public site, show landing page with option to go back
  if (showLanding && user && profile) {
    return <LandingPage showBackToDashboard />;
  }

  // Show dashboards for authenticated users
  if (profile.role === 'admin') {
    return <AdminDashboard />;
  }

  if (profile.role === 'owner') {
    return <OwnerDashboard />;
  }

  return <TenantDashboard />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
