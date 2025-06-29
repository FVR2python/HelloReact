import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function ClasesCatequesis() {
  const [clases, setClases] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [formData, setFormData] = useState({
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    tema: '',
    id_grupo: ''
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    obtenerClases();
    obtenerGrupos();
  }, []);

  const obtenerClases = async () => {
    try {
      const res = await fetch('http://localhost:5000/clases-catequesis');
      const data = await res.json();
      setClases(Array.isArray(data) ? data : []);
    } catch {
      setClases([]);
      Swal.fire("Error", "No se pudieron cargar las clases", "error");
    }
  };

  const obtenerGrupos = async () => {
    try {
      const res = await fetch('http://localhost:5000/grupos-catequesis');
      const data = await res.json();
      setGrupos(Array.isArray(data) ? data : []);
    } catch {
      setGrupos([]);
      Swal.fire("Error", "No se pudieron cargar los grupos", "error");
    }
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const { fecha, hora_inicio, hora_fin, tema, id_grupo } = formData;

    if (!fecha || !hora_inicio || !hora_fin || !tema.trim() || !id_grupo) {
      Swal.fire('Campos incompletos', 'Por favor completa todos los campos', 'warning');
      return;
    }

    const url = editando
      ? `http://localhost:5000/clases-catequesis/${editando}`
      : 'http://localhost:5000/clases-catequesis';
    const method = editando ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      obtenerClases();
      setFormData({ fecha: '', hora_inicio: '', hora_fin: '', tema: '', id_grupo: '' });
      setEditando(null);
      Swal.fire('Éxito', editando ? 'Clase actualizada' : 'Clase registrada', 'success');
    } else {
      Swal.fire('Error', 'No se pudo guardar la clase', 'error');
    }
  };

  const handleEditar = c => {
    setFormData({
      fecha: c.fecha?.split('T')[0] || '',
      hora_inicio: c.hora_inicio,
      hora_fin: c.hora_fin,
      tema: c.tema,
      id_grupo: c.id_grupo.toString()
    });
    setEditando(c.id_clase);
  };

  const handleEliminar = async id => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      const res = await fetch(`http://localhost:5000/clases-catequesis/${id}`, { method: 'DELETE' });
      if (res.ok) {
        obtenerClases();
        Swal.fire('Eliminado', 'Clase eliminada correctamente', 'success');
      } else {
        Swal.fire('Error', 'No se pudo eliminar la clase', 'error');
      }
    }
  };

return (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-blue-600">Gestión de Clases de Catequesis</h2>

    {/* Formulario */}
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl shadow-lg p-6"
    >
      <div>
        <label className="block text-sm font-medium mb-1">Fecha</label>
        <input
          type="date"
          name="fecha"
          value={formData.fecha}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Hora Inicio</label>
        <input
          type="time"
          name="hora_inicio"
          value={formData.hora_inicio}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Hora Fin</label>
        <input
          type="time"
          name="hora_fin"
          value={formData.hora_fin}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="lg:col-span-2">
        <label className="block text-sm font-medium mb-1">Tema</label>
        <input
          type="text"
          name="tema"
          placeholder="Ej. Parábolas"
          value={formData.tema}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Grupo</label>
        <select
          name="id_grupo"
          value={formData.id_grupo}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Seleccione</option>
          {grupos.map(g => (
            <option key={g.id_grupo} value={g.id_grupo}>{g.nombre_grupo}</option>
          ))}
        </select>
      </div>

      <div className="lg:col-span-6 flex justify-end mt-2">
        <button
          type="submit"
          className="px-4 py-2 rounded-lg text-white text-sm bg-blue-600 hover:bg-blue-700"
        >
          {editando ? 'Actualizar' : 'Registrar'}
        </button>
      </div>
    </form>

    {/* Tabla de clases */}
    <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl shadow overflow-x-auto">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="px-4 py-2 text-center">#</th>
            <th className="px-4 py-2">Fecha</th>
            <th className="px-4 py-2">Inicio</th>
            <th className="px-4 py-2">Fin</th>
            <th className="px-4 py-2">Tema</th>
            <th className="px-4 py-2">Grupo</th>
            <th className="px-4 py-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
          {Array.isArray(clases) && clases.length > 0 ? (
            clases.map((c, i) => (
              <tr key={c.id_clase}>
                <td className="px-4 py-2 text-center">{i + 1}</td>
                <td className="px-4 py-2">{c.fecha?.split('T')[0]}</td>
                <td className="px-4 py-2">{c.hora_inicio}</td>
                <td className="px-4 py-2">{c.hora_fin}</td>
                <td className="px-4 py-2">{c.tema}</td>
                <td className="px-4 py-2">{c.nombre_grupo}</td>
                <td className="px-4 py-2 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleEditar(c)}
                      className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(c.id_clase)}
                      className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center text-gray-400 dark:text-neutral-500 py-4">
                No hay clases registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
}

export default ClasesCatequesis;
