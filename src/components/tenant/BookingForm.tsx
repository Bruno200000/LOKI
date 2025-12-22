import React, { useState } from 'react';
import { supabase, House } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Calendar, User, MapPin, Home, Loader, Phone } from 'lucide-react';

interface BookingFormProps {
  house: House;
  onBack: () => void;
  onBookingSuccess: (bookingId: string) => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({ house, onBack }) => {
  const { user, profile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [dateToAdd, setDateToAdd] = useState('');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [ownerPhone, setOwnerPhone] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) {
      setError("Veuillez vous connecter pour effectuer une réservation (aucun paiement requis)");
      return;
    }

    if (!fullName || !phone) {
      setError("Veuillez renseigner votre nom et votre numéro de téléphone");
      return;
    }

    if (selectedDates.length === 0) {
      setError("Veuillez ajouter au moins une date de réservation");
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

      // Déterminer la période (du plus tôt au plus tard)
      const sorted = [...selectedDates].sort();
      const earliest = sorted[0];
      const latest = sorted[sorted.length - 1];

      // Calcul frais fixe selon type
      const commission = house.type === 'residence' ? 2000 : (house.type === 'house' ? 5000 : null);

      // Créer la réservation (sans paiement côté utilisateur)
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          house_id: house.id,
          tenant_id: user.id,
          owner_id: house.owner_id,
          move_in_date: formatDateForDB(earliest),
          start_date: formatDateForDB(earliest),
          end_date: formatDateForDB(latest),
          status: 'pending',
          commission_fee: commission || undefined,
          monthly_rent: house.price,
          // Stocker nom/téléphone/dates dans notes au format JSON pour éviter des migrations
          notes: JSON.stringify({
            tenant_name: fullName,
            tenant_phone: phone,
            reservation_dates: sorted,
            message: notes || null
          })
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Fetch owner phone
      const { data: ownerData, error: ownerError } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', house.owner_id)
        .single();

      if (ownerError) {
        console.error("Could not fetch owner phone", ownerError);
      }

      setOwnerPhone(ownerData?.phone || 'Non disponible');
      setSuccess(true);
      // Pas de redirection vers une page de paiement

    } catch (err: any) {
      console.error('Error creating booking:', err);
      setError(err.message || 'Erreur lors de la création de la réservation');
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1); // Demain au plus tôt
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 6); // Dans 6 mois au plus tard

  const addDate = () => {
    if (!dateToAdd) return;
    // borne min/max
    const d = new Date(dateToAdd);
    if (d < minDate || d > maxDate) return;
    if (!selectedDates.includes(dateToAdd)) {
      setSelectedDates([...selectedDates, dateToAdd]);
    }
    setDateToAdd('');
  };

  const removeDate = (d: string) => {
    setSelectedDates(selectedDates.filter(x => x !== d));
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-8 h-8 text-green-600">✓</div>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Réservation envoyée !</h1>
            <p className="text-slate-600 mb-8">
              Votre demande de réservation a bien été enregistrée. Voici les coordonnées du propriétaire pour finaliser les détails :
            </p>

            <div className="bg-green-50 rounded-xl p-6 border border-green-200 mb-8">
              <p className="text-sm text-green-800 mb-2 uppercase tracking-wide font-semibold">Numéro du propriétaire</p>
              <div className="text-3xl font-bold text-green-900 tracking-wider select-all">
                {ownerPhone}
              </div>
              <a
                href={`tel:${ownerPhone}`}
                className="inline-block mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition"
              >
                Appeler maintenant
              </a>
            </div>

            <button
              onClick={() => window.location.href = '/dashboard'}
              className="text-slate-600 hover:text-slate-900 font-medium hover:underline"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              <p className="text-slate-600">Aucun paiement requis côté utilisateur. Renseignez vos informations et vos dates de séjour.</p>
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
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nom complet</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500"
                      placeholder="Votre nom complet"
                      required
                    />
                  </div>
                  <div className="text-slate-900">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Téléphone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500"
                        placeholder="07 00 00 00 00"
                        required
                      />
                    </div>
                  </div>
                  <div className="text-slate-900">
                    <span className="font-medium">Email:</span> {profile?.email || user?.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Dates de réservation (une ou plusieurs)
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="date"
                      value={dateToAdd}
                      onChange={(e) => setDateToAdd(e.target.value)}
                      min={minDate.toISOString().split('T')[0]}
                      max={maxDate.toISOString().split('T')[0]}
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addDate}
                    className="px-4 py-2 bg-ci-orange-600 text-white rounded-lg hover:bg-ci-orange-700"
                  >
                    Ajouter
                  </button>
                </div>
                {selectedDates.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedDates.sort().map(d => (
                      <span key={d} className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-sm">
                        {d}
                        <button type="button" onClick={() => removeDate(d)} className="text-slate-500 hover:text-slate-700">×</button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-sm text-slate-500 mt-1">
                  Sélectionnez des dates entre demain et dans 6 mois. Vous pouvez en ajouter plusieurs.
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

              <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Aucun frais côté utilisateur</h3>
                <p className="text-blue-800 mb-4">
                  La mise en relation est gratuite. Une fois la réservation enregistrée, le numéro du propriétaire s'affichera pour le contacter directement.
                </p>
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center font-bold">!</div>
                  Les frais fixes (2000 FCFA pour résidence, 5000 FCFA pour maison) sont réglés par le propriétaire après transaction réussie.
                </div>
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
                  disabled={loading || selectedDates.length === 0 || !fullName || !phone}
                  className="flex-1 px-6 py-3 bg-ci-orange-600 text-white rounded-lg hover:bg-ci-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Envoi de la demande...
                    </>
                  ) : (
                    'Envoyer la demande'
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
