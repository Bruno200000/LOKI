import React from 'react';
import { XCircle, Home, RefreshCw, Phone } from 'lucide-react';

export const PaymentError: React.FC = () => {
  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleContactSupport = () => {
    window.open('tel:+2250123456789');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 text-center">
        <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Erreur de paiement</h1>
        <p className="text-slate-600 mb-6">
          Une erreur s'est produite lors du traitement de votre paiement.
          Veuillez vérifier vos informations et réessayer.
        </p>

        <div className="bg-red-50 p-4 rounded-lg mb-6 text-left">
          <p className="text-sm text-red-800">
            <strong>Causes possibles :</strong>
          </p>
          <ul className="text-sm text-red-700 mt-2 space-y-1">
            <li>• Solde insuffisant sur votre compte Wave</li>
            <li>• Informations de paiement incorrectes</li>
            <li>• Problème de connexion réseau</li>
            <li>• Service Wave temporairement indisponible</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleGoBack}
            className="w-full bg-ci-orange-600 hover:bg-ci-orange-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Réessayer le paiement
          </button>

          <button
            onClick={handleGoHome}
            className="w-full border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </button>

          <button
            onClick={handleContactSupport}
            className="w-full border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Phone className="w-5 h-5" />
            Contacter le support
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Besoin d'aide ? Contactez-nous au +225 01 23 45 67 89
          </p>
        </div>
      </div>
    </div>
  );
};
