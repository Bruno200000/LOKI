import React, { useState } from 'react';
import { supabase, House } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Calendar, User, MapPin, Home, Loader } from 'lucide-react';

interface BookingFormProps {
  house: House;
  onBack: () => void;
  onBookingSuccess: (bookingId: string) => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({ house, onBack, onBookingSuccess }) => {
  const { user, profile } = useAuth();
  const [moveInDate, setMoveInDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) {
      setError('Veuillez vous connecter pour effectuer une réservation');
      return;
    }
    
    if (!moveInDate) {
      setError('Veuillez sélectionner une date d\'arrivée');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Format the date for database
      const formatDateForDB = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      };

      // Create booking record
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          house_id: house.id,
          tenant_id: user.id,
          owner_id: house.owner_id,
          move_in_date: formatDateForDB(moveInDate),
          start_date: formatDateForDB(moveInDate), // Using move-in date as start date
          end_date: new Date(new Date(moveInDate).setMonth(new Date(moveInDate).getMonth() + 12))
            .toISOString()
            .split('T')[0], // Default to 1 year after move-in
          status: 'pending',
          commission_fee: 1000,
          monthly_rent: house.price,
          notes: notes || null
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Redirect to payment page
      onBookingSuccess(bookingData.id);

    } catch (err: any) {
      console.error('Error creating booking:', err);
      setError(err.message || 'Erreur lors de la création de la réservation');
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1); // Tomorrow at earliest
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 6); // 6 months from now

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-slate-100 border-b border-slate-200">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour aux détails de la propriété
            </button>
          </div>

          <div className="p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Réserver cette propriété</h1>
              <p className="text-slate-600">Complétez les informations pour finaliser votre réservation</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Property Information */}
              <div className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Informations de la propriété
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-600" />
                    <span className="text-slate-700">{house.location}, {house.city}</span>
                  </div>
                  <div className="text-slate-900">
                    <span className="font-medium">Titre:</span> {house.title}
                  </div>
                  <div className="text-slate-900">
                    <span className="font-medium">Prix mensuel:</span> {house.price.toLocaleString()} FCFA
                  </div>
                  <div className="text-slate-900">
                    <span className="font-medium">Chambres:</span> {house.bedrooms || 1}
                  </div>
                  <div className="text-slate-900">
                    <span className="font-medium">Salles de bain:</span> {house.bathrooms || 1}
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Vos informations
                </h2>
                <div className="space-y-3">
                  <div className="text-slate-900">
                    <span className="font-medium">Nom:</span> {profile?.full_name || 'Non spécifié'}
                  </div>
                  <div className="text-slate-900">
                    <span className="font-medium">Email:</span> {profile?.email || user?.email}
                  </div>
                  {profile?.phone && (
                    <div className="text-slate-900">
                      <span className="font-medium">Téléphone:</span> {profile.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label htmlFor="moveInDate" className="block text-sm font-medium text-slate-700 mb-2">
                  Date d'emménagement souhaitée *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="date"
                    id="moveInDate"
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    min={minDate.toISOString().split('T')[0]}
                    max={maxDate.toISOString().split('T')[0]}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500"
                    required
                  />
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  Sélectionnez une date entre demain et dans 6 mois
                </p>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-2">
                  Notes supplémentaires (optionnel)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500"
                  placeholder="Ajoutez des informations supplémentaires pour le propriétaire..."
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              <div className="bg-slate-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Résumé de la réservation</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Loyer mensuel</span>
                    <span className="font-semibold">{house.price.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Commission plateforme</span>
                    <span className="font-semibold">1 000 FCFA</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">Total à payer maintenant</span>
                      <span className="text-xl font-bold text-ci-orange-600">1 000 FCFA</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-500 mt-3">
                  Vous ne paierez que la commission maintenant. Le premier mois de loyer sera payé directement au propriétaire.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onBack}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading || !moveInDate}
                  className="flex-1 px-6 py-3 bg-ci-orange-600 text-white rounded-lg hover:bg-ci-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Création de la réservation...
                    </>
                  ) : (
                    'Confirmer la réservation'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
