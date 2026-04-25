import React, { useState } from 'react';
import { Check, Zap, Star, Rocket, ArrowRight, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface OwnerUpgradeProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const OwnerUpgrade: React.FC<OwnerUpgradeProps> = ({ onClose, onSuccess }) => {
  const { profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'boost'>('pro');

  const handleUpgrade = async (plan: 'pro' | 'boost') => {
    setLoading(true);
    try {
      // Simulation de paiement
      await new Promise(resolve => setTimeout(resolve, 2000));

      const updates: any = {};
      if (plan === 'pro') {
        updates.plan = 'pro';
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        updates.plan_expires_at = expiryDate.toISOString();
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile?.id);

      if (error) throw error;

      await refreshProfile();
      onSuccess();
    } catch (error) {
      console.error('Error upgrading:', error);
      alert('Erreur lors de la mise à niveau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col md:flex-row">
          {/* Left Side - Info */}
          <div className="md:w-1/3 bg-slate-900 p-8 text-white">
            <div className="bg-ci-orange-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">LOKI <span className="text-ci-orange-500">PRO</span></h2>
            <p className="text-slate-400 mb-8">Faites passer votre activité immobilière au niveau supérieur avec nos outils professionnels.</p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-1 rounded-full"><Check className="h-4 w-4 text-ci-green-500" /></div>
                <span className="text-sm">Annonces illimitées</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-1 rounded-full"><Check className="h-4 w-4 text-ci-green-500" /></div>
                <span className="text-sm">Badge "Vérifié Pro"</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-1 rounded-full"><Check className="h-4 w-4 text-ci-green-500" /></div>
                <span className="text-sm">Priorité dans les recherches</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-1 rounded-full"><Check className="h-4 w-4 text-ci-green-500" /></div>
                <span className="text-sm">Statistiques d'audience</span>
              </div>
            </div>
          </div>

          {/* Right Side - Plans */}
          <div className="md:w-2/3 p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-slate-800">Choisissez votre plan</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors text-2xl">×</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pro Plan */}
              <div 
                onClick={() => setSelectedPlan('pro')}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${selectedPlan === 'pro' ? 'border-ci-orange-500 bg-orange-50' : 'border-slate-100 hover:border-slate-200'}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-orange-100 p-2 rounded-lg"><Star className="h-5 w-5 text-ci-orange-600" /></div>
                  <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Plus Populaire</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">Abonnement PRO</h4>
                <p className="text-sm text-slate-500 mb-4">Accès illimité à tous les outils</p>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-3xl font-black text-slate-900">35,000</span>
                  <span className="text-sm font-bold text-slate-500 mb-1">FCFA/mois</span>
                </div>
              </div>

              {/* Boost Plan */}
              <div 
                onClick={() => setSelectedPlan('boost')}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${selectedPlan === 'boost' ? 'border-ci-green-500 bg-emerald-50' : 'border-slate-100 hover:border-slate-200'}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-emerald-100 p-2 rounded-lg"><Rocket className="h-5 w-5 text-ci-green-600" /></div>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">BOOST 7 Jours</h4>
                <p className="text-sm text-slate-500 mb-4">Mise en avant d'une annonce</p>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-3xl font-black text-slate-900">5,000</span>
                  <span className="text-sm font-bold text-slate-500 mb-1">FCFA/7j</span>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <button
                onClick={() => handleUpgrade(selectedPlan)}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-100 ${selectedPlan === 'pro' ? 'bg-ci-orange-600 hover:bg-ci-orange-700 shadow-orange-200' : 'bg-ci-green-600 hover:bg-ci-green-700 shadow-emerald-200'}`}
              >
                {loading ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Activer maintenant
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
              <p className="text-center text-xs text-slate-400 mt-4">Paiement sécurisé. Annulez à tout moment.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
