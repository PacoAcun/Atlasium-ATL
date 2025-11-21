import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import LayoutResponsive from '../layout/LayoutResponsive';
import LoadingScreen from '../components/ui/LoadingScreen';
import { supabase } from '../lib/supabase';
import { FiArrowDownLeft, FiArrowUpRight, FiExternalLink } from 'react-icons/fi';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(true);

  useEffect(() => {
    if (user?.walletAddress) {
      fetchRecentTransactions();
    }
  }, [user]);

  const fetchRecentTransactions = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-transactions', {
        body: {} // No body needed for user history
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      // Alchemy returns 'transfers' array. We take top 5.
      setRecentTransactions(data.transactions.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoadingTx(false);
    }
  };

  if (!user) {
    return <LoadingScreen text="Cargando Inicio..." />;
  }

  return (
    <LayoutResponsive>
      <h1 className="text-3xl font-bold mb-2 mt-10">Hola, {user?.name}</h1>

      <p className="text-gray-400">
        Bienvenido a tu espacio en Atlasium.
      </p>

      {/* Wallet Info Card */}

      <div className="mb-3 mt-8 bg-gradient-to-br from-blue-900/40 to-blue-700/40 border border-blue-500/30 p-6 rounded-xl relative overflow-hidden">
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

      {/* Info Card */}
      <div className="bg-yellow-900/20 border border-yellow-600/30 p-4 rounded-lg">
        <p className="text-yellow-200 text-sm">
          <strong>Red de prueba:</strong> Esta wallet funciona en Sepolia Testnet. 
          Los ETH y tokens no tienen valor real.
        </p>
      </div>

      <div className="mt-6 bg-neutral-900 border border-neutral-700 p-6 rounded-xl">
        <h2 className="text-lg font-semibold mb-4">Actividad Reciente</h2>
        
        {loadingTx ? (
          <div className="text-center py-8 text-gray-500 text-sm">Cargando actividad...</div>
        ) : recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No hay transacciones recientes
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((tx) => {
              const isIncoming = tx.to?.toLowerCase() === user.walletAddress?.toLowerCase();
              return (
                <div key={tx.hash} className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isIncoming ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>
                      {isIncoming ? <FiArrowDownLeft size={18} /> : <FiArrowUpRight size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {isIncoming ? 'Recibido' : 'Enviado'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(tx.metadata.blockTimestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold block ${isIncoming ? 'text-blue-400' : 'text-red-400'}`}>
                      {isIncoming ? '+' : '-'}{tx.value} ATL
                    </span>
                    <a 
                      href={`https://sepolia.etherscan.io/tx/${tx.hash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-white mt-1 transition"
                      title="Ver en Etherscan"
                    >
                      <FiExternalLink size={10} /> Explorer
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <a href="/history" className="block text-center text-blue-400 text-sm hover:text-blue-300 mt-4">
          Ver todo el historial →
        </a>
      </div>
    </LayoutResponsive>
  );
}
