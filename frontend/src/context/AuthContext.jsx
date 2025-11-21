import { createContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario si hay sesión activa
  useEffect(() => {
    // Verificar sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadUserProfile(session.access_token);
      } else {
        setLoading(false);
      }
    });

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        loadUserProfile(session.access_token);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Cargar perfil del usuario desde la Edge Function
  async function loadUserProfile(token) {
    try {
      const { data, error } = await supabase.functions.invoke("me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (error) {
        // Si el error es 400 (User not found), lo ignoramos silenciosamente
        // porque puede ser que el usuario se esté registrando apenas.
        // Solo lanzamos error si es otra cosa.
        if (error.message && error.message.includes("non-2xx")) {
           console.warn("User profile not found yet (expected during registration)");
           return;
        }
        throw error;
      }

      if (data.success) {
        setUser({
          id: data.id,
          email: data.email,
          name: data.name,
          walletAddress: data.walletAddress,
          role: data.role,
          balances: data.balances,
        });
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      // No cerramos sesión automáticamente para permitir que complete el registro
      // await supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  }

  // Registro paso 1: Iniciar registro con OTP
  async function signUp(email, password, metadata) {
    console.log("Attempting signUp for:", email);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: metadata.name,
            carnet: metadata.carnet,
          },
        },
      });

      console.log("SignUp response:", { data, error });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("SignUp error:", error);
      throw error;
    }
  }

  // Registro paso 2: Verificar OTP
  async function verifyOtp(email, token) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup',
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Verify OTP error:", error);
      throw error;
    }
  }

  // Registro paso 3: Completar perfil y wallet
  async function completeRegistration() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      const { data, error } = await supabase.functions.invoke("complete-registration", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Failed to complete registration");

      // Recargar perfil
      await loadUserProfile(session.access_token);
      return data;
    } catch (error) {
      console.error("Complete registration error:", error);
      throw error;
    }
  }

  // Login - llama a la Edge Function custom (Legacy/Alternative)
  // O usar supabase.auth.signInWithPassword si preferimos standard auth
  async function login(email, password) {
    try {
      // Intentar login standard primero
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        await loadUserProfile(data.session.access_token);
      }
    } catch (error) {
      throw new Error(error.message || "Error during login");
    }
  }

  // Logout
  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/";
  }

  // Refrescar balance (útil después de transacciones)
  async function refreshBalance() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      await loadUserProfile(session.access_token);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, login, signUp, verifyOtp, completeRegistration, logout, refreshBalance, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

