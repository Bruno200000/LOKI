import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Home, Users, DollarSign, Calendar, LogOut, TrendingUp, Trash2, Eye, BarChart3 } from 'lucide-react';

interface Stats {
  totalOwners: number;
  totalTenants: number;
  totalHouses: number;
  availableHouses: number;
  totalBookings: number;
  activeBookings: number;
  totalCommissions: number;
  activeCommissions: number;
}

interface User {
  id: string;
  full_name: string;
  role: string;
  created_at: string;
  phone?: string;
  city?: string;
  auth_users?: { email: string }[];
}

interface Transaction {
  id: string;
  booking_id: string;
  amount: number;
  payment_type: string;
  payment_method: string;
  status: string;
  created_at: string;
}

interface Booking {
  id: string;
  house_id: string;
  tenant_id: string;
  owner_id: string;
  start_date: string;
  move_in_date: string;
  status: string;
  commission_fee: number;
  monthly_rent: number;
  notes?: string;
  created_at: string;
  tenant_profile?: { id: string; full_name?: string };
  owner_profile?: { id: string; full_name?: string };
  house_info?: { id: string; title?: string };
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}



export const AdminDashboard: React.FC = () => {
  const { profile, user, signOut } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalOwners: 0,
    totalTenants: 0,
    totalHouses: 0,
    availableHouses: 0,
    totalBookings: 0,
    activeBookings: 0,
    totalCommissions: 0,
    activeCommissions: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'bookings' | 'analytics'>('overview');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchStats();
    fetchTransactions();
    fetchUsers();
    fetchBookingsWithNames();
  }, []);

  const fetchStats = async () => {
    try {
      console.log('🔍 Récupération des statistiques...');
      const [profilesResult, housesResult, bookingsResult, paymentsResult] = await Promise.all([
        supabase.from('profiles').select('role'),
        supabase.from('houses').select('status'),
        supabase.from('bookings').select('status, commission_fee'),
        supabase.from('payments').select('*').eq('payment_type', 'commission')
      ]);

      if (profilesResult.error) {
        console.error('❌ Erreur profiles:', profilesResult.error);
        throw profilesResult.error;
      }
      if (housesResult.error) {
        console.error('❌ Erreur houses:', housesResult.error);
        throw housesResult.error;
      }
      if (bookingsResult.error) {
        console.error('❌ Erreur bookings:', bookingsResult.error);
        console.log('Bookings result:', bookingsResult);
        console.log('Bookings data:', bookingsResult.data);
        console.log('Bookings error:', bookingsResult.error);
        throw bookingsResult.error;
      }
      if (paymentsResult.error) {
        console.error('❌ Erreur payments:', paymentsResult.error);
        throw paymentsResult.error;
      }

      const profiles = profilesResult.data || [];
      const houses = housesResult.data || [];
      const bookingsData = bookingsResult.data || [];
      const payments = paymentsResult.data || [];

      console.log('📊 Données récupérées:');
      console.log('- Profiles:', profiles.length);
      console.log('- Houses:', houses.length);
      console.log('- Bookings:', bookingsData.length);
      console.log('- Payments:', payments.length);

      const owners = profiles.filter((p) => p.role === 'owner').length;
      const tenants = profiles.filter((p) => p.role === 'tenant').length;
      const admins = profiles.filter((p) => p.role === 'admin').length;
      const totalHouses = houses.length;
      const available = houses.filter((h) => h.status === 'available').length;
      const totalBookings = bookingsData.length;
      const confirmedBookings = bookingsData.filter((b) => b.status === 'confirmed').length;
      const totalComm = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

      setStats({
        totalOwners: owners,
        totalTenants: tenants,
        totalHouses,
        availableHouses: available,
        totalBookings,
        activeBookings: confirmedBookings,
        totalCommissions: totalComm,
        activeCommissions: totalComm,
      });

      setChartData([
        { name: 'Propriétaires', value: owners, color: '#3B82F6' },
        { name: 'Locataires', value: tenants, color: '#10B981' },
        { name: 'Administrateurs', value: admins, color: '#F59E0B' },
      ]);

      setTransactions(payments.slice(0, 20) || []);
    } catch (error) {
      console.error('❌ Erreur fetchStats:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('payment_type', 'commission')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('🔍 Récupération des utilisateurs...');
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          role,
          created_at,
          phone,
          city
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur fetchUsers:', error);
        throw error;
      }

      console.log('✅ Utilisateurs récupérés:', data);
      setUsers(data || []);
    } catch (error) {
      console.error('❌ Erreur fetchUsers:', error);
    }
  };

  const fetchBookingsWithNames = async () => {
    try {
      console.log('🔍 Récupération des réservations avec noms...');

      // Récupérer les réservations
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          house_id,
          tenant_id,
          owner_id,
          start_date,
          move_in_date,
          status,
          commission_fee,
          monthly_rent,
          notes,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Récupérer les noms des utilisateurs
      const userIds = new Set<string>();
      bookingsData?.forEach(booking => {
        userIds.add(booking.tenant_id);
        userIds.add(booking.owner_id);
      });

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', Array.from(userIds));

      if (profilesError) throw profilesError;

      // Récupérer les noms des maisons
      const houseIds = new Set<string>();
      bookingsData?.forEach(booking => {
        houseIds.add(booking.house_id);
      });

      const { data: housesData, error: housesError } = await supabase
        .from('houses')
        .select('id, title')
        .in('id', Array.from(houseIds));

      if (housesError) throw housesError;

      // Combiner les données
      const bookingsWithNames = bookingsData?.map(booking => ({
        ...booking,
        tenant_profile: profilesData?.find(p => p.id === booking.tenant_id),
        owner_profile: profilesData?.find(p => p.id === booking.owner_id),
        house_info: housesData?.find(h => h.id === booking.house_id)
      }));

      console.log('✅ Réservations avec noms:', bookingsWithNames);
      setBookings(bookingsWithNames || []);
    } catch (error) {
      console.error('❌ Erreur fetchBookingsWithNames:', error);
    }
  };

  const deleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userEmail || userId} ? Cette action est irréversible.`)) {
      return;
    }

    try {
      // Supprimer d'abord les données liées
      await Promise.all([
        supabase.from('houses').delete().eq('owner_id', userId),
        supabase.from('bookings').delete().or(`tenant_id.eq.${userId},owner_id.eq.${userId}`),
        supabase.from('payments').delete().or(`paid_by.eq.${userId},paid_to.eq.${userId}`),
        supabase.from('reviews').delete().eq('tenant_id', userId),
      ]);

      // Supprimer le profil
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) throw profileError;

      // Recharger les données
      fetchStats();
      fetchUsers();

      alert('Utilisateur supprimé avec succès');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const goToPublicSite = () => {
    window.location.href = '/?view=public';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-ci-orange-600 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">LOKI</h1>
                <p className="text-xs text-slate-600">Administrateur</p>
              </div>
            </a>
            <div className="flex items-center gap-4">
              <button
                onClick={goToPublicSite}
                className="flex items-center gap-2 px-4 py-2 bg-ci-orange-600 text-white rounded-lg hover:bg-ci-orange-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Aller sur le site
              </button>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{profile?.full_name}</p>
                <p className="text-xs text-slate-600">{user?.email}</p>
              </div>
              <button
                onClick={signOut}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
                title="Déconnexion"
              >
                <LogOut className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Tableau de Bord Admin</h1>
          <p className="text-slate-600">Vue d'ensemble de la plateforme LOKI</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-ci-orange-600 text-ci-orange-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'users'
                  ? 'border-ci-orange-600 text-ci-orange-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Utilisateurs ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'bookings'
                  ? 'border-ci-orange-600 text-ci-orange-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Réservations ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'analytics'
                  ? 'border-ci-orange-600 text-ci-orange-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Analytique
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Propriétaires</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalOwners}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Locataires</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalTenants}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Maisons</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalHouses}</p>
                    <p className="text-xs text-ci-orange-600 mt-1">
                      {stats.availableHouses} disponibles
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Home className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Réservations</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalBookings}</p>
                    <p className="text-xs text-ci-orange-600 mt-1">
                      {stats.activeBookings} actives
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-ci-green-500 to-ci-orange-600 p-8 rounded-xl shadow-lg text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-ci-green-100 text-sm">Commissions Totales</p>
                    <p className="text-4xl font-bold mt-2">
                      {stats.totalCommissions.toLocaleString()} FCFA
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-8 h-8" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-ci-green-100">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm">Depuis le lancement</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 rounded-xl shadow-lg text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-blue-100 text-sm">Commissions Actives</p>
                    <p className="text-4xl font-bold mt-2">
                      {stats.activeCommissions.toLocaleString()} FCFA
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-8 h-8" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-blue-100">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm">Réservations en cours</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">Transactions Récentes</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Dernières commissions collectées
                </p>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-ci-orange-600"></div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="p-12 text-center">
                  <DollarSign className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">Aucune transaction</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                          Transaction
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                          Montant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                          Méthode
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900">
                              {String(transaction.id).slice(0, 8)}...
                            </div>
                            <div className="text-xs text-slate-600">Commission</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-ci-orange-600">
                              {transaction.amount.toLocaleString()} FCFA
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900 capitalize">
                              {transaction.payment_method?.replace('_', ' ') || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                transaction.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : transaction.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {transaction.status === 'completed'
                                ? 'Complété'
                                : transaction.status === 'pending'
                                ? 'En attente'
                                : 'Échoué'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            {new Date(transaction.created_at).toLocaleDateString('fr-FR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Gestion des Utilisateurs</h2>
              <p className="text-sm text-slate-600 mt-1">
                Liste de tous les utilisateurs inscrits sur la plateforme
              </p>
              {users.length === 0 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    📝 Aucun utilisateur trouvé. Vérifiez que des utilisateurs sont inscrits dans la base de données.
                  </p>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Téléphone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Ville
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Inscrit le
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">
                          {user.full_name || 'N/A'}
                        </div>
                        <div className="text-xs text-slate-600">
                          Email non disponible
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'admin'
                              ? 'bg-red-100 text-red-800'
                              : user.role === 'owner'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {user.role === 'admin'
                            ? 'Administrateur'
                            : user.role === 'owner'
                            ? 'Propriétaire'
                            : 'Locataire'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {user.phone || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {user.city || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => deleteUser(user.id, user.full_name || 'Utilisateur')}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Supprimer l'utilisateur"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Gestion des Réservations</h2>
              <p className="text-sm text-slate-600 mt-1">
                Liste de toutes les réservations effectuées sur la plateforme
              </p>
              {bookings.length === 0 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    📝 Aucune réservation trouvée. Vérifiez que des réservations ont été créées dans la base de données.
                  </p>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Réservation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Maison
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Locataire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Propriétaire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Période
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Loyer Mensuel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Commission
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Créée le
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">
                          {String(booking.id).slice(0, 8)}...
                        </div>
                        <div className="text-xs text-slate-600">
                          Réservation ID: {String(booking.id).slice(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                          {booking.house_info?.title || `Maison ${String(booking.house_id).slice(0, 8)}...`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                          {booking.tenant_profile?.full_name || `${String(booking.tenant_id).slice(0, 8)}...`}
                        </div>
                        <div className="text-xs text-slate-600">
                          {booking.tenant_profile?.full_name ? 'Locataire' : 'ID Locataire'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                          {booking.owner_profile?.full_name || `${String(booking.owner_id).slice(0, 8)}...`}
                        </div>
                        <div className="text-xs text-slate-600">
                          {booking.owner_profile?.full_name ? 'Propriétaire' : 'ID Propriétaire'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                          {new Date(booking.start_date).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="text-xs text-slate-600">
                          {booking.move_in_date ? `→ ${new Date(booking.move_in_date).toLocaleDateString('fr-FR')}` : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-ci-orange-600">
                        {booking.monthly_rent.toLocaleString()} FCFA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        {booking.commission_fee.toLocaleString()} FCFA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : booking.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {booking.status === 'confirmed'
                            ? 'Confirmée'
                            : booking.status === 'pending'
                            ? 'En attente'
                            : booking.status === 'cancelled'
                            ? 'Annulée'
                            : booking.status || 'Inconnu'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {new Date(booking.created_at).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">Répartition des Utilisateurs</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAnalyticsPeriod('week')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      analyticsPeriod === 'week'
                        ? 'bg-ci-orange-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Semaine
                  </button>
                  <button
                    onClick={() => setAnalyticsPeriod('month')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      analyticsPeriod === 'month'
                        ? 'bg-ci-orange-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Mois
                  </button>
                  <button
                    onClick={() => setAnalyticsPeriod('year')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      analyticsPeriod === 'year'
                        ? 'bg-ci-orange-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Année
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-4">
                    {chartData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-slate-600">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                          <span className="text-xs text-slate-500 ml-2">
                            ({Math.round((item.value / chartData.reduce((sum, d) => sum + d.value, 0)) * 100)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                      {chartData.map((item, index) => {
                        const total = chartData.reduce((sum, d) => sum + d.value, 0);
                        const percentage = (item.value / total) * 100;
                        const offset = chartData.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 100, 0);
                        return (
                          <circle
                            key={item.name}
                            cx="50"
                            cy="50"
                            r="20"
                            fill="none"
                            stroke={item.color}
                            strokeWidth="15"
                            strokeDasharray={`${percentage} ${100 - percentage}`}
                            strokeDashoffset={100 - offset}
                            className="transition-all duration-500"
                          />
                        );
                      })}
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Statistiques {analyticsPeriod === 'week' ? 'hebdomadaires' : analyticsPeriod === 'month' ? 'mensuelles' : 'annuelles'}
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Taux d'occupation</span>
                    <span className="text-sm font-semibold">
                      {stats.totalHouses > 0 ? Math.round(((stats.totalHouses - stats.availableHouses) / stats.totalHouses) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">
                      Réservations {analyticsPeriod === 'week' ? 'cette semaine' : analyticsPeriod === 'month' ? 'ce mois' : 'cette année'}
                    </span>
                    <span className="text-sm font-semibold">
                      {analyticsPeriod === 'week' ? Math.round(stats.totalBookings / 4) : analyticsPeriod === 'month' ? Math.round(stats.totalBookings / 12) : stats.totalBookings}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Commission moyenne</span>
                    <span className="text-sm font-semibold">
                      {stats.totalBookings > 0 ? Math.round(stats.totalCommissions / stats.totalBookings) : 0} FCFA
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Activité {analyticsPeriod === 'week' ? 'cette semaine' : analyticsPeriod === 'month' ? 'ce mois' : 'cette année'}
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">
                      Nouveaux utilisateurs ({analyticsPeriod === 'week' ? '7j' : analyticsPeriod === 'month' ? '30j' : '365j'})
                    </span>
                    <span className="text-sm font-semibold text-green-600">
                      +{analyticsPeriod === 'week' ? users.slice(0, 7).length : analyticsPeriod === 'month' ? users.slice(0, 30).length : users.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">
                      Nouvelles maisons ({analyticsPeriod === 'week' ? '7j' : analyticsPeriod === 'month' ? '30j' : '365j'})
                    </span>
                    <span className="text-sm font-semibold text-blue-600">
                      +{analyticsPeriod === 'week' ? Math.round(stats.totalHouses / 4) : analyticsPeriod === 'month' ? Math.round(stats.totalHouses / 12) : stats.totalHouses}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">
                      Transactions ({analyticsPeriod === 'week' ? '7j' : analyticsPeriod === 'month' ? '30j' : '365j'})
                    </span>
                    <span className="text-sm font-semibold text-purple-600">
                      +{analyticsPeriod === 'week' ? Math.round(transactions.length / 4) : analyticsPeriod === 'month' ? Math.round(transactions.length / 12) : transactions.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
