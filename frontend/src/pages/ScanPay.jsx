import LayoutResponsive from "../layout/LayoutResponsive";
import { useState, useContext } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { AuthContext } from "../context/AuthContext";
import { FiUser, FiCamera, FiEdit, FiX } from "react-icons/fi";
import BackButton from "../components/ui/BackButton";

export default function ScanPay() {
  const navigate = useNavigate();
  const { refreshBalance } = useContext(AuthContext);
  
  // Modes: 'select', 'scan', 'manual', 'confirm', 'success'
  const [mode, setMode] = useState('select');
  
  const [scannedData, setScannedData] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [amount, setAmount] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [processing, setProcessing] = useState(false);
  const [txHash, setTxHash] = useState("");

  const handleScan = (result) => {
    if (result && result[0]) {
      const raw = result[0].rawValue;
      processAddressData(raw);
    }
  };

  const handleManualSubmit = () => {
    if (!manualAddress) return;
    processAddressData(manualAddress);
  };

  const processAddressData = (raw) => {
    setScannedData(raw);
    try {
      // Intentar parsear JSON (formato del Event Organizer)
      const data = JSON.parse(raw);
      if (data.address) {
        setParsedData(data);
        if (data.amount) setAmount(data.amount);
      } else {
         setParsedData({ address: raw });
      }
    } catch (e) {
      // Si no es JSON, asumir que es solo la address
      setParsedData({ address: raw });
    }
    setMode('confirm');
  };

  const handlePayment = async () => {
    if (!parsedData?.address || !amount) return;
    
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('transfer', {
        body: { 
          toAddress: parsedData.address,
          amount: amount
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      await refreshBalance();
      setTxHash(data.txHash);
      setMode('success');
    } catch (error) {
      console.error('Payment error:', error);
      alert("Error en el pago: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const resetFlow = () => {
    setMode('select');
    setScannedData(null);
    setParsedData(null);
    setAmount("");
    setManualAddress("");
    setTxHash("");
  };

  return (
    <LayoutResponsive>
      <h1 className="text-2xl font-bold mb-6">Métodos de Pago</h1>

      {/* MODE: SELECT */}
      {mode === 'select' && (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setMode('scan')}
            className="aspect-square bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-2xl flex flex-col items-center justify-center gap-4 transition group"
          >
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition">
              <FiCamera size={32} className="text-blue-400" />
            </div>
            <span className="font-medium text-gray-200">Escanear QR</span>
          </button>

          <button
            onClick={() => setMode('manual')}
            className="aspect-square bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-2xl flex flex-col items-center justify-center gap-4 transition group"
          >
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition">
              <FiEdit size={32} className="text-purple-400" />
            </div>
            <span className="font-medium text-gray-200">Ingresar Dirección</span>
          </button>
        </div>
      )}

      {/* MODE: SCAN */}
      {mode === 'scan' && (
        <div className="relative">
           <button 
            onClick={resetFlow}
            className="absolute -top-12 right-0 text-gray-400 hover:text-white flex items-center gap-2"
          >
            <FiX /> Cancelar
          </button>
          <div className="bg-black rounded-xl overflow-hidden border border-neutral-800 relative">
            <Scanner 
              onScan={handleScan} 
              styles={{ container: { height: 300 } }}
            />
            <p className="text-center text-gray-400 p-4">
              Escanea el código QR del destinatario
            </p>
          </div>
        </div>
      )}

      {/* MODE: MANUAL */}
      {mode === 'manual' && (
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl relative">
          <button 
            onClick={resetFlow}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <FiX size={24} />
          </button>

          <h2 className="text-lg font-semibold mb-4">Ingresar Dirección</h2>
          
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">Dirección de Wallet (0x...)</label>
            <input
              type="text"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              className="w-full bg-black border border-neutral-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none font-mono text-sm"
              placeholder="0x123..."
              autoFocus
            />
          </div>

          <button
            onClick={handleManualSubmit}
            disabled={!manualAddress || manualAddress.length < 40}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
          >
            Continuar
          </button>
        </div>
      )}

      {/* MODE: CONFIRM */}
      {mode === 'confirm' && (
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <FiUser size={22} className="text-blue-400" />
            </div>

            <div>
              <p className="text-sm text-gray-400">Pagando a:</p>
              <p className="font-bold text-white text-lg">
                {parsedData?.name || 'Destinatario'}
              </p>
              <p className="font-mono text-gray-500 text-xs break-all">
                {parsedData?.address}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">Monto a Pagar (ATL)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-black border border-neutral-700 rounded-lg p-4 text-2xl text-white text-center focus:border-blue-500 focus:outline-none"
              placeholder="0.00"
              autoFocus={!parsedData?.amount}
              readOnly={!!parsedData?.amount} // Si el QR traía monto, es fijo
            />
          </div>

          <button
            onClick={handlePayment}
            disabled={processing || !amount}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition disabled:opacity-50"
          >
            {processing ? "Procesando en Blockchain..." : "Confirmar Pago"}
          </button>

          <button
            onClick={resetFlow}
            className="w-full mt-3 text-gray-400 text-sm hover:text-white"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* MODE: SUCCESS */}
      {mode === 'success' && (
        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-xl text-center">
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">¡Transacción Exitosa!</h2>
          <p className="text-gray-400 mb-6">Tu pago se ha procesado correctamente.</p>
          
          <div className="bg-black p-4 rounded-lg mb-6 text-left">
            <p className="text-xs text-gray-500 mb-1">Hash de transacción:</p>
            <p className="font-mono text-xs text-blue-400 break-all">{txHash}</p>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
          >
            Volver al Inicio
          </button>
        </div>
      )}
    </LayoutResponsive>
  );
}
