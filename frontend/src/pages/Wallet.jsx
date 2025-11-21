import LayoutResponsive from "../layout/LayoutResponsive";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { EventContext } from "../context/EventContext";
import { FiPlusSquare } from "react-icons/fi";

export default function Wallet() {
  const { user, refreshBalance } = useContext(AuthContext);
  const { myEvents, selectEvent } = useContext(EventContext);
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-gray-300">
        Cargando...
      </div>
    );
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(user.walletAddress);
    alert("Dirección copiada al portapapeles");
  };

  return (
    <LayoutResponsive>
      <h1 className="text-3xl font-bold mb-2">Mi Wallet</h1>
      <p className="text-gray-400 mb-6">Gestiona tu wallet Ethereum en Sepolia</p>


      {/* Balances */}

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


      {/* Wallet Address Card */}
      <div className="bg-neutral-900 border border-neutral-700 p-6 rounded-xl mb-6">
        <h2 className="text-lg font-semibold mb-3">Dirección de Wallet</h2>
        <div className="flex items-center gap-3">
          <p className="flex-1 font-mono text-sm bg-dark p-3 rounded break-all">
            {user.walletAddress}
          </p>
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition"
          >
            Copiar
          </button>
        </div>
      </div>




      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={refreshBalance}
          className="flex-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 p-3 rounded-lg transition"
        >
          Actualizar Balance
        </button>
        <a
          href={`https://sepolia.etherscan.io/address/${user.walletAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-blue-600 hover:bg-blue-700 p-3 rounded-lg text-center transition"
        >
          Ver en Etherscan
        </a>
      </div>

      {/* Event Organizer Section */}
      <div className="bg-neutral-900 border border-neutral-700 p-6 rounded-xl mb-6">
        <h2 className="text-lg font-semibold mb-3">Organizar Evento</h2>
        <p className="text-gray-400 text-sm mb-4">
          Crea eventos, gestiona cobros y staff con tu propia wallet temporal.
        </p>
        
        {myEvents.length > 0 && (
          <div className="mb-4 space-y-2">
            <h3 className="text-sm font-medium text-gray-300">Mis Eventos:</h3>
            {myEvents.map(event => (
              <button
                key={event.id}
                onClick={() => {
                  selectEvent(event.id);
                  navigate('/event-dashboard');
                }}
                className="w-full flex items-center justify-between bg-black/40 hover:bg-black/60 p-3 rounded-lg border border-neutral-800 transition group"
              >
                <span className="font-medium text-white">{event.name}</span>
                <span className="text-xs text-gray-500 group-hover:text-azulito transition">
                  Gestionar →
                </span>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate('/create-event')}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition font-medium"
        >
          <FiPlusSquare size={18} />
          Crear Nuevo Evento
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-yellow-900/20 border border-yellow-600/30 p-4 rounded-lg">
        <p className="text-yellow-200 text-sm">
          ⚠️ <strong>Red de prueba:</strong> Esta wallet funciona en Sepolia Testnet. 
          Los ETH y tokens no tienen valor real.
        </p>
      </div>
    </LayoutResponsive>
  );
}
