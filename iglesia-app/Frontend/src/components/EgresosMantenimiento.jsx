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
  <div className="space-y-6 p-4">
    <h2 className="text-2xl font-bold text-blue-700">Gestión de Egresos de Mantenimiento</h2>

    {/* Formulario */}
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white p-6 rounded-2xl shadow border">
      <input
        type="text"
        name="proveedor"
        value={formData.proveedor}
        onChange={handleChange}
        placeholder="Nombre del proveedor *"
        className="input-form"
        required
      />

      <input
        type="text"
        name="descripcion"
        value={formData.descripcion}
        onChange={handleChange}
        placeholder="Detalle del egreso"
        className="input-form"
      />

      <select
        name="id_inventario"
        value={formData.id_inventario}
        onChange={handleChange}
        className="input-form"
        required
      >
        <option value="">Seleccione objeto litúrgico</option>
        {inventario.map(i => (
          <option key={i.id_inventario} value={i.id_inventario}>{i.nombre_invent}</option>
        ))}
      </select>

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

      <div className="lg:col-span-3 md:col-span-2 flex justify-end gap-3 mt-2">
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
            <th className="py-3 px-2">Proveedor</th>
            <th className="py-3 px-2">Objeto</th>
            <th className="py-3 px-2">Transacción</th>
            <th className="py-3 px-2">Descripción</th>
            <th className="py-3 px-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {egresos.length > 0 ? (
            egresos.map(e => (
              <tr key={e.id_egreso} className="hover:bg-gray-100">
                <td className="py-2 px-2">{e.proveedor}</td>
                <td className="py-2 px-2">{e.nombre_invent}</td>
                <td className="py-2 px-2">{e.descripcion_transaccion}</td>
                <td className="py-2 px-2">{e.descripcion}</td>
                <td className="py-2 px-2 flex items-center justify-center gap-2">
                  <button onClick={() => handleEditar(e)} className="text-blue-600 hover:text-blue-800 text-lg">
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  <button onClick={() => handleEliminar(e.id_egreso)} className="text-red-600 hover:text-red-800 text-lg">
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-4 text-gray-500">
                No hay egresos registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
}

export default EgresosMantenimiento;
