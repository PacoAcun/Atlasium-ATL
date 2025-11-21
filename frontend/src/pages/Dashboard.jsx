import LayoutResponsive from "../layout/LayoutResponsive";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { FiRefreshCw } from "react-icons/fi";


export default function Dashboard() {
  const { user, refreshBalance } = useContext(AuthContext);

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

      {/* Wallet Info Card */}

      <div className="mb-8 mt-8 bg-gradient-to-br from-blue-900/40 to-blue-700/40 border border-blue-500/30 p-6 rounded-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
        </div>

        <h2 className="text-m font-semibold mb-2 text-gray-200">Balance Disponible</h2>

        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-blue-400">
            {user.balances?.atl || '0'}
          </span>
          <span className="text-xl font-medium text-blue-400">ATL</span>
        </div>

        <p className="text-sm text-gray-400 mt-1 mb-6">
          Atlasium Token
        </p>
      </div>

      <div className="mt-6 bg-neutral-900 border border-neutral-700 p-6 rounded-xl">
        <h2 className="text-lg font-semibold mb-4">Actividad Reciente</h2>
        <div className="text-center py-8 text-gray-500 text-sm">
          No hay transacciones recientes
        </div>
        <a href="/history" className="block text-center text-blue text-sm hover:text-blue mt-2">
          Ver todo el historial →
        </a>
      </div>
    </LayoutResponsive>
  );
}
