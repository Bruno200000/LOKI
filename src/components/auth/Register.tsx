import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, Mail, Lock, User, AlertCircle, Home, Users, Phone, MapPin, Eye, EyeOff } from 'lucide-react';
import { supabase, IVORIAN_CITIES } from '../../lib/supabase';

interface RegisterProps {
  onToggleMode: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onToggleMode }) => {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [role, setRole] = useState<'owner' | 'tenant'>('tenant');
  const [ownerType, setOwnerType] = useState<'particulier' | 'agent'>('particulier');
  const [mainActivityNeighborhood, setMainActivityNeighborhood] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    try {
      await signUp(email, password, fullName, role, phone, city, ownerType, mainActivityNeighborhood);
      setSuccess('Compte créé avec succès ! Vérifiez votre email et cliquez sur le lien de confirmation. Vous serez ensuite redirigé vers votre tableau de bord.');
      setLoading(false);
      // Ne pas vider les champs pour permettre à l'utilisateur de voir le message de succès
    } catch (err: any) {
      if (err.message?.includes('over_email_send_rate_limit')) {
        setError('Trop de tentatives. Veuillez attendre quelques instants avant de réessayer.');
      } else if (err.message?.includes('User already registered')) {
        setError('Cet email est déjà utilisé. Essayez de vous connecter.');
      } else {
        setError(err.message || 'Erreur lors de la création du compte');
      }
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion avec Google');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-ci-green-100 rounded-full mb-4">
              <UserPlus className="w-8 h-8 text-ci-orange-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Créer un compte</h2>
            <p className="text-slate-600 mt-2">Rejoignez LOKI dès aujourd'hui</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-green-800 text-sm font-medium">{success}</p>
                <p className="text-green-700 text-xs mt-1">Vous pouvez fermer cette page et revenir après avoir confirmé votre email.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
                Nom complet
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-green-500 focus:border-ci-green-500 outline-none transition"
                  placeholder="Jean Kouassi"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                Numéro de téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-green-500 focus:border-ci-green-500 outline-none transition"
                  placeholder="07 00 00 00 00"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-2">
                Ville
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-green-500 focus:border-ci-green-500 outline-none transition appearance-none bg-white"
                  required
                >
                  <option value="" disabled>Sélectionnez votre ville</option>
                  {IVORIAN_CITIES.map((cityName) => (
                    <option key={cityName} value={cityName}>{cityName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-green-500 focus:border-ci-green-500 outline-none transition"
                  placeholder="votre@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-green-500 focus:border-ci-green-500 outline-none transition"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Type de compte
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('tenant')}
                  className={`p-4 border-2 rounded-lg transition-all ${role === 'tenant'
                    ? 'border-ci-green-500 bg-ci-green-50 text-ci-orange-700'
                    : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                  <Users className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-semibold text-sm">Locataire</div>
                  <div className="text-xs text-slate-600 mt-1">Chercher un logement</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('owner')}
                  className={`p-4 border-2 rounded-lg transition-all ${role === 'owner'
                    ? 'border-ci-green-500 bg-ci-green-50 text-ci-orange-700'
                    : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                  <Home className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-semibold text-sm">Propriétaire</div>
                  <div className="text-xs text-slate-600 mt-1">Louer ma propriété</div>
                </button>
              </div>
            </div>

            {role === 'owner' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Type de propriétaire
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setOwnerType('particulier')}
                      className={`p-3 border-2 rounded-lg transition-all ${ownerType === 'particulier'
                        ? 'border-ci-green-500 bg-ci-green-50 text-ci-orange-700'
                        : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <User className="w-5 h-5 mx-auto mb-1" />
                      <div className="font-semibold text-sm">Particulier</div>
                      <div className="text-xs text-slate-600 mt-1">Propriétaire individuel</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOwnerType('agent')}
                      className={`p-3 border-2 rounded-lg transition-all ${ownerType === 'agent'
                        ? 'border-ci-green-500 bg-ci-green-50 text-ci-orange-700'
                        : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <Home className="w-5 h-5 mx-auto mb-1" />
                      <div className="font-semibold text-sm">Agent</div>
                      <div className="text-xs text-slate-600 mt-1">Agent immobilier</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="mainActivityNeighborhood" className="block text-sm font-medium text-slate-700 mb-2">
                    Quartier principal d'activité
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="mainActivityNeighborhood"
                      type="text"
                      value={mainActivityNeighborhood}
                      onChange={(e) => setMainActivityNeighborhood(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-green-500 focus:border-ci-green-500 outline-none transition"
                      placeholder="Ex: Cocody, Plateau, Yopougon..."
                      required={role === 'owner'}
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ci-orange-600 hover:bg-ci-orange-700 disabled:bg-slate-400 text-white font-semibold py-3 rounded-lg transition duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Ou continuer avec</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 disabled:bg-slate-100 text-slate-700 font-semibold py-3 rounded-lg border-2 border-slate-200 transition duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>

          {success && (
            <div className="mt-6 text-center">
              <button
                onClick={onToggleMode}
                className="text-ci-orange-600 hover:text-ci-orange-700 font-semibold underline"
              >
                ← Retour à la connexion
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-slate-600">
              Déjà un compte ?{' '}
              <button
                onClick={onToggleMode}
                className="text-ci-orange-600 hover:text-ci-orange-700 font-semibold"
              >
                Se connecter
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
