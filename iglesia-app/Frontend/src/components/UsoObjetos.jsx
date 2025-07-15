import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function UsoObjetos() {
  const BASE_URL = 'http://localhost:5000';

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
    obtenerDatosIniciales();
  }, []);

  const obtenerDatosIniciales = async () => {
    try {
      const [usoRes, objRes, sacraRes, liturgRes] = await Promise.all([
        fetch(`${BASE_URL}/uso_objetos`),
        fetch(`${BASE_URL}/objetos_liturgicos`),
        fetch(`${BASE_URL}/eventos_sacramentales`),
        fetch(`${BASE_URL}/eventos_liturgicos`)
      ]);
      const [usoData, objData, sacraData, liturgData] = await Promise.all([
        usoRes.json(),
        objRes.json(),
        sacraRes.json(),
        liturgRes.json()
      ]);
      setUsos(usoData);
      setObjetos(objData);
      setEventosSacra(sacraData);
      setEventosLiturg(liturgData);
    } catch (error) {
      Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
    }
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const url = editando ? `${BASE_URL}/uso_objetos/${editando}` : `${BASE_URL}/uso_objetos`;
    const method = editando ? 'PUT' : 'POST';

    const payload = {
      id_inventario: formData.id_inventario,
      tipo_evento: formData.tipo_evento,
      id_evento_sacramental: formData.tipo_evento === 'sacramental' ? formData.id_evento_sacramental : null,
      id_evento_liturgico: formData.tipo_evento === 'liturgico' ? formData.id_evento_liturgico : null,
      estado_post_uso: formData.estado_post_uso,
      observacion: formData.observacion
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        await obtenerDatosIniciales();
        Swal.fire('Éxito', editando ? 'Uso actualizado' : 'Uso registrado', 'success');
        handleCancelar();
      } else {
        Swal.fire('Error', data.mensaje || 'No se pudo guardar el uso', 'error');
      }
    } catch {
      Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
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
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${BASE_URL}/uso_objetos/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok) {
          await obtenerDatosIniciales();
          Swal.fire('Eliminado', 'Uso eliminado correctamente', 'success');
        } else {
          Swal.fire('Error', data.mensaje || 'No se pudo eliminar el uso', 'error');
        }
      } catch {
        Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
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
    <div className="p-8 bg-white rounded-2xl shadow-2xl max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">Gestión de Uso de Objetos Litúrgicos</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 bg-blue-50 p-6 rounded-xl shadow mb-8">
        <div>
          <label className="text-sm font-semibold">Objeto</label>
          <select name="id_inventario" value={formData.id_inventario} onChange={handleChange} required className="w-full px-3 py-2 rounded-lg border">
            <option value="">Seleccione objeto</option>
            {objetos.map(o => (
              <option key={o.id_inventario} value={o.id_inventario}>{o.nombre_invent}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold">Tipo de evento</label>
          <select name="tipo_evento" value={formData.tipo_evento} onChange={handleChange} required className="w-full px-3 py-2 rounded-lg border">
            <option value="">Seleccione tipo</option>
            <option value="sacramental">Sacramental</option>
            <option value="liturgico">Litúrgico</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold">Estado post uso</label>
          <select name="estado_post_uso" value={formData.estado_post_uso} onChange={handleChange} required className="w-full px-3 py-2 rounded-lg border">
            <option value="">Seleccione estado</option>
            <option value="disponible">Disponible</option>
            <option value="dañado">Dañado</option>
            <option value="en_mantenimiento">En mantenimiento</option>
          </select>
        </div>

        {(formData.tipo_evento === 'sacramental' || formData.tipo_evento === 'liturgico') && (
          <div>
            <label className="text-sm font-semibold">Evento</label>
            <select
              name={formData.tipo_evento === 'sacramental' ? 'id_evento_sacramental' : 'id_evento_liturgico'}
              value={formData.tipo_evento === 'sacramental' ? formData.id_evento_sacramental : formData.id_evento_liturgico}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg border"
            >
              <option value="">Seleccione evento</option>
              {(formData.tipo_evento === 'sacramental' ? eventosSacra : eventosLiturg).map(e => (
                <option key={e.id_evento} value={e.id_evento}>
                  {e.nombre_event || e.nombre} - {new Date(e.fecha_event || e.fecha).toLocaleDateString('es-PE')}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="col-span-full">
          <label className="text-sm font-semibold">Observación</label>
          <textarea name="observacion" value={formData.observacion} onChange={handleChange} rows={3} className="w-full px-3 py-2 rounded-lg border resize-none" />
        </div>

        <div className="col-span-full flex gap-4">
          <button type="submit" className={`px-6 py-2 text-white rounded-lg ${editando ? 'bg-yellow-500' : 'bg-blue-600'}`}>
            {editando ? 'Actualizar' : 'Registrar'}
          </button>
          {editando && (
            <button type="button" onClick={handleCancelar} className="px-6 py-2 bg-gray-400 text-white rounded-lg">
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl shadow border">
        <table className="min-w-full text-sm text-center bg-white">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-2">Objeto</th>
              <th className="px-4 py-2">Tipo evento</th>
              <th className="px-4 py-2">Evento</th>
              <th className="px-4 py-2">Estado post uso</th>
              <th className="px-4 py-2">Observación</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usos.length > 0 ? usos.map(u => {
              let fechaFormateada = '';
              if (u.fecha_evento) {
                try {
                  fechaFormateada = new Date(u.fecha_evento).toLocaleDateString('es-PE');
                } catch {
                  fechaFormateada = u.fecha_evento;
                }
              }

              return (
                <tr key={u.id_uso} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{u.nombre_invent}</td>
                  <td className="px-4 py-2">{u.tipo_evento}</td>
                  <td className="px-4 py-2">{u.nombre_evento} - {fechaFormateada}</td>
                  <td className="px-4 py-2">{u.estado_post_uso.replace('_', ' ')}</td>
                  <td className="px-4 py-2">{u.observacion || '—'}</td>
                  <td className="px-4 py-2 flex justify-center gap-2">
                    <button onClick={() => handleEditar(u)} className="text-blue-600 border border-blue-600 px-3 py-1 rounded hover:bg-blue-50">Editar</button>
                    <button onClick={() => handleEliminar(u.id_uso)} className="text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-50">Eliminar</button>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="6" className="text-gray-500 py-4">No hay registros.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UsoObjetos;
