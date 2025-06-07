
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  email: string;
  user_type: 'master_admin' | 'user';
  permission_level: 'viewer' | 'editor' | 'admin' | 'master_admin';
  can_create_forms: boolean;
  can_edit_forms: boolean;
  can_delete_forms: boolean;
  can_view_responses: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isMasterAdmin: boolean;
  canCreateForms: boolean;
  canEditForms: boolean;
  canDeleteForms: boolean;
  canViewResponses: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Buscando perfil para usuário:', userId);
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return null;
      }
      
      console.log('Perfil encontrado:', profile);
      return profile as UserProfile;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile after setting session
          const profile = await fetchUserProfile(session.user.id);
          if (mounted) {
            setUserProfile(profile);
          }
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão:', error);
        }
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          if (mounted) {
            setUserProfile(profile);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erro na inicialização da auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUserProfile(null);
      setUser(null);
      setSession(null);
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      console.error('Erro no logout:', error);
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro ao fazer logout.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calcular permissões baseadas no perfil do usuário
  const isMasterAdmin = userProfile?.user_type === 'master_admin';
  const isAdmin = userProfile?.permission_level === 'admin' || isMasterAdmin;
  
  // Master admin tem todas as permissões
  // Outros usuários seguem as permissões específicas
  const canCreateForms = isMasterAdmin || (userProfile?.can_create_forms ?? false);
  const canEditForms = isMasterAdmin || (userProfile?.can_edit_forms ?? false);
  const canDeleteForms = isMasterAdmin || (userProfile?.can_delete_forms ?? false);
  const canViewResponses = isMasterAdmin || (userProfile?.can_view_responses ?? true);

  console.log('Permissões calculadas:', {
    isMasterAdmin,
    isAdmin,
    canCreateForms,
    canEditForms,
    canDeleteForms,
    canViewResponses,
    userProfile
  });

  const value = {
    user,
    session,
    userProfile,
    loading,
    signOut,
    isMasterAdmin,
    canCreateForms,
    canEditForms,
    canDeleteForms,
    canViewResponses,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
