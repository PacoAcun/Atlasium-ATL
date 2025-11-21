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

      if (error) throw error;

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
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  }

  // Registro - llama a la Edge Function custom
  async function register(data) {
    try {
      const { data: result, error } = await supabase.functions.invoke(
        "register",
        {
          body: data,
        }
      );

      if (error) {
        console.error("Supabase function error:", error);
        console.error("Error context:", JSON.stringify(error, null, 2));
        alert(`Error from server: ${JSON.stringify(error)}`);
        throw error;
      }

      console.log("Registration result:", result);

      if (!result || !result.success) {
        const errorMsg = result?.error || "Registration failed";
        console.error("Registration failed:", errorMsg);
        alert(`Registration failed: ${errorMsg}`);
        throw new Error(errorMsg);
      }

      return result;
    } catch (error) {
      console.error("Registration error detail:", error);
      const errorMessage = error.message || error.toString() || "Error during registration";
      alert(`Error: ${errorMessage}`);
      throw new Error(errorMessage);
    }
  }

  // Login - llama a la Edge Function custom
  async function login(email, password) {
    try {
      const { data, error } = await supabase.functions.invoke("login", {
        body: { email, password },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || "Login failed");
      }

      // Establecer sesión con el token recibido
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });

      if (sessionError) throw sessionError;

      // Cargar perfil completo del usuario con balances
      await loadUserProfile(data.access_token);
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
      value={{ user, login, register, logout, refreshBalance, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

