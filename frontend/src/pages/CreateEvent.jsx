import { useState, useContext } from 'react';
import { EventContext } from '../context/EventContext';
import { useNavigate } from 'react-router-dom';
import LayoutResponsive from '../layout/LayoutResponsive';

export default function CreateEvent() {
  const { createEvent, setCurrentEvent } = useContext(EventContext);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (new Date(endTime) <= new Date(startTime)) {
      alert('La fecha de fin debe ser posterior a la de inicio');
      return;
    }

    setLoading(true);
    try {
      // Convertir a ISO string (UTC) para asegurar consistencia
      const startISO = new Date(startTime).toISOString();
      const endISO = new Date(endTime).toISOString();
      
      const event = await createEvent(name, description, startISO, endISO);
      setCurrentEvent(event); // Seleccionar el nuevo evento automáticamente
      navigate('/event-dashboard'); // Ir al dashboard del evento
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutResponsive>
      <div className="mx-auto">
        <button 
          onClick={() => navigate('/wallet')}
          className="mb-2 text-gray-400 hover:text-white flex items-center gap-2"
        >
          ← Volver a Wallet
        </button>

        <h1 className="text-2xl font-bold mb-2 text-white">Crear Nuevo Evento</h1>
        <p className="text-gray-400 mb-4 text-sm">
          Genera una wallet temporal exclusiva para tu evento y comienza a cobrar en ATL.
        </p>

        <form onSubmit={handleSubmit} className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 space-y-4 relative z-10">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nombre del Evento</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black border border-neutral-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
              placeholder="Ej. Tacos Don Paco"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Inicio</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-black border border-neutral-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Fin</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-black border border-neutral-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Descripción (Opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-black border border-neutral-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none h-20"
              placeholder="Venta de comida para el festival..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Crear Evento'}
          </button>
        </form>
      </div>
    </LayoutResponsive>
  );
}
