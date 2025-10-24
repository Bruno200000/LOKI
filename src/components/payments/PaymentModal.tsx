import React, { useState } from 'react';
import { wavePaymentService, WavePaymentData } from '../../lib/wavePayment';
import { useAuth } from '../../contexts/AuthContext';
import { Loader, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  currency?: string;
  description?: string;
  onPaymentSuccess?: (sessionId: string) => void;
  onPaymentError?: (error: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  currency = 'XOF',
  description = 'Paiement LOKI',
  onPaymentSuccess,
  onPaymentError,
}) => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handlePayment = async () => {
    if (!profile) {
      setError('Utilisateur non connecté');
      return;
    }

    if (!wavePaymentService) {
      setError('Service de paiement non configuré. Veuillez configurer VITE_WAVE_API_KEY dans votre fichier .env');
      setPaymentStatus('error');
      onPaymentError?.('Service de paiement non configuré');
      return;
    }

    setLoading(true);
    setError('');
    setPaymentStatus('processing');

    try {
      const paymentData: WavePaymentData = {
        amount,
        currency,
        error_url: `${window.location.origin}/payment/error`,
        success_url: `${window.location.origin}/payment/success`,
        description,
        customer_email: profile?.email || '',
        customer_phone: profile.phone || '',
      };

      // Créer la session de paiement Wave
      const response = await wavePaymentService.createCheckoutSession(paymentData);

      // Enregistrer le paiement dans la base de données
      await wavePaymentService.recordPayment({
        user_id: profile.id,
        amount,
        currency,
        wave_session_id: response.session_id,
        description,
        status: 'pending',
      });

      // Rediriger vers Wave pour le paiement
      window.location.href = response.session_url;

      setPaymentStatus('success');
      onPaymentSuccess?.(response.session_id);

    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors du paiement';
      setError(errorMessage);
      setPaymentStatus('error');
      onPaymentError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'processing':
        return <Loader className="w-8 h-8 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-600" />;
      default:
        return <CreditCard className="w-8 h-8 text-slate-600" />;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'processing':
        return 'Traitement du paiement en cours...';
      case 'success':
        return 'Paiement initié avec succès ! Redirection vers Wave...';
      case 'error':
        return error;
      default:
        return 'Prêt à effectuer le paiement';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            {getStatusIcon()}
          </div>

          <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">
            Paiement sécurisé
          </h2>

          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-ci-orange-600 mb-2">
              {amount.toLocaleString()} {currency}
            </div>
            <p className="text-slate-600">{description}</p>
          </div>

          {paymentStatus !== 'idle' && (
            <div className={`text-center p-4 rounded-lg mb-4 ${
              paymentStatus === 'success' ? 'bg-green-50 text-green-800' :
              paymentStatus === 'error' ? 'bg-red-50 text-red-800' :
              'bg-blue-50 text-blue-800'
            }`}>
              <p className="text-sm font-medium">{getStatusMessage()}</p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handlePayment}
              disabled={loading || paymentStatus === 'success'}
              className="w-full bg-ci-orange-600 hover:bg-ci-orange-700 disabled:bg-slate-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Traitement...
                </>
              ) : paymentStatus === 'success' ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Redirection...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Payer avec Wave
                </>
              )}
            </button>

            <button
              onClick={onClose}
              disabled={loading}
              className="w-full border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              Annuler
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Paiement sécurisé via Wave Mobile Money
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Vous serez redirigé vers l'application Wave pour finaliser le paiement
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
