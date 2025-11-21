import { useState, useEffect, useContext } from 'react';
import { EventContext } from '../context/EventContext';
import { supabase } from '../lib/supabase';
import LayoutResponsive from '../layout/LayoutResponsive';
import { FiArrowDownLeft, FiArrowUpRight, FiClock } from 'react-icons/fi';
import LoadingScreen from '../components/ui/LoadingScreen';

export default function EventAudit() {
  const { currentEvent, loadingEvent } = useContext(EventContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    if (currentEvent) {
      loadHistory();
    }
  }, [currentEvent]);

  async function loadHistory() {
    try {
      const { data, error } = await supabase.functions.invoke('get-transactions', {
        body: { eventId: currentEvent.id, walletAddress: currentEvent.wallet_address }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      // Soporta ambas formas: arreglo directo o { transfers: [...] }
      const txsRaw = data.transactions;
      const txs = Array.isArray(txsRaw)
        ? txsRaw
        : Array.isArray(txsRaw?.transfers)
          ? txsRaw.transfers
          : [];
      setTransactions(txs);

      // Calcular ventas totales (entradas)
      const sales = txs
        .filter(tx => tx.to.toLowerCase() === currentEvent.wallet_address.toLowerCase())
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
                tx.to.toLowerCase() === currentEvent.wallet_address.toLowerCase();

              return (
                <div
                  key={tx.hash}
                  className="p-4 flex items-center justify-between hover:bg-neutral-800/50 transition"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-full ${
                        isIncoming
                          ? "bg-blue-500/10 text-blue-500"
                          : "bg-red-500/10 text-red-500"
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
                          ? `De: ${tx.from.slice(0, 6)}...${tx.from.slice(-4)}`
                          : `A: ${tx.to.slice(0, 6)}...${tx.to.slice(-4)}`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        isIncoming ? "text-blue-400" : "text-white"
                      }`}
                    >
                      {isIncoming ? "+" : "-"}
                      {parseFloat(tx.value).toFixed(2)} ATL
                    </p>
                    <div className="flex items-center justify-end gap-1 text-xs text-gray-500 mt-1">
                      <FiClock size={10} />
                      <span>
                        {new Date(
                          tx.metadata.blockTimestamp
                        ).toLocaleString()}
                      </span>
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
