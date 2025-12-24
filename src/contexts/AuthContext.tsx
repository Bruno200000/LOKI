import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';
import { SecurityUtils, SecurityMiddleware } from '../lib/security';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: 'owner' | 'tenant', phone: string, ownerType?: 'particulier' | 'agent', mainActivityNeighborhood?: string) => Promise<void>;
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
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
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
        fetchProfile(session.user.id).then(async (profileData) => {
          if (!profileData && session.user) {
            const fullName = session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              session.user.email?.split('@')[0] || 'User';

            // Validation du nom avant insertion
            const nameValidation = SecurityUtils.validateFullName(fullName);
            if (!nameValidation.isValid) {
              console.error('Invalid name provided:', nameValidation.errors);
              return;
            }

            const sanitizedName = SecurityUtils.sanitizeInput(fullName);

            const { data: newProfile } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                full_name: sanitizedName,
                role: 'tenant',
              })
              .select()
              .single();

            setProfile(newProfile);
          } else {
            setProfile(profileData);
          }
        });
      }

      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          let profileData = await fetchProfile(session.user.id);

          if (!profileData) {
            const fullName = session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              session.user.email?.split('@')[0] || 'User';

            // Validation du nom avant insertion
            const nameValidation = SecurityUtils.validateFullName(fullName);
            if (!nameValidation.isValid) {
              console.error('Invalid name provided:', nameValidation.errors);
              return;
            }

            const sanitizedName = SecurityUtils.sanitizeInput(fullName);

            const { data: newProfile } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                full_name: sanitizedName,
                role: 'tenant',
              })
              .select()
              .single();

            profileData = newProfile;
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

    const { data, error } = await supabase.auth.signUp({
      email: sanitizedEmail,
      password,
      options: {
        data: {
          full_name: sanitizedName,
          role: role,
          phone: sanitizedPhone,
        },
      },
    });

    if (error) {
      SecurityMiddleware.logSecurityEvent('SIGNUP_FAILED', { email: sanitizedEmail, error: error.message });
      throw error;
    }

    if (data.user) {
      SecurityMiddleware.logSecurityEvent('SIGNUP_SUCCESS', { email: sanitizedEmail, userId: data.user.id });
      // Créer ou mettre à jour immédiatement le profil avec le numéro de téléphone et les champs propriétaire
      await supabase
        .from('profiles')
        .upsert(
          {
            id: data.user.id,
            full_name: sanitizedName,
            role,
            email: sanitizedEmail,
            phone: sanitizedPhone,
            owner_type: role === 'owner' ? ownerType : null,
            main_activity_neighborhood: role === 'owner' ? mainActivityNeighborhood : null,
          },
          { onConflict: 'id' }
        );
      console.log('Utilisateur créé, en attente de confirmation email');
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
