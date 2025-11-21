import { useState, useContext } from 'react';
import { EventContext } from '../context/EventContext';
import { useNavigate } from 'react-router-dom';
import LayoutResponsive from '../layout/LayoutResponsive';

export default function CreateEvent() {
  const { createEvent, setCurrentEvent } = useContext(EventContext);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const event = await createEvent(name, description);
      setCurrentEvent(event); // Seleccionar el nuevo evento automáticamente
      alert('✅ Evento creado exitosamente!');
      navigate('/event-dashboard'); // Ir al dashboard del evento
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutResponsive>
      <div className="max-w-md mx-auto mt-10">
        <button 
          onClick={() => navigate('/wallet')}
          className="mb-6 text-gray-400 hover:text-white flex items-center gap-2"
        >
          ← Volver a Wallet
        </button>

        <h1 className="text-3xl font-bold mb-6 text-white">Crear Nuevo Evento</h1>
        <p className="text-gray-400 mb-8">
          Genera una wallet temporal exclusiva para tu evento y comienza a cobrar en ATL.
        </p>

        <form onSubmit={handleSubmit} className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 space-y-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Nombre del Evento</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black border border-neutral-700 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none"
              placeholder="Ej. Tacos Don Paco"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Descripción (Opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-black border border-neutral-700 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none h-24"
              placeholder="Venta de comida para el festival..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/wallet')}
              className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-4 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 rounded-xl transition disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Evento'}
            </button>
          </div>
        </form>
      </div>
    </LayoutResponsive>
  );
}
