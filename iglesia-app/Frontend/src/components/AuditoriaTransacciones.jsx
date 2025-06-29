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
  <div className="p-6 max-w-7xl mx-auto space-y-6">
    <h2 className="text-2xl font-bold text-blue-700">Gestión de Auditoría de Transacciones</h2>

    {/* Formulario */}
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <label className="label-form">Acción</label>
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
      </div>

      <div>
        <label className="label-form">Fecha acción</label>
        <input
          type="date"
          name="fecha_accion"
          value={formData.fecha_accion}
          onChange={handleChange}
          className="input-form"
          required
        />
      </div>

      <div>
        <label className="label-form">Observación</label>
        <input
          type="text"
          name="observacion"
          value={formData.observacion}
          onChange={handleChange}
          className="input-form"
        />
      </div>

      <div>
        <label className="label-form">Transacción</label>
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
      </div>

      <div className="flex items-end justify-end gap-3 col-span-full">
        {editando && (
          <button type="button" onClick={handleCancelar} className="btn btn-secondary">
            Cancelar
          </button>
        )}
        <button type="submit" className={`btn ${editando ? 'btn-warning' : 'btn-primary'}`}>
          {editando ? 'Actualizar' : 'Registrar'}
        </button>
      </div>
    </form>

    {/* Tabla */}
    <div className="bg-white rounded-2xl shadow overflow-x-auto">
      <table className="min-w-full text-sm text-center">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="table-th">Fecha</th>
            <th className="table-th">Acción</th>
            <th className="table-th">Transacción</th>
            <th className="table-th">Observación</th>
            <th className="table-th">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {auditorias.length > 0 ? auditorias.map(a => (
            <tr key={a.id_auditoria}>
              <td className="table-td">{a.fecha_accion}</td>
              <td className="table-td">{a.accion}</td>
              <td className="table-td">{a.descripcion_transaccion}</td>
              <td className="table-td">{a.observacion}</td>
              <td className="table-td">
                <div className="flex justify-center gap-2">
                  <button onClick={() => handleEditar(a)} className="btn-icon-edit">✏️</button>
                  <button onClick={() => handleEliminar(a.id_auditoria)} className="btn-icon-delete">🗑️</button>
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="5" className="py-4 text-gray-400">No hay auditorías registradas</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

}

export default AuditoriaTransacciones;
