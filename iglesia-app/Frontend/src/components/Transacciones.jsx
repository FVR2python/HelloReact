import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function Transacciones() {
  const BASE_URL = 'http://localhost:5000';

  const [transacciones, setTransacciones] = useState([]);
  const [parroquias, setParroquias] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [eventosSacra, setEventosSacra] = useState([]);
  const [eventosLiturg, setEventosLiturg] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [formData, setFormData] = useState({
    monto: '',
    fecha_transaccion: '',
    num_comprobante: '',
    descripcion: '',
    id_parroquia: '',
    id_tipo_transaccion: '',
    id_evento: '',
    tipo_evento: '',
    id_persona: ''
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    obtenerTransacciones();
    obtenerParroquias();
    obtenerTipos();
    obtenerEventosSacra();
    obtenerEventosLiturg();
    obtenerPersonas();
  }, []);

  const obtenerTransacciones = async () => {
    const res = await fetch(`${BASE_URL}/transacciones`);
    setTransacciones(await res.json());
  };

  const obtenerParroquias = async () => {
    const res = await fetch(`${BASE_URL}/parroquias`);
    setParroquias(await res.json());
  };

  const obtenerTipos = async () => {
    const res = await fetch(`${BASE_URL}/tipos_transacciones`);
    setTipos(await res.json());
  };

  const obtenerEventosSacra = async () => {
    const res = await fetch(`${BASE_URL}/eventos_sacramentales`);
    setEventosSacra(await res.json());
  };

  const obtenerEventosLiturg = async () => {
    const res = await fetch(`${BASE_URL}/eventos_liturgicos`);
    setEventosLiturg(await res.json());
  };

  const obtenerPersonas = async () => {
    const res = await fetch(`${BASE_URL}/personas`);
    setPersonas(await res.json());
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const url = editando ? `${BASE_URL}/transacciones/${editando}` : `${BASE_URL}/transacciones`;
    const method = editando ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      obtenerTransacciones();
      Swal.fire('Éxito', editando ? 'Transacción actualizada' : 'Transacción registrada', 'success');
      handleCancelar();
    } else {
      const error = await res.json();
      Swal.fire('Error', error.mensaje || 'No se pudo guardar la transacción', 'error');
    }
  };

  const handleEditar = t => {
    setFormData({
      monto: t.monto,
      fecha_transaccion: t.fecha_transaccion,
      num_comprobante: t.num_comprobante,
      descripcion: t.descripcion,
      id_parroquia: t.id_parroquia,
      id_tipo_transaccion: t.id_tipo_transaccion,
      id_persona: t.id_persona || '',
      id_evento: t.id_evento || '',
      tipo_evento: t.tipo_evento || ''
    });
    setEditando(t.id_transaccion);
  };

  const handleEliminar = async id => {
    const result = await Swal.fire({
      title: '¿Eliminar transacción?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      const res = await fetch(`${BASE_URL}/transacciones/${id}`, { method: 'DELETE' });
      if (res.ok) {
        obtenerTransacciones();
        Swal.fire('Eliminado', 'Transacción eliminada correctamente', 'success');
      } else {
        Swal.fire('Error', 'No se pudo eliminar la transacción', 'error');
      }
    }
  };

  const handleCancelar = () => {
    setFormData({
      monto: '',
      fecha_transaccion: '',
      num_comprobante: '',
      descripcion: '',
      id_parroquia: '',
      id_tipo_transaccion: '',
      id_persona: '',
      id_evento: '',
      tipo_evento: ''
    });
    setEditando(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-blue-700">Gestión de Transacciones</h2>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-lg grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          ['Monto', 'monto', 'number'],
          ['Fecha de Transacción', 'fecha_transaccion', 'date'],
          ['Número de Comprobante', 'num_comprobante'],
          ['Descripción', 'descripcion']
        ].map(([label, name, type = 'text']) => (
          <div key={name}>
            <label className="label-form">{label}</label>
            <input type={type} name={name} value={formData[name]} onChange={handleChange} className="input-form" required />
          </div>
        ))}

        <div>
          <label className="label-form">Parroquia</label>
          <select name="id_parroquia" value={formData.id_parroquia} onChange={handleChange} className="input-form" required>
            <option value="">Seleccione</option>
            {parroquias.map(p => (
              <option key={p.id_parroquia} value={p.id_parroquia}>{p.nombre_prrq}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-form">Tipo de Transacción</label>
          <select name="id_tipo_transaccion" value={formData.id_tipo_transaccion} onChange={handleChange} className="input-form" required>
            <option value="">Seleccione</option>
            {tipos.map(t => (
              <option key={t.id_tipo_transaccion} value={t.id_tipo_transaccion}>{t.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-form">Persona</label>
          <select name="id_persona" value={formData.id_persona} onChange={handleChange} className="input-form">
            <option value="">Ninguno</option>
            {personas.map(p => (
              <option key={p.id_persona} value={p.id_persona}>{p.nombres} {p.apellido1}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-form">Tipo de Evento</label>
          <select name="tipo_evento" value={formData.tipo_evento} onChange={handleChange} className="input-form">
            <option value="">Seleccione</option>
            <option value="sacramental">Sacramental</option>
            <option value="liturgico">Litúrgico</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <label className="label-form">Evento</label>
          <select name="id_evento" value={formData.id_evento} onChange={handleChange} className="input-form">
            <option value="">Seleccione evento</option>
            {(formData.tipo_evento === 'sacramental' ? eventosSacra : eventosLiturg).map(e => (
              <option key={e.id_evento} value={e.id_evento}>
                {formData.tipo_evento === 'sacramental'
                  ? `${e.nombre_event} - ${new Date(e.fecha_event).toLocaleDateString('es-PE')}`
                  : `${e.nombre} - ${new Date(e.fecha).toLocaleDateString('es-PE')}`}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3 flex justify-end gap-3 mt-2">
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
              <th className="table-th">Comprobante</th>
              <th className="table-th">Descripción</th>
              <th className="table-th">Tipo</th>
              <th className="table-th">Parroquia</th>
              <th className="table-th">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transacciones.length > 0 ? transacciones.map(t => (
              <tr key={t.id_transaccion}>
                <td className="table-td">{new Date(t.fecha_transaccion).toLocaleDateString('es-PE')}</td>
                <td className="table-td">S/ {parseFloat(t.monto).toFixed(2)}</td>
                <td className="table-td">{t.num_comprobante}</td>
                <td className="table-td">{t.descripcion}</td>
                <td className="table-td">{t.nombre_tipo}</td>
                <td className="table-td">{t.nombre_parroquia}</td>
                <td className="table-td">
                  <div className="flex justify-center gap-2">
                    <button className="btn-icon-edit" onClick={() => handleEditar(t)}>✏️</button>
                    <button className="btn-icon-delete" onClick={() => handleEliminar(t.id_transaccion)}>🗑️</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" className="py-4 text-gray-400">No hay transacciones registradas</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Transacciones;
