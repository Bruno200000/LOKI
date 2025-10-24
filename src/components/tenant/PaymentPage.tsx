import React, { useState, useEffect } from 'react';
import { supabase, Booking } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, CreditCard, CheckCircle, X, Loader } from 'lucide-react';

interface PaymentPageProps {
  bookingId: string;
  onBack: () => void;
}

export const PaymentPage: React.FC<PaymentPageProps> = ({ bookingId, onBack }) => {
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .single();

        if (error) throw error;
        setBooking(data);
      } catch (error) {
        console.error('Error fetching booking:', error);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const handlePaymentClick = () => {
    if (!user || !booking) return;

    // Rediriger directement vers le lien de paiement Wave
    const wavePaymentUrl = 'https://pay.wave.com/m/M_ci_YbMv_7m4fP66/c/ci/?amount=1000';
    window.location.href = wavePaymentUrl;
  };

  const handleRetry = () => {
    setPaymentStatus('idle');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-ci-orange-600 mb-4"></div>
          <p className="text-slate-600 font-medium">Chargement de la réservation...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <X className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Réservation non trouvée</p>
        </div>
      </div>
    );
  }

  const getButtonContent = () => {
    switch (paymentStatus) {
      case 'processing':
        return (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Traitement du paiement...
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="w-5 h-5" />
            Paiement réussi
          </>
        );
      case 'error':
        return (
          <>
            <X className="w-5 h-5" />
            Réessayer le paiement
          </>
        );
      default:
        return (
          <>
            <CreditCard className="w-5 h-5" />
            Payer avec Wave (1 000 FCFA)
          </>
        );
    }
  };

  const getButtonColor = () => {
    switch (paymentStatus) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'error':
        return 'bg-red-600 hover:bg-red-700';
      default:
        return 'bg-ci-orange-600 hover:bg-ci-orange-700';
    }
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-slate-100 border-b border-slate-200">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour au formulaire de réservation
              </button>
            </div>

            <div className="p-6">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Finaliser la réservation</h1>
                <p className="text-slate-600">Procédez au paiement de la commission pour confirmer votre réservation</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Booking Summary */}
                <div className="bg-slate-50 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Résumé de la réservation</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">ID de réservation</span>
                      <span className="font-semibold">{booking.id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Date d'emménagement</span>
                      <span className="font-semibold">{new Date(booking.move_in_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Statut</span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        {booking.status === 'pending' ? 'En attente' : booking.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Loyer mensuel</span>
                      <span className="font-semibold">{booking.monthly_rent?.toLocaleString()} FCFA</span>
                    </div>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-slate-50 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Détails du paiement</h2>
                  <div className="space-y-3">
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
                    Cette commission confirme votre réservation. Le premier mois de loyer sera payé directement au propriétaire.
                  </p>
                  <p className="text-sm text-blue-600 mt-2 font-medium">
                    💳 Vous serez redirigé vers Wave Mobile Money pour finaliser le paiement de 1 000 FCFA
                  </p>
                </div>
              </div>

              {/* Payment Status */}
              {paymentStatus === 'success' && (
                <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-green-800">Paiement réussi !</h3>
                      <p className="text-green-700 mt-1">
                        Votre réservation a été confirmée. Vous recevrez bientôt les informations du propriétaire.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {paymentStatus === 'error' && (
                <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <X className="w-8 h-8 text-red-600" />
                    <div>
                      <h3 className="font-semibold text-red-800">Erreur de paiement</h3>
                      <p className="text-red-700 mt-1">
                        Une erreur s'est produite lors du traitement du paiement. Veuillez réessayer.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Button */}
              {paymentStatus !== 'success' && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={paymentStatus === 'error' ? handleRetry : handlePaymentClick}
                    disabled={paymentStatus === 'processing'}
                    className={`px-8 py-4 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold text-white ${getButtonColor()}`}
                  >
                    {getButtonContent()}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
