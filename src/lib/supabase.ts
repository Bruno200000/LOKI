import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://oliizzwqbmlpeqozhofm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9saWl6endxYm1scGVxb3pob2ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzOTU5MzYsImV4cCI6MjA3NDk3MTkzNn0.G_E-bPzPZXEMbKZvUdhmaF3X1uH6_HVibVXiA42XhDs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'owner' | 'tenant' | 'admin';

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  address?: string | null;
  created_at: string;
}

export interface House {
  id: number;
  owner_id: string;
  title: string;
  description: string | null;
  price: number;
  location: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm?: number | null;
  photos?: string[] | null;
  videos?: string[] | null;
  amenities?: string[] | null;
  status: 'available' | 'taken' | 'pending';
  image_url?: string | null;
  video_url?: string | null;
  virtual_tour_url?: string | null;
  image_data?: string | null;
  created_at: string;
  updated_at?: string;

  // Nouveaux champs ajoutés
  neighborhood?: string | null;
  property_type?: string | null;
  furnished?: boolean | null;
  floor?: number | null;
  elevator?: boolean | null;
  parking?: boolean | null;
  balcony?: boolean | null;
  garden?: boolean | null;
  pool?: boolean | null;
  air_conditioning?: boolean | null;
  heating?: boolean | null;
  hot_water?: boolean | null;
  internet?: boolean | null;
  security_cameras?: boolean | null;
  alarm_system?: boolean | null;
  interphone?: boolean | null;
  guardian?: boolean | null;
  deposit_amount?: number | null;
  agency_fees?: number | null;
  utilities_included?: boolean | null;
  utilities_amount?: number | null;
  availability_date?: string | null;
  minimum_rental_period?: number | null;
  pets_allowed?: boolean | null;
  smoking_allowed?: boolean | null;
  proximity_transport?: string | null;
  proximity_schools?: string | null;
  proximity_shops?: string | null;
  proximity_green_spaces?: string | null;
}

export interface Booking {
  id: number; // Changed from string to number to match bigint in DB
  house_id: number;
  tenant_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  move_in_date: string;
  status: 'pending' | 'confirmed' | 'cancelled'; // Updated to match DB constraints
  commission_fee?: number;
  monthly_rent: number;
  notes?: string | null;
  created_at: string;

  // Joined profile and house information
  tenant_profile?: {
    id: string;
    full_name: string | null;
    phone: string | null;
  } | null;
  owner_profile?: {
    id: string;
    full_name: string | null;
  } | null;
  house_info?: {
    id: number;
    title: string;
    address: string;
    city: string;
  } | null;
}

export interface Payment {
  id: string;
  booking_id: number;
  amount: number;
  payment_type: 'commission' | 'rent' | 'deposit';
  payment_method?: 'wave' | 'orange_money' | 'moov_money' | 'cash' | 'pending';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  paid_by: string;
  paid_to?: string;
  created_at: string;
  completed_at?: string;
}

export const IVORIAN_CITIES = [
  'Abidjan',
  'Bouaké',
  'Daloa',
  'Yamoussoukro',
  'San-Pédro',
  'Divo',
  'Korhogo',
  'Anyama',
  'Abobo',
  'Man',
  'Gagnoa',
  'Soubré',
  'Agboville',
  'Grand-Bassam',
  'Bingerville',
  'Tiassalé',
  'Aboisso',
  'Ferkessédougou',
  'Odienné',
  'Séguéla'
] as const;

// Utility function to update booking status when commission payment is completed
export const updateBookingStatusAfterPayment = async (bookingId: string) => {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', bookingId);

    if (error) throw error;
  } catch (err) {
    console.error('Error updating booking status:', err);
  }
};

// Landing page statistics interface and functions
export interface LandingStats {
  totalRevenue: number;
  totalActiveProperties: number;
  occupancyRate: number;
  confirmedBookings: number;
  pendingBookings: number;
  totalRequests: number;
}

export const fetchLandingStats = async (): Promise<LandingStats> => {
  try {
    // Use direct queries instead of views for better compatibility
    const [profilesResult, housesResult, bookingsResult, paymentsResult] = await Promise.all([
      supabase.from('profiles').select('role'),
      supabase.from('houses').select('status'),
      supabase.from('bookings').select('status, commission_fee, monthly_rent').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('payments').select('amount, status').eq('payment_type', 'commission').eq('status', 'completed')
    ]);

    if (profilesResult.error) throw profilesResult.error;
    if (housesResult.error) throw housesResult.error;
    if (bookingsResult.error) throw bookingsResult.error;
    if (paymentsResult.error) throw paymentsResult.error;

    const houses = housesResult.data || [];
    const recentBookings = bookingsResult.data || [];
    const completedPayments = paymentsResult.data || [];

    // Calculate statistics
    const totalHouses = houses.length;
    const availableHouses = houses.filter(h => h.status === 'available').length;
    const takenHouses = houses.filter(h => h.status === 'taken').length;

    // Calculate occupancy rate
    const occupancyRate = totalHouses > 0 ? Math.round((takenHouses / totalHouses) * 100) : 0;

    // Count bookings by status
    const confirmedBookings = recentBookings.filter(b => b.status === 'confirmed').length;
    const pendingBookings = recentBookings.filter(b => b.status === 'pending').length;
    const totalRequests = recentBookings.length;

    // Calculate total revenue from completed payments
    const totalRevenue = completedPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    return {
      totalRevenue: totalRevenue,
      totalActiveProperties: availableHouses,
      occupancyRate: occupancyRate,
      confirmedBookings: confirmedBookings,
      pendingBookings: pendingBookings,
      totalRequests: totalRequests
    };
  } catch (error) {
    console.error('Error fetching landing stats:', error);

    // Return fallback data if queries fail
    return {
      totalRevenue: 2450000,
      totalActiveProperties: 156,
      occupancyRate: 89,
      confirmedBookings: 18,
      pendingBookings: 3,
      totalRequests: 47
    };
  }
};
