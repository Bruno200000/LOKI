import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Home, Users, DollarSign, Calendar, LogOut, TrendingUp } from 'lucide-react';

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

interface Transaction {
  id: string;
  booking_id: string;
  amount: number;
  payment_type: string;
  payment_method: string;
  status: string;
  created_at: string;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchTransactions();
  }, []);

  const fetchStats = async () => {
    try {
      // Use direct queries instead of views for better compatibility
      const [profilesResult, housesResult, bookingsResult, paymentsResult] = await Promise.all([
        supabase.from('profiles').select('role'),
        supabase.from('houses').select('status'),
        supabase.from('bookings').select('status, commission_fee'),
        supabase.from('payments').select('*').eq('payment_type', 'commission')
      ]);

      if (profilesResult.error) throw profilesResult.error;
      if (housesResult.error) throw housesResult.error;
      if (bookingsResult.error) throw bookingsResult.error;
      if (paymentsResult.error) throw paymentsResult.error;

      const profiles = profilesResult.data || [];
      const houses = housesResult.data || [];
      const bookings = bookingsResult.data || [];
      const payments = paymentsResult.data || [];

      const owners = profiles.filter((p) => p.role === 'owner').length;
      const tenants = profiles.filter((p) => p.role === 'tenant').length;
      const totalHouses = houses.length;
      const available = houses.filter((h) => h.status === 'available').length;
      const totalBookings = bookings.length;
      const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length;
      const totalComm = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

      setStats({
        totalOwners: owners,
        totalTenants: tenants,
        totalHouses,
        availableHouses: available,
        totalBookings,
        activeBookings: confirmedBookings, // Using confirmed as active
        totalCommissions: totalComm,
        activeCommissions: totalComm, // Approximation
      });

      // Set recent transactions for the table
      setTransactions(payments.slice(0, 20) || []);
    } catch (error) {
      console.error('Error fetching stats:', error);
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
                          {transaction.id.slice(0, 8)}...
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
      </div>
    </div>
  );
};
