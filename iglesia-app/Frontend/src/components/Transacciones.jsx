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
  <div className="space-y-6 p-4">
    {/* Formulario de transacción */}
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-2xl shadow border">
      <h2 className="md:col-span-3 text-lg font-bold text-blue-700">
        {editando ? '✏️ Editar Transacción' : '➕ Registrar nueva Transacción'}
      </h2>

      <input type="number" name="monto" value={formData.monto} onChange={handleChange} placeholder="Monto *" className="input-form" required />
      <input type="date" name="fecha_transaccion" value={formData.fecha_transaccion} onChange={handleChange} placeholder="Fecha de Transacción *" className="input-form" required />
      <input name="num_comprobante" value={formData.num_comprobante} onChange={handleChange} placeholder="Número de Comprobante" className="input-form" />

      <input name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Descripción" className="input-form md:col-span-3" />

      <select name="id_parroquia" value={formData.id_parroquia} onChange={handleChange} className="input-form" required>
        <option value="">Seleccione Parroquia</option>
        {parroquias.map(p => (
          <option key={p.id_parroquia} value={p.id_parroquia}>{p.nombre_prrq}</option>
        ))}
      </select>

      <select name="id_tipo_transaccion" value={formData.id_tipo_transaccion} onChange={handleChange} className="input-form" required>
        <option value="">Seleccione Tipo de Transacción</option>
        {tipos.map(t => (
          <option key={t.id_tipo_transaccion} value={t.id_tipo_transaccion}>{t.nombre}</option>
        ))}
      </select>

      <select name="id_persona" value={formData.id_persona} onChange={handleChange} className="input-form">
        <option value="">Persona (opcional)</option>
        {personas.map(p => (
          <option key={p.id_persona} value={p.id_persona}>{p.nombres} {p.apellido1}</option>
        ))}
      </select>

      <select name="tipo_evento" value={formData.tipo_evento} onChange={handleChange} className="input-form">
        <option value="">Tipo de Evento</option>
        <option value="sacramental">Sacramental</option>
        <option value="liturgico">Litúrgico</option>
      </select>

      <select name="id_evento" value={formData.id_evento} onChange={handleChange} className="input-form md:col-span-2">
        <option value="">Seleccione Evento</option>
        {(formData.tipo_evento === 'sacramental' ? eventosSacra : eventosLiturg).map(e => (
          <option key={e.id_evento} value={e.id_evento}>
            {formData.tipo_evento === 'sacramental'
              ? `${e.nombre_event} - ${new Date(e.fecha_event).toLocaleDateString('es-PE')}`
              : `${e.nombre} - ${new Date(e.fecha).toLocaleDateString('es-PE')}`}
          </option>
        ))}
      </select>

      <div className="md:col-span-3 flex justify-end gap-3 mt-2">
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

    {/* Tabla de transacciones */}
    <div className="overflow-x-auto rounded-2xl border shadow bg-white">
      <table className="min-w-full text-sm text-center">
        <thead className="bg-blue-600 text-white uppercase text-xs">
          <tr>
            <th className="py-3 px-2">Fecha</th>
            <th className="py-3 px-2">Monto</th>
            <th className="py-3 px-2">Comprobante</th>
            <th className="py-3 px-2">Descripción</th>
            <th className="py-3 px-2">Tipo</th>
            <th className="py-3 px-2">Parroquia</th>
            <th className="py-3 px-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {transacciones.length > 0 ? (
            transacciones.map(t => (
              <tr key={t.id_transaccion} className="hover:bg-gray-100">
                <td className="table-td">{new Date(t.fecha_transaccion).toLocaleDateString('es-PE')}</td>
                <td className="table-td">S/ {parseFloat(t.monto).toFixed(2)}</td>
                <td className="table-td">{t.num_comprobante}</td>
                <td className="table-td">{t.descripcion}</td>
                <td className="table-td">{t.nombre_tipo}</td>
                <td className="table-td">{t.nombre_parroquia}</td>
                <td className="table-td flex items-center justify-center gap-2">
                  <button onClick={() => handleEditar(t)} className="text-blue-600 hover:text-blue-800 text-lg">
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  <button onClick={() => handleEliminar(t.id_transaccion)} className="text-red-600 hover:text-red-800 text-lg">
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center py-4 text-gray-500">
                No hay transacciones registradas
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
}

export default Transacciones;
