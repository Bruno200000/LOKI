import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Home, LogOut, ExternalLink, User, X, Menu, Calendar, Search, Star, MapPin } from 'lucide-react';
import { HouseBrowser } from './HouseBrowser';
import { BookingManager } from './BookingManager';
import { ProfileEdit } from '../ProfileEdit';
import { Footer } from '../Footer';
import { supabase } from '../../lib/supabase';

type View = 'browse' | 'bookings' | 'profile';

// Configuration object for dynamic content
const DASHBOARD_CONFIG = {
  brand: {
    name: 'LOKI',
    tagline: 'Locataire'
  },
  welcome: {
    title: "Trouvez votre prochain chez-vous",
    subtitle: "Explorez nos propriétés disponibles et réservez en quelques clics"
  },
  stats: {
    properties: {
      count: "500+",
      label: "Propriétés Disponibles",
      description: "Dans toute la Côte d'Ivoire"
    },
    rating: {
      score: "4.8",
      label: "Note Moyenne",
      description: "Basée sur 1000+ avis"
    },
    support: {
      availability: "24/7",
      label: "Support"
    },
    bookings: {
      count: "0",
      label: "Réservations",
      description: "Vos réservations actives"
    }
  },
  navigation: {
    browse: "Parcourir",
    bookings: "Mes réservations",
    profile: "Mon profil",
    logout: "Déconnexion",
    viewSite: "Voir le site",
    browseMobile: "Parcourir les biens"
  },
  mobile: {
    dashboardTitle: "Tableau de bord"
  }
};

