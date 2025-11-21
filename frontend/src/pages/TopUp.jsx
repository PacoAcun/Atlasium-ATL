import LayoutResponsive from "../layout/LayoutResponsive";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import LoadingScreen from "../components/ui/LoadingScreen";
import BackButton from "../components/ui/BackButton";

export default function TopUp() {
  const { user, refreshBalance } = useContext(AuthContext);
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTopUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('topup', {
        body: { amount: parseFloat(amount) }
      });

      if (error) throw error;

      if (!data.success) throw new Error(data.error || 'Error en la compra');

      alert(`Compra exitosa de ${amount} ATL\nTx Hash: ${data.txHash.substring(0, 10)}...`);
      await refreshBalance();
      navigate("/dashboard");
    } catch (error) {
      console.error('Topup error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen text="Procesando Compra..." />;
  }

  return (
    <LayoutResponsive>
      <div className="mt-10">
        <h1 className="text-3xl font-bold mb-6 text-white">Comprar ATL</h1>

        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
          <form onSubmit={handleTopUp} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Monto a comprar (Q)</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-500">Q</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-black border border-neutral-700 rounded-lg p-3 pl-8 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="0.00"
                  required
                  min="1"
                />
              </div>
              <p className="text-xs text-blue-400 mt-2">
                Tasa de cambio: Q1.00 = 1.00 ATL
              </p>
            </div>

            <div className="border-t border-neutral-800 pt-6">
              <h3 className="text-sm font-medium text-white mb-4">Método de Pago (Simulado)</h3>
              
              <div className="space-y-3">
                <input
                  type="text"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded p-3 text-sm"
                  placeholder="Número de Tarjeta"
                  defaultValue="4242 4242 4242 4242"
                  disabled
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    className="bg-neutral-800 border border-neutral-700 rounded p-3 text-sm"
                    placeholder="MM/YY"
                    defaultValue="12/25"
                    disabled
                  />
                  <input
                    type="text"
                    className="bg-neutral-800 border border-neutral-700 rounded p-3 text-sm"
                    placeholder="CVC"
                    defaultValue="123"
                    disabled
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Procesando..." : `Pagar Q${amount || '0'}`}
            </button>
          </form>
        </div>
      </div>
    </LayoutResponsive>
  );
}
