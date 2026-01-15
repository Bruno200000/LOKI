import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface LoginProps {
  onToggleMode: () => void;
}

export const Login: React.FC<LoginProps> = ({ onToggleMode }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle OAuth redirect after Google Sign In
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const returnUrl = sessionStorage.getItem('googleRedirectUrl');
        if (returnUrl) {
          sessionStorage.removeItem('googleRedirectUrl');
          window.location.href = returnUrl;
        }
      }
    };

    handleOAuthCallback();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);

      // Check if user came from property details page
      const returnUrl = sessionStorage.getItem('returnToProperty');
      if (returnUrl) {
        sessionStorage.removeItem('returnToProperty');
        window.location.href = returnUrl;
      }
      // If no specific return URL, just reload the page to show dashboard
    } catch (err: any) {
      if (err.message?.includes('email_not_confirmed')) {
        setError('Veuillez vérifier votre email et confirmer votre compte avant de vous connecter.');
      } else if (err.message?.includes('Invalid login credentials')) {
        setError('Email ou mot de passe incorrect.');
      } else {
        setError(err.message || 'Erreur lors de la connexion');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
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

      // Check if user came from property details page
      const returnUrl = sessionStorage.getItem('returnToProperty');
      if (returnUrl) {
        sessionStorage.setItem('googleRedirectUrl', returnUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion avec Google');
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Veuillez entrer votre email pour réinitialiser votre mot de passe.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/?reset=true`,
      });

      if (error) throw error;

      setSuccess('Un email de réinitialisation a été envoyé à votre adresse.');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi de l\'email de réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-ci-green-100 rounded-full mb-4">
              <LogIn className="w-8 h-8 text-ci-orange-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Bienvenue sur LOKI</h2>
            <p className="text-slate-600 mt-2">Connectez-vous à votre compte</p>
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
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Mot de passe
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm font-semibold text-ci-orange-600 hover:text-ci-orange-700 transition"
                >
                  Mot de passe oublié ?
                </button>
              </div>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ci-orange-600 hover:bg-ci-orange-700 disabled:bg-slate-400 text-white font-semibold py-3 rounded-lg transition duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
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
            onClick={handleGoogleSignIn}
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

          <div className="mt-6 text-center">
            <p className="text-slate-600">
              Pas encore de compte ?{' '}
              <button
                onClick={onToggleMode}
                className="text-ci-orange-600 hover:text-ci-orange-700 font-semibold"
              >
                S'inscrire
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
