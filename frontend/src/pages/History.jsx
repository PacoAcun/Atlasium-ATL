import LayoutResponsive from "../layout/LayoutResponsive";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

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

  return (
    <LayoutResponsive>
      <h1 className="text-2xl font-bold mb-6">Historial de Transacciones</h1>

      {loading ? (
        <div className="text-center text-gray-400 py-10">Cargando...</div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-10 bg-neutral-900 rounded-xl border border-neutral-800">
          <p className="text-gray-400 mb-2">No tienes transacciones aún</p>
          <p className="text-sm text-gray-600">Tus pagos y recargas aparecerán aquí</p>
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
                    isIncoming ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
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
                  <p className={`font-bold ${isIncoming ? "text-green-400" : "text-white"}`}>
                    {isIncoming ? "+" : "-"}{amount} ATL
                  </p>
                  <p className="text-xs text-green-500 capitalize">
                    Confirmado
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </LayoutResponsive>
  );
}
