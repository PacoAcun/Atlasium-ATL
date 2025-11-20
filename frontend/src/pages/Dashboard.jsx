import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);

  if (!user) return <p className="p-10 text-gray-400">Cargando...</p>;

  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold">Bienvenido, {user.name}</h1>
      <p className="text-gray-400 mt-2">{user.email}</p>

      <button
        onClick={logout}
        className="mt-6 px-4 py-2 bg-red-600 rounded"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
