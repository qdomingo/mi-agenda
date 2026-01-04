import React, { useState, useEffect, useCallback } from 'react';

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
  // Ajuste para compensar la zona horaria local (igual que en EventosPage)
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 16);
};

interface Tarea {
  id: string;
  titulo: string;
  descripcion?: string;
  completada: boolean;
  fecha_limite?: string;
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA';
  usuario_id: string;
}

interface TareasPageProps {
  usuarioId: string;
}

const TareasPage: React.FC<TareasPageProps> = ({ usuarioId }) => {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string>('');
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha_limite: '',
    prioridad: 'MEDIA' as 'BAJA' | 'MEDIA' | 'ALTA',
  });

  useEffect(() => {
    if (!showForm) return;
    if (editingId) return;
    setFormData((prev) => {
      if (prev.fecha_limite) return prev;
      const rounded = roundToFiveMinutes(new Date());
      return {
        ...prev,
        fecha_limite: formatDateTimeLocal(rounded),
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

  const fetchTareas = useCallback(async () => {
    try {
      setApiError('');
      const response = await fetch('/api/tareas', {
        headers: getAuthHeaders(),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = data?.error || `Error cargando tareas (${response.status})`;
        setApiError(message);
        setTareas([]);
        return;
      }

      if (!Array.isArray(data)) {
        setApiError('Respuesta inesperada del servidor al listar tareas');
        setTareas([]);
        return;
      }

      setTareas(data);
    } catch (error) {
      console.error('Error fetching tareas:', error);
      setApiError('Error al conectar con el servidor');
      setTareas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTareas();
  }, [fetchTareas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEditing = Boolean(editingId);
      const response = await fetch(isEditing ? `/api/tareas/${editingId}` : '/api/tareas', {
        method: isEditing ? 'PUT' : 'POST',
        headers: getAuthHeaders('application/json'),
        body: JSON.stringify(isEditing ? formData : { ...formData, completada: false }),
      });
      if (response.ok) {
        setFormData({ titulo: '', descripcion: '', fecha_limite: '', prioridad: 'MEDIA' });
        setShowForm(false);
        setEditingId(null);
        fetchTareas();
      }
    } catch (error) {
      console.error('Error creating tarea:', error);
    }
  };

  const startCreate = () => {
    setEditingId(null);
    setFormData({ titulo: '', descripcion: '', fecha_limite: '', prioridad: 'MEDIA' });
    setShowForm(true);
  };

  const startEdit = (tarea: Tarea) => {
    setEditingId(tarea.id);
    setFormData({
      titulo: tarea.titulo || '',
      descripcion: tarea.descripcion || '',
      fecha_limite: tarea.fecha_limite ? formatDateTimeLocal(tarea.fecha_limite) : '',
      prioridad: (tarea.prioridad || 'MEDIA') as any,
    });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ titulo: '', descripcion: '', fecha_limite: '', prioridad: 'MEDIA' });
  };

  const toggleCompletada = async (id: string, completada: boolean) => {
    try {
      await fetch(`/api/tareas/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders('application/json'),
        body: JSON.stringify({ completada: !completada }),
      });
      fetchTareas();
    } catch (error) {
      console.error('Error updating tarea:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar esta tarea?')) return;
    try {
      await fetch(`/api/tareas/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      fetchTareas();
    } catch (error) {
      console.error('Error deleting tarea:', error);
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'ALTA': return 'bg-red-100 text-red-800';
      case 'MEDIA': return 'bg-yellow-100 text-yellow-800';
      case 'BAJA': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando tareas...</div>;
  }

  const tareasActivas = tareas.filter(t => !t.completada);
  const tareasCompletadas = tareas.filter(t => t.completada);

  return (
    <div className="px-4">
      {apiError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{apiError}</p>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Mis Tareas</h2>
        <button
          onClick={() => (showForm ? cancelForm() : startCreate())}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          {showForm ? 'Cancelar' : '+ Nueva Tarea'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Límite</label>
                <input
                  type="datetime-local"
                  step={300}
                  value={formData.fecha_limite}
                  onChange={(e) => setFormData({ ...formData, fecha_limite: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                <select
                  value={formData.prioridad}
                  onChange={(e) => setFormData({ ...formData, prioridad: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="BAJA">Baja</option>
                  <option value="MEDIA">Media</option>
                  <option value="ALTA">Alta</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              {editingId ? 'Actualizar Tarea' : 'Guardar Tarea'}
            </button>
          </form>
        </div>
      )}

      {/* Tareas Activas */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Pendientes ({tareasActivas.length})</h3>
        <div className="space-y-3">
          {tareasActivas.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              ¡Genial! No tienes tareas pendientes.
            </div>
          ) : (
            tareasActivas.map((tarea) => (
              <div key={tarea.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={tarea.completada}
                    onChange={() => toggleCompletada(tarea.id, tarea.completada)}
                    className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-gray-800">{tarea.titulo}</h4>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(tarea)}
                          className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded"
                          aria-label="Editar tarea"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(tarea.id)}
                          className="text-red-600 hover:bg-red-50 px-2 py-1 rounded"
                          aria-label="Eliminar tarea"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    {tarea.descripcion && (
                      <p className="text-sm text-gray-600 mt-1">{tarea.descripcion}</p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getPrioridadColor(tarea.prioridad)}`}>
                        {tarea.prioridad}
                      </span>
                      {tarea.fecha_limite && (
                        <span className="text-xs text-gray-500">
                          ⏰ {new Date(tarea.fecha_limite).toLocaleString('es-ES')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tareas Completadas */}
      {tareasCompletadas.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Completadas ({tareasCompletadas.length})</h3>
          <div className="space-y-3 opacity-75">
            {tareasCompletadas.map((tarea) => (
              <div key={tarea.id} className="bg-gray-50 rounded-lg shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={tarea.completada}
                    onChange={() => toggleCompletada(tarea.id, tarea.completada)}
                    className="mt-1 h-5 w-5 text-green-600 rounded"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-gray-600 line-through">{tarea.titulo}</h4>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(tarea)}
                          className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded"
                          aria-label="Editar tarea"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(tarea.id)}
                          className="text-red-600 hover:bg-red-50 px-2 py-1 rounded"
                          aria-label="Eliminar tarea"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TareasPage;
