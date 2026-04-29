import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, PropertyContact, House } from '../../lib/supabase';
import { Home, Users, DollarSign, Calendar, LogOut, BarChart3, Phone, MessageCircle, MapPin, User, CheckCircle, Star, Trash2, Eye, Search } from 'lucide-react';

interface Stats {
  totalOwners: number;
  totalTenants: number;
  totalHouses: number;
  availableHouses: number;
  occupancyRate: number;
  totalBookings: number;
  activeBookings: number;
  totalCommissions: number;
  activeCommissions: number;
  totalRevenuePotential: number; // Nouveau
  averageCommission: number;    // Nouveau
  conversionRate: number;      // Nouveau
}

interface User {
  id: string;
  full_name: string;
  role: string;
  created_at: string;
  email?: string;
  phone?: string;
  city?: string;
}

interface Transaction {
  id: string;
  booking_id: string;
  contact_id?: string;
  amount: number;
  payment_type: string;
  payment_method: string;
  status: string;
  created_at: string;
  paid_by: string;
  payer_profile?: { full_name: string };
  booking_info?: { house_info: { title: string } };
  contact_info?: { house_info: { title: string } };
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

interface HouseWithOwner extends House {
  owner?: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
  };
  featured?: boolean;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

export const AdminDashboard: React.FC = () => {
  const { profile, signOut } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalOwners: 0,
    totalTenants: 0,
    totalHouses: 0,
    availableHouses: 0,
    occupancyRate: 0,
    totalBookings: 0,
    activeBookings: 0,
    totalCommissions: 0,
    activeCommissions: 0,
    totalRevenuePotential: 0,
    averageCommission: 0,
    conversionRate: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [houses, setHouses] = useState<HouseWithOwner[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [propertyContacts, setPropertyContacts] = useState<PropertyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'houses' | 'bookings' | 'contacts' | 'analytics' | 'commissions' | 'admins'>('overview');
  const [adminForm, setAdminForm] = useState({ email: '', password: '', fullName: '', phone: '' });
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'owner' | 'tenant'>('all');
  const [contactSearch, setContactSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchStats(),
        fetchTransactions(),
        fetchUsers(),
        fetchHouses(),
        fetchBookingsWithNames(),
        fetchPropertyContacts()
      ]);
      setLoading(false);
    };
    fetchData();

