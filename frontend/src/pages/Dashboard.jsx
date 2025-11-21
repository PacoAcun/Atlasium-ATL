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
      <div className="mt-8 bg-gradient-to-br from-azulito to-blue-900/40 border border-azulito p-6 rounded-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
          </svg>
        </div>

        <h2 className="text-xl font-semibold mb-2 text-gray-200">Balance Disponible</h2>
        
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold text-white tracking-tight">
            {user.balances?.atl || '0'}
          </span>
          <span className="text-xl font-medium text-azulito-400">ATL</span>
            <button 
            onClick={refreshBalance}
            className="ml-3 flex items-center gap-1 text-gray-300 hover:text-white underline font-semibold transition"
            >
            <FiRefreshCw size={16} />
            <span className="text-sm">Refrescar balance</span>
            </button>
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
        <a href="/history" className="block text-center text-azulito text-sm hover:text-azulito mt-2">
          Ver todo el historial →
        </a>
      </div>
    </LayoutResponsive>
  );
}
