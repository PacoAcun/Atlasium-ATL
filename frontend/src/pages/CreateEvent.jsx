import { useState, useContext } from 'react';
import { EventContext } from '../context/EventContext';
import { useNavigate } from 'react-router-dom';
import LayoutResponsive from '../layout/LayoutResponsive';

export default function CreateEvent() {
  const { createEvent } = useContext(EventContext);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const event = await createEvent(name, description);
      alert('✅ Evento creado exitosamente!');
      navigate('/events'); // Redirigir a lista de eventos o dashboard del evento
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutResponsive>
      <div className="max-w-md mx-auto mt-10">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 rounded-xl transition disabled:opacity-50"
          >
            {loading ? 'Creando Wallet...' : 'Crear Evento'}
          </button>
        </form>
      </div>
    </LayoutResponsive>
  );
}
