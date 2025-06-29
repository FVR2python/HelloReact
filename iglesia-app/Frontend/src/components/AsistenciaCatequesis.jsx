import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function AsistenciaCatequesis() {
  const [asistencias, setAsistencias] = useState([]);
  const [clases, setClases] = useState([]);
  const [catequizandos, setCatequizandos] = useState([]);
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
  }, []);

  const obtenerAsistencias = async () => {
    try {
      const res = await fetch('http://localhost:5000/asistencias');
      setAsistencias(await res.json());
    } catch {
      Swal.fire('Error', 'No se pudieron cargar las asistencias', 'error');
    }
  };

  const obtenerClases = async () => {
    try {
      const res = await fetch('http://localhost:5000/clases-catequesis');
      setClases(await res.json());
    } catch {
      Swal.fire('Error', 'No se pudieron cargar las clases', 'error');
    }
  };

  const obtenerCatequizandos = async () => {
    try {
      const res = await fetch('http://localhost:5000/catequizandos');
      setCatequizandos(await res.json());
    } catch {
      Swal.fire('Error', 'No se pudieron cargar los catequizandos', 'error');
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
      Swal.fire('Campos incompletos', 'Seleccione clase y catequizando', 'warning');
      return;
    }

    const url = editando
      ? `http://localhost:5000/asistencias/${editando}`
      : 'http://localhost:5000/asistencias';
    const method = editando ? 'PUT' : 'POST';

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
      Swal.fire('Error', 'No se pudo guardar la asistencia.', 'error');
    }
  };

  const handleEditar = a => {
    setFormData({
      asistio: a.asistio,
      observacion: a.observacion || '',
      id_clase: a.id_clase,
      id_catequizando: a.id_catequizando
    });
    setEditando(a.id_asistencia);
  };

  const handleEliminar = async id => {
    const result = await Swal.fire({
      title: '¿Eliminar?',
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

return (
  <div className="p-6">
    <h2 className="text-2xl font-semibold text-blue-700 mb-4">Gestión de Asistencia de Catequesis</h2>

    {/* Formulario */}
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-2xl shadow-md border border-gray-200 mb-6">
      <div className="flex flex-col md:flex-row md:items-end md:space-x-4 space-y-4 md:space-y-0">
        {/* Checkbox Asistió */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="asistio"
            id="asistioCheck"
            checked={formData.asistio === 1}
            onChange={handleChange}
            className="accent-blue-600 w-4 h-4"
          />
          <label htmlFor="asistioCheck" className="text-sm font-medium">Asistió</label>
        </div>

        {/* Observación */}
        <input
          type="text"
          name="observacion"
          value={formData.observacion}
          onChange={handleChange}
          className="flex-1 min-w-[150px] text-sm rounded-lg border-gray-300 shadow-sm focus:ring-blue-600 focus:border-blue-600"
          placeholder="Observaciones..."
        />

        {/* Clase */}
        <select
          name="id_clase"
          value={formData.id_clase}
          onChange={handleChange}
          className="flex-1 min-w-[150px] text-sm rounded-lg border-gray-300 shadow-sm focus:ring-blue-600 focus:border-blue-600"
          required
        >
          <option value="">Seleccione Clase</option>
          {clases.map(c => (
            <option key={c.id_clase} value={c.id_clase}>
              {c.tema} - {new Date(c.fecha).toLocaleDateString()}
            </option>
          ))}
        </select>

        {/* Catequizando */}
        <select
          name="id_catequizando"
          value={formData.id_catequizando}
          onChange={handleChange}
          className="flex-1 min-w-[180px] text-sm rounded-lg border-gray-300 shadow-sm focus:ring-blue-600 focus:border-blue-600"
          required
        >
          <option value="">Seleccione Catequizando</option>
          {catequizandos.map(p => (
            <option key={p.id_persona} value={p.id_persona}>
              {p.nombres} {p.apellido1}
            </option>
          ))}
        </select>

        {/* Botones */}
        <div className="flex gap-2">
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
      </div>
    </form>

    {/* Tabla */}
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200 text-sm text-center">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="px-4 py-2">Clase</th>
            <th>Catequizando</th>
            <th>Asistió</th>
            <th>Observación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {asistencias.length > 0 ? (
            asistencias.map(a => (
              <tr key={a.id_asistencia}>
                <td className="px-4 py-2">{a.tema} ({new Date(a.fecha).toLocaleDateString()})</td>
                <td>{a.catequizando}</td>
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
              <td colSpan="5" className="py-4 text-gray-500 text-sm">No hay asistencias registradas.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);


}

export default AsistenciaCatequesis;
