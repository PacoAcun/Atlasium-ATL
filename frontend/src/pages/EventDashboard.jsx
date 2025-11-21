import { useState, useContext, useEffect } from 'react';
import { EventContext } from '../context/EventContext';
import { supabase } from '../lib/supabase';
import LayoutResponsive from '../layout/LayoutResponsive';
import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'react-router-dom';

export default function EventDashboard() {
  const { currentEvent, loadingEvent, inviteStaff } = useContext(EventContext);
  const [amount, setAmount] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('waiting'); // waiting, success
  const [staffEmail, setStaffEmail] = useState('');
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (currentEvent) {
      fetchEventTransactions();
    }
  }, [currentEvent]);

  async function fetchEventTransactions() {
    try {
      const { data, error } = await supabase.functions.invoke('get-transactions', {
        body: { eventId: currentEvent.id }
      });
      if (!error && data.success) {
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error('Error fetching event transactions:', err);
    }
  }

  // Realtime Listener for Payments
  useEffect(() => {
    if (!showQR || !currentEvent) return;

    const channel = supabase
      .channel('table-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `to_address=eq.${currentEvent.wallet_address}`,
        },
        (payload) => {
          console.log('New transaction received!', payload);
          // Verificar monto (opcional, por ahora asumimos que si llega es correcto o el cajero verifica)
          if (parseFloat(payload.new.amount) >= parseFloat(amount)) {
            setPaymentStatus('success');
            setTimeout(() => {
              setShowQR(false);
              setAmount('');
              setPaymentStatus('waiting');
              // Opcional: Recargar balance del evento
            }, 3000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showQR, currentEvent, amount]);

  if (loadingEvent || !currentEvent) {
    return <div className="p-10 text-center text-white">Cargando Evento...</div>;
  }

  const handleNumPad = (num) => {
    if (num === 'C') setAmount('');
    else if (num === '.') {
      if (!amount.includes('.')) setAmount(amount + '.');
    } else {
      setAmount(amount + num);
    }
  };

  const generateQR = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setPaymentStatus('waiting');
    setShowQR(true);
  };

  const qrData = JSON.stringify({
    address: currentEvent.wallet_address,
    amount: amount,
    name: currentEvent.name
  });

  return (
    <LayoutResponsive>
      <div className="flex flex-col h-full">
        {/* Header Evento */}
        <div className="bg-neutral-900 border-b border-neutral-800 p-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white">{currentEvent.name}</h1>
            <p className="text-xs text-gray-400">POS Mode • {currentEvent.userRole}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Balance</p>
            <p className="text-xl font-bold text-blue-400">{currentEvent.balance} ATL</p>
            {currentEvent.userRole === 'admin' && (
              <Link to="/event-audit" className="text-xs text-blue-400 hover:text-blue-300 mt-1 block">
                Ver Auditoría
              </Link>
            )}
          </div>
        </div>

        {/* Main POS Area */}
        <div className="flex-1 p-4 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          
          {/* Display Amount */}
          <div className="w-full bg-black border border-neutral-700 rounded-2xl p-6 mb-6 text-right">
            <span className="text-gray-500 text-2xl mr-2">Q</span>
            <span className="text-5xl font-bold text-white">{amount || '0'}</span>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-4 w-full mb-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'C'].map((key) => (
              <button
                key={key}
                onClick={() => handleNumPad(key)}
                className={`p-6 rounded-xl text-2xl font-semibold transition ${
                  key === 'C' 
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                    : 'bg-neutral-800 text-white hover:bg-neutral-700'
                }`}
              >
                {key}
              </button>
            ))}
          </div>

          {/* Action Button */}
          <button
            onClick={generateQR}
            disabled={!amount}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-xl text-xl transition disabled:opacity-50"
          >
            Generar Cobro QR
          </button>
        </div>

        {/* Staff Management (Admin Only) */}
        {currentEvent.userRole === 'admin' && (
          <div className="mt-8 p-4 border-t border-neutral-800">
            <h3 className="text-sm font-bold text-gray-400 mb-2">Gestión de Staff</h3>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email del staff" 
                className="bg-neutral-900 border border-neutral-700 rounded p-2 text-white flex-1"
                value={staffEmail}
                onChange={e => setStaffEmail(e.target.value)}
              />
              <button 
                onClick={() => { inviteStaff(staffEmail); setStaffEmail(''); }}
                className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
              >
                Invitar
              </button>
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div className="mt-8 p-4 border-t border-neutral-800 pb-20">
          <h3 className="text-sm font-bold text-gray-400 mb-4">Historial de Transacciones</h3>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay transacciones aún</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => {
                const isIncoming = tx.to?.toLowerCase() === currentEvent.wallet_address?.toLowerCase();
                const amount = parseFloat(tx.value || 0).toFixed(2);
                const date = new Date(tx.metadata.blockTimestamp);
                
                return (
                  <div 
                    key={tx.uniqueId} 
                    className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        isIncoming ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400"
                      }`}>
                        {isIncoming ? "↓" : "↑"}
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">
                          {isIncoming ? "Cobro Recibido" : "Pago Enviado"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {date.toLocaleDateString()} • {date.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${isIncoming ? "text-blue-400" : "text-white"}`}>
                        {isIncoming ? "+" : "-"}{amount} ATL
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center relative">
            <button 
              onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
            >
              ✕
            </button>
            
            {paymentStatus === 'success' ? (
              <div className="py-10">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-blue-600 mb-2">¡Pago Recibido!</h2>
                <p className="text-gray-600">La transacción ha sido confirmada.</p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Escanear para Pagar</h2>
                <p className="text-gray-500 mb-6">Muestra este código al cliente</p>
                
                <div className="bg-gray-100 p-4 rounded-xl inline-block mb-4">
                  <QRCodeSVG value={qrData} size={200} />
                </div>
                
                <p className="text-3xl font-bold text-gray-900">Q{amount}</p>
                <p className="text-sm text-gray-400 mt-4 animate-pulse">
                  Esperando confirmación de red...
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </LayoutResponsive>
  );
}