    // Abonnement Temps Réel pour les contacts
    const contactsSubscription = supabase
      .channel('admin-contacts-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'property_contacts' 
      }, () => {
        console.log('🔄 Mise à jour temps réel reçue pour les contacts');
        fetchPropertyContacts();
        fetchStats(); // Optionnel : mettre à jour les stats aussi
      })
      .subscribe();

    return () => {
      supabase.removeChannel(contactsSubscription);
    };
  }, []);

  const fetchHouses = async () => {
    try {
      // Check if user is admin
      if (!profile || profile.role !== 'admin') {
        // Use regular query for non-admin users
        let query = supabase
          .from('houses')
          .select(`
            *,
            owner:profiles (
              id,
              full_name,
              email,
              phone
            )
          `)
          .order('created_at', { ascending: false });

        let { data, error } = await query;

        // Fallback: if fetching with email fails, try without it
        if (error) {
          console.warn('⚠️ Fetch with email failed, retrying without email...', error.message);
          const fallbackQuery = supabase
            .from('houses')
            .select(`
              *,
              owner:profiles (
                id,
                full_name,
                phone
              )
            `)
            .order('created_at', { ascending: false });

          const result = await fallbackQuery;
          data = result.data;
          error = result.error;
        }

        if (error) {
          console.error('❌ Erreur houses (regular):', error);
        } else {
          setHouses(data || []);
        }
        return;
      }

      // Try RPC function first (bypasses RLS) - only for admins
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_houses_for_admin');

      console.log('🔧 RPC Response:', { data: rpcData, error: rpcError });

      if (!rpcError && rpcData && rpcData.length > 0) {
        console.log('✅ Maisons récupérées via RPC:', rpcData.length);
        console.log('🏠 RPC Data sample:', rpcData[0]);

        // Map RPC data to match House interface
        const mappedHouses = rpcData.map((house: any) => ({
          ...house,
          owner: house.owner_full_name ? {
            id: house.owner_id_2,
            full_name: house.owner_full_name,
            email: house.owner_email,
            phone: house.owner_phone
          } : null
        }));

        console.log('🏠 Mapped houses:', mappedHouses[0]);
        setHouses(mappedHouses);
        return;
      }

      if (rpcError) {
        console.error('❌ RPC Error details:', rpcError);
      } else if (!rpcData || rpcData.length === 0) {
        console.log('ℹ️ RPC returned empty data');
      }

      console.log('⚠️ RPC failed, falling back to direct query');

      // First try without the join to see if houses exist
      const { data: housesOnly, error: housesError } = await supabase
        .from('houses')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('🏠 Houses without join:', housesOnly?.length, housesError);
      console.log('🏠 Houses data:', housesOnly);

      if (housesError) {
        console.error('❌ Erreur houses (simple):', housesError);
      }

      // Then try with the join
      // Then try with the join (Full attempt)
      let { data, error } = await supabase
        .from('houses')
        .select(`
          *,
          owner:profiles (
            id,
            full_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      // Fallback: If full attempt fails, try without email
      if (error) {
        console.warn('⚠️ Admin fetch with email failed, retrying without email...', error.message);
        const retryResult = await supabase
          .from('houses')
          .select(`
            *,
            owner:profiles (
              id,
              full_name,
              phone
            )
          `)
          .order('created_at', { ascending: false });

        data = retryResult.data;
        error = retryResult.error;
      }

      if (error) {
        console.error('❌ Erreur houses (with join):', error);
        // If join still fails, use houses without owner info (from previous generic fetch)
        if (housesOnly) {
          setHouses(housesOnly);
        }
        return;
      }

      setHouses(data || []);
    } catch (error) {
      console.error('❌ Erreur fetchHouses:', error);
    }
  };

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
      }
      if (housesResult.error) {
        console.error('❌ Erreur houses:', housesResult.error);
      }
      if (bookingsResult.error) {
        console.error('❌ Erreur bookings:', bookingsResult.error);
      }
      if (paymentsResult.error) {
        console.error('❌ Erreur payments:', paymentsResult.error);
      }

      const profiles = profilesResult.data || [];
      const houses = housesResult.data || [];
      const bookings = bookingsResult.data || [];
      const payments = paymentsResult.data || [];

      const totalHouses = houses.length;
      const availableHouses = houses.filter(h => h.status === 'available').length;
      const takenHouses = houses.filter(h => h.status === 'taken').length;

      const occupancyRate = totalHouses > 0 ? Math.round((takenHouses / totalHouses) * 100) : 0;

      const totalOwners = profiles.filter(p => p.role === 'owner').length;
      const totalTenants = profiles.filter(p => p.role === 'tenant').length;

      const totalBookings = bookings.length;
      const activeBookings = bookings.filter(b => b.status === 'confirmed').length;

      const totalCommissions = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const activeCommissions = payments.filter(p => p.status === 'pending').length;
      const totalRevenuePotential = totalCommissions + (activeCommissions * 5000); // 5000 est une moyenne estimée
      const averageCommission = totalBookings > 0 ? Math.round(totalCommissions / totalBookings) : 0;
      const conversionRate = totalBookings > 0 ? Math.round((activeBookings / totalBookings) * 100) : 0;

      setStats({
        totalOwners,
        totalTenants,
        totalHouses,
        availableHouses,
        occupancyRate,
        totalBookings,
        activeBookings,
        totalCommissions,
        activeCommissions,
        totalRevenuePotential,
        averageCommission,
        conversionRate,
      });

      setChartData([
        { name: 'Propriétaires', value: totalOwners, color: '#3B82F6' },
        { name: 'Locataires', value: totalTenants, color: '#22C55E' },
      ]);

      console.log('✅ Stats updated:', {
        totalOwners,
        totalTenants,
        totalHouses,
        availableHouses,
        totalBookings,
        activeBookings,
        totalCommissions,
        activeCommissions,
        totalRevenuePotential,
        averageCommission,
        conversionRate,
      });
    } catch (error) {
      console.error('❌ Erreur fetchStats:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      console.log('🔍 Récupération des transactions...');
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          payer_profile:profiles!payments_paid_by_fkey(full_name),
          booking_info:bookings(house_info:houses(title)),
          contact_info:property_contacts(house_info:houses(title))
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur transactions:', error);
      } else {
        console.log('✅ Transactions récupérées:', data?.length);
        setTransactions(data || []);
      }
    } catch (error) {
      console.error('❌ Erreur fetchTransactions:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('🔍 Récupération des utilisateurs...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur fetchUsers:', error);
      } else {
        console.log('✅ Utilisateurs récupérés:', data?.length);
        setUsers(data || []);
      }
    } catch (error) {
      console.error('❌ Erreur fetchUsers:', error);
    }
  };

  const fetchBookingsWithNames = async () => {
    try {
      console.log('🔍 Récupération des réservations avec noms...');

      // 1. Essayer via RPC (plus performant et contourne RLS)
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_bookings_for_admin');

      if (!rpcError && rpcData) {
        console.log('✅ Réservations récupérées via RPC:', rpcData.length);
        const mappedBookings = rpcData.map((b: any) => ({
          id: b.id,
          house_id: b.house_id,
          tenant_id: b.tenant_id,
          owner_id: b.owner_id,
          start_date: b.start_date,
          move_in_date: b.move_in_date,
          status: b.status,
          commission_fee: b.commission_fee,
          monthly_rent: b.monthly_rent,
          notes: b.notes,
          created_at: b.created_at,
          tenant_profile: {
            id: b.tenant_id,
            full_name: b.tenant_full_name,
            email: b.tenant_email,
            phone: b.tenant_phone
          },
          owner_profile: {
            id: b.owner_id,
            full_name: b.owner_full_name,
            email: b.owner_email,
            phone: b.owner_phone
          },
          house_info: {
            id: String(b.house_id),
            title: b.house_title,
            city: b.house_city,
            price: b.house_price
          }
        }));
        setBookings(mappedBookings);
        return;
      }

      console.warn('⚠️ RPC bookings failed or not found, falling back to standard fetch:', rpcError?.message);

      // 2. Fallback: Méthode standard (peut échouer si RLS mal configuré)
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      if (!bookingsData || bookingsData.length === 0) {
        setBookings([]);
        return;
      }

      // Récupérer les noms des utilisateurs (Safe fetch)
      let profilesData: any[] = [];
      try {
        const userIds = new Set<string>();
        bookingsData.forEach(booking => {
          if (booking.tenant_id) userIds.add(booking.tenant_id);
          if (booking.owner_id) userIds.add(booking.owner_id);
        });

        if (userIds.size > 0) {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', Array.from(userIds));

          if (!error && data) profilesData = data;
        }
      } catch (e) {
        console.warn('⚠️ Erreur fetch profiles details:', e);
      }

      // Récupérer les noms des maisons (Safe fetch)
      let housesData: any[] = [];
      try {
        const houseIds = new Set<string>();
        bookingsData.forEach(booking => {
          if (booking.house_id) houseIds.add(booking.house_id);
        });

        if (houseIds.size > 0) {
          const { data, error } = await supabase
            .from('houses')
            .select('id, title')
            .in('id', Array.from(houseIds));

          if (!error && data) housesData = data;
        }
      } catch (e) {
        console.warn('⚠️ Erreur fetch houses details:', e);
      }

      // Combiner les données
      const bookingsWithNames = bookingsData.map(booking => ({
        ...booking,
        tenant_profile: profilesData.find(p => p.id === booking.tenant_id),
        owner_profile: profilesData.find(p => p.id === booking.owner_id),
        house_info: housesData.find(h => h.id === booking.house_id),
      }));

      console.log('✅ Réservations avec noms (Fallback):', bookingsWithNames);
      setBookings(bookingsWithNames);
    } catch (error) {
      console.error('❌ Erreur fetchBookingsWithNames:', error);
    }
  };

  const fetchPropertyContacts = async () => {
    try {
      console.log('🔍 Récupération des contacts de propriétés...');

      // Tentative de récupération avec toutes les jointures
      const { data, error } = await supabase
        .from('property_contacts')
        .select(`
          *,
          house_info:houses(id, title, type, city, neighborhood, price),
          owner_profile:profiles!property_contacts_owner_id_fkey(id, full_name, phone, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('⚠️ Échec de récupération avec jointures (possible problème RLS sur les profils):', error.message);
        
        // Tentative de repli (fallback) sans les jointures sur les profils/maisons
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('property_contacts')
          .select('*')
          .order('created_at', { ascending: false });

        if (fallbackError) {
          console.error('❌ Erreur de repli pour les contacts:', fallbackError);
          return;
        }

        console.log('✅ Contacts récupérés en mode simple (sans détails):', fallbackData?.length);
        setPropertyContacts(fallbackData || []);
      } else {
        console.log('✅ Contacts récupérés avec succès:', data?.length);
        setPropertyContacts(data || []);
      }
    } catch (error) {
      console.error('❌ Erreur critique fetchPropertyContacts:', error);
    }
  };

  const updateContactStatus = async (contactId: number, newStatus: 'contact_initiated' | 'reservation_made' | 'rental_confirmed') => {
    try {
      const { error } = await supabase
        .from('property_contacts')
        .update({ status: newStatus })
        .eq('id', contactId);

      if (error) throw error;

      // If rental is confirmed, generate fee
      if (newStatus === 'rental_confirmed') {
        const contact = propertyContacts.find(c => c.id === contactId);
        if (contact) {
          const fee = contact.property_type === 'residence' ? 2000 : 5000; // FCFA

          // Create payment record for the fee
          await supabase
            .from('payments')
            .insert({
              contact_id: contactId,
              amount: fee,
              payment_type: 'commission',
              status: 'pending',
              paid_by: contact.owner_id,
              created_at: new Date().toISOString()
            });

          alert(`Frais de ${fee} FCFA générés pour cette location confirmée.`);
        }
      }

      // Refresh all data to update stats and commission list
      await Promise.all([
        fetchPropertyContacts(),
        fetchStats(),
        fetchTransactions()
      ]);
    } catch (error) {
      console.error('Error updating contact status:', error);
      alert('Erreur lors de la mise à jour du statut');
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

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingAdmin(true);
    try {
      // 1. Créer le compte auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: adminForm.email,
        password: adminForm.password,
        options: {
          data: {
            full_name: adminForm.fullName,
            role: 'admin'
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Créer le profil s'il n'existe pas déjà (parfois géré par trigger)
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: adminForm.fullName,
            role: 'admin',
            phone: adminForm.phone
          })
          .eq('id', authData.user.id);

        if (profileError) {
          // Si l'update échoue, on essaye un insert au cas où le trigger n'aurait pas encore créé le profil
          await supabase.from('profiles').insert({
            id: authData.user.id,
            full_name: adminForm.fullName,
            role: 'admin',
            phone: adminForm.phone,
            email: adminForm.email
          });
        }
      }

      alert('Administrateur créé avec succès ! Un email de confirmation a été envoyé.');
      setAdminForm({ email: '', password: '', fullName: '', phone: '' });
      fetchUsers();
    } catch (error: any) {
      console.error('Erreur création admin:', error);
      alert(error.message || 'Erreur lors de la création de l\'administrateur');
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const deleteHouse = async (houseId: number, houseTitle: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la maison "${houseTitle}" ? Cette action est irréversible.`)) {
      return;
    }

    try {
      console.log('🗑️ Suppression de la maison:', houseId);
      const { error } = await supabase
        .from('houses')
        .delete()
        .eq('id', houseId);

      if (error) {
        console.error('❌ Erreur suppression maison:', error);
        throw error;
      }

      console.log('✅ Maison supprimée avec succès');
      alert('Maison supprimée avec succès');
      fetchHouses();
      fetchStats();
    } catch (error: any) {
      console.error('❌ Erreur deleteHouse:', error);
      alert(error.message || 'Erreur lors de la suppression de la maison');
    }
  };

  const deleteBooking = async (bookingId: string) => {
    if (!confirm(`Supprimer cette demande de réservation ?`)) return;
    try {
      const { error } = await supabase.from('bookings').delete().eq('id', bookingId);
      if (error) throw error;
      alert('Demande supprimée');
      fetchBookingsWithNames();
      fetchStats();
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const deleteContact = async (contactId: number) => {
    if (!confirm(`Supprimer ce contact ?`)) return;
    try {
      const { error } = await supabase.from('property_contacts').delete().eq('id', contactId);
      if (error) throw error;
      alert('Contact supprimé');
      fetchPropertyContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const updateUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'owner' ? 'tenant' : 'owner';
    if (!confirm(`Changer le rôle de l'utilisateur en ${newRole} ?`)) return;
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      if (error) throw error;
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Erreur lors du changement de rôle');
    }
  };

  const toggleHouseStatus = async (houseId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'available' ? 'taken' : 'available';
    try {
      const { error } = await supabase.from('houses').update({ status: newStatus }).eq('id', houseId);
      if (error) throw error;
      fetchHouses();
      fetchStats();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erreur lors du changement de statut');
    }
  };

  const toggleFeatured = async (houseId: number, currentFeatured: boolean) => {
    try {
      console.log('⭐ Mise à jour statut featured:', houseId, !currentFeatured);
      const { error } = await supabase
        .from('houses')
        .update({ featured: !currentFeatured })
        .eq('id', houseId);

      if (error) {
        console.error('❌ Erreur mise à jour featured:', error);
        // Si le champ featured n'existe pas, on l'ignore silencieusement
        if (error.message?.includes('column') || error.message?.includes('field')) {
          console.warn('⚠️ Le champ "featured" n\'existe pas dans la table houses');
          alert('La fonctionnalité "Mettre en vedette" n\'est pas encore disponible. Contactez l\'administrateur pour ajouter le champ "featured" à la base de données.');
          return;
        }
        throw error;
      }

      console.log('✅ Statut featured mis à jour');
      fetchHouses(); // Rafraîchir la liste
    } catch (error: any) {
      console.error('❌ Erreur toggleFeatured:', error);
      alert(error.message || 'Erreur lors de la mise à jour du statut featured');
    }
  };

  const goToPublicSite = () => {
    window.location.href = '/?view=public';
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter;
    const matchesSearch = !userSearch || 
      user.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.phone?.includes(userSearch);
    return matchesRole && matchesSearch;
  });

  const filteredContacts = propertyContacts.filter(contact => {
    const searchLower = contactSearch.toLowerCase();
    return !contactSearch || 
      contact.tenant_name?.toLowerCase().includes(searchLower) ||
      contact.tenant_phone?.includes(contactSearch) ||
      contact.owner_name?.toLowerCase().includes(searchLower) ||
      contact.house_info?.title?.toLowerCase().includes(searchLower) ||
      contact.neighborhood?.toLowerCase().includes(searchLower);
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-ci-orange-600 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">LOKI</span>
            </a>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">
                {profile?.full_name} ({profile?.role})
              </span>
              <button
                onClick={goToPublicSite}
                className="text-sm text-ci-orange-600 hover:text-ci-orange-700 font-medium"
              >
                Voir le site public
              </button>
              <button
                onClick={signOut}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ci-orange-600"></div>
            <span className="ml-3 text-slate-600">Chargement...</span>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Tableau de Bord Admin</h1>
              <p className="text-slate-600">Vue d'ensemble de la plateforme LOKI</p>
            </div>

            {/* Navigation Tabs */}
            <div className="mb-8">
              <nav className="flex space-x-8 border-b border-slate-200">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'overview'
                    ? 'border-ci-orange-600 text-ci-orange-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                >
                  <BarChart3 className="w-4 h-4 inline mr-2" />
                  Vue d'ensemble
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'users'
                    ? 'border-ci-orange-600 text-ci-orange-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                >
                  <Users className="w-4 h-4 inline mr-2" />
                  Utilisateurs ({users.length})
                </button>
                <button
                  onClick={() => setActiveTab('houses')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'houses'
                    ? 'border-ci-orange-600 text-ci-orange-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                >
                  <Home className="w-4 h-4 inline mr-2" />
                  Maisons ({houses.length})
                </button>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'bookings'
                    ? 'border-ci-orange-600 text-ci-orange-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                >
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Demandes ({bookings.length})
                </button>
                <button
                  onClick={() => setActiveTab('contacts')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'contacts'
                    ? 'border-ci-orange-600 text-ci-orange-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                >
                  <Phone className="w-4 h-4 inline mr-2" />
                  Contacts ({propertyContacts.length})
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'analytics'
                    ? 'border-ci-orange-600 text-ci-orange-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                >
                  <BarChart3 className="w-4 h-4 inline mr-2" />
                  Analytique
                </button>
                <button
                  onClick={() => setActiveTab('commissions')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'commissions'
                    ? 'border-ci-orange-600 text-ci-orange-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                >
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Commissions ({transactions.filter(t => t.payment_type === 'commission').length})
                </button>
                <button
                  onClick={() => setActiveTab('admins')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'admins'
                    ? 'border-ci-orange-600 text-ci-orange-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Administrateurs
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Propriétaires</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">{stats.totalOwners}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Locataires</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">{stats.totalTenants}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Users className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Maisons</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">{stats.totalHouses}</p>
                        <p className="text-[10px] font-bold text-ci-orange-600 mt-1 uppercase">
                          {stats.availableHouses} libres • {stats.occupancyRate}% occupées
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Home className="w-6 h-6 text-amber-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Commissions</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalCommissions.toLocaleString()} <span className="text-sm">F</span></p>
                        <p className="text-[10px] font-bold text-green-600 mt-1 uppercase">
                          Taux: {stats.conversionRate}%
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-ci-orange-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <DollarSign className="w-6 h-6 text-ci-orange-600" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="relative overflow-hidden bg-gradient-to-br from-ci-orange-600 to-ci-orange-700 p-8 rounded-3xl shadow-xl shadow-ci-orange-200 text-white group">
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                    <p className="text-ci-orange-100 text-xs font-black uppercase tracking-widest">Revenu Potentiel</p>
                    <p className="text-4xl font-black mt-2 tracking-tighter">{stats.totalRevenuePotential.toLocaleString()} <span className="text-lg">FCFA</span></p>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold uppercase">{stats.activeCommissions} en attente</span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Panier Moyen</p>
                    <p className="text-3xl font-black text-slate-900 mt-2 tracking-tighter">{stats.averageCommission.toLocaleString()} <span className="text-lg">FCFA</span></p>
                    <p className="text-slate-400 text-[10px] mt-1 font-bold italic">Par conversion confirmée</p>
                  </div>

                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Taux d'Occupation</p>
                      <span className="text-lg font-black text-slate-900">{stats.occupancyRate}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600 shadow-inner transition-all duration-1000" 
                        style={{ width: `${stats.occupancyRate}%` }} 
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-3 font-bold text-center uppercase tracking-tighter">Basé sur {stats.totalHouses} biens listés</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Utilisateurs Récents</h3>
                    <div className="space-y-4">
                      {users.slice(0, 5).map((user) => (
                        <div key={user.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-slate-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{user.full_name}</p>
                              <p className="text-sm text-slate-500">{user.role}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.role === 'owner' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                            {user.role === 'owner' ? 'Propriétaire' : 'Locataire'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Transactions Récentes</h3>
                    <div className="space-y-4">
                      {transactions.slice(0, 5).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="font-medium text-slate-900">{transaction.amount} FCFA</p>
                            <p className="text-sm text-slate-500">{transaction.payment_type}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {transaction.status === 'completed' ? 'Complété' : 'En attente'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'users' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Gestion des Utilisateurs</h2>
                      <p className="text-slate-600 mt-1">Liste de tous les utilisateurs inscrits ({filteredUsers.length})</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <button
                          onClick={() => setUserRoleFilter('all')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${userRoleFilter === 'all' ? 'bg-white text-ci-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          Tous
                        </button>
                        <button
                          onClick={() => setUserRoleFilter('owner')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${userRoleFilter === 'owner' ? 'bg-white text-ci-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          Propriétaires
                        </button>
                        <button
                          onClick={() => setUserRoleFilter('tenant')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${userRoleFilter === 'tenant' ? 'bg-white text-ci-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          Locataires
                        </button>
                      </div>
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Rechercher..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-ci-orange-500 outline-none w-full md:w-64"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Utilisateur</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rôle</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Téléphone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ville</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date d'inscription</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-slate-600" />
                              </div>
                              <div className="ml-3">
                                <p className="font-medium text-slate-900">{user.full_name}</p>
                                <p className="text-sm text-slate-500">ID: {user.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {user.email || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.role === 'owner' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                              }`}>
                              {user.role === 'owner' ? 'Propriétaire' : 'Locataire'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {user.phone || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {user.city || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {new Date(user.created_at).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => updateUserRole(user.id, user.role)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Changer Rôle
                              </button>
                              <button
                                onClick={() => deleteUser(user.id, user.email || '')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600">Aucun utilisateur enregistré</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900">Suivi des Demandes</h2>
                  <p className="text-slate-600 mt-1">Liste de toutes les demandes de mise en relation</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Bien</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Locataire</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Propriétaire</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date début</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date emménagement</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Loyer mensuel</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Commission</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Statut</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            <div>
                              <p className="font-medium">{booking.house_info?.title || 'N/A'}</p>
                              <p className="text-slate-500 text-xs">ID: {booking.house_id}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            <div>
                              <p className="font-medium">{booking.tenant_profile?.full_name || 'N/A'}</p>
                              <p className="text-slate-500 text-xs">ID: {booking.tenant_id}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            <div>
                              <p className="font-medium">{booking.owner_profile?.full_name || 'N/A'}</p>
                              <p className="text-slate-500 text-xs">ID: {booking.owner_id}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {new Date(booking.start_date).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {new Date(booking.move_in_date).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {booking.monthly_rent} FCFA
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {booking.commission_fee} FCFA
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                              }`}>
                              {booking.status === 'confirmed' ? 'Confirmée' :
                                booking.status === 'pending' ? 'En attente' : 'Annulée'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => deleteBooking(booking.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {bookings.length === 0 && (
                    <div className="text-center py-12">
                      <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600">Aucune demande enregistrée</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'houses' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                  <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Gestion des Maisons</h2>
                      <p className="text-slate-600 mt-1">Toutes les propriétés de la plateforme</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-slate-600">
                        Total: <span className="font-semibold text-slate-900">{houses.length}</span> |
                        Disponibles: <span className="font-semibold text-green-600">{houses.filter(h => h.status === 'available').length}</span> |
                        Prises: <span className="font-semibold text-red-600">{houses.filter(h => h.status === 'taken').length}</span>
                      </div>
                      <button
                        onClick={() => fetchHouses()}
                        className="px-3 py-1.5 text-sm bg-ci-orange-600 text-white rounded-lg hover:bg-ci-orange-700 transition-colors"
                      >
                        Rafraîchir
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Propriété</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Propriétaire</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Localisation</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Prix</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Statut</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {houses.map((house) => (
                          <tr key={house.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                {house.photos && house.photos.length > 0 ? (
                                  <img
                                    src={house.photos[0]}
                                    alt={house.title}
                                    className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 overflow-hidden relative">
                                    <img 
                                      src={
                                        house.type?.toLowerCase() === 'land' ? "/images/default-land.png" : 
                                        house.type?.toLowerCase() === 'residence' ? "/images/default-residence.png" :
                                        house.type?.toLowerCase() === 'shop' ? "/images/default-shop.png" :
                                        "/images/default-property.png"
                                      } 
                                      alt="LOKI Default" 
                                      className="w-full h-full object-cover opacity-60"
                                    />
                                    {(house.type?.toLowerCase() === 'residence' || house.type?.toLowerCase() === 'shop') && (
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                                        <span className="bg-white/90 backdrop-blur-md px-1 py-0.5 rounded-[2px] text-[4px] font-black text-slate-900 shadow-xl border border-white/20 uppercase tracking-[0.05em] text-center leading-tight">
                                          {house.type?.toLowerCase() === 'residence' ? 'Résidence\nà louer' : 'Magasin\nà louer'}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                                <div>
                                  <p className="font-semibold text-slate-900">{house.title}</p>
                                  <p className="text-xs text-slate-500">ID: {house.id}</p>
                                  {house.bedrooms && (
                                    <p className="text-xs text-slate-500">{house.bedrooms} chambres</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <p className="text-sm font-medium text-slate-900">
                                  {house.owner?.full_name || 'N/A'}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {house.owner?.email || 'Email non disponible'}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${house.type === 'residence' ? 'bg-purple-100 text-purple-800' :
                                house.type === 'house' ? 'bg-blue-100 text-blue-800' :
                                  house.type === 'land' ? 'bg-green-100 text-green-800' :
                                    'bg-orange-100 text-orange-800'
                                }`}>
                                {house.type === 'residence' ? 'Résidence' :
                                  house.type === 'house' ? 'Maison' :
                                    house.type === 'land' ? 'Terrain' : 'Magasin'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              <div>
                                <p className="font-medium">{house.city}</p>
                                {house.neighborhood && (
                                  <p className="text-xs text-slate-500">{house.neighborhood}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              <p className="font-semibold">{house.price.toLocaleString()} FCFA</p>
                              {house.area_sqm && (
                                <p className="text-xs text-slate-500">{house.area_sqm} m²</p>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => toggleHouseStatus(house.id, house.status)}
                                className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${house.status === 'available'
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                                  }`}
                              >
                                {house.status === 'available' ? 'Disponible' : 'Pris'}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleFeatured(house.id, house.featured || false)}
                                  className={`p-1.5 rounded-lg transition-colors ${house.featured
                                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                  title={house.featured ? "Retirer de la vedette" : "Mettre en vedette"}
                                >
                                  <Star className={`w-4 h-4 ${house.featured ? 'fill-current' : ''}`} />
                                </button>
                                <button
                                  onClick={() => window.open(`/?view=house&id=${house.id}`, '_blank')}
                                  className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                  title="Voir la maison"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteHouse(house.id, house.title)}
                                  className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                  title="Supprimer la maison"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {houses.length === 0 && (
                      <div className="text-center py-12">
                        <Home className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600">Aucune maison trouvée</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contacts' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Suivi des Contacts</h2>
                      <p className="text-slate-600 mt-1">Historique des contacts initiés par les locataires ({filteredContacts.length})</p>
                    </div>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Rechercher un contact, bien ou quartier..."
                        value={contactSearch}
                        onChange={(e) => setContactSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-ci-orange-500 outline-none w-full md:w-80"
                      />
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Statut</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Bien & Localisation</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Locataire</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Propriétaire</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {filteredContacts.map((contact) => (
                        <tr key={contact.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-2">
                              <span className="text-sm font-bold text-slate-900">
                                {new Date(contact.contact_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                              </span>
                              <span className={`inline-flex w-fit px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-md ${contact.status === 'contact_initiated'
                                ? 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                                : contact.status === 'reservation_made'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                  : 'bg-green-50 text-green-700 border border-green-100'
                                }`}>
                                {contact.status === 'contact_initiated' ? 'Contact initié' :
                                  contact.status === 'reservation_made' ? 'Réservation faite' :
                                    'Location confirmée'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <p className="text-sm font-black text-slate-900 group-hover:text-ci-orange-600 transition-colors">
                                {contact.house_info?.title || (
                                  <span className="text-slate-400 italic">
                                    {contact.property_type === 'land' ? 'Terrain' : 
                                     contact.property_type === 'house' ? 'Maison' : 
                                     contact.property_type === 'residence' ? 'Résidence' : 'Bien'} #{contact.house_id}
                                  </span>
                                )}
                              </p>
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <MapPin className="w-3 h-3 text-ci-orange-500" />
                                {contact.neighborhood || contact.house_info?.neighborhood}, {contact.house_info?.city}
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                {contact.property_type === 'residence' ? 'Résidence Meublée' :
                                 contact.property_type === 'house' ? 'Maison / Villa' :
                                 contact.property_type === 'land' ? 'Terrain' :
                                 contact.property_type === 'shop' ? 'Magasin / Local' : contact.property_type}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">
                                {contact.tenant_name?.charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                <p className="text-sm font-bold text-slate-900">{contact.tenant_name}</p>
                                <a href={`tel:${contact.tenant_phone}`} className="text-xs text-slate-500 hover:text-ci-orange-600 flex items-center gap-1">
                                  <Phone className="w-3 h-3" /> {contact.tenant_phone}
                                </a>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <p className="text-sm font-bold text-slate-700">{contact.owner_name}</p>
                              <p className="text-xs text-slate-400">{contact.owner_profile?.email || 'Pas d\'email'}</p>
                              {contact.owner_profile?.phone && (
                                <a href={`tel:${contact.owner_profile.phone}`} className="text-[10px] font-bold text-slate-500 mt-1 flex items-center gap-1">
                                  <Phone className="w-3 h-3" /> {contact.owner_profile.phone}
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {contact.status === 'contact_initiated' && (
                                <button
                                  onClick={() => updateContactStatus(contact.id, 'reservation_made')}
                                  className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                  Réservation Faite
                                </button>
                              )}
                              {contact.status === 'reservation_made' && (
                                <button
                                  onClick={() => updateContactStatus(contact.id, 'rental_confirmed')}
                                  className="px-3 py-1.5 bg-green-50 text-green-600 text-xs font-bold rounded-lg hover:bg-green-100 transition-colors"
                                >
                                  Confirmer Location
                                </button>
                              )}
                              <button
                                onClick={() => deleteContact(contact.id)}
                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredContacts.length === 0 && (
                    <div className="text-center py-20 bg-slate-50/50">
                      <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-8 h-8 text-slate-300" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Aucun contact trouvé</h3>
                      <p className="text-slate-500 text-sm">Ajustez votre recherche ou revenez plus tard.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900">Analyse de Performance</h2>
                  <div className="flex gap-2">
                    {(['week', 'month', 'year'] as const).map((period) => (
                      <button
                        key={period}
                        onClick={() => setAnalyticsPeriod(period)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${analyticsPeriod === period
                          ? 'bg-ci-orange-600 text-white shadow-md shadow-ci-orange-200'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                      >
                        {period === 'week' ? 'Semaine' : period === 'month' ? 'Mois' : 'Année'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Graphique de revenus SVG */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Évolution des Commissions (Estimation)</h3>
                    <div className="h-64 w-full flex items-end gap-2 pb-6">
                      {[40, 65, 45, 80, 55, 90, 75].map((height, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <div
                            className="w-full bg-ci-orange-500 rounded-t-lg transition-all duration-500 hover:bg-ci-orange-600 cursor-pointer relative group"
                            style={{ height: `${height}%` }}
                          >
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              {height * 1000} FCFA
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">J-{6 - i}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Graphique de types de biens */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Répartition par Type de Bien</h3>
                    <div className="space-y-4">
                      {[
                        { label: 'Résidences', count: stats.totalHouses * 0.4, color: 'bg-blue-500' },
                        { label: 'Maisons', count: stats.totalHouses * 0.3, color: 'bg-green-500' },
                        { label: 'Terrains', count: stats.totalHouses * 0.2, color: 'bg-amber-500' },
                        { label: 'Magasins', count: stats.totalHouses * 0.1, color: 'bg-purple-500' },
                      ].map((item) => (
                        <div key={item.label}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-600">{item.label}</span>
                            <span className="font-medium">{Math.round(item.count)}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div
                              className={`${item.color} h-2 rounded-full`}
                              style={{ width: `${(item.count / stats.totalHouses) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Répartition des Utilisateurs</h2>
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
                              <span className="font-medium text-slate-900">{item.name} {stats.totalTenants + stats.totalOwners > 0 ? `(${Math.round(item.value / (stats.totalTenants + stats.totalOwners) * 100)}%)` : ''}</span>
                            </div>
                            <span className="font-semibold text-slate-900">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-center items-center">
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
                          Demandes {analyticsPeriod === 'week' ? 'cette semaine' : analyticsPeriod === 'month' ? 'ce mois' : 'cette année'}
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

            {activeTab === 'commissions' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Suivi des Commissions</h2>
                    <p className="text-slate-600 mt-1">Historique des commissions perçues par la plateforme</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500 uppercase font-semibold">Total Commissions</p>
                    <p className="text-3xl font-bold text-ci-orange-600">{stats.totalCommissions} FCFA</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Payeur/Propriétaire</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Bien Concerné</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Montant</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Méthode</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {transactions
                        .filter(t => t.payment_type === 'commission')
                        .map((commission) => (
                          <tr key={commission.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              {new Date(commission.created_at).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              {commission.payer_profile?.full_name || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              {commission.booking_info?.house_info?.title || commission.contact_info?.house_info?.title || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                              {commission.amount} FCFA
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 uppercase">
                              {commission.payment_method || 'pending'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${commission.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : commission.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                                }`}>
                                {commission.status === 'completed' ? 'Payé' :
                                  commission.status === 'pending' ? 'En attente' : commission.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {transactions.filter(t => t.payment_type === 'commission').length === 0 && (
                    <div className="text-center py-12">
                      <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600">Aucune commission enregistrée</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'admins' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-ci-orange-100 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-ci-orange-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">Ajouter un Administrateur</h2>
                        <p className="text-sm text-slate-500">Créez un nouveau compte avec des accès administratifs</p>
                      </div>
                    </div>
                    <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Nom Complet</label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-ci-orange-500 outline-none transition-all"
                          value={adminForm.fullName}
                          onChange={(e) => setAdminForm({ ...adminForm, fullName: e.target.value })}
                          placeholder="Ex: Jean Kouassi"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Email</label>
                        <input
                          type="email"
                          required
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-ci-orange-500 outline-none transition-all"
                          value={adminForm.email}
                          onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                          placeholder="jean.kouassi@loki.ci"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Mot de passe</label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-ci-orange-500 outline-none transition-all"
                          value={adminForm.password}
                          onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                          placeholder="6 caractères minimum"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Téléphone</label>
                        <input
                          type="tel"
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-ci-orange-500 outline-none transition-all"
                          value={adminForm.phone}
                          onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                          placeholder="Ex: +225 0102030405"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <button
                          type="submit"
                          disabled={isCreatingAdmin}
                          className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 bg-ci-orange-600 text-white font-semibold rounded-lg hover:bg-ci-orange-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-ci-orange-200"
                        >
                          {isCreatingAdmin ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                              Création en cours...
                            </>
                          ) : (
                            <>
                              <User className="w-5 h-5" />
                              Créer le compte Administrateur
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="bg-slate-900 p-6 rounded-xl shadow-lg text-white">
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                          <CheckCircle className="w-6 h-6 text-ci-orange-400" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Accès Administrateur</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                          Les administrateurs peuvent gérer les utilisateurs, voir les demandes de contact, suivre les commissions et gérer les autres privilèges de la plateforme.
                        </p>
                      </div>
                      <div className="mt-8">
                        <p className="text-slate-400 text-xs uppercase font-semibold mb-1">Total Actuels</p>
                        <p className="text-4xl font-bold text-ci-orange-400">
                          {users.filter(u => u.role === 'admin').length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900">Équipe Administrative</h2>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                      {users.filter(u => u.role === 'admin').length} comptes
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Administrateur</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rôle</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {users.filter(u => u.role === 'admin').map((admin) => (
                          <tr key={admin.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                                  <User className="w-5 h-5 text-slate-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900">{admin.full_name}</p>
                                  <p className="text-xs text-slate-500">ID: {admin.id.substring(0, 8)}...</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="space-y-1">
                                <p className="text-sm text-slate-700 font-medium">{admin.email}</p>
                                <p className="text-xs text-slate-500">{admin.phone || 'Pas de téléphone'}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wider">
                                Super Admin
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => deleteUser(admin.id, admin.email || '')}
                                className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Révoquer
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {users.filter(u => u.role === 'admin').length === 0 && (
                      <div className="text-center py-20 bg-slate-50/50">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <User className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">Aucun administrateur trouvé</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
