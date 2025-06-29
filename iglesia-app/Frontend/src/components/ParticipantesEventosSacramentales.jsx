import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

function ParticipantesEventosSacramentales() {
  const [participantes, setParticipantes] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    id_evento_sacramental: '',
    id_persona: '',
    id_rol: ''
  });

  useEffect(() => {
    obtenerParticipantes();
    obtenerEventos();
    obtenerPersonas();
    obtenerRoles();
  }, []);

  const obtenerParticipantes = async () => {
    try {
      const res = await fetch('/api/participantes/sacramentales');
      const data = await res.json();
      setParticipantes(data);
    } catch (error) {
      console.error('Error al obtener participantes:', error);
    }
  };

  const obtenerEventos = async () => {
    const res = await fetch('/api/eventos_sacramentales');
    setEventos(await res.json());
  };

  const obtenerPersonas = async () => {
    const res = await fetch('/api/personas');
    setPersonas(await res.json());
  };

  const obtenerRoles = async () => {
    const res = await fetch('/api/roles');
    setRoles(await res.json());
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/participantes/sacramentales', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        Swal.fire('¡Agregado!', 'Participante agregado correctamente.', 'success');
        obtenerParticipantes();
        setFormData({ id_evento_sacramental: '', id_persona: '', id_rol: '' });
      } else {
        const data = await res.json();
        Swal.fire('Error', data.message || 'No se pudo agregar.', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Error al conectar con el servidor.', 'error');
    }
  };

  const eliminarParticipante = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar?',
      text: 'Esto eliminará el participante',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (confirm.isConfirmed) {
      const res = await fetch(`/api/participantes/sacramentales/${id}`, { method: 'DELETE' });
      if (res.ok) {
        Swal.fire('Eliminado', 'Participante eliminado correctamente.', 'success');
        obtenerParticipantes();
      } else {
        Swal.fire('Error', 'No se pudo eliminar.', 'error');
      }
    }
  };

return (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-blue-600">Participantes de Eventos Sacramentales</h2>

    {/* Formulario */}
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl shadow-lg p-6"
    >
      <div>
        <label className="block text-sm font-medium mb-1">Evento</label>
        <select name="id_evento_sacramental" value={formData.id_evento_sacramental}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Seleccione evento</option>
          {eventos.map(e => (
            <option key={e.id_evento} value={e.id_evento}>{e.nombre_event}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Persona</label>
        <select name="id_persona" value={formData.id_persona}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Seleccione persona</option>
          {personas.map(p => (
            <option key={p.id_persona} value={p.id_persona}>
              {p.nombres} {p.apellido1}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Rol</label>
        <select name="id_rol" value={formData.id_rol}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Seleccione rol</option>
          {roles.map(r => (
            <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>
          ))}
        </select>
      </div>

      <div className="flex items-end">
        <button type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm">
          Agregar
        </button>
      </div>
    </form>

    {/* Tabla */}
    <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl shadow overflow-x-auto">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="px-4 py-2">Evento</th>
            <th className="px-4 py-2">Persona</th>
            <th className="px-4 py-2">Rol</th>
            <th className="px-4 py-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
          {participantes.map(p => (
            <tr key={p.id_participante}>
              <td className="px-4 py-2">{p.nombre_event}</td>
              <td className="px-4 py-2">{p.nombres} {p.apellido1}</td>
              <td className="px-4 py-2">{p.nombre_rol}</td>
              <td className="px-4 py-2 text-center">
                <button
                  onClick={() => eliminarParticipante(p.id_participante)}
                  className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded">
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
          {participantes.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center text-gray-400 dark:text-neutral-500 py-4">
                No hay participantes registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
}

export default ParticipantesEventosSacramentales;
