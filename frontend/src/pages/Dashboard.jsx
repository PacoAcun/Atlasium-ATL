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

      {/* Wallet Info Card */}
      <div className="mt-8 bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/30 p-6 rounded-xl">
        <h2 className="text-2xl font-semibold mb-4">💼 Tu Wallet</h2>
        
        <div className="space-y-3">
          <div>
            <p className="text-gray-400 text-sm">Dirección Ethereum</p>
            <p className="text-white font-mono text-sm break-all bg-black/30 p-2 rounded mt-1">
              {user.walletAddress || 'No disponible'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-black/30 p-4 rounded-lg">
              <p className="text-gray-400 text-xs">Balance ETH</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">
                {user.ethBalance || '0'} ETH
              </p>
            </div>

            <div className="bg-black/30 p-4 rounded-lg">
              <p className="text-gray-400 text-xs">Balance ATL</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">
                {user.atlBalance || '0'} ATL
              </p>
            </div>
          </div>

          <a 
            href={`https://sepolia.etherscan.io/address/${user.walletAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-blue-400 hover:text-blue-300 text-sm"
          >
            🔍 Ver en Sepolia Etherscan →
          </a>
        </div>
      </div>

      <div className="mt-6 bg-neutral-900 border border-neutral-700 p-6 rounded-xl">
        <h2 className="text-2xl font-semibold">📋 Próximos pasos</h2>
        <ul className="mt-4 space-y-2 text-gray-300">
          <li>✅ Wallet creada automáticamente</li>
          <li>✅ Recibiste 0.002 ETH para gas</li>
          <li>• Realiza tu primera transacción</li>
          <li>• Explora el historial de transacciones</li>
        </ul>
      </div>
    </LayoutResponsive>
  );
}
