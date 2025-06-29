import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function UsoObjetos() {
  const [usos, setUsos] = useState([]);
  const [objetos, setObjetos] = useState([]);
  const [eventosSacra, setEventosSacra] = useState([]);
  const [eventosLiturg, setEventosLiturg] = useState([]);
  const [formData, setFormData] = useState({
    id_inventario: '',
    tipo_evento: '',
    id_evento_sacramental: '',
    id_evento_liturgico: '',
    estado_post_uso: '',
    observacion: ''
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    obtenerUsos();
    obtenerObjetos();
    obtenerEventosSacra();
    obtenerEventosLiturg();
  }, []);

  const obtenerUsos = async () => {
    const res = await fetch('/uso_objetos');
    setUsos(await res.json());
  };

  const obtenerObjetos = async () => {
    const res = await fetch('/objetos_liturgicos');
    setObjetos(await res.json());
  };

  const obtenerEventosSacra = async () => {
    const res = await fetch('/eventos_sacramentales');
    setEventosSacra(await res.json());
  };

  const obtenerEventosLiturg = async () => {
    const res = await fetch('/eventos_liturgicos');
    setEventosLiturg(await res.json());
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const url = editando ? `/uso_objetos/${editando}` : '/uso_objetos';
    const method = editando ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      obtenerUsos();
      Swal.fire('Éxito', editando ? 'Uso actualizado' : 'Uso registrado', 'success');
      handleCancelar();
    } else {
      const error = await res.json();
      Swal.fire('Error', error.mensaje || 'No se pudo guardar el uso', 'error');
    }
  };

  const handleEditar = u => {
    setFormData({
      id_inventario: u.id_inventario,
      tipo_evento: u.tipo_evento,
      id_evento_sacramental: u.id_evento_sacramental || '',
      id_evento_liturgico: u.id_evento_liturgico || '',
      estado_post_uso: u.estado_post_uso,
      observacion: u.observacion || ''
    });
    setEditando(u.id_uso);
  };

  const handleEliminar = async id => {
    const result = await Swal.fire({
      title: '¿Eliminar uso?',
      text: 'Esto eliminará el registro de uso',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      const res = await fetch(`/uso_objetos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        obtenerUsos();
        Swal.fire('Eliminado', 'Uso eliminado correctamente', 'success');
      } else {
        Swal.fire('Error', 'No se pudo eliminar el uso', 'error');
      }
    }
  };

  const handleCancelar = () => {
    setFormData({
      id_inventario: '',
      tipo_evento: '',
      id_evento_sacramental: '',
      id_evento_liturgico: '',
      estado_post_uso: '',
      observacion: ''
    });
    setEditando(null);
  };

return (
  <div className="p-6 bg-white shadow-xl rounded-2xl">
    <h2 className="text-xl font-semibold text-blue-700 mb-4">Gestión de Uso de Objetos Litúrgicos</h2>

    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl shadow mb-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Objeto</label>
        <select
          name="id_inventario"
          value={formData.id_inventario}
          onChange={handleChange}
          className="mt-1 w-full rounded-xl border-gray-300 text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Seleccione objeto</option>
          {objetos.map(o => (
            <option key={o.id_inventario} value={o.id_inventario}>{o.nombre_invent}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Tipo de evento</label>
        <select
          name="tipo_evento"
          value={formData.tipo_evento}
          onChange={handleChange}
          className="mt-1 w-full rounded-xl border-gray-300 text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Seleccione tipo</option>
          <option value="sacramental">Sacramental</option>
          <option value="liturgico">Litúrgico</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Estado post uso</label>
        <select
          name="estado_post_uso"
          value={formData.estado_post_uso}
          onChange={handleChange}
          className="mt-1 w-full rounded-xl border-gray-300 text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Seleccione estado</option>
          <option value="disponible">Disponible</option>
          <option value="dañado">Dañado</option>
          <option value="en_mantenimiento">En mantenimiento</option>
        </select>
      </div>

      {(formData.tipo_evento === 'sacramental' || formData.tipo_evento === 'liturgico') && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {formData.tipo_evento === 'sacramental' ? 'Evento Sacramental' : 'Evento Litúrgico'}
          </label>
          <select
            name={formData.tipo_evento === 'sacramental' ? 'id_evento_sacramental' : 'id_evento_liturgico'}
            value={
              formData.tipo_evento === 'sacramental'
                ? formData.id_evento_sacramental
                : formData.id_evento_liturgico
            }
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border-gray-300 text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Seleccione evento</option>
            {(formData.tipo_evento === 'sacramental' ? eventosSacra : eventosLiturg).map(e => (
              <option key={e.id_evento} value={e.id_evento}>
                {e.nombre_event || e.nombre} - {e.fecha_event || e.fecha}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="col-span-1 md:col-span-2 xl:col-span-4">
        <label className="block text-sm font-medium text-gray-700">Observación</label>
        <input
          type="text"
          name="observacion"
          value={formData.observacion}
          onChange={handleChange}
          className="mt-1 w-full rounded-xl border-gray-300 text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="Opcional"
        />
      </div>

      <div className="flex items-end gap-2 col-span-1 md:col-span-2 xl:col-span-4">
        <button
          type="submit"
          className={`px-4 py-2 h-10 rounded-xl text-white text-sm transition ${
            editando ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {editando ? 'Actualizar' : 'Registrar'}
        </button>
        {editando && (
          <button
            type="button"
            onClick={handleCancelar}
            className="px-4 py-2 h-10 rounded-xl bg-gray-400 hover:bg-gray-500 text-white text-sm"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>

    <div className="overflow-x-auto">
      <table className="min-w-full table-auto text-sm text-center border border-gray-200 shadow rounded-xl">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="px-4 py-2">Objeto</th>
            <th className="px-4 py-2">Tipo evento</th>
            <th className="px-4 py-2">Evento</th>
            <th className="px-4 py-2">Estado post uso</th>
            <th className="px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usos.length > 0 ? (
            usos.map(u => (
              <tr key={u.id_uso} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{u.nombre_invent}</td>
                <td className="px-4 py-2 capitalize">{u.tipo_evento}</td>
                <td className="px-4 py-2">{u.nombre_evento} - {u.fecha_evento}</td>
                <td className="px-4 py-2 capitalize">{u.estado_post_uso.replace('_', ' ')}</td>
                <td className="px-4 py-2">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleEditar(u)}
                      className="px-2 py-1 text-xs text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(u.id_uso)}
                      className="px-2 py-1 text-xs text-red-600 border border-red-600 rounded hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center text-gray-400 py-4">
                No hay registros.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

}

export default UsoObjetos;
