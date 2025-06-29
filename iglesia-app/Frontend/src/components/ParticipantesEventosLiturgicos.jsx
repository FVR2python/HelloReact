import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

function ParticipantesEventosLiturgicos() {
  const [participantes, setParticipantes] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    id_evento_liturgico: '',
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
      const res = await fetch('/api/participantes-liturgicos');
      const data = await res.json();
      setParticipantes(data);
    } catch (error) {
      console.error('Error al obtener participantes:', error);
    }
  };

  const obtenerEventos = async () => {
    const res = await fetch('/api/eventos_liturgicos');
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
      const res = await fetch('/api/participantes-liturgicos', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        Swal.fire('¡Agregado!', 'Participante agregado correctamente.', 'success');
        obtenerParticipantes();
        setFormData({ id_evento_liturgico: '', id_persona: '', id_rol: '' });
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
      const res = await fetch(`/api/participantes-liturgicos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        Swal.fire('Eliminado', 'Participante eliminado correctamente.', 'success');
        obtenerParticipantes();
      } else {
        Swal.fire('Error', 'No se pudo eliminar.', 'error');
      }
    }
  };

return (
  <div className="p-6">
    <h2 className="text-xl font-semibold text-blue-700 mb-4">Gestión de Participantes de Eventos Litúrgicos</h2>

    <div className="bg-white rounded-2xl shadow p-4 mb-6">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div>
          <label className="text-sm font-medium text-gray-700">Evento</label>
          <select
            name="id_evento_liturgico"
            value={formData.id_evento_liturgico}
            onChange={handleChange}
            className="w-full rounded-xl border-gray-300 shadow-sm text-sm"
            required
          >
            <option value="">Seleccione evento</option>
            {eventos.map(e => (
              <option key={e.id_evento} value={e.id_evento}>{e.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Persona</label>
          <select
            name="id_persona"
            value={formData.id_persona}
            onChange={handleChange}
            className="w-full rounded-xl border-gray-300 shadow-sm text-sm"
            required
          >
            <option value="">Seleccione persona</option>
            {personas.map(p => (
              <option key={p.id_persona} value={p.id_persona}>{p.nombres} {p.apellido1}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Rol</label>
          <select
            name="id_rol"
            value={formData.id_rol}
            onChange={handleChange}
            className="w-full rounded-xl border-gray-300 shadow-sm text-sm"
            required
          >
            <option value="">Seleccione rol</option>
            {roles.map(r => (
              <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-1">
          <button
            type="submit"
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-xl w-full hover:bg-blue-700 transition"
          >
            Agregar
          </button>
        </div>
      </form>
    </div>

    <div className="bg-white rounded-2xl shadow overflow-x-auto">
      <table className="min-w-full text-sm text-center">
        <thead className="bg-blue-600 text-white uppercase rounded-t-xl">
          <tr>
            <th className="py-2 px-4">Evento</th>
            <th className="py-2 px-4">Persona</th>
            <th className="py-2 px-4">Rol</th>
            <th className="py-2 px-4">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {participantes.length > 0 ? (
            participantes.map(p => (
              <tr key={p.id_participante} className="hover:bg-gray-50">
                <td className="py-2 px-4">{p.nombre}</td>
                <td className="py-2 px-4">{p.nombres} {p.apellido1}</td>
                <td className="py-2 px-4">{p.nombre_rol}</td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => eliminarParticipante(p.id_participante)}
                    className="text-red-600 border border-red-600 hover:bg-red-600 hover:text-white px-3 py-1 rounded-xl transition"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="py-4 text-gray-400">No hay participantes registrados.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

}

export default ParticipantesEventosLiturgicos;
