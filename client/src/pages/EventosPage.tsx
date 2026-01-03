import React, { useState, useEffect } from 'react';

// Helper para formatear fechas para datetime-local input
const roundToFiveMinutes = (value: Date): Date => {
  const d = new Date(value);
  d.setSeconds(0, 0);
  const minutes = d.getMinutes();
  const rounded = Math.floor(minutes / 5) * 5;
  d.setMinutes(rounded);
  return d;
};

const formatDateTimeLocal = (date: Date | string): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

interface Evento {
  id: string;
  titulo: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  ubicacion?: string;
  usuario_id: string;
}

interface EventosPageProps {
  usuarioId: string;
}

const EventosPage: React.FC<EventosPageProps> = ({ usuarioId }) => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string>('');
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    ubicacion: '',
  });

  useEffect(() => {
    fetchEventos();
  }, [usuarioId]);

  useEffect(() => {
    if (!showForm) return;
    if (editingId) return;
    setFormData((prev) => {
      if (prev.fecha_inicio || prev.fecha_fin) return prev;
      const start = roundToFiveMinutes(new Date());
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + 30);
      return {
        ...prev,
        fecha_inicio: formatDateTimeLocal(start),
        fecha_fin: formatDateTimeLocal(end),
      };
    });
  }, [showForm, editingId]);

  const getAuthHeaders = (contentType?: string) => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (contentType) headers['Content-Type'] = contentType;
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  const fetchEventos = async () => {
    try {
      setApiError('');
      const response = await fetch('/api/eventos', {
        headers: getAuthHeaders(),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = data?.error || `Error cargando eventos (${response.status})`;
        setApiError(message);
        setEventos([]);
        return;
      }

      if (!Array.isArray(data)) {
        setApiError('Respuesta inesperada del servidor al listar eventos');
        setEventos([]);
        return;
      }

      setEventos(data);
    } catch (error) {
      console.error('Error fetching eventos:', error);
      setApiError('Error al conectar con el servidor');
      setEventos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEditing = Boolean(editingId);
      const response = await fetch(isEditing ? `/api/eventos/${editingId}` : '/api/eventos', {
        method: isEditing ? 'PUT' : 'POST',
        headers: getAuthHeaders('application/json'),
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setFormData({ titulo: '', descripcion: '', fecha_inicio: '', fecha_fin: '', ubicacion: '' });
        setShowForm(false);
        setEditingId(null);
        fetchEventos();
      }
    } catch (error) {
      console.error('Error creating evento:', error);
    }
  };

  const startCreate = () => {
    setEditingId(null);
    setFormData({ titulo: '', descripcion: '', fecha_inicio: '', fecha_fin: '', ubicacion: '' });
    setShowForm(true);
  };

  const startEdit = (evento: Evento) => {
    setEditingId(evento.id);
    setFormData({
      titulo: evento.titulo || '',
      descripcion: evento.descripcion || '',
      fecha_inicio: evento.fecha_inicio ? formatDateTimeLocal(evento.fecha_inicio) : '',
      fecha_fin: evento.fecha_fin ? formatDateTimeLocal(evento.fecha_fin) : '',
      ubicacion: evento.ubicacion || '',
    });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ titulo: '', descripcion: '', fecha_inicio: '', fecha_fin: '', ubicacion: '' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este evento?')) return;
    try {
      await fetch(`/api/eventos/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      fetchEventos();
    } catch (error) {
      console.error('Error deleting evento:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando eventos...</div>;
  }

  return (
    <div className="px-4">
      {apiError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{apiError}</p>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Mis Eventos</h2>
        <button
          onClick={() => (showForm ? cancelForm() : startCreate())}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          {showForm ? 'Cancelar' : '+ Nuevo Evento'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input
                type="text"
                required
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio *</label>
                <input
                  type="datetime-local"
                  step={300}
                  required
                  value={formData.fecha_inicio}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin *</label>
                <input
                  type="datetime-local"
                  step={300}
                  required
                  value={formData.fecha_fin}
                  onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
              <input
                type="text"
                value={formData.ubicacion}
                onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              {editingId ? 'Actualizar Evento' : 'Guardar Evento'}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {eventos.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No hay eventos registrados. ¡Crea tu primer evento!
          </div>
        ) : (
          eventos.map((evento) => (
            <div key={evento.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{evento.titulo}</h3>
                  {evento.descripcion && (
                    <p className="text-gray-600 mb-3">{evento.descripcion}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                    <span>📅 {new Date(evento.fecha_inicio).toLocaleString('es-ES')}</span>
                    <span>→ {new Date(evento.fecha_fin).toLocaleString('es-ES')}</span>
                    {evento.ubicacion && <span>📍 {evento.ubicacion}</span>}
                  </div>
                </div>
                <div className="ml-4 flex items-start gap-2">
                  <button
                    onClick={() => startEdit(evento)}
                    className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-md transition"
                    aria-label="Editar evento"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(evento.id)}
                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-md transition"
                    aria-label="Eliminar evento"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventosPage;
