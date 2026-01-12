import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';
import { SecurityUtils, SecurityMiddleware } from '../lib/security';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: 'owner' | 'tenant', phone: string, city: string, ownerType?: 'particulier' | 'agent', mainActivityNeighborhood?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    console.log('Récupération du profil pour userId:', userId);

    const preferredCols = [
      'id',
      'full_name',
      'role',
      'email',
      'phone',
      'city',
      'address',
      'owner_type',
      'main_activity_neighborhood',
      'created_at',
      'updated_at'
    ];

    const selectCols = (cols: string[]) => cols.join(',');

    try {
      // Try with preferred columns first
      let { data, error } = await supabase
        .from('profiles')
        .select(selectCols(preferredCols))
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        // If column does not exist (e.g., profiles table missing `email` or `updated_at`), try a fallback
        if (error.code === '42703' || /does not exist/i.test(error.message || '')) {
          console.warn('Column missing in profiles table, retrying without optional cols:', error.message);
          const fallbackCols = preferredCols.filter(c => c !== 'email' && c !== 'updated_at');
          const result = await supabase
            .from('profiles')
            .select(selectCols(fallbackCols))
            .eq('id', userId)
            .maybeSingle();

          if (result.error) {
            console.error('Error fetching profile after fallback:', result.error);
            return null;
          }

          console.log('Profil récupéré (fallback):', result.data);
          return result.data;
        }

        console.error('Error fetching profile:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });

        return null;
      }

      console.log('Profil récupéré:', data);
      return data;
    } catch (err: any) {
      console.error('Unexpected error fetching profile:', err);
      return null;
    }
  };

  // Helper: attempt fetching profile with retries (handles RLS trigger timing issues)
  const attemptFetchProfileWithRetries = async (userId: string, retries = 5, delayMs = 500) => {
    for (let i = 0; i < retries; i++) {
      const p = await fetchProfile(userId);
      if (p) return p;
      // wait
      await new Promise((res) => setTimeout(res, delayMs));
    }
    return null;
  }; 

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Try to fetch existing profile; retry a few times to handle trigger timing
        (async () => {
          let profileData = await attemptFetchProfileWithRetries(session.user.id, 6, 400);

          if (!profileData) {
            // If still missing, try to ensure auth metadata is set so the trigger can populate profile
            const fullName = session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              session.user.email?.split('@')[0] || 'User';

            const nameValidation = SecurityUtils.validateFullName(fullName);
            if (!nameValidation.isValid) {
              console.error('Invalid name provided:', nameValidation.errors);
            }

            const sanitizedName = SecurityUtils.sanitizeInput(fullName);
            const phone = session.user.user_metadata?.phone || null;
            const city = session.user.user_metadata?.city || null;
            const role = session.user.user_metadata?.role || 'tenant';

            try {
              const { error: metaError } = await supabase.auth.updateUser({
                data: {
                  full_name: sanitizedName,
                  role,
                  phone: phone,
                  city: city,
                },
              });

              if (metaError) {
                console.warn('Unable to update auth metadata during session init:', metaError);
              } else {
                // Try to fetch once more
                profileData = await attemptFetchProfileWithRetries(session.user.id, 6, 400);
              }
            } catch (err) {
              console.warn('Error updating auth metadata during session init:', err);
            }
          }

          if (profileData) setProfile(profileData);
        })();
      }

      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Try to fetch profile with retries
          let profileData = await attemptFetchProfileWithRetries(session.user.id, 6, 400);

          if (!profileData) {
            const fullName = session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              session.user.email?.split('@')[0] || 'User';

            const sanitizedName = SecurityUtils.sanitizeInput(fullName);
            const phone = session.user.user_metadata?.phone || null;
            const city = session.user.user_metadata?.city || null;
            const role = session.user.user_metadata?.role || 'tenant';

            try {
              const { error: metaError } = await supabase.auth.updateUser({
                data: {
                  full_name: sanitizedName,
                  role,
                  phone: phone,
                  city: city,
                },
              });

              if (metaError) {
                console.warn('Unable to update auth metadata after auth state change:', metaError);
              } else {
                profileData = await attemptFetchProfileWithRetries(session.user.id, 6, 400);
              }
            } catch (err) {
              console.warn('Error updating auth metadata after auth state change:', err);
            }
          }

          setProfile(profileData);
        } else {
          setProfile(null);
        }

        setLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: 'owner' | 'tenant',
    phone: string,
    city: string,
    ownerType?: 'particulier' | 'agent',
    mainActivityNeighborhood?: string
  ) => {
    // Validation des entrées
    const emailValidation = SecurityUtils.validateEmail(email);
    const passwordValidation = SecurityUtils.validatePassword(password);
    const nameValidation = SecurityUtils.validateFullName(fullName);
    const phoneValidation = SecurityUtils.validatePhone(phone);

    if (!emailValidation.isValid || !passwordValidation.isValid || !nameValidation.isValid || !phoneValidation.isValid) {
      const allErrors = [
        ...emailValidation.errors,
        ...passwordValidation.errors,
        ...nameValidation.errors,
        ...phoneValidation.errors,
      ];
      throw new Error(`Erreurs de validation: ${allErrors.join(', ')}`);
    }

    // Rate limiting
    const rateLimitKey = `signup_${email}`;
    if (!SecurityUtils.checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000)) { // 3 tentatives par heure
      throw new Error('Trop de tentatives d\'inscription. Veuillez réessayer dans 1 heure.');
    }

    // Nettoyage des entrées
    const sanitizedEmail = SecurityUtils.sanitizeInput(email.toLowerCase());
    const sanitizedName = SecurityUtils.sanitizeInput(fullName);
    const sanitizedPhone = SecurityUtils.sanitizeInput(phone);
    const sanitizedCity = SecurityUtils.sanitizeInput(city);

    const { data, error } = await supabase.auth.signUp({
      email: sanitizedEmail,
      password,
      options: {
        data: {
          full_name: sanitizedName,
          role: role,
          phone: sanitizedPhone,
          city: sanitizedCity,
          owner_type: role === 'owner' ? ownerType : null,
          main_activity_neighborhood: role === 'owner' ? mainActivityNeighborhood : null,
        },
      },
    });

    if (error) {
      SecurityMiddleware.logSecurityEvent('SIGNUP_FAILED', { email: sanitizedEmail, error: error.message });
      throw error;
    }

    if (data.user) {
      SecurityMiddleware.logSecurityEvent('SIGNUP_SUCCESS', { email: sanitizedEmail, userId: data.user.id });

      // Ne pas upserter le profil côté client (RLS peut bloquer si l'utilisateur n'est pas encore authentifié).
      // Essayer de sauvegarder les métadonnées utilisateur pour que le trigger côté serveur puisse les copier dans profiles.
      try {
        const { error: metaError } = await supabase.auth.updateUser({
          data: {
            full_name: sanitizedName,
            role,
            phone: sanitizedPhone,
            city: sanitizedCity,
            owner_type: role === 'owner' ? ownerType : null,
            main_activity_neighborhood: role === 'owner' ? mainActivityNeighborhood : null,
          },
        });

        if (metaError) {
          console.warn('Impossible de mettre à jour les métadonnées utilisateur immédiatement:', metaError);
        } else {
          console.log('Métadonnées utilisateur sauvegardées dans auth (le trigger va créer / mettre à jour le profil).');
        }
      } catch (err) {
        console.warn('Erreur lors de la mise à jour des métadonnées utilisateur:', err);
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    // Validation des entrées
    const emailValidation = SecurityUtils.validateEmail(email);
    if (!emailValidation.isValid) {
      throw new Error(`Email invalide: ${emailValidation.errors.join(', ')}`);
    }

    // Rate limiting
    const rateLimitKey = `signin_${email}`;
    if (!SecurityUtils.checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) { // 5 tentatives par 15 minutes
      throw new Error('Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.');
    }

    // Nettoyage des entrées
    const sanitizedEmail = SecurityUtils.sanitizeInput(email.toLowerCase());

    const { data, error } = await supabase.auth.signInWithPassword({
      email: sanitizedEmail,
      password,
    });

    if (error) {
      SecurityMiddleware.logSecurityEvent('SIGNIN_FAILED', { email: sanitizedEmail, error: error.message });
      throw error;
    }

    if (data.user) {
      SecurityMiddleware.logSecurityEvent('SIGNIN_SUCCESS', { email: sanitizedEmail, userId: data.user.id });
      const profileData = await fetchProfile(data.user.id);
      setProfile(profileData);
    }
  };

  const signOut = async () => {
    if (user) {
      SecurityMiddleware.logSecurityEvent('SIGNOUT', { userId: user.id, email: user.email });
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
        setProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
