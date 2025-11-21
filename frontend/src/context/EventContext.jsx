import { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AuthContext } from './AuthContext';

export const EventContext = createContext();

export function EventProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(false);
  const [myEvents, setMyEvents] = useState([]);

  // Cargar eventos donde el usuario es miembro
  useEffect(() => {
    if (user) {
      loadMyEvents();
    }
  }, [user]);

  async function loadMyEvents() {
    try {
      // Obtener IDs de eventos donde soy miembro
      const { data: memberships, error: memberError } = await supabase
        .from('event_members')
        .select('event_id, role')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      if (memberships && memberships.length > 0) {
        const eventIds = memberships.map(m => m.event_id);
        
        // Obtener detalles de esos eventos
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .in('id', eventIds);

        if (eventsError) throw eventsError;

        setMyEvents(events);
      }
    } catch (error) {
      console.error('Error loading my events:', error);
    }
  }

  async function createEvent(name, description) {
    try {
      const { data, error } = await supabase.functions.invoke('create-event', {
        body: { name, description }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      await loadMyEvents(); // Recargar lista
      return data.event;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async function selectEvent(eventId) {
    setLoadingEvent(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-event-details', {
        body: { eventId }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setCurrentEvent(data.event);
    } catch (error) {
      console.error('Error selecting event:', error);
      alert('Error loading event details');
    } finally {
      setLoadingEvent(false);
    }
  }

  async function inviteStaff(email) {
    if (!currentEvent) return;
    try {
      const { data, error } = await supabase.functions.invoke('invite-staff', {
        body: { eventId: currentEvent.id, email }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      alert('Staff invited successfully!');
    } catch (error) {
      console.error('Error inviting staff:', error);
      alert(error.message);
    }
  }

  return (
    <EventContext.Provider value={{
      myEvents,
      currentEvent,
      loadingEvent,
      createEvent,
      selectEvent,
      inviteStaff,
      setCurrentEvent // Para salir del modo evento
    }}>
      {children}
    </EventContext.Provider>
  );
}
