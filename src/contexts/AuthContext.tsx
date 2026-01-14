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




    try {
      // Use wildcard to avoid errors when specific columns (like email) are missing in DB
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {

        return null;
      }
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
      if (profileData && typeof profileData === 'object' && 'id' in profileData) {
        setProfile(profileData as Profile);
      } else {
        setProfile(null);
      }
    }
  };

  useEffect(() => {
    // Fallback profile creator
    const getFallbackProfile = (user: User): Profile => ({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Utilisateur',
      role: (user.user_metadata?.role as any) || 'tenant',
      phone: user.user_metadata?.phone || null,
      city: user.user_metadata?.city || null,
      created_at: new Date().toISOString()
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      (async () => {
        try {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            let profileData = await attemptFetchProfileWithRetries(session.user.id, 6, 400);

            if (!profileData) {
              const fullName = session.user.user_metadata?.full_name ||
                session.user.user_metadata?.name ||
                session.user.email?.split('@')[0] || 'User';

              const sanitizedName = SecurityUtils.sanitizeInput(fullName);
              const role = session.user.user_metadata?.role || 'tenant';

              try {
                await supabase.auth.updateUser({
                  data: {
                    full_name: sanitizedName,
                    role,
                  },
                });
                profileData = await attemptFetchProfileWithRetries(session.user.id, 3, 500);
              } catch (err) { /* silent */ }
            }

            if (profileData && typeof profileData === 'object' && 'id' in profileData) {
              setProfile(profileData as Profile);
            } else {
              setProfile(getFallbackProfile(session.user));
            }
          }
        } catch (err) {
          console.error('Error fetching initial session/profile:', err);
        } finally {
          setLoading(false);
        }
      })();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        try {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            let profileData = await attemptFetchProfileWithRetries(session.user.id, 6, 400);

            if (!profileData) {
              const fullName = session.user.user_metadata?.full_name ||
                session.user.user_metadata?.name ||
                session.user.email?.split('@')[0] || 'User';

              try {
                await supabase.auth.updateUser({
                  data: { full_name: fullName }
                });
                profileData = await attemptFetchProfileWithRetries(session.user.id, 3, 500);
              } catch (e) { /* ignore */ }
            }

            if (profileData && typeof profileData === 'object' && 'id' in profileData) {
              setProfile(profileData as Profile);
            } else {
              setProfile(getFallbackProfile(session.user));
            }
          } else {
            setProfile(null);
          }
        } catch (err) {
          console.error('Error in onAuthStateChange:', err);
        } finally {
          setLoading(false);
        }
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


    // Validation des entrées plus permissive
    const emailValidation = SecurityUtils.validateEmail(email);
    const passwordValidation = SecurityUtils.validatePassword(password);
    const nameValidation = SecurityUtils.validateFullName(fullName);

    if (!emailValidation.isValid) {
      throw new Error(`Email invalide: ${emailValidation.errors.join(', ')}`);
    }

    if (!passwordValidation.isValid) {
      throw new Error(`Mot de passe invalide: ${passwordValidation.errors.join(', ')}`);
    }

    if (!nameValidation.isValid) {
      throw new Error(`Nom invalide: ${nameValidation.errors.join(', ')}`);
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
        emailRedirectTo: 'https://lokivoire.pro/?view=dashboard',
        data: {
          full_name: sanitizedName,
          role,
          phone: sanitizedPhone,
          city: sanitizedCity,
          owner_type: ownerType,
          main_activity_neighborhood: mainActivityNeighborhood,
        },
      },
    });

    if (error) {
      console.error('Erreur Supabase signUp:', error);
      SecurityMiddleware.logSecurityEvent('SIGNUP_FAILED', { email: sanitizedEmail, error: error.message });
      throw error;
    }



    if (data.user) {
      SecurityMiddleware.logSecurityEvent('SIGNUP_SUCCESS', { email: sanitizedEmail, userId: data.user.id });

      // Ne pas créer le profil immédiatement à cause des RLS
      // Le profil sera créé lors de la première connexion via le trigger
      console.log('Inscription réussie. Le profil sera créé lors de la confirmation email et première connexion.');
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

      // Essayer de récupérer le profil, mais ne pas échouer si RLS bloque
      try {
        const profileData = await fetchProfile(data.user.id);
        if (profileData && typeof profileData === 'object' && 'id' in profileData) {
          setProfile(profileData as Profile);
        } else {
          // Créer un profil par défaut si aucun profil trouvé
          console.log('Aucun profil trouvé, création d\'un profil par défaut');
          const defaultProfile = {
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Utilisateur',
            role: 'tenant' as const,
            phone: null,
            city: null,
            created_at: new Date().toISOString()
          };
          setProfile(defaultProfile);
        }
      } catch (profileErr) {
        console.error('Erreur lors de la récupération du profil:', profileErr);
        // Créer un profil par défaut en cas d'erreur
        const defaultProfile = {
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Utilisateur',
          role: 'tenant' as const,
          phone: null,
          city: null,
          created_at: new Date().toISOString()
        };
        setProfile(defaultProfile);
      }
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
