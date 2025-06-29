import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function EgresosMantenimiento() {
  const [egresos, setEgresos] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [transacciones, setTransacciones] = useState([]);
  const [formData, setFormData] = useState({
    proveedor: '',
    descripcion: '',
    id_inventario: '',
    id_transaccion: ''
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    obtenerEgresos();
    obtenerInventario();
    obtenerTransacciones();
  }, []);

  const obtenerEgresos = async () => {
    const res = await fetch('http://localhost:5000/egresos_mantenimiento');
    setEgresos(await res.json());
  };

  const obtenerInventario = async () => {
    const res = await fetch('http://localhost:5000/objetos_liturgicos');
    setInventario(await res.json());
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
      ? `http://localhost:5000/egresos_mantenimiento/${editando}`
      : 'http://localhost:5000/egresos_mantenimiento';
    const method = editando ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      obtenerEgresos();
      Swal.fire('Éxito', editando ? 'Egreso actualizado' : 'Egreso registrado', 'success');
      handleCancelar();
    } else {
      const error = await res.json();
      Swal.fire('Error', error.mensaje || 'No se pudo guardar el egreso', 'error');
    }
  };

  const handleEditar = e => {
    setFormData({
      proveedor: e.proveedor,
      descripcion: e.descripcion,
      id_inventario: e.id_inventario,
      id_transaccion: e.id_transaccion
    });
    setEditando(e.id_egreso);
  };

  const handleEliminar = async id => {
    const result = await Swal.fire({
      title: '¿Eliminar egreso?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      const res = await fetch(`http://localhost:5000/egresos_mantenimiento/${id}`, { method: 'DELETE' });
      if (res.ok) {
        obtenerEgresos();
        Swal.fire('Eliminado', 'Egreso eliminado correctamente', 'success');
      } else {
        Swal.fire('Error', 'No se pudo eliminar el egreso', 'error');
      }
    }
  };

  const handleCancelar = () => {
    setFormData({
      proveedor: '',
      descripcion: '',
      id_inventario: '',
      id_transaccion: ''
    });
    setEditando(null);
  };

return (
  <div className="p-6 max-w-7xl mx-auto space-y-6">
    <h2 className="text-2xl font-bold text-blue-700">Gestión de Egresos de Mantenimiento</h2>

    {/* Formulario */}
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div>
        <label className="label-form">Proveedor</label>
        <input
          type="text"
          name="proveedor"
          value={formData.proveedor}
          onChange={handleChange}
          className="input-form"
          placeholder="Nombre del proveedor"
          required
        />
      </div>

      <div>
        <label className="label-form">Descripción</label>
        <input
          type="text"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          className="input-form"
          placeholder="Detalle del egreso"
        />
      </div>

      <div>
        <label className="label-form">Objeto Litúrgico</label>
        <select
          name="id_inventario"
          value={formData.id_inventario}
          onChange={handleChange}
          className="input-form"
          required
        >
          <option value="">Seleccione objeto</option>
          {inventario.map(i => (
            <option key={i.id_inventario} value={i.id_inventario}>
              {i.nombre_invent}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label-form">Transacción Asociada</label>
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

      <div className="lg:col-span-3 md:col-span-2 flex justify-end gap-3 mt-2">
        {editando && (
          <button type="button" onClick={handleCancelar} className="btn btn-secondary">Cancelar</button>
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
            <th className="table-th">Proveedor</th>
            <th className="table-th">Objeto</th>
            <th className="table-th">Transacción</th>
            <th className="table-th">Descripción</th>
            <th className="table-th">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {egresos.length > 0 ? egresos.map(e => (
            <tr key={e.id_egreso}>
              <td className="table-td">{e.proveedor}</td>
              <td className="table-td">{e.nombre_invent}</td>
              <td className="table-td">{e.descripcion_transaccion}</td>
              <td className="table-td">{e.descripcion}</td>
              <td className="table-td">
                <div className="flex justify-center gap-2">
                  <button className="btn-icon-edit" onClick={() => handleEditar(e)}>✏️</button>
                  <button className="btn-icon-delete" onClick={() => handleEliminar(e.id_egreso)}>🗑️</button>
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="5" className="py-4 text-gray-400">No hay egresos registrados</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
}

export default EgresosMantenimiento;
