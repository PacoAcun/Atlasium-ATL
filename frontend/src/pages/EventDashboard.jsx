import { useState, useContext, useEffect } from 'react';
import { EventContext } from '../context/EventContext';
import { supabase } from '../lib/supabase';
import LayoutResponsive from '../layout/LayoutResponsive';
import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'react-router-dom';

export default function EventDashboard() {
  const { currentEvent, loadingEvent, inviteStaff, selectEvent } = useContext(EventContext);
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

  const isEventEnded = currentEvent && new Date() > new Date(currentEvent.end_time);

  const handleCreateStaticQR = async () => {
    const name = prompt("Nombre del producto (ej. Refresco):");
    if (!name) return;
    const price = prompt("Precio en ATL:");
    if (!price) return;

    try {
      const { data, error } = await supabase.functions.invoke('create-static-qr', {
        body: { eventId: currentEvent.id, name, amount: parseFloat(price) }
      });
      
      if (error || !data.success) throw new Error(data?.error || error?.message);
      
      alert('✅ QR Estático creado!');
      // Recargar evento para ver el nuevo QR
      await selectEvent(currentEvent.id); 
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <LayoutResponsive>
      <div className="flex flex-col h-full">
        {/* Header Evento */}
        <div className="bg-neutral-900 border-b border-neutral-800 p-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white">{currentEvent.name}</h1>
            <p className="text-xs text-gray-400">
              {isEventEnded ? <span className="text-red-500 font-bold">EVENTO FINALIZADO</span> : 'En Curso'} • {currentEvent.userRole}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Balance Total</p>
            <p className="text-xl font-bold text-purple-400">{currentEvent.balance} ATL</p>
            {currentEvent.userRole === 'admin' && (
              <Link to="/event-audit" className="text-xs text-blue-400 hover:text-blue-300 mt-1 block">
                Ver Auditoría
              </Link>
            )}
          </div>
        </div>

        {isEventEnded ? (
          /* VISTA DE EVENTO FINALIZADO */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 max-w-md w-full">
              <div className="text-6xl mb-6">🔒</div>
              <h2 className="text-2xl font-bold text-white mb-4">El evento ha finalizado</h2>
              <p className="text-gray-400 mb-8">
                La wallet ha sido bloqueada y los QRs ya no están disponibles.
                Para retirar los fondos acumulados ({currentEvent.balance} ATL), por favor contacta a la administración.
              </p>
              <button 
                onClick={() => alert('Por favor acércate a la oficina de la facultad para procesar el retiro de fondos.')}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition"
              >
                Solicitar Retiro de Fondos
              </button>
            </div>
          </div>
        ) : (
          /* VISTA DE EVENTO ACTIVO (POS) */
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 flex flex-col items-center justify-center max-w-md mx-auto w-full">
              
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-xl text-xl transition disabled:opacity-50 mb-8"
              >
                Generar Cobro QR
              </button>

              {/* Static QRs Section */}
              <div className="w-full border-t border-neutral-800 pt-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-bold">QRs Fijos</h3>
                  <button 
                    onClick={handleCreateStaticQR}
                    className="text-xs bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1 rounded"
                  >
                    + Crear Nuevo
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {currentEvent.staticQrs?.map(qr => (
                    <div key={qr.id} className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 text-center cursor-pointer hover:border-blue-500 transition"
                         onClick={() => {
                           setAmount(qr.amount.toString());
                           // Opcional: Auto generar
                         }}>
                      <p className="text-white font-bold">{qr.name}</p>
                      <p className="text-blue-400 text-sm">{qr.amount} ATL</p>
                      <button 
                        className="mt-2 text-xs text-gray-500 underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Mostrar QR estático en modal (podríamos reusar el modal existente)
                          setAmount(qr.amount.toString());
                          setShowQR(true);
                        }}
                      >
                        Ver QR
                      </button>
                    </div>
                  ))}
                  {(!currentEvent.staticQrs || currentEvent.staticQrs.length === 0) && (
                    <p className="text-gray-500 text-xs col-span-2 text-center">No hay productos fijos aún.</p>
                  )}
                </div>
              </div>

              {/* Staff Management (Admin Only) */}
              {currentEvent.userRole === 'admin' && (
                <div className="w-full border-t border-neutral-800 pt-6">
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
            </div>
          </div>
        )}

        {/* Transaction History (Always visible or only active? User said "se borren todos los qr... solo salga un boton retirar", implying history might be hidden or secondary. Keeping it hidden in ended state for simplicity based on "solo salga un boton") */}
        {/* Actually, user said "solo salga un boton que diga retirar". So I will hide history in ended state too. */}
        
        {!isEventEnded && (
          <div className="p-4 border-t border-neutral-800 pb-20">
            <h3 className="text-sm font-bold text-gray-400 mb-4">Historial Reciente</h3>
            {/* ... (Existing transaction list code) ... */}
            {transactions.slice(0, 3).map((tx) => (
               <div key={tx.uniqueId} className="text-gray-500 text-xs mb-1">
                 {tx.to === currentEvent.wallet_address ? '+' : '-'}{parseFloat(tx.value).toFixed(2)} ATL
               </div>
            ))}
            <Link to="/event-audit" className="text-center block text-blue-500 text-sm mt-2">Ver todo el historial</Link>
          </div>
        )}
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
