import { useContext } from "react";
import LayoutResponsive from "../layout/LayoutResponsive";
import { AuthContext } from "../context/AuthContext";

export default function Profile() {
  const { user, logout } = useContext(AuthContext);

  return (
    <LayoutResponsive>
      <h1 className="text-3xl font-bold mt-10">Perfil</h1>
      <p className="text-gray-400 mt-2">Aquí aparecerá tu informacion en Atlasium.</p>

      <button
        onClick={logout}
        className="text-red-500 hover:text-red-400 text-sm"
      >
        Cerrar sesión
      </button>
    </LayoutResponsive>
  );
}
