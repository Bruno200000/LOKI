import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Booking, House } from '../../lib/supabase';
import { Calendar, DollarSign, X, AlertCircle, CheckCircle } from 'lucide-react';
import { OwnerContactInfo } from './OwnerContactInfo';

export const BookingManager: React.FC = () => {
  const { profile } = useAuth();

  // Vérification de l'initialisation du profil
  if (!profile) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600">Erreur: Utilisateur non connecté</div>
      </div>
    );
  }
  const [bookings, setBookings] = useState<(Booking & { house: House })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('tenant_id', profile?.id)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      const bookingsWithHouses = await Promise.all(
        (bookingsData || []).filter(booking => booking?.house_id).map(async (booking) => {
          const { data: house, error: houseError } = await supabase
            .from('houses')
            .select('*')
            .eq('id', booking.house_id)
            .single();

          if (houseError) throw houseError;

          return { ...booking, house };
        })
      );

      setBookings(bookingsWithHouses);
    } catch (err: any) {
      setError('Erreur lors du chargement des réservations');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string, houseId: number) => {
    if (!bookingId || !houseId) {
      console.error('ID de réservation ou de maison invalide');
      return;
    }
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return;

    try {
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (bookingError) throw bookingError;

      const { error: houseError } = await supabase
        .from('houses')
        .update({ status: 'available' })
        .eq('id', houseId);

      if (houseError) throw houseError;

      setSuccess('Réservation annulée avec succès');
      setTimeout(() => setSuccess(''), 3000);
      await fetchBookings();
    } catch (err: any) {
      setError('Erreur lors de l\'annulation');
      console.error('Error canceling booking:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmée';
      case 'pending':
        return 'En attente';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-ci-orange-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Mes Réservations</h1>
        <p className="text-slate-600">
          {bookings.length} réservation{bookings.length > 1 ? 's' : ''}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-800 text-sm">{success}</p>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Aucune réservation
          </h3>
          <p className="text-slate-600">
            Commencez par parcourir les propriétés disponibles
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition">
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-48 lg:w-64 aspect-video sm:aspect-square lg:aspect-auto bg-slate-200">
                  {booking.house.image_url ? (
                    <img
                      src={booking.house.image_url}
                      alt={booking.house.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar className="w-10 h-10 text-slate-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3 sm:mb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 line-clamp-2">
                      {booking.house.title}
                    </h3>
                    <span
                      className={`px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {getStatusText(booking.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div className="flex items-start gap-2">
                      <div className="p-1.5 sm:p-2 bg-slate-100 rounded-lg mt-0.5">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-slate-600">Date d'emménagement</div>
                        <div className="font-semibold text-slate-900 text-sm sm:text-base">
                          {new Date(booking.move_in_date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="p-1.5 sm:p-2 bg-slate-100 rounded-lg mt-0.5">
                        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-slate-600">Loyer mensuel</div>
                        <div className="font-semibold text-slate-900 text-sm sm:text-base">
                          {booking.house.price.toLocaleString()} FCFA
                        </div>
                      </div>
                    </div>
                  </div>

                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleCancelBooking(booking.id, booking.house_id)}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-sm sm:text-base"
                      >
                        <X className="w-4 h-4" />
                        Annuler la réservation
                      </button>
                      {booking.status === 'confirmed' && (
                        <div className="mt-2 sm:mt-0">
                          {booking?.owner_id && (
                            <OwnerContactInfo
                              ownerId={booking.owner_id.toString()}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
