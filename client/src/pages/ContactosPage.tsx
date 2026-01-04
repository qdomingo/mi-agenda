import React, { useState, useEffect, useCallback } from 'react';

interface Contacto {
  id: string;
  nombre: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  notas?: string;
  usuario_id: string;
}

interface ContactosPageProps {
  usuarioId: string;
}

const ContactosPage: React.FC<ContactosPageProps> = ({ usuarioId }) => {
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string>('');
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    notas: '',
  });

  const getAuthHeaders = (contentType?: string) => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (contentType) headers['Content-Type'] = contentType;
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  const fetchContactos = useCallback(async () => {
    try {
      setApiError('');
      const response = await fetch('/api/contactos', {
        headers: getAuthHeaders(),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = data?.error || `Error cargando contactos (${response.status})`;
        setApiError(message);
        setContactos([]);
        return;
      }

      if (!Array.isArray(data)) {
        setApiError('Respuesta inesperada del servidor al listar contactos');
        setContactos([]);
        return;
      }

      setContactos(data);
    } catch (error) {
      console.error('Error fetching contactos:', error);
      setApiError('Error al conectar con el servidor');
      setContactos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContactos();
  }, [fetchContactos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEditing = Boolean(editingId);
      const response = await fetch(isEditing ? `/api/contactos/${editingId}` : '/api/contactos', {
        method: isEditing ? 'PUT' : 'POST',
        headers: getAuthHeaders('application/json'),
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setFormData({ nombre: '', apellido: '', email: '', telefono: '', notas: '' });
        setShowForm(false);
        setEditingId(null);
        fetchContactos();
      }
    } catch (error) {
      console.error('Error creating contacto:', error);
    }
  };

  const startCreate = () => {
    setEditingId(null);
    setFormData({ nombre: '', apellido: '', email: '', telefono: '', notas: '' });
    setShowForm(true);
  };

  const startEdit = (contacto: Contacto) => {
    setEditingId(contacto.id);
    setFormData({
      nombre: contacto.nombre || '',
      apellido: contacto.apellido || '',
      email: contacto.email || '',
      telefono: contacto.telefono || '',
      notas: contacto.notas || '',
    });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ nombre: '', apellido: '', email: '', telefono: '', notas: '' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este contacto?')) return;
    try {
      await fetch(`/api/contactos/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      fetchContactos();
    } catch (error) {
      console.error('Error deleting contacto:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando contactos...</div>;
  }

  return (
    <div className="px-4">
      {apiError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{apiError}</p>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Mis Contactos</h2>
        <button
          onClick={() => (showForm ? cancelForm() : startCreate())}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          {showForm ? 'Cancelar' : '+ Nuevo Contacto'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                <input
                  type="text"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <textarea
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              {editingId ? 'Actualizar Contacto' : 'Guardar Contacto'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contactos.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No hay contactos registrados. ¡Agrega tu primer contacto!
          </div>
        ) : (
          contactos.map((contacto) => (
            <div key={contacto.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-800">
                  {contacto.nombre} {contacto.apellido}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(contacto)}
                    className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                    aria-label="Editar contacto"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(contacto.id)}
                    className="text-red-600 hover:bg-red-50 p-1 rounded"
                    aria-label="Eliminar contacto"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              {contacto.email && (
                <p className="text-sm text-gray-600 mb-1">📧 {contacto.email}</p>
              )}
              {contacto.telefono && (
                <p className="text-sm text-gray-600 mb-1">📱 {contacto.telefono}</p>
              )}
              {contacto.notas && (
                <p className="text-sm text-gray-500 mt-3 italic">{contacto.notas}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ContactosPage;
