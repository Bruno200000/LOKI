import React, { useEffect, useState } from 'react';
import { wavePaymentService } from '../../lib/wavePayment';
import { CheckCircle, XCircle, Loader, Home, ArrowRight } from 'lucide-react';

export const PaymentSuccess: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'error' | 'pending'>('pending');
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      // Récupérer les paramètres d'URL manuellement
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');

      if (!sessionId) {
        setPaymentStatus('error');
        setLoading(false);
        return;
      }

      try {
        // Vérifier le statut du paiement
        const status = await wavePaymentService.checkPaymentStatus(sessionId);

        if (status.status === 'completed') {
          // Mettre à jour le statut en base de données
          await wavePaymentService.updatePaymentStatus(sessionId, 'completed');
          setPaymentStatus('success');
        } else {
          setPaymentStatus('error');
        }

        setPaymentInfo(status);
      } catch (error) {
        console.error('Erreur lors de la vérification du paiement:', error);
        setPaymentStatus('error');
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, []);

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleRetryPayment = () => {
    window.location.href = '/booking';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-ci-orange-600 mx-auto mb-4" />
          <p className="text-slate-600">Vérification du paiement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 text-center">
        {paymentStatus === 'success' ? (
          <>
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Paiement réussi !</h1>
            <p className="text-slate-600 mb-6">
              Votre paiement a été traité avec succès. Merci pour votre confiance !
            </p>
            {paymentInfo && (
              <div className="bg-green-50 p-4 rounded-lg mb-6 text-left">
                <p className="text-sm text-green-800">
                  <strong>Montant payé :</strong> {paymentInfo.amount} {paymentInfo.currency}
                </p>
                <p className="text-sm text-green-800">
                  <strong>Référence :</strong> {paymentInfo.reference || paymentInfo.id}
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Paiement échoué</h1>
            <p className="text-slate-600 mb-6">
              Votre paiement n'a pas pu être traité. Veuillez réessayer ou contacter le support.
            </p>
          </>
        )}

        <div className="space-y-3">
          <button
            onClick={handleGoHome}
            className="w-full bg-ci-orange-600 hover:bg-ci-orange-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </button>

          {paymentStatus === 'error' && (
            <button
              onClick={handleRetryPayment}
              className="w-full border border-ci-orange-600 text-ci-orange-600 hover:bg-ci-orange-50 font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-5 h-5" />
              Réessayer le paiement
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
