import LayoutResponsive from "../layout/LayoutResponsive";
import { useState, useContext } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { AuthContext } from "../context/AuthContext";

export default function ScanPay() {
  const navigate = useNavigate();
  const { refreshBalance } = useContext(AuthContext);
  const [scannedData, setScannedData] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleScan = (result) => {
    if (result && result[0]) {
      const raw = result[0].rawValue;
      setScannedData(raw);
      
      try {
        // Intentar parsear JSON (formato del Event Organizer)
        const data = JSON.parse(raw);
        if (data.address) {
          setParsedData(data);
          if (data.amount) setAmount(data.amount);
        }
      } catch (e) {
        // Si no es JSON, asumir que es solo la address
        setParsedData({ address: raw });
      }
    }
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
      alert("✅ Pago Exitoso! Hash: " + data.txHash.slice(0, 10) + "...");
      navigate("/dashboard");
    } catch (error) {
      console.error('Payment error:', error);
      alert("Error en el pago: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <LayoutResponsive>
      <h1 className="text-2xl font-bold mb-6">Escanear y Pagar</h1>

      {!scannedData ? (
        <div className="bg-black rounded-xl overflow-hidden border border-neutral-800 relative">
          <Scanner 
            onScan={handleScan} 
            styles={{ container: { height: 300 } }}
          />
          <p className="text-center text-gray-400 p-4">
            Escanea el código QR del comercio
          </p>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-2xl">
              🏪
            </div>
            <div>
              <p className="text-sm text-gray-400">Pagando a:</p>
              <p className="font-bold text-white text-lg">
                {parsedData?.name || 'Comercio Desconocido'}
              </p>
              <p className="font-mono text-gray-500 text-xs break-all">
                {parsedData?.address || scannedData}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">Monto a Pagar (ATL)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-black border border-neutral-700 rounded-lg p-4 text-2xl text-white text-center focus:border-purple-500 focus:outline-none"
              placeholder="0.00"
              autoFocus
              readOnly={!!parsedData?.amount} // Si el QR traía monto, es fijo
            />
          </div>

          <button
            onClick={handlePayment}
            disabled={processing || !amount}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition disabled:opacity-50"
          >
            {processing ? "Procesando en Blockchain..." : "Confirmar Pago"}
          </button>

          <button
            onClick={() => {
              setScannedData(null);
              setParsedData(null);
              setAmount("");
            }}
            className="w-full mt-3 text-gray-400 text-sm hover:text-white"
          >
            Cancelar y escanear de nuevo
          </button>
        </div>
      )}
    </LayoutResponsive>
  );
}
