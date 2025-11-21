import LayoutResponsive from "../layout/LayoutResponsive";
import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useNavigate } from "react-router-dom";

export default function ScanPay() {
  const navigate = useNavigate();
  const [scannedData, setScannedData] = useState(null);
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleScan = (result) => {
    if (result && result[0]) {
      setScannedData(result[0].rawValue);
    }
  };

  const handlePayment = () => {
    setProcessing(true);
    // Simulación de pago
    setTimeout(() => {
      setProcessing(false);
      alert("✅ Pago Exitoso!");
      navigate("/dashboard");
    }, 2000);
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
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-2xl">
              🏪
            </div>
            <div>
              <p className="text-sm text-gray-400">Pagando a:</p>
              <p className="font-mono text-white text-sm break-all">{scannedData}</p>
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
            onClick={() => setScannedData(null)}
            className="w-full mt-3 text-gray-400 text-sm hover:text-white"
          >
            Cancelar y escanear de nuevo
          </button>
        </div>
      )}
    </LayoutResponsive>
  );
}