export const TenantDashboard: React.FC = () => {
  const { signOut, user, profile } = useAuth();
  const [view, setView] = useState<View>('browse');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userBookingsCount, setUserBookingsCount] = useState<number>(0);
  const [availablePropertiesCount, setAvailablePropertiesCount] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(4.8);

  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('id')
          .eq('tenant_id', user.id)
          .in('status', ['pending', 'confirmed']);

        if (error) {
          console.error('Error fetching bookings:', error);
          return;
        }

        setUserBookingsCount(data?.length || 0);
      } catch (error) {
        console.error('Error fetching user bookings:', error);
      }
    };

    fetchUserBookings();
  }, [user?.id]);

  useEffect(() => {
    const fetchAvailableProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('houses')
          .select('id')
          .eq('status', 'available');

        if (error) {
          console.error('Error fetching available properties:', error);
          return;
        }

        setAvailablePropertiesCount(data?.length || 0);
      } catch (error) {
        console.error('Error fetching available properties:', error);
      }
    };

    fetchAvailableProperties();
  }, []);

  useEffect(() => {
    const calculateAverageRating = async () => {
      try {
        // For now, we'll use a mock calculation or fetch from a ratings table if it exists
        // You can replace this with actual ratings data from your database
        const { data, error } = await supabase
          .from('bookings')
          .select('id, created_at')
          .eq('status', 'confirmed')
          .limit(100); // Get recent bookings for rating calculation

        if (error) {
          console.error('Error calculating rating:', error);
          return;
        }

        // For demo purposes, we'll use a calculated rating based on booking success
        // In a real app, you'd have a separate ratings/reviews table
        const totalBookings = data?.length || 0;
        if (totalBookings > 0) {
          // Simulate a rating based on booking volume (this is just an example)
          const calculatedRating = Math.min(5.0, 4.2 + (totalBookings / 100) * 0.3);
          setAverageRating(Math.round(calculatedRating * 10) / 10);
        }
      } catch (error) {
        console.error('Error calculating average rating:', error);
      }
    };

    calculateAverageRating();
  }, []);

  const handleViewSite = () => {
    // Redirect to the public site (LandingPage)
    window.location.href = '/?view=public';
  };

  if (view === 'profile') {
    return <ProfileEdit onBack={() => setView('browse')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 relative overflow-hidden">
      {/* Enhanced Background animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-200/25 to-indigo-200/25 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-indigo-200/25 to-purple-200/25 rounded-full blur-3xl opacity-40 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-200/15 to-blue-200/15 rounded-full blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl opacity-35 animate-pulse" style={{animationDelay: '1.5s'}}></div>
      </div>

      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                type="button"
                className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100/80 focus:outline-none mr-2 transition-all duration-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-all duration-200 group">
                <div className="w-10 h-10 bg-gradient-to-br from-ci-orange-600 to-ci-orange-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-slate-900 group-hover:text-ci-orange-600 transition-colors duration-200">{DASHBOARD_CONFIG.brand.name}</h1>
                  <p className="text-xs text-slate-600">{DASHBOARD_CONFIG.brand.tagline}</p>
                </div>
              </a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setView('browse')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                    view === 'browse'
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600 border border-transparent hover:border-blue-200'
                  }`}
                >
                  <Search className="w-4 h-4 inline mr-2" />
                  {DASHBOARD_CONFIG.navigation.browse}
                </button>
                <button
                  onClick={() => setView('bookings')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                    view === 'bookings'
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600 border border-transparent hover:border-blue-200'
                  }`}
                >
                  <Calendar className="w-4 h-4 inline mr-2" />
                  {DASHBOARD_CONFIG.navigation.bookings}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleViewSite}
                  className="p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-all duration-200 hover:scale-110"
                  title="Voir le site"
                >
                  <ExternalLink className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setView('profile')}
                  className="p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-all duration-200 hover:scale-110"
                  title="Mon profil"
                >
                  <User className="w-5 h-5" />
                </button>

                <button
                  onClick={signOut}
                  className="p-2 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 hover:scale-110"
                  title="Déconnexion"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Menu mobile */}
            <div className={`md:hidden fixed inset-0 bg-white z-40 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
              <div className="px-4 pt-2 pb-3 space-y-1 sm:px-3">
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-ci-orange-600 rounded-lg flex items-center justify-center">
                      <Home className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-slate-800">{DASHBOARD_CONFIG.mobile.dashboardTitle}</p>
                      <p className="text-xs text-slate-500">{DASHBOARD_CONFIG.brand.tagline}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-md text-slate-700 hover:bg-slate-100"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setView('browse');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                      view === 'browse' ? 'bg-ci-orange-50 text-ci-orange-700' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Home className="mr-3 h-5 w-5" />
                    {DASHBOARD_CONFIG.navigation.browseMobile}
                  </button>
                  
                  <button
                    onClick={() => {
                      setView('bookings');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                      view === 'bookings' ? 'bg-ci-orange-50 text-ci-orange-700' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Calendar className="mr-3 h-5 w-5" />
                    {DASHBOARD_CONFIG.navigation.bookings}
                  </button>
                  
                  <button
                    onClick={() => {
                      setView('profile');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
                  >
                    <User className="mr-3 h-5 w-5" />
                    {DASHBOARD_CONFIG.navigation.profile}
                  </button>
                  
                  <button
                    onClick={handleViewSite}
                    className="w-full flex items-center px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
                  >
                    <ExternalLink className="mr-3 h-5 w-5" />
                    {DASHBOARD_CONFIG.navigation.viewSite}
                  </button>
                  
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    {DASHBOARD_CONFIG.navigation.logout}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-2xl shadow-blue-500/25 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-20"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    {DASHBOARD_CONFIG.welcome.title}
                    {user && profile?.full_name && (
                      <span className="block text-3xl text-blue-100 mt-2">
                        Bienvenue, {profile.full_name}!
                      </span>
                    )}
                  </h1>
                  <p className="text-blue-100 text-lg opacity-90">{DASHBOARD_CONFIG.welcome.subtitle}</p>
                </div>
                <div className="hidden md:flex items-center space-x-8">
                  <div className="text-center group">
                    <div className="text-3xl font-bold mb-1 group-hover:scale-110 transition-transform duration-200">{availablePropertiesCount}</div>
                    <div className="text-sm text-blue-100 opacity-80">{DASHBOARD_CONFIG.stats.properties.label}</div>
                  </div>
                  <div className="text-center group">
                    <div className="text-3xl font-bold mb-1 group-hover:scale-110 transition-transform duration-200">{averageRating}</div>
                    <div className="text-sm text-blue-100 opacity-80">{DASHBOARD_CONFIG.stats.rating.label}</div>
                  </div>
                  <div className="text-center group">
                    <div className="text-3xl font-bold mb-1 group-hover:scale-110 transition-transform duration-200">{DASHBOARD_CONFIG.stats.support.availability}</div>
                    <div className="text-sm text-blue-100 opacity-80">{DASHBOARD_CONFIG.stats.support.label}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-slate-200/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium mb-2">{DASHBOARD_CONFIG.stats.properties.label}</p>
                  <p className="text-4xl font-bold text-slate-900 mb-1">{availablePropertiesCount}</p>
                  <p className="text-xs text-slate-500">{DASHBOARD_CONFIG.stats.properties.description}</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-slate-200/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium mb-2">{DASHBOARD_CONFIG.stats.rating.label}</p>
                  <p className="text-4xl font-bold text-slate-900 mb-1">{averageRating}</p>
                  <p className="text-xs text-slate-500">{DASHBOARD_CONFIG.stats.rating.description}</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Star className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-slate-200/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium mb-2">{DASHBOARD_CONFIG.stats.bookings.label}</p>
                  <p className="text-4xl font-bold text-slate-900 mb-1">{userBookingsCount}</p>
                  <p className="text-xs text-slate-500">{DASHBOARD_CONFIG.stats.bookings.description}</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200/50 overflow-hidden hover:shadow-3xl transition-shadow duration-300">
          <div className="p-8">
            {view === 'browse' && <HouseBrowser />}
            {view === 'bookings' && <BookingManager />}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
