import { useState } from 'react';
import { wavePaymentService, WavePaymentData } from '../lib/wavePayment';
import { useAuth } from '../contexts/AuthContext';

export interface PaymentOptions {
  amount: number;
  currency?: string;
  description?: string;
  successUrl?: string;
  errorUrl?: string;
}

export const usePayment = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const initiatePayment = async (options: PaymentOptions) => {
    if (!profile) {
      setError('Utilisateur non connecté');
      return null;
    }

    if (!wavePaymentService) {
      setError('Service de paiement non configuré. Veuillez configurer VITE_WAVE_API_KEY dans votre fichier .env');
      return null;
    }

    setLoading(true);
    setError('');

    try {
      const paymentData: WavePaymentData = {
        amount: options.amount,
        currency: options.currency || 'XOF',
        error_url: options.errorUrl || `${window.location.origin}/payment/error`,
        success_url: options.successUrl || `${window.location.origin}/payment/success`,
        description: options.description || 'Paiement LOKI',
        customer_email: profile.email || '',
        customer_phone: profile.phone || '',
      };

      // Créer la session de paiement
      const response = await wavePaymentService.createCheckoutSession(paymentData);

      // Enregistrer le paiement en base de données
      await wavePaymentService.recordPayment({
        user_id: profile.id,
        amount: options.amount,
        currency: options.currency || 'XOF',
        wave_session_id: response.session_id,
        description: options.description || 'Paiement LOKI',
        status: 'pending',
      });

      // Rediriger vers Wave
      window.location.href = response.session_url;

      return response.session_id;
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors du paiement';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (sessionId: string) => {
    if (!wavePaymentService) {
      throw new Error('Service de paiement non configuré. Veuillez configurer VITE_WAVE_API_KEY dans votre fichier .env');
    }

    try {
      return await wavePaymentService.checkPaymentStatus(sessionId);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la vérification');
      throw err;
    }
  };

  return {
    initiatePayment,
    checkPaymentStatus,
    loading,
    error,
  };
};
