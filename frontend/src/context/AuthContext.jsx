import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Cargar usuario si hay token guardado
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:4000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUser(res.data))
        .catch(() => localStorage.removeItem("token"));
    }
  }, []);

  // Registro
  async function register(data) {
    const res = await axios.post("http://localhost:4000/auth/register", data);
    return res.data; // no login automático todavía
  }

  // Login
  async function login(email, password) {
    const res = await axios.post("http://localhost:4000/auth/login", {
      email,
      password,
    });

    const token = res.data.token;
    localStorage.setItem("token", token);

    // cargar perfil
    const me = await axios.get("http://localhost:4000/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setUser(me.data);
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
