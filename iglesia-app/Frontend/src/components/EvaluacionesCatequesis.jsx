import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function EvaluacionesCatequesis() {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [catequizandos, setCatequizandos] = useState([]);
  const [formData, setFormData] = useState({
    id_grupo: '',
    id_persona: '',
    nota: '',
    estado_final: '',
    observaciones: '',
    fecha_evaluacion: ''
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    obtenerEvaluaciones();
    obtenerGrupos();
    obtenerCatequizandos();
  }, []);

  const obtenerEvaluaciones = async () => {
    const res = await fetch('http://localhost:5000/evaluaciones');
    const data = await res.json();
    setEvaluaciones(Array.isArray(data) ? data : []);
  };

  const obtenerGrupos = async () => {
    const res = await fetch('http://localhost:5000/grupos-catequesis');
    const data = await res.json();
    setGrupos(Array.isArray(data) ? data : []);
  };

  const obtenerCatequizandos = async () => {
    const res = await fetch('http://localhost:5000/catequizandos');
    const data = await res.json();
    setCatequizandos(Array.isArray(data) ? data : []);
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.id_grupo || !formData.id_persona || !formData.nota || !formData.estado_final || !formData.fecha_evaluacion) {
      Swal.fire('Campos incompletos', 'Por favor completa todos los campos requeridos', 'warning');
      return;
    }

    const url = editando
      ? `http://localhost:5000/evaluaciones/${editando}`
      : 'http://localhost:5000/evaluaciones';
    const method = editando ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      obtenerEvaluaciones();
      setFormData({ id_grupo: '', id_persona: '', nota: '', estado_final: '', observaciones: '', fecha_evaluacion: '' });
      setEditando(null);
      Swal.fire('Éxito', editando ? 'Evaluación actualizada' : 'Evaluación registrada', 'success');
    } else {
      Swal.fire('Error', 'No se pudo guardar la evaluación.', 'error');
    }
  };

  const handleEditar = (e) => {
    setFormData({
      id_grupo: e.id_grupo,
      id_persona: e.id_persona,
      nota: e.nota,
      estado_final: e.estado_final,
      observaciones: e.observaciones,
      fecha_evaluacion: e.fecha_evaluacion?.split('T')[0]
    });
    setEditando(e.id_evaluacion);
  };

  const handleEliminar = async id => {
    const confirm = await Swal.fire({
      title: '¿Eliminar?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (confirm.isConfirmed) {
      const res = await fetch(`http://localhost:5000/evaluaciones/${id}`, { method: 'DELETE' });
      if (res.ok) {
        obtenerEvaluaciones();
        Swal.fire('Eliminado', 'Evaluación eliminada', 'success');
      }
    }
  };

return (
  <div className="p-6 bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-lg">
    <h2 className="text-2xl font-bold text-blue-700 mb-6 border-b pb-2">
      📘 Gestión de Evaluaciones de Catequesis
    </h2>

    <form
      onSubmit={handleSubmit}
      className="bg-white border border-blue-200 rounded-2xl shadow p-6 mb-8"
    >
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-4">
          <label className="text-sm font-semibold text-gray-600 mb-1 block">Grupo</label>
          <select
            name="id_grupo"
            value={formData.id_grupo}
            onChange={handleChange}
            className="w-full rounded-lg border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccione</option>
            {grupos.map(g => (
              <option key={g.id_grupo} value={g.id_grupo}>{g.nombre_grupo}</option>
            ))}
          </select>
        </div>

        <div className="col-span-4">
          <label className="text-sm font-semibold text-gray-600 mb-1 block">Catequizando</label>
          <select
            name="id_persona"
            value={formData.id_persona}
            onChange={handleChange}
            className="w-full rounded-lg border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccione</option>
            {catequizandos.map(p => (
              <option key={p.id_persona} value={p.id_persona}>
                {p.nombres} {p.apellido1}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-4">
          <label className="text-sm font-semibold text-gray-600 mb-1 block">Nota</label>
          <input
            type="number"
            name="nota"
            min="0"
            max="20"
            value={formData.nota}
            onChange={handleChange}
            className="w-full rounded-lg border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="col-span-4">
          <label className="text-sm font-semibold text-gray-600 mb-1 block">Estado</label>
          <select
            name="estado_final"
            value={formData.estado_final}
            onChange={handleChange}
            className="w-full rounded-lg border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccione</option>
            <option value="aprobado">Aprobado</option>
            <option value="desaprobado">Desaprobado</option>
            <option value="pendiente">Pendiente</option>
          </select>
        </div>

        <div className="col-span-5">
          <label className="text-sm font-semibold text-gray-600 mb-1 block">Observaciones</label>
          <input
            type="text"
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            placeholder="Observaciones..."
            className="w-full rounded-lg border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="col-span-3">
          <label className="text-sm font-semibold text-gray-600 mb-1 block">Fecha</label>
          <input
            type="date"
            name="fecha_evaluacion"
            value={formData.fecha_evaluacion}
            onChange={handleChange}
            className="w-full rounded-lg border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="col-span-12 flex justify-end items-end mt-1">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition-all"
          >
            {editando ? 'Actualizar' : 'Registrar'}
          </button>
        </div>
      </div>
    </form>

    <div className="overflow-x-auto rounded-2xl shadow-md border">
      <table className="min-w-full text-sm text-center bg-white">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="px-4 py-3">Grupo</th>
            <th className="px-4 py-3">Catequizando</th>
            <th className="px-4 py-3">Nota</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Obs.</th>
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {evaluaciones.length > 0 ? (
            evaluaciones.map((e) => (
              <tr key={e.id_evaluacion} className="border-b hover:bg-gray-100 transition">
                <td className="px-4 py-2">{e.nombre_grupo}</td>
                <td className="px-4 py-2">{e.catequizando}</td>
                <td className="px-4 py-2">{e.nota}</td>
                <td className="px-4 py-2 capitalize">{e.estado_final}</td>
                <td className="px-4 py-2">{e.observaciones}</td>
                <td className="px-4 py-2">{new Date(e.fecha_evaluacion).toLocaleDateString()}</td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => handleEditar(e)}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(e.id_evaluacion)}
                    className="text-red-600 hover:underline font-medium"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center text-gray-400 py-4">
                No hay evaluaciones registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
}

export default EvaluacionesCatequesis;