import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, House, Booking } from '../../lib/supabase';
import { 
  Plus, 
  Home, 
  Calendar, 
  DollarSign, 
  LogOut, 
  CreditCard as Edit, 
  Trash2, 
  Eye, 
  ExternalLink, 
  Camera, 
  Play, 
  TrendingUp, 
  CheckCircle, 
  Clock,
  User,
  LayoutDashboard,
  X
} from 'lucide-react';
import { HouseForm } from './HouseForm';
import { HouseDetails } from './HouseDetails';
import { Footer } from '../Footer';

export const OwnerDashboard: React.FC = () => {
  const { profile, signOut } = useAuth();
  const [houses, setHouses] = useState<House[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHouseForm, setShowHouseForm] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [viewingHouse, setViewingHouse] = useState<House | null>(null);
  type DashboardView = 'dashboard' | 'profile';
  const [currentView, setCurrentView] = useState<DashboardView>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // State for card interactions
  const [selectedCardFilter, setSelectedCardFilter] = useState<string | null>(null);

  // State for booking management
  const [showAllBookings, setShowAllBookings] = useState(false);

  // State for calendar
  const [showCalendar, setShowCalendar] = useState(false);

  // Card interaction handlers
  const handleCardClick = (filterType: string) => {
    setSelectedCardFilter(selectedCardFilter === filterType ? null : filterType);
  };

  // Filter functions based on card selection
  const getFilteredHouses = () => {
    if (!selectedCardFilter) return houses;

    switch (selectedCardFilter) {
      case 'available':
        return houses.filter(h => h.status === 'available');
      case 'occupied':
        return houses.filter(h => h.status === 'taken');
      default:
        return houses;
    }
  };

  const getFilteredBookings = () => {
    if (!selectedCardFilter) return bookings;

    switch (selectedCardFilter) {
      case 'active':
        return bookings.filter(b => b.status === 'confirmed');
      case 'pending':
        return bookings.filter(b => b.status === 'pending');
      case 'total':
        return bookings;
      default:
        return bookings;
    }
  };

  const handleContactTenant = (booking: Booking) => {
    // This would typically open a messaging interface or redirect to contact page
    alert(`Contacter le locataire pour la réservation #${booking.id}`);
  };

  const handleViewAllBookings = () => {
    setShowAllBookings(true);
  };

  const handleShowCalendar = () => {
    setShowCalendar(true);
  };

  useEffect(() => {
    if (profile?.id) {
      fetchHouses();
      fetchBookings();
    }
  }, [profile?.id]);

  const fetchHouses = async () => {
    if (!profile?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('houses')
        .select('*')
        .eq('owner_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHouses(data || []);
    } catch (error) {
      console.error('Error fetching houses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    if (!profile?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*, houses(*)')
        .eq('house_owner_id', profile.id)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHouse = async (houseId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette maison ?')) return;

    try {
      const { error } = await supabase.from('houses').delete().eq('id', houseId);

      if (error) throw error;
      await fetchHouses();
    } catch (error) {
      console.error('Error deleting house:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleEditHouse = (house: House) => {
    setSelectedHouse(house);
    setShowHouseForm(true);
  };

  const handleFormClose = () => {
    setShowHouseForm(false);
    setSelectedHouse(null);
    fetchHouses();
  };

  const handleViewSite = () => {
    // Redirect to the public site (LandingPage)
    window.location.href = '/?view=public';
  };

  const stats = {
    totalHouses: houses.length,
    availableHouses: houses.filter((h) => h.status === 'available').length,
    occupiedHouses: houses.filter((h) => h.status === 'taken').length,
    totalBookings: bookings.length,
    activeBookings: bookings.filter((b) => b.status === 'confirmed').length,
    pendingBookings: bookings.filter((b) => b.status === 'pending').length,
    completedBookings: bookings.filter((b) => b.status === 'cancelled').length,
    totalRevenue: bookings
      .filter((b) => b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.commission_fee || 0), 0),
    monthlyRevenue: bookings
      .filter((b) => {
        if (b.status !== 'confirmed') return false;
        const bookingDate = new Date(b.created_at);
        const now = new Date();
        return bookingDate.getMonth() === now.getMonth() &&
               bookingDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, b) => sum + (b.commission_fee || 0), 0),
    occupancyRate: houses.length > 0 ? Math.round((houses.filter(h => h.status === 'taken').length / houses.length) * 100) : 0,
  };

  if (showHouseForm) {
    return <HouseForm house={selectedHouse} onClose={handleFormClose} />;
  }

  if (viewingHouse) {
    return <HouseDetails house={viewingHouse} onClose={() => setViewingHouse(null)} />;
  }

  if (showAllBookings) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Toutes les réservations</h2>
              <button
                onClick={() => setShowAllBookings(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {getFilteredBookings().length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                Aucune réservation trouvée
              </div>
            ) : (
              <div className="grid gap-4">
                {getFilteredBookings().map((booking) => {
                  const house = houses.find(h => h.id === booking.house_id);
                  return (
                    <div
                      key={booking.id}
                      className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition cursor-pointer"
                      onClick={() => handleContactTenant(booking)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-4 h-4 rounded-full ${
                            booking.status === 'confirmed' ? 'bg-green-500' :
                            booking.status === 'pending' ? 'bg-yellow-500' :
                            booking.status === 'cancelled' ? 'bg-red-500' :
                            'bg-blue-500'
                          }`}></div>
                          <div>
                            <p className="font-medium text-slate-900">{house?.title || 'Propriété inconnue'}</p>
                            <p className="text-sm text-slate-600">
                              {new Date(booking.created_at).toLocaleDateString()} •
                              {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {booking.status === 'confirmed' ? 'Confirmée' :
                             booking.status === 'pending' ? 'En attente' :
                             booking.status === 'cancelled' ? 'Annulée' :
                             booking.status === 'active' ? 'Active' :
                             booking.status === 'completed' ? 'Terminée' :
                             booking.status}
                          </span>
                          {booking.commission_fee && (
                            <span className="text-sm font-medium text-slate-700">
                              {booking.commission_fee.toLocaleString()} FCFA
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (showCalendar) {
    // Group bookings by date for calendar view
    const bookingsByDate = getFilteredBookings().reduce((acc, booking) => {
      const date = new Date(booking.start_date).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(booking);
      return acc;
    }, {} as Record<string, Booking[]>);

    const sortedDates = Object.keys(bookingsByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Calendrier des réservations</h2>
              <button
                onClick={() => setShowCalendar(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {sortedDates.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                Aucune réservation à afficher dans le calendrier
              </div>
            ) : (
              <div className="space-y-6">
                {sortedDates.map((date) => {
                  const bookingsForDate = bookingsByDate[date];
                  const dateObj = new Date(date);

                  return (
                    <div key={date} className="border border-slate-200 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-ci-orange-600" />
                        {dateObj.toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h3>

                      <div className="space-y-3">
                        {bookingsForDate.map((booking) => {
                          const house = houses.find(h => h.id === booking.house_id);
                          return (
                            <div
                              key={booking.id}
                              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                              onClick={() => handleContactTenant(booking)}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${
                                  booking.status === 'confirmed' ? 'bg-green-500' :
                                  booking.status === 'pending' ? 'bg-yellow-500' :
                                  booking.status === 'cancelled' ? 'bg-red-500' :
                                  'bg-blue-500'
                                }`}></div>
                                <div>
                                  <p className="font-medium text-slate-900">{house?.title || 'Propriété inconnue'}</p>
                                  <p className="text-sm text-slate-600">
                                    {new Date(booking.start_date).toLocaleTimeString('fr-FR', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })} - {new Date(booking.end_date).toLocaleTimeString('fr-FR', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {booking.status === 'confirmed' ? 'Confirmée' :
                                   booking.status === 'pending' ? 'En attente' :
                                   booking.status === 'cancelled' ? 'Annulée' :
                                   booking.status === 'active' ? 'Active' :
                                   booking.status === 'completed' ? 'Terminée' :
                                   booking.status}
                                </span>

                                {booking.commission_fee && (
                                  <span className="text-sm font-medium text-slate-700">
                                    {booking.commission_fee.toLocaleString()} FCFA
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative">
      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} md:hidden`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Mobile Sidebar */}
      <div 
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:hidden`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-ci-orange-600 rounded-lg flex items-center justify-center">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">LOKI</h1>
                  <p className="text-xs text-slate-600">Propriétaire</p>
                </div>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-md hover:bg-slate-100"
                aria-label="Fermer le menu"
              >
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            <button
              onClick={() => {
                setCurrentView('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${
                currentView === ('dashboard' as DashboardView) ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Tableau de bord
            </button>
            <button
              onClick={() => {
                setCurrentView('profile');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${
                currentView === ('profile' as DashboardView) ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <User className="w-5 h-5" />
              Mon profil
            </button>
            <button
              onClick={handleViewSite}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50"
            >
              <ExternalLink className="w-5 h-5" />
              Voir le site
            </button>
            <div className="pt-2 mt-2 border-t border-slate-100">
              <button
                onClick={signOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button 
                type="button" 
                className="md:hidden p-2 -ml-1 rounded-md text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ci-orange-500"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Ouvrir le menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity ml-2 md:ml-0">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-ci-orange-600 rounded-lg flex items-center justify-center">
                  <Home className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg md:text-xl font-bold text-slate-900">LOKI</h1>
                  <p className="text-xs text-slate-600">Propriétaire</p>
                </div>
              </a>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setCurrentView('profile' as DashboardView)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm font-medium ${
                  currentView === ('profile' as DashboardView) 
                    ? 'bg-slate-100 text-slate-900' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Edit className="w-4 h-4" />
                Modifier profil
              </button>
              <button
                onClick={handleViewSite}
                className="flex items-center gap-2 px-4 py-2 bg-ci-orange-100 hover:bg-ci-orange-200 text-ci-orange-700 rounded-lg transition text-sm font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Voir le site
              </button>
              <button
                onClick={signOut}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                title="Déconnexion"
                aria-label="Déconnexion"
              >
                <LogOut className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Background animations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-ci-green-200/20 to-ci-orange-200/20 rounded-full blur-3xl opacity-40 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-br from-ci-orange-200/20 to-yellow-200/20 rounded-full blur-3xl opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        {/* Welcome Section */}
        <div className="mb-8 relative z-10">
          <div className="bg-gradient-to-r from-ci-orange-600 to-ci-green-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Bienvenue, {profile?.full_name || 'Propriétaire'} !</h1>
                <p className="text-ci-orange-100 text-lg">Gérez vos propriétés et suivez vos performances</p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.totalHouses}</div>
                  <div className="text-sm text-ci-orange-100">Propriétés</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
                  <div className="text-sm text-ci-orange-100">Occupation</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()}</div>
                  <div className="text-sm text-ci-orange-100">FCFA</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative z-10">
          <div
            onClick={() => handleCardClick('total')}
            className={`bg-white p-6 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer ${
              selectedCardFilter === 'total' ? 'ring-2 ring-ci-orange-500 bg-ci-orange-50' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Total Maisons</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalHouses}</p>
                <p className="text-xs text-slate-500 mt-1">Propriétés enregistrées</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-ci-green-500 to-ci-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Home className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div
            onClick={() => handleCardClick('available')}
            className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 cursor-pointer transition-all duration-300 ${
              selectedCardFilter === 'available' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Disponibles</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.availableHouses}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div
            onClick={() => handleCardClick('occupied')}
            className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 cursor-pointer transition-all duration-300 ${
              selectedCardFilter === 'occupied' ? 'ring-2 ring-amber-500 bg-amber-50' : 'hover:shadow-lg'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Occupées</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.occupiedHouses}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div
            onClick={() => handleCardClick('occupancy')}
            className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 cursor-pointer transition-all duration-300 ${
              selectedCardFilter === 'occupancy' ? 'ring-2 ring-green-500 bg-green-50' : 'hover:shadow-lg'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Taux d'occupation</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.occupancyRate}%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div
            onClick={() => handleCardClick('total')}
            className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 cursor-pointer transition-all duration-300 ${
              selectedCardFilter === 'total' ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:shadow-lg'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Réservations</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalBookings}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div
            onClick={() => handleCardClick('active')}
            className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 cursor-pointer transition-all duration-300 ${
              selectedCardFilter === 'active' ? 'ring-2 ring-green-500 bg-green-50' : 'hover:shadow-lg'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Réservations Actives</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.activeBookings}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div
            onClick={() => handleCardClick('pending')}
            className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 cursor-pointer transition-all duration-300 ${
              selectedCardFilter === 'pending' ? 'ring-2 ring-yellow-500 bg-yellow-50' : 'hover:shadow-lg'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">En Attente</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.pendingBookings}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div
            onClick={() => handleCardClick('revenue')}
            className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 cursor-pointer transition-all duration-300 ${
              selectedCardFilter === 'revenue' ? 'ring-2 ring-emerald-500 bg-emerald-50' : 'hover:shadow-lg'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Revenus Totaux</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-slate-500">FCFA</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Réservations Récentes</h3>
            {loading ? (
              <div className="text-center py-8 text-slate-500">Chargement...</div>
            ) : getFilteredBookings().length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Aucune réservation pour le moment
              </div>
            ) : (
              <div className="space-y-4">
                {getFilteredBookings().slice(0, 5).map((booking) => {
                  const house = houses.find(h => h.id === booking.house_id);
                  return (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition cursor-pointer group"
                      onClick={() => handleContactTenant(booking)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            booking.status === 'confirmed' ? 'bg-green-500' :
                            booking.status === 'pending' ? 'bg-yellow-500' :
                            booking.status === 'cancelled' ? 'bg-red-500' :
                            'bg-blue-500'
                          }`}></div>
                          <div>
                            <p className="font-medium text-slate-900 group-hover:text-ci-orange-600 transition">
                              {house?.title || 'Propriété inconnue'}
                            </p>
                            <p className="text-sm text-slate-600">
                              {new Date(booking.created_at).toLocaleDateString()} • {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {booking.status === 'confirmed' ? 'Confirmée' :
                           booking.status === 'pending' ? 'En attente' :
                           booking.status === 'cancelled' ? 'Annulée' :
                           booking.status === 'active' ? 'Active' :
                           booking.status === 'completed' ? 'Terminée' :
                           booking.status}
                        </span>
                        {booking.commission_fee && (
                          <span className="text-sm font-medium text-slate-700">
                            {booking.commission_fee.toLocaleString()} FCFA
                          </span>
                        )}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1 hover:bg-white rounded">
                            <Eye className="w-4 h-4 text-slate-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {getFilteredBookings().length > 5 && (
                  <button
                    onClick={handleViewAllBookings}
                    className="w-full text-ci-orange-600 hover:text-ci-orange-700 font-medium py-2 text-sm hover:bg-ci-orange-50 rounded-lg transition"
                  >
                    Voir toutes les réservations ({getFilteredBookings().length}) →
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Actions Rapides</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowHouseForm(true)}
                className="flex flex-col items-center p-4 bg-ci-orange-50 hover:bg-ci-orange-100 rounded-lg transition"
              >
                <Plus className="w-8 h-8 text-ci-orange-600 mb-2" />
                <span className="text-sm font-medium text-slate-700">Ajouter Maison</span>
              </button>

              <button
                onClick={() => setCurrentView('profile')}
                className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
              >
                <Edit className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-slate-700">Modifier Profil</span>
              </button>

              <button
                onClick={handleViewSite}
                className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition"
              >
                <ExternalLink className="w-8 h-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-slate-700">Voir le Site</span>
              </button>

              <button
                onClick={handleShowCalendar}
                className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
              >
                <Calendar className="w-8 h-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-slate-700">Calendrier</span>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-ci-orange-600"></div>
          </div>
        ) : houses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <Home className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Aucune propriété</h3>
            <p className="text-slate-600 mb-6">
              Commencez par ajouter votre première propriété
            </p>
            <button
              onClick={() => setShowHouseForm(true)}
              className="bg-ci-orange-600 hover:bg-ci-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Ajouter une maison
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredHouses().map((house) => (
              <div
                key={house.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition"
              >
                <div className="aspect-video bg-slate-200 relative">
                  {house.video_url ? (
                    <video
                      src={house.video_url}
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : house.image_url ? (
                    <img
                      src={house.image_url}
                      alt={house.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="w-12 h-12 text-slate-400" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        house.status === 'available'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {house.status === 'available' ? 'Disponible' : 'Pris'}
                    </span>
                  </div>
                  {/* Indicateurs pour les fonctionnalités supplémentaires */}
                  <div className="absolute bottom-3 right-3 flex gap-1">
                    {house.photos && house.photos.length > 0 && (
                      <div className="bg-black bg-opacity-70 text-white rounded-full p-1.5">
                        <Camera className="w-3 h-3" />
                      </div>
                    )}
                    {house.virtual_tour_url && (
                      <div className="bg-black bg-opacity-70 text-white rounded-full p-1.5">
                        <Play className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-slate-900 mb-1">{house.title}</h3>
                  <p className="text-slate-600 text-sm mb-3 line-clamp-2">{house.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-ci-orange-600">
                      {house.price.toLocaleString()} FCFA
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewingHouse(house)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      Voir
                    </button>
                    <button
                      onClick={() => handleEditHouse(house)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition text-sm font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteHouse(house.id)}
                      className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};
