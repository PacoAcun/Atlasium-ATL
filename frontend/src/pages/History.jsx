import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { AuthContext } from '../context/AuthContext';
import LayoutResponsive from '../layout/LayoutResponsive';
import LoadingScreen from '../components/ui/LoadingScreen';
import { FiExternalLink } from 'react-icons/fi';

import BackButton from '../components/ui/BackButton';

export default function History() {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  async function fetchTransactions() {
    try {
      const { data, error } = await supabase.functions.invoke('get-transactions');

      if (error) throw error;
      
      if (data.success) {
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingScreen text="Cargando Historial..." />;
  }

  return (
    <LayoutResponsive>
      <BackButton to="/dashboard" label="Volver al Dashboard" />
      <h1 className="text-3xl font-bold mb-6">Historial de Transacciones</h1>
      
      {transactions.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          No hay transacciones recientes
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => {
            // Alchemy returns 'from' and 'to' in lowercase
            const isIncoming = tx.to?.toLowerCase() === user.walletAddress?.toLowerCase();
            const amount = parseFloat(tx.value || 0).toFixed(2);
            const date = new Date(tx.metadata.blockTimestamp);
            
            return (
              <div 
                key={tx.uniqueId} 
                className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    isIncoming ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400"
                  }`}>
                    {isIncoming ? "↓" : "↑"}
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {isIncoming ? "Recibido" : "Enviado"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {date.toLocaleDateString()} • {date.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                  <div className="text-right">
                    <p className={`font-bold ${isIncoming ? "text-blue-400" : "text-red-400"}`}>
                      {isIncoming ? "+" : "-"}{amount} ATL
                    </p>

                    <div className="flex items-center justify-end gap-2 mt-1">
                      <p className={`text-xs capitalize ${isIncoming ? "text-blue-500" : "text-red-500"}`}>
                        Confirmado
                      </p>
                      <a 
                        href={`https://sepolia.etherscan.io/tx/${tx.hash}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-white transition"
                        title="Ver en Etherscan"
                      >
                        <FiExternalLink size={12} />
                      </a>
                    </div>
                  </div>
              </div>
            );
          })}
        </div>
      )}
    </LayoutResponsive>
  );
}
