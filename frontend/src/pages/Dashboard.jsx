import LayoutResponsive from "../layout/LayoutResponsive";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

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
      <div className="mt-8 bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/30 p-6 rounded-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
          </svg>
        </div>

        <h2 className="text-xl font-semibold mb-2 text-gray-200">Balance Disponible</h2>
        
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold text-white tracking-tight">
            {user.atlBalance || '0'}
          </span>
          <span className="text-xl font-medium text-purple-400">ATL</span>
          <button 
            onClick={refreshBalance}
            className="ml-2 p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
            title="Actualizar balance"
          >
            🔄
          </button>
        </div>

        <p className="text-sm text-gray-400 mt-1 mb-6">
          Atlasium Token
        </p>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <a href="/topup" className="flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 p-3 rounded-lg transition group">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 group-hover:scale-110 transition">
              💰
            </div>
            <span className="text-xs font-medium text-gray-300">Recargar</span>
          </a>

          <a href="/scan" className="flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 p-3 rounded-lg transition group">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition">
              📷
            </div>
            <span className="text-xs font-medium text-gray-300">Pagar</span>
          </a>

          <a href="/history" className="flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 p-3 rounded-lg transition group">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition">
              📜
            </div>
            <span className="text-xs font-medium text-gray-300">Historial</span>
          </a>
        </div>
      </div>

      <div className="mt-6 bg-neutral-900 border border-neutral-700 p-6 rounded-xl">
        <h2 className="text-lg font-semibold mb-4">Actividad Reciente</h2>
        <div className="text-center py-8 text-gray-500 text-sm">
          No hay transacciones recientes
        </div>
        <a href="/history" className="block text-center text-purple-400 text-sm hover:text-purple-300 mt-2">
          Ver todo el historial →
        </a>
      </div>
    </LayoutResponsive>
  );
}
