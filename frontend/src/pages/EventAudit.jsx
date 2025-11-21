import { useState, useEffect, useContext } from 'react';
import { EventContext } from '../context/EventContext';
import { supabase } from '../lib/supabase';
import LayoutResponsive from '../layout/LayoutResponsive';
import { FiArrowDownLeft, FiArrowUpRight, FiClock, FiExternalLink } from 'react-icons/fi';
import LoadingScreen from '../components/ui/LoadingScreen';
import BackButton from '../components/ui/BackButton';

export default function EventAudit() {
  const { currentEvent, loadingEvent } = useContext(EventContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    if (currentEvent) {
      loadHistory();

      // Realtime Listener for new transactions
      const channel = supabase
        .channel('event-audit-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'transactions',
            filter: `to_address=eq.${currentEvent.wallet_address}`,
          },
          (payload) => {
            console.log('New transaction in audit!', payload);
            loadHistory();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentEvent]);

  async function loadHistory() {
    try {
      const { data, error } = await supabase.functions.invoke('get-transactions', {
        body: { eventId: currentEvent.id }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      // Fix: data.transactions is the array, not data.transactions.transfers
      const txs = data.transactions || [];
      setTransactions(txs);

      // Calcular ventas totales (entradas)
      const sales = txs
        .filter(tx => tx.to && currentEvent.wallet_address && tx.to.toLowerCase() === currentEvent.wallet_address.toLowerCase())
        .reduce((acc, tx) => acc + parseFloat(tx.value), 0);
      
      setTotalSales(sales);

    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loadingEvent || !currentEvent) {
    return <LoadingScreen text="Cargando Auditoría..." />;
  }

  return (
    <LayoutResponsive>
      <BackButton to="/event-dashboard" label="Volver al Evento" />
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Transacciones: {currentEvent.name}
          </h1>
          <p className="text-gray-400 text-sm font-mono mt-1">
            {currentEvent.wallet_address}
          </p>
        </div>

        <div className="text-right bg-neutral-900 p-4 rounded-xl border border-neutral-800">
          <p className="text-xs text-gray-400">Ventas Totales</p>
          <p className="text-2xl font-bold text-blue-400">
            +{totalSales.toFixed(2)} ATL
          </p>
        </div>
      </div>

      {/* LISTA DE TRANSACCIONES */}
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-neutral-800">
          <h3 className="font-bold text-gray-300">Transacciones Recientes</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Cargando transacciones...
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay transacciones registradas
          </div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {transactions.map((tx) => {
              const isIncoming =
                tx.to && currentEvent.wallet_address && 
                tx.to.toLowerCase() === currentEvent.wallet_address.toLowerCase();

              return (
                <div
                  key={tx.hash || tx.uniqueId} // Fallback key
                  className="p-4 flex items-center justify-between hover:bg-neutral-800/50 transition"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-full ${
                        isIncoming
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {isIncoming ? (
                        <FiArrowDownLeft size={20} />
                      ) : (
                        <FiArrowUpRight size={20} />
                      )}
                    </div>

                    <div>
                      <p className="text-white font-medium">
                        {isIncoming ? "Pago Recibido" : "Transferencia Enviada"}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        {isIncoming
                          ? `De: ${tx.from ? tx.from.slice(0, 6) + '...' + tx.from.slice(-4) : 'Desconocido'}`
                          : `A: ${tx.to ? tx.to.slice(0, 6) + '...' + tx.to.slice(-4) : 'Desconocido'}`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        isIncoming ? "text-blue-400" : "text-red-400"
                      }`}
                    >
                      {isIncoming ? "+" : "-"}
                      {parseFloat(tx.value).toFixed(2)} ATL
                    </p>
                    <div className="flex items-center justify-end gap-3 mt-1">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <FiClock size={10} />
                        <span>
                          {tx.metadata?.blockTimestamp 
                            ? new Date(tx.metadata.blockTimestamp).toLocaleString() 
                            : 'Fecha desconocida'}
                        </span>
                      </div>
                      <a 
                        href={`https://sepolia.etherscan.io/tx/${tx.hash}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-400 transition"
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
      </div>
    </LayoutResponsive>
  );
}