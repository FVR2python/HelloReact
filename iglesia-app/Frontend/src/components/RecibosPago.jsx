import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function RecibosPago() {
  const [recibos, setRecibos] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [transacciones, setTransacciones] = useState([]);
  const [formData, setFormData] = useState({
    monto: '',
    fecha_pago: '',
    archivo: null,
    id_inscripcion: '',
    id_transaccion: ''
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    obtenerRecibos();
    obtenerInscripciones();
    obtenerTransacciones();
  }, []);

  const obtenerRecibos = async () => {
    const res = await fetch('http://localhost:5000/recibos_pago');
    setRecibos(await res.json());
  };

  const obtenerInscripciones = async () => {
    const res = await fetch('http://localhost:5000/inscripciones_sacramentales');
    setInscripciones(await res.json());
  };

  const obtenerTransacciones = async () => {
    const res = await fetch('http://localhost:5000/transacciones');
    setTransacciones(await res.json());
  };

  const handleChange = e => {
    if (e.target.name === 'archivo') {
      setFormData({ ...formData, archivo: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const data = new FormData();
    data.append('monto', formData.monto);
    data.append('fecha_pago', formData.fecha_pago);
    data.append('id_inscripcion', formData.id_inscripcion);
    data.append('id_transaccion', formData.id_transaccion);
    if (formData.archivo) data.append('archivo', formData.archivo);

    const url = editando
      ? `http://localhost:5000/recibos_pago/${editando}`
      : 'http://localhost:5000/recibos_pago';
    const method = editando ? 'PUT' : 'POST';

    const res = await fetch(url, { method, body: data });

    if (res.ok) {
      obtenerRecibos();
      Swal.fire('Éxito', editando ? 'Recibo actualizado' : 'Recibo registrado', 'success');
      handleCancelar();
    } else {
      const error = await res.json();
      Swal.fire('Error', error.mensaje || 'No se pudo guardar el recibo', 'error');
    }
  };

  const handleEditar = r => {
    setFormData({
      monto: r.monto,
      fecha_pago: r.fecha_pago,
      archivo: null,
      id_inscripcion: r.id_inscripcion,
      id_transaccion: r.id_transaccion
    });
    setEditando(r.id_recibo);
  };

  const handleEliminar = async id => {
    const result = await Swal.fire({
      title: '¿Eliminar recibo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      const res = await fetch(`http://localhost:5000/recibos_pago/${id}`, { method: 'DELETE' });
      if (res.ok) {
        obtenerRecibos();
        Swal.fire('Eliminado', 'Recibo eliminado', 'success');
      } else {
        Swal.fire('Error', 'No se pudo eliminar el recibo', 'error');
      }
    }
  };

  const handleDescargar = async id => {
    const res = await fetch(`http://localhost:5000/recibos_pago/archivo/${id}`);
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recibo_${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      Swal.fire('Error', 'No se pudo descargar el archivo', 'error');
    }
  };

  const handleCancelar = () => {
    setFormData({
      monto: '',
      fecha_pago: '',
      archivo: null,
      id_inscripcion: '',
      id_transaccion: ''
    });
    setEditando(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-blue-700">Gestión de Recibos de Pago</h2>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="label-form">Monto</label>
          <input type="number" name="monto" step="0.01" value={formData.monto} onChange={handleChange} className="input-form" required />
        </div>

        <div>
          <label className="label-form">Fecha de Pago</label>
          <input type="date" name="fecha_pago" value={formData.fecha_pago} onChange={handleChange} className="input-form" required />
        </div>

        <div className="lg:col-span-1 md:col-span-2">
          <label className="label-form">Archivo (PDF o imagen)</label>
          <input type="file" name="archivo" accept="application/pdf,image/*" onChange={handleChange} className="input-form" />
        </div>

        <div>
          <label className="label-form">Inscripción</label>
          <select name="id_inscripcion" value={formData.id_inscripcion} onChange={handleChange} className="input-form" required>
            <option value="">Seleccione</option>
            {inscripciones.map(i => (
              <option key={i.id_inscripcion} value={i.id_inscripcion}>
                {i.nombres} {i.apellido1} - {i.nombre_sacrament}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-form">Transacción</label>
          <select name="id_transaccion" value={formData.id_transaccion} onChange={handleChange} className="input-form" required>
            <option value="">Seleccione</option>
            {transacciones.map(t => (
              <option key={t.id_transaccion} value={t.id_transaccion}>
                {t.descripcion} - S/ {t.monto}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-4 mt-2">
          {editando && (
            <button type="button" onClick={handleCancelar} className="btn btn-secondary">Cancelar</button>
          )}
          <button type="submit" className={`btn ${editando ? 'btn-warning' : 'btn-primary'}`}>
            {editando ? 'Actualizar' : 'Registrar'}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="min-w-full text-sm text-center">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="table-th">Fecha</th>
              <th className="table-th">Monto</th>
              <th className="table-th">Inscripción</th>
              <th className="table-th">Transacción</th>
              <th className="table-th">Archivo</th>
              <th className="table-th">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {recibos.length > 0 ? recibos.map(r => (
              <tr key={r.id_recibo}>
                <td className="table-td">{r.fecha_pago}</td>
                <td className="table-td">S/ {parseFloat(r.monto).toFixed(2)}</td>
                <td className="table-td">{r.nombres} {r.apellido1} - {r.nombre_sacrament}</td>
                <td className="table-td">{r.descripcion_transaccion}</td>
                <td className="table-td">
                  <button onClick={() => handleDescargar(r.id_recibo)} className="btn-icon-edit">📄 Descargar</button>
                </td>
                <td className="table-td">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => handleEditar(r)} className="btn-icon-edit">✏️</button>
                    <button onClick={() => handleEliminar(r.id_recibo)} className="btn-icon-delete">🗑️</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="py-4 text-gray-400">No hay recibos registrados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecibosPago;
