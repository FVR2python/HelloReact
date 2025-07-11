import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function PersonasRoles() {
  const [asignaciones, setAsignaciones] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    id_persona: '',
    id_rol: '',
    tipo_contexto: 'parroquia',
    fecha_inicio: '',
    fecha_fin: ''
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    obtenerAsignaciones();
    obtenerPersonas();
    obtenerRoles();
  }, []);

  const obtenerAsignaciones = async () => {
    try {
      const res = await fetch('http://localhost:5000/personas_roles');
      setAsignaciones(await res.json());
    } catch {
      Swal.fire('Error', 'No se pudieron cargar las asignaciones.', 'error');
    }
  };

  const obtenerPersonas = async () => {
    try {
      const res = await fetch('http://localhost:5000/personas');
      setPersonas(await res.json());
    } catch {
      Swal.fire('Error', 'No se pudieron cargar las personas.', 'error');
    }
  };

  const obtenerRoles = async () => {
    try {
      const res = await fetch('http://localhost:5000/roles');
      setRoles(await res.json());
    } catch {
      Swal.fire('Error', 'No se pudieron cargar los roles.', 'error');
    }
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const existe = asignaciones.find(a =>
      a.id_persona === parseInt(formData.id_persona) &&
      a.id_rol === parseInt(formData.id_rol) &&
      a.tipo_contexto === formData.tipo_contexto &&
      a.fecha_inicio === formData.fecha_inicio
    );

    if (existe && !editando) {
      return Swal.fire('Duplicado', 'Ya existe una asignación similar.', 'warning');
    }

    const url = editando
      ? `http://localhost:5000/personas_roles/${editando}`
      : 'http://localhost:5000/personas_roles';
    const method = editando ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      obtenerAsignaciones();
      handleCancelar();
      Swal.fire({
        icon: 'success',
        title: editando ? 'Asignación actualizada' : 'Asignación registrada',
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      Swal.fire('Error', 'No se pudo guardar la asignación.', 'error');
    }
  };

  const handleEditar = a => {
    setFormData({
      id_persona: a.id_persona.toString(),
      id_rol: a.id_rol.toString(),
      tipo_contexto: a.tipo_contexto,
      fecha_inicio: a.fecha_inicio,
      fecha_fin: a.fecha_fin || ''
    });
    setEditando(a.id_persona_rol);
  };

  const handleEliminar = async id => {
    const confirm = await Swal.fire({
      title: '¿Eliminar asignación?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (confirm.isConfirmed) {
      const res = await fetch(`http://localhost:5000/personas_roles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        obtenerAsignaciones();
        Swal.fire('Eliminado', 'La asignación fue eliminada.', 'success');
      } else {
        Swal.fire('Error', 'No se pudo eliminar.', 'error');
      }
    }
  };

  const handleCancelar = () => {
    setFormData({
      id_persona: '',
      id_rol: '',
      tipo_contexto: 'parroquia',
      fecha_inicio: '',
      fecha_fin: ''
    });
    setEditando(null);
  };

  const formatearFecha = (valor) => {
    return valor
      ? new Date(valor).toLocaleDateString('es-PE', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      : '—';
  };

return (
  <div className="p-6 max-w-7xl mx-auto">
    <h2 className="text-2xl font-bold text-blue-700 mb-6">Asignación de Roles a Personas</h2>

    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-xl p-6 mb-8 space-y-4 border border-gray-200"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Persona</label>
          <select
            name="id_persona"
            value={formData.id_persona}
            onChange={handleChange}
            className="input-form"
            required
          >
            <option value="">Seleccione</option>
            {personas.map(p => (
              <option key={p.id_persona} value={p.id_persona}>
                {p.nombres} {p.apellido1}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Rol</label>
          <select
            name="id_rol"
            value={formData.id_rol}
            onChange={handleChange}
            className="input-form"
            required
          >
            <option value="">Seleccione</option>
            {roles.map(r => (
              <option key={r.id_rol} value={r.id_rol}>
                {r.nombre_rol}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Contexto</label>
          <select
            name="tipo_contexto"
            value={formData.tipo_contexto}
            onChange={handleChange}
            className="input-form"
          >
            <option value="parroquia">Parroquia</option>
            <option value="evento_sacramental">Evento Sacramental</option>
            <option value="evento_liturgico">Evento Litúrgico</option>
            <option value="grupo_catequesis">Grupo Catequesis</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
          <input
            type="date"
            name="fecha_inicio"
            value={formData.fecha_inicio}
            onChange={handleChange}
            className="input-form"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha de Fin</label>
          <input
            type="date"
            name="fecha_fin"
            value={formData.fecha_fin}
            onChange={handleChange}
            className="input-form"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <button type="submit" className="btn btn-primary">
          {editando ? 'Actualizar' : 'Registrar'}
        </button>
        {editando && (
          <button type="button" onClick={handleCancelar} className="btn btn-secondary">
            Cancelar
          </button>
        )}
      </div>
    </form>

    <div className="bg-white shadow-md rounded-xl border border-gray-200 overflow-x-auto">
      <table className="min-w-full text-sm text-center">
        <thead className="bg-blue-100 text-blue-800 font-semibold">
          <tr>
            <th className="px-4 py-2">Persona</th>
            <th className="px-4 py-2">Rol</th>
            <th className="px-4 py-2">Contexto</th>
            <th className="px-4 py-2">Inicio</th>
            <th className="px-4 py-2">Fin</th>
            <th className="px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {asignaciones.length > 0 ? (
            asignaciones.map(a => (
              <tr key={a.id_persona_rol} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{a.nombres} {a.apellido1}</td>
                <td className="px-4 py-2">{a.nombre_rol}</td>
                <td className="px-4 py-2">{a.tipo_contexto}</td>
                <td className="px-4 py-2">{formatearFecha(a.fecha_inicio)}</td>
                <td className="px-4 py-2">{formatearFecha(a.fecha_fin)}</td>
                <td className="px-4 py-2">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => handleEditar(a)} className="btn-icon-edit text-sm">Editar</button>
                    <button onClick={() => handleEliminar(a.id_persona_rol)} className="btn-icon-delete text-sm">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="px-4 py-4 text-gray-500 italic">No hay asignaciones registradas.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
}

export default PersonasRoles;
