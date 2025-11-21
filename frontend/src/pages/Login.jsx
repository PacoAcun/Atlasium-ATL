import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
      setIsLoading(false);
    }
  }

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <h2 className="text-3xl font-bold mb-6">Ingresar</h2>

      <form className="flex flex-col gap-4 w-80" onSubmit={handleSubmit}>
        <input
          className="bg-neutral-900 border border-neutral-700 p-3 rounded"
          placeholder="Correo institucional"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="bg-neutral-900 border border-neutral-700 p-3 rounded"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button 
          className="bg-white text-black p-3 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? "Cargando..." : "Entrar"}
        </button>
      </form>

      <a href="/register" className="text-gray-400 text-sm mt-4">
        ¿No tienes cuenta? Regístrate
      </a>
    </div>
  );
}
