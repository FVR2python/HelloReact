import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function AuditoriaTransacciones() {
  const [auditorias, setAuditorias] = useState([]);
  const [transacciones, setTransacciones] = useState([]);
  const [formData, setFormData] = useState({
    accion: '',
    fecha_accion: '',
    observacion: '',
    id_transaccion: ''
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    obtenerAuditorias();
    obtenerTransacciones();
  }, []);

  const obtenerAuditorias = async () => {
    const res = await fetch('http://localhost:5000/auditoria_transacciones');
    setAuditorias(await res.json());
  };

  const obtenerTransacciones = async () => {
    const res = await fetch('http://localhost:5000/transacciones');
    setTransacciones(await res.json());
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const url = editando
      ? `http://localhost:5000/auditoria_transacciones/${editando}`
      : 'http://localhost:5000/auditoria_transacciones';
    const method = editando ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      obtenerAuditorias();
      Swal.fire('Éxito', editando ? 'Auditoría actualizada' : 'Auditoría registrada', 'success');
      handleCancelar();
    } else {
      const error = await res.json();
      Swal.fire('Error', error.mensaje || 'No se pudo guardar la auditoría', 'error');
    }
  };

  const handleEditar = a => {
    setFormData({
      accion: a.accion,
      fecha_accion: a.fecha_accion,
      observacion: a.observacion || '',
      id_transaccion: a.id_transaccion
    });
    setEditando(a.id_auditoria);
  };

  const handleEliminar = async id => {
    const result = await Swal.fire({
      title: '¿Eliminar auditoría?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      const res = await fetch(`http://localhost:5000/auditoria_transacciones/${id}`, { method: 'DELETE' });
      if (res.ok) {
        obtenerAuditorias();
        Swal.fire('Eliminado', 'Auditoría eliminada correctamente', 'success');
      } else {
        Swal.fire('Error', 'No se pudo eliminar la auditoría', 'error');
      }
    }
  };

  const handleCancelar = () => {
    setFormData({
      accion: '',
      fecha_accion: '',
      observacion: '',
      id_transaccion: ''
    });
    setEditando(null);
  };

return (
  <div className="space-y-6 p-4">
    <h2 className="text-2xl font-bold text-blue-700">Gestión de Auditoría de Transacciones</h2>

    {/* Formulario */}
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-6 rounded-2xl shadow border">
      <select
        name="accion"
        value={formData.accion}
        onChange={handleChange}
        className="input-form"
        required
      >
        <option value="">Seleccione acción</option>
        <option value="editar">Editar</option>
        <option value="anular">Anular</option>
      </select>

      <input
        type="date"
        name="fecha_accion"
        value={formData.fecha_accion}
        onChange={handleChange}
        className="input-form"
        placeholder="Fecha de acción"
        required
      />

      <input
        type="text"
        name="observacion"
        value={formData.observacion}
        onChange={handleChange}
        className="input-form"
        placeholder="Observación"
      />

      <select
        name="id_transaccion"
        value={formData.id_transaccion}
        onChange={handleChange}
        className="input-form"
        required
      >
        <option value="">Seleccione transacción</option>
        {transacciones.map(t => (
          <option key={t.id_transaccion} value={t.id_transaccion}>
            {t.descripcion} - S/ {parseFloat(t.monto).toFixed(2)}
          </option>
        ))}
      </select>

      <div className="col-span-full flex justify-end gap-3 mt-2">
        {editando && (
          <button
            type="button"
            onClick={handleCancelar}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className={`px-4 py-2 text-white rounded-lg transition ${editando ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {editando ? 'Actualizar' : 'Registrar'}
        </button>
      </div>
    </form>

    {/* Tabla */}
    <div className="overflow-x-auto rounded-2xl border shadow bg-white">
      <table className="min-w-full text-sm text-center">
        <thead className="bg-blue-600 text-white uppercase text-xs">
          <tr>
            <th className="py-3 px-2">Fecha</th>
            <th className="py-3 px-2">Acción</th>
            <th className="py-3 px-2">Transacción</th>
            <th className="py-3 px-2">Observación</th>
            <th className="py-3 px-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {auditorias.length > 0 ? (
            auditorias.map(a => (
              <tr key={a.id_auditoria} className="hover:bg-gray-100">
                <td className="py-2 px-2">{a.fecha_accion}</td>
                <td className="py-2 px-2 capitalize">{a.accion}</td>
                <td className="py-2 px-2">{a.descripcion_transaccion}</td>
                <td className="py-2 px-2">{a.observacion}</td>
                <td className="py-2 px-2 flex items-center justify-center gap-2">
                  <button onClick={() => handleEditar(a)} className="text-blue-600 hover:text-blue-800 text-lg">
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  <button onClick={() => handleEliminar(a.id_auditoria)} className="text-red-600 hover:text-red-800 text-lg">
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-4 text-gray-500">
                No hay auditorías registradas
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

}

export default AuditoriaTransacciones;
