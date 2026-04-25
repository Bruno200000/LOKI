import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, IVORIAN_CITIES } from '../lib/supabase';
import { ArrowLeft, Save, User, Mail, CheckCircle } from 'lucide-react';

export const ProfileEdit: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { profile, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    city: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        city: profile.city || '',
        address: profile.address || ''
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const updateData = {
        full_name: formData.full_name || null,
        phone: formData.phone || null,
        city: formData.city || null,
        address: formData.address || null
      };

      console.log('Tentative de mise à jour avec:', updateData, 'pour id:', profile.id);

      // 1. Update Auth Metadata (to keep fallback in sync)
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          phone: formData.phone,
          city: formData.city,
          address: formData.address // custom field
        }
      });

      if (metadataError) {
        console.warn('Erreur lors de la mise à jour des métadonnées:', metadataError);
        // We continue, as this is secondary to the main profile table
      }

      // 2. Update Profiles Table
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) {
        console.error('Erreur Supabase:', error);
        throw new Error(`Erreur: ${error.message}`);
      }

      if (!data) {
        throw new Error('Aucune donnée retournée');
      }

      console.log('Mise à jour réussie:', data);

      // 3. Refresh global profile state
      await refreshProfile();

      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        onBack();
      }, 2000);
    } catch (err: any) {
      console.error('Erreur complète:', err);
      setError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-ci-orange-600 to-ci-green-600 p-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center space-x-3">
                <User className="w-6 h-6 text-white" />
                <h1 className="text-2xl font-bold text-white">Modifier le profil</h1>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Profil mis à jour avec succès!
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email du propriétaire
              </label>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <Mail className="w-5 h-5 text-slate-400" />
                <span className="text-slate-900 font-medium">{profile?.email || 'Non disponible'}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">L'email ne peut pas être modifié</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nom complet
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition"
                placeholder="Votre nom complet"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition"
                placeholder="+225 XX XX XX XX XX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Adresse
              </label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition"
              >
                <option value="">Sélectionnez votre adresse</option>
                {IVORIAN_CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Détails complémentaires
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition"
                placeholder="Informations complémentaires"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onBack}
                disabled={loading}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-ci-orange-600 hover:bg-ci-orange-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? 'Sauvegarde...' : success ? 'Sauvegardé!' : (
                  <>
                    <Save className="w-4 h-4 mr-2 inline" />
                    Sauvegarder
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};