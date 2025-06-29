import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function GruposCatequesis() {
  const [grupos, setGrupos] = useState([]);
  const [sacramentos, setSacramentos] = useState([]);
  const [parroquias, setParroquias] = useState([]);
  const [formData, setFormData] = useState({
    nombre_grupo: '',
    fecha_inicio: '',
    fecha_fin: '',
    id_sacramento: '',
    id_parroquia: ''
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    obtenerGrupos();
    obtenerSacramentos();
    obtenerParroquias();
  }, []);

  const obtenerGrupos = async () => {
    try {
      const res = await fetch('http://localhost:5000/grupos-catequesis');
      const data = await res.json();
      setGrupos(Array.isArray(data) ? data : []);
    } catch {
      Swal.fire("Error", "No se pudieron cargar los grupos", "error");
    }
  };

  const obtenerSacramentos = async () => {
    const res = await fetch('http://localhost:5000/sacramentos');
    const data = await res.json();
    setSacramentos(data);
  };

  const obtenerParroquias = async () => {
    const res = await fetch('http://localhost:5000/parroquias');
    const data = await res.json();
    setParroquias(data);
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const { nombre_grupo, fecha_inicio, fecha_fin, id_sacramento, id_parroquia } = formData;

    if (!nombre_grupo || !fecha_inicio || !fecha_fin || !id_sacramento || !id_parroquia) {
      Swal.fire('Campos incompletos', 'Por favor, complete todos los campos.', 'warning');
      return;
    }

    if (fecha_inicio > fecha_fin) {
      Swal.fire('Error de fechas', 'La fecha de inicio no puede ser mayor que la de fin.', 'warning');
      return;
    }

    const url = editando
      ? `http://localhost:5000/grupos-catequesis/${editando}`
      : 'http://localhost:5000/grupos-catequesis';
    const method = editando ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      obtenerGrupos();
      setFormData({
        nombre_grupo: '',
        fecha_inicio: '',
        fecha_fin: '',
        id_sacramento: '',
        id_parroquia: ''
      });
      setEditando(null);
      Swal.fire('Éxito', editando ? 'Grupo actualizado' : 'Grupo registrado', 'success');
    } else {
      Swal.fire('Error', 'No se pudo guardar el grupo.', 'error');
    }
  };

  const handleEditar = g => {
    setFormData({
      nombre_grupo: g.nombre_grupo,
      fecha_inicio: g.fecha_inicio?.split('T')[0] || '',
      fecha_fin: g.fecha_fin?.split('T')[0] || '',
      id_sacramento: g.id_sacramento.toString(),
      id_parroquia: g.id_parroquia.toString()
    });
    setEditando(g.id_grupo);
  };

  const handleEliminar = async id => {
    const result = await Swal.fire({
      title: '¿Eliminar grupo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      const res = await fetch(`http://localhost:5000/grupos-catequesis/${id}`, { method: 'DELETE' });
      if (res.ok) {
        obtenerGrupos();
        Swal.fire('Eliminado', 'Grupo eliminado correctamente', 'success');
      } else {
        Swal.fire('Error', 'No se pudo eliminar el grupo.', 'error');
      }
    }
  };

  return (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-blue-600">Gestión de Grupos de Catequesis</h2>

    {/* Formulario */}
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl shadow-lg p-6"
    >
      <div className="lg:col-span-2">
        <label className="block text-sm font-medium mb-1">Nombre del Grupo</label>
        <input
          type="text"
          name="nombre_grupo"
          value={formData.nombre_grupo}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Fecha Inicio</label>
        <input
          type="date"
          name="fecha_inicio"
          value={formData.fecha_inicio}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Fecha Fin</label>
        <input
          type="date"
          name="fecha_fin"
          value={formData.fecha_fin}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Sacramento</label>
        <select
          name="id_sacramento"
          value={formData.id_sacramento}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">--</option>
          {sacramentos.map(s => (
            <option key={s.id_sacramento} value={s.id_sacramento}>
              {s.nombre}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Parroquia</label>
        <select
          name="id_parroquia"
          value={formData.id_parroquia}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">--</option>
          {parroquias.map(p => (
            <option key={p.id_parroquia} value={p.id_parroquia}>
              {p.nombre_prrq}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-end">
        <button
          type="submit"
          className="w-full px-4 py-2 rounded-lg text-white text-sm bg-blue-600 hover:bg-blue-700"
        >
          {editando ? 'Actualizar' : 'Registrar'}
        </button>
      </div>
    </form>

    {/* Tabla */}
    <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl shadow overflow-x-auto">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="px-4 py-2">Grupo</th>
            <th className="px-4 py-2">Inicio</th>
            <th className="px-4 py-2">Fin</th>
            <th className="px-4 py-2">Sacramento</th>
            <th className="px-4 py-2">Parroquia</th>
            <th className="px-4 py-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
          {grupos.map(g => (
            <tr key={g.id_grupo}>
              <td className="px-4 py-2">{g.nombre_grupo}</td>
              <td className="px-4 py-2">{g.fecha_inicio?.split('T')[0]}</td>
              <td className="px-4 py-2">{g.fecha_fin?.split('T')[0]}</td>
              <td className="px-4 py-2">{g.nombre_sacramento}</td>
              <td className="px-4 py-2">{g.nombre_parroquia}</td>
              <td className="px-4 py-2 text-center">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => handleEditar(g)}
                    className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(g.id_grupo)}
                    className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {grupos.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center text-gray-400 dark:text-neutral-500 py-4">
                No hay grupos registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
}

export default GruposCatequesis;
