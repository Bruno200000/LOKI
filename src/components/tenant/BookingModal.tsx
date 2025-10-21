import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, House } from '../../lib/supabase';
import { wavePaymentService } from '../../lib/wavePayment';
import { X, MapPin, Bed, Bath, Calendar, AlertCircle, CreditCard } from 'lucide-react';
import { PaymentModal } from '../payments/PaymentModal';

interface BookingModalProps {
  house: House;
  onClose: () => void;
  onBookingComplete: () => void;
}

const COMMISSION_FEE = 1000;

export const BookingModal: React.FC<BookingModalProps> = ({ house, onClose, onBookingComplete }): JSX.Element => {
  const { profile } = useAuth();
  const [moveInDate, setMoveInDate] = useState('');
  const [endDate, setEndDate] = useState(''); // Date de fin de location
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [paymentMethod] = useState<'wave'>('wave'); // Forcer Wave comme méthode de paiement
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingPaymentData, setPendingPaymentData] = useState<{
    bookingId: string;
    paymentId: string;
    amount: number;
    description: string;
  } | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const handleContinueToPayment = () => {
    try {
      if (!moveInDate) {
        setError('Veuillez sélectionner une date d\'arrivée');
        return;
      }
      
      if (!endDate) {
        setError('Veuillez sélectionner une date de départ');
        return;
      }

      if (!endDate) {
        setError('Veuillez sélectionner une date de fin de location');
        return;
      }

      // Valider que les dates sont valides
      const startDate = new Date(moveInDate);
      const endDateObj = new Date(endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDateObj.getTime())) {
        setError('Veuillez sélectionner des dates valides');
        return;
      }

      // S'assurer que la date de fin est après la date de début
      if (endDateObj <= startDate) {
        setError('La date de fin doit être après la date d\'emménagement');
        return;
      }

      setError('');
      setStep('payment');
    } catch (err: any) {
      console.error('Erreur lors de la validation des dates:', err);
      setError('Une erreur est survenue lors de la validation des dates');
      setLoading(false);
    }
  };

  const handleBookingSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      if (!profile) {
        setError('Veuillez vous connecter pour effectuer une réservation');
        setLoading(false);
        return;
      }

      if (!moveInDate) {
        setError('Veuillez sélectionner une date d\'emménagement');
        setLoading(false);
        return;
      }

      if (!endDate) {
        setError('Veuillez sélectionner une date de fin de location');
        setLoading(false);
        return;
      }

      // Valider que les dates sont valides
      const startDate = new Date(moveInDate);
      const endDateObj = new Date(endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDateObj.getTime())) {
        setError('Veuillez sélectionner des dates valides');
        setLoading(false);
        return;
      }

      // S'assurer que la date de fin est après la date de début
      if (endDateObj <= startDate) {
        setError('La date de fin doit être après la date d\'emménagement');
        setLoading(false);
        return;
      }

      // Vérifier que la date n'est pas dans le passé
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (startDate < today) {
        setError('La date d\'emménagement ne peut pas être dans le passé');
        setLoading(false);
        return;
      }

      if (!house?.id) {
        setError('Informations de la maison non disponibles');
        setLoading(false);
        return;
      }

      // Formater les dates pour la base de données
      const formatDateForDB = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      };

      // Créer la réservation
      const bookingData = {
        house_id: house.id,
        tenant_id: profile.id,
        owner_id: house.owner_id,
        move_in_date: formatDateForDB(moveInDate),
        end_date: formatDateForDB(endDate),
        start_date: formatDateForDB(moveInDate), // Formatage explicite pour la base de données
        status: 'pending',
        commission_fee: COMMISSION_FEE,
        monthly_rent: house.price,
        notes: notes || null,
      };

      // 1. Créer la réservation
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select()
        .single();

      if (bookingError) throw bookingError;

      // 2. Préparer les données pour le paiement
      const paymentData = {
        booking_id: booking.id,
        amount: COMMISSION_FEE,
        payment_type: 'commission',
        payment_method: 'wave',
        status: 'pending',
        paid_by: profile.id,
        paid_to: house.owner_id,
        description: `Réservation #${booking.id} - ${house.title}`,
        metadata: {
          house_id: house.id,
          house_title: house.title,
          tenant_id: profile.id,
          move_in_date: moveInDate,
        },
      };

      // 3. Enregistrer le paiement en attente
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert([paymentData])
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Stocker les données de paiement et ouvrir le modal de paiement
      setPendingPaymentData({
        bookingId: booking.id,
        paymentId: payment.id,
        amount: COMMISSION_FEE,
        description: `Commission réservation - ${house.title}`,
      });

      setShowPaymentModal(true);
      setLoading(false);

    } catch (err: any) {
      console.error('Erreur lors de la réservation:', err);
      setError(err.message || 'Une erreur est survenue lors de la réservation');
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    if (!pendingPaymentData || !profile) return;

    try {
      // Créer la session de paiement Wave
      const { session_url } = await wavePaymentService.createCheckoutSession({
        amount: pendingPaymentData.amount,
        currency: 'XOF',
        error_url: `${window.location.origin}/payment/error?payment=${pendingPaymentData.paymentId}`,
        success_url: `${window.location.origin}/payment/success?payment=${pendingPaymentData.paymentId}`,
        description: pendingPaymentData.description,
        customer_email: profile.email || '',
        customer_phone: profile.phone || ''
      });

      // Mettre à jour le paiement avec l'ID de session Wave
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          external_payment_id: session_url.split('/').pop(),
          status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', pendingPaymentData.paymentId);

      if (updateError) throw updateError;

      // Notifier le composant parent que la réservation est complétée
      onBookingComplete();

      // Fermer le modal de paiement et rediriger vers Wave
      setShowPaymentModal(false);
      window.location.href = session_url;

    } catch (err: any) {
      console.error('Erreur lors de la création de la session de paiement:', err);
      setError(err.message || 'Erreur lors de la création de la session de paiement');
    }
  };

  const handlePaymentError = (error: string) => {
    setError(error);
    setShowPaymentModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {step === 'details' ? 'Réserver cette propriété' : 'Paiement de la commission'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}


          <div className="bg-slate-50 rounded-lg p-4 sm:p-5 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {house.photos && house.photos.length > 0 && (
                <img
                  src={house.photos[0]}
                  alt={house.title}
                  className="w-full sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base sm:text-lg text-slate-900 mb-1 truncate">{house.title}</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-slate-600 text-sm mb-2">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{house.location}, {house.city}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Bed className="w-4 h-4" />
                    <span>{house.bedrooms} chambre{(house.bedrooms || 1) > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="w-4 h-4" />
                    <span>{house.bathrooms} salle{(house.bathrooms || 1) > 1 ? 's' : ''} de bain</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {step === 'details' ? (
            <form onSubmit={(e) => { e.preventDefault(); handleContinueToPayment(); }} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date d'emménagement *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                    <input
                      type="date"
                      value={moveInDate}
                      onChange={(e) => {
                        setMoveInDate(e.target.value);
                        // Si la date de fin est antérieure à la nouvelle date d'arrivée, on la met à jour
                        if (endDate && new Date(e.target.value) > new Date(endDate)) {
                          const newEndDate = new Date(e.target.value);
                          newEndDate.setDate(newEndDate.getDate() + 1);
                          setEndDate(newEndDate.toISOString().split('T')[0]);
                        }
                      }}
                      min={today}
                      className="w-full pl-10 sm:pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date de fin de location *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={moveInDate || tomorrowStr}
                      className="w-full pl-10 sm:pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition text-sm sm:text-base"
                  rows={3}
                  placeholder="Informations supplémentaires..."
                />
              </div>

              <div className="bg-ci-green-50 border border-ci-green-200 rounded-lg p-4">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 text-sm sm:text-base">Loyer mensuel:</span>
                    <span className="font-semibold text-slate-900 text-sm sm:text-base">
                      {house.price.toLocaleString()} FCFA
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 text-sm sm:text-base">Commission plateforme:</span>
                    <span className="font-semibold text-slate-900 text-sm sm:text-base">
                      {COMMISSION_FEE.toLocaleString()} FCFA
                    </span>
                  </div>
                  <div className="border-t border-ci-green-200 mt-3 pt-3 flex items-center justify-between">
                    <span className="font-semibold text-slate-900 text-sm sm:text-base">Total à payer maintenant:</span>
                    <span className="text-xl sm:text-2xl font-bold text-ci-orange-600">
                      {COMMISSION_FEE.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-ci-orange-600 hover:bg-ci-orange-700 disabled:bg-slate-400 text-white font-semibold py-3 sm:py-4 rounded-lg transition text-sm sm:text-base"
              >
                Continuer vers le paiement
              </button>
            </form>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleBookingSubmit(); }} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Méthode de paiement
                </label>
                <div className="space-y-3">
                  <div className="p-3 sm:p-4 border-2 border-ci-orange-500 bg-ci-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      <span className="font-semibold text-slate-900 text-sm sm:text-base">Wave</span>
                      <span className="ml-auto px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        Recommandé
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">
                      Paiement sécurisé via Wave Mobile Money
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 border-2 border-slate-200 rounded-lg opacity-50 cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                      <span className="font-semibold text-slate-400 text-sm sm:text-base">Orange Money</span>
                      <span className="ml-auto px-2 py-1 bg-slate-100 text-slate-400 text-xs font-medium rounded">
                        Bientôt disponible
                      </span>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 border-2 border-slate-200 rounded-lg opacity-50 cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                      <span className="font-semibold text-slate-400 text-sm sm:text-base">Moov Money</span>
                      <span className="ml-auto px-2 py-1 bg-slate-100 text-slate-400 text-xs font-medium rounded">
                        Bientôt disponible
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
                <p className="text-sm text-amber-900">
                  <strong>Note:</strong> Après avoir confirmé, vous serez redirigé vers {paymentMethod === 'wave' ? 'Wave' : paymentMethod === 'orange_money' ? 'Orange Money' : 'Moov Money'} pour finaliser le paiement de {COMMISSION_FEE.toLocaleString()} FCFA.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="flex-1 px-4 sm:px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition text-sm sm:text-base"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-ci-orange-600 hover:bg-ci-orange-700 disabled:bg-slate-400 text-white rounded-lg font-semibold transition text-sm sm:text-base"
                >
                  {loading ? 'Traitement...' : 'Confirmer la réservation'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Modal de paiement sécurisé */}
      {showPaymentModal && pendingPaymentData && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          amount={pendingPaymentData.amount}
          currency="XOF"
          description={pendingPaymentData.description}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      )}
    </div>
  );
};
