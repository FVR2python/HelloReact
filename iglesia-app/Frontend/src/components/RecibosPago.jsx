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
    const res = await fetch('http://localhost:5000/inscripciones');
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

  const formatearFecha = fechaISO => {
    if (!fechaISO) return '';
    return new Date(fechaISO).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
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
  <div className="space-y-6 p-4">
    {/* Título */}
    <h2 className="text-2xl font-bold text-blue-700">Gestión de Recibos de Pago</h2>

    {/* Formulario */}
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white p-6 rounded-2xl shadow border">
      <input
        type="number"
        name="monto"
        step="0.01"
        value={formData.monto}
        onChange={handleChange}
        placeholder="Monto *"
        className="input-form"
        required
      />

      <input
        type="date"
        name="fecha_pago"
        value={formData.fecha_pago}
        onChange={handleChange}
        placeholder="Fecha de Pago *"
        className="input-form"
        required
      />

      <input
        type="file"
        name="archivo"
        accept="application/pdf,image/*"
        onChange={handleChange}
        className="input-form lg:col-span-1 md:col-span-2"
      />

      <select
        name="id_inscripcion"
        value={formData.id_inscripcion}
        onChange={handleChange}
        className="input-form"
        required
      >
        <option value="">Seleccione Inscripción</option>
        {inscripciones.map(i => (
          <option key={i.id_inscripcion} value={i.id_inscripcion}>
            {i.nombres} {i.apellido1} - {i.nombre_sacramento}
          </option>
        ))}
      </select>

      <select
        name="id_transaccion"
        value={formData.id_transaccion}
        onChange={handleChange}
        className="input-form"
        required
      >
        <option value="">Seleccione Transacción</option>
        {transacciones.map(t => (
          <option key={t.id_transaccion} value={t.id_transaccion}>
            {t.descripcion} - S/ {t.monto}
          </option>
        ))}
      </select>

      <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-4 mt-2">
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
            <th className="py-3 px-2">Monto</th>
            <th className="py-3 px-2">Inscripción</th>
            <th className="py-3 px-2">Transacción</th>
            <th className="py-3 px-2">Archivo</th>
            <th className="py-3 px-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {recibos.length > 0 ? (
            recibos.map(r => (
              <tr key={r.id_recibo} className="hover:bg-gray-100">
                <td className="py-2 px-2">{formatearFecha(r.fecha_pago)}</td>
                <td className="py-2 px-2">S/ {parseFloat(r.monto).toFixed(2)}</td>
                <td className="py-2 px-2">{r.nombres} {r.apellido1} - {r.nombre_sacramento}</td>
                <td className="py-2 px-2">{r.descripcion_transaccion}</td>
                <td className="py-2 px-2">
                  <button
                    onClick={() => handleDescargar(r.id_recibo)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    <i className="bi bi-download"></i> Descargar
                  </button>
                </td>
                <td className="py-2 px-2 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleEditar(r)}
                    className="text-blue-600 hover:text-blue-800 text-lg"
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  <button
                    onClick={() => handleEliminar(r.id_recibo)}
                    className="text-red-600 hover:text-red-800 text-lg"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-4 text-gray-500">
                No hay recibos registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
  
}

export default RecibosPago;