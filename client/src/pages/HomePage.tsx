import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Evento {
  id: string;
  titulo: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  ubicacion?: string;
}

interface Tarea {
  id: string;
  titulo: string;
  descripcion?: string;
  completada: boolean;
  fecha_limite?: string;
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA';
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    type: 'evento' | 'tarea';
    data: Evento | Tarea;
  };
}

interface HomePageProps {
  usuarioId: string;
}

const HomePage: React.FC<HomePageProps> = ({ usuarioId }) => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  const fetchEventos = useCallback(async () => {
    try {
      const response = await fetch('/api/eventos', {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setEventos(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching eventos:', error);
    }
  }, []);

  const fetchTareas = useCallback(async () => {
    try {
      const response = await fetch('/api/tareas', {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setTareas(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching tareas:', error);
    }
  }, []);

  useEffect(() => {
    fetchEventos();
    fetchTareas();
  }, [fetchEventos, fetchTareas]);

  useEffect(() => {
    // Combinar eventos y tareas en el calendario
    const eventosCalendar: CalendarEvent[] = eventos.map((evento) => ({
      id: evento.id,
      title: `📅 ${evento.titulo}`,
      start: new Date(evento.fecha_inicio),
      end: new Date(evento.fecha_fin),
      resource: {
        type: 'evento',
        data: evento,
      },
    }));

    const tareasCalendar: CalendarEvent[] = tareas
      .filter((tarea) => tarea.fecha_limite && !tarea.completada)
      .map((tarea) => {
        const fecha = new Date(tarea.fecha_limite!);
        return {
          id: tarea.id,
          title: `✓ ${tarea.titulo} ${tarea.prioridad === 'ALTA' ? '🔴' : tarea.prioridad === 'MEDIA' ? '🟡' : '🟢'}`,
          start: fecha,
          end: fecha,
          resource: {
            type: 'tarea',
            data: tarea,
          },
        };
      });

    setCalendarEvents([...eventosCalendar, ...tareasCalendar]);
  }, [eventos, tareas]);

  const eventStyleGetter = (event: CalendarEvent) => {
    const isEvento = event.resource.type === 'evento';
    const style = {
      backgroundColor: isEvento ? '#3b82f6' : '#10b981',
      borderRadius: '5px',
      opacity: 0.9,
      color: 'white',
      border: '0px',
      display: 'block',
    };
    return { style };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    const { type, data } = event.resource;
    if (type === 'evento') {
      const evento = data as Evento;
      alert(
        `Evento: ${evento.titulo}\n` +
        `Inicio: ${new Date(evento.fecha_inicio).toLocaleString('es-ES')}\n` +
        `Fin: ${new Date(evento.fecha_fin).toLocaleString('es-ES')}\n` +
        `${evento.descripcion ? `Descripción: ${evento.descripcion}\n` : ''}` +
        `${evento.ubicacion ? `Ubicación: ${evento.ubicacion}` : ''}`
      );
    } else {
      const tarea = data as Tarea;
      alert(
        `Tarea: ${tarea.titulo}\n` +
        `Prioridad: ${tarea.prioridad}\n` +
        `Límite: ${new Date(tarea.fecha_limite!).toLocaleString('es-ES')}\n` +
        `${tarea.descripcion ? `Descripción: ${tarea.descripcion}` : ''}`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Mi Agenda</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Vista general de eventos y tareas</p>
            </div>
            <div className="flex gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded"></div>
                <span className="text-xs sm:text-sm text-gray-700">Eventos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded"></div>
                <span className="text-xs sm:text-sm text-gray-700">Tareas</span>
              </div>
            </div>
          </div>

          <div className="h-[500px] sm:h-[600px] md:h-[700px]">
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={handleSelectEvent}
              views={['month', 'week', 'day', 'agenda']}
              messages={{
                next: 'Siguiente',
                previous: 'Anterior',
                today: 'Hoy',
                month: 'Mes',
                week: 'Semana',
                day: 'Día',
                agenda: 'Agenda',
                date: 'Fecha',
                time: 'Hora',
                event: 'Evento',
                noEventsInRange: 'No hay eventos en este rango',
                showMore: (total: number) => `+ Ver más (${total})`,
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg shadow p-3 sm:p-4">
            <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-2">Próximos Eventos</h3>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">{eventos.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-3 sm:p-4">
            <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-2">Tareas Pendientes</h3>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">
              {tareas.filter((t) => !t.completada).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
            <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-2">Contactos</h3>
            <p className="text-2xl sm:text-3xl font-bold text-purple-600">-</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
