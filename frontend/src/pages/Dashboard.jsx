import LayoutResponsive from "../layout/LayoutResponsive";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-gray-300">
        Cargando...
      </div>
    );
  }

  return (
    <LayoutResponsive>
      <h1 className="text-4xl font-bold mb-4">Hola, {user?.name}</h1>

      <p className="text-gray-400">
        Bienvenido a tu espacio en Atlasium.
      </p>

      <div className="mt-10 bg-dark border border-neutral-700 p-6 rounded">
        <h2 className="text-2xl font-semibold">Próximos pasos</h2>
        <ul className="mt-4 space-y-2 text-gray-300">
          <li>• Solicitar Wallet temporal</li>
          <li>• Escanear QR para pagar</li>
          <li>• Ver historial de transacciones</li>
        </ul>
      </div>
    </LayoutResponsive>
  );
}
