import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function AsistenciaCatequesis() {
  const [asistencias, setAsistencias] = useState([]);
  const [clases, setClases] = useState([]);
  const [catequizandos, setCatequizandos] = useState([]);
  const [sacramentos, setSacramentos] = useState([]);
  const [sacramentoFiltro, setSacramentoFiltro] = useState('');
  const [formData, setFormData] = useState({
    asistio: 0,
    observacion: '',
    id_clase: '',
    id_catequizando: ''
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    obtenerAsistencias();
    obtenerClases();
    obtenerCatequizandos();
    obtenerSacramentos();
  }, []);

  const obtenerAsistencias = async () => {
    try {
      const res = await fetch('http://localhost:5000/asistencias');
      const data = await res.json();
      setAsistencias(Array.isArray(data) ? data : []);
    } catch {
      Swal.fire('Error', 'No se pudieron cargar las asistencias', 'error');
    }
  };

  const obtenerClases = async () => {
    try {
      const res = await fetch('http://localhost:5000/clases-catequesis');
      const data = await res.json();
      setClases(Array.isArray(data) ? data : []);
    } catch {
      Swal.fire('Error', 'No se pudieron cargar las clases', 'error');
    }
  };

  const obtenerCatequizandos = async () => {
    try {
      const res = await fetch('http://localhost:5000/catequizandos');
      const data = await res.json();
      setCatequizandos(Array.isArray(data) ? data : []);
    } catch {
      Swal.fire('Error', 'No se pudieron cargar los catequizandos', 'error');
    }
  };

  const obtenerSacramentos = async () => {
    try {
      const res = await fetch('http://localhost:5000/sacramentos-catequesis');
      const data = await res.json();
      setSacramentos(Array.isArray(data) ? data : []);
    } catch {
      Swal.fire('Error', 'No se pudieron cargar los sacramentos', 'error');
    }
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.id_clase || !formData.id_catequizando) {
      Swal.fire('Campos obligatorios', 'Seleccione una clase y un catequizando.', 'warning');
      return;
    }

    const url = editando
      ? `http://localhost:5000/asistencias/${editando}`
      : 'http://localhost:5000/asistencias';
    const method = editando ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        obtenerAsistencias();
        resetForm();
        Swal.fire('Éxito', editando ? 'Asistencia actualizada' : 'Asistencia registrada', 'success');
      } else {
        Swal.fire('Error', 'No se pudo guardar la asistencia', 'error');
      }
    } catch {
      Swal.fire('Error', 'Hubo un problema con la conexión', 'error');
    }
  };

  const handleEditar = (a) => {
    setFormData({
      asistio: a.asistio,
      observacion: a.observacion || '',
      id_clase: a.id_clase,
      id_catequizando: a.id_catequizando
    });
    setEditando(a.id_asistencia);
  };

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar asistencia?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      const res = await fetch(`http://localhost:5000/asistencias/${id}`, { method: 'DELETE' });
      if (res.ok) {
        obtenerAsistencias();
        Swal.fire('Eliminado', 'Asistencia eliminada correctamente', 'success');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      asistio: 0,
      observacion: '',
      id_clase: '',
      id_catequizando: ''
    });
    setEditando(null);
  };

  const asistenciasFiltradas = sacramentoFiltro
    ? asistencias.filter(a => String(a.id_sacramento) === String(sacramentoFiltro))
    : asistencias;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">Gestión de Asistencia de Catequesis</h2>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-6 border border-gray-200 rounded-2xl shadow mb-6">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="asistio"
            id="asistio"
            checked={formData.asistio === 1}
            onChange={handleChange}
            className="accent-blue-600"
          />
          <label htmlFor="asistio" className="text-sm font-medium">Asistió</label>
        </div>

        <input
          type="text"
          name="observacion"
          placeholder="Observaciones"
          value={formData.observacion}
          onChange={handleChange}
          className="border rounded-lg px-3 py-2 text-sm col-span-1 focus:ring-2 focus:ring-blue-500"
        />

        <select
          name="id_clase"
          value={formData.id_clase}
          onChange={handleChange}
          className="border rounded-lg px-3 py-2 text-sm col-span-1 focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Seleccione Clase</option>
          {clases.map(c => (
            <option key={c.id_clase} value={c.id_clase}>
              {c.tema} ({new Date(c.fecha).toLocaleDateString()})
            </option>
          ))}
        </select>

        <select
          name="id_catequizando"
          value={formData.id_catequizando}
          onChange={handleChange}
          className="border rounded-lg px-3 py-2 text-sm col-span-1 focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Seleccione Catequizando</option>
          {catequizandos.map(p => (
            <option key={p.id_persona} value={p.id_persona}>
              {p.nombres} {p.apellido1} {p.apellido2}
            </option>
          ))}
        </select>

        <div className="col-span-full flex justify-end gap-2 mt-2">
          {editando && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm px-4 py-1.5 rounded-lg shadow"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className={`text-sm px-4 py-1.5 rounded-lg shadow text-white ${editando ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {editando ? 'Actualizar' : 'Registrar'}
          </button>
        </div>
      </form>

      {/* Filtro */}
      <div className="mb-4 flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Filtrar por sacramento:</label>
        <select
          value={sacramentoFiltro}
          onChange={(e) => setSacramentoFiltro(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 w-64"
        >
          <option value="">Todos</option>
          {sacramentos.map(s => (
            <option key={s.id_sacramento} value={s.id_sacramento}>
              {s.nombre_sacrament}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm text-center">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-2">Clase</th>
              <th>Catequizando</th>
              <th>Sacramento</th>
              <th>Asistió</th>
              <th>Observación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {asistenciasFiltradas.length > 0 ? (
              asistenciasFiltradas.map(a => (
                <tr key={a.id_asistencia}>
                  <td className="px-4 py-2">{a.tema} ({new Date(a.fecha).toLocaleDateString()})</td>
                  <td>{a.catequizando}</td>
                  <td>{a.sacramento || '-'}</td>
                  <td>{a.asistio ? 'Sí' : 'No'}</td>
                  <td>{a.observacion || '-'}</td>
                  <td>
                    <div className="flex justify-center gap-2">
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                        onClick={() => handleEditar(a)}
                      >
                        Editar
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                        onClick={() => handleEliminar(a.id_asistencia)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-4 text-gray-500">No hay asistencias registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AsistenciaCatequesis;
