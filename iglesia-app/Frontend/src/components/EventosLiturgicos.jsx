import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function EventosLiturgicos() {
  const [eventos, setEventos] = useState([]);
  const [parroquias, setParroquias] = useState([]);
  const [formData, setFormData] = useState({
    tipo_evento: 'liturgico',
    nombre: '',
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    observacion: '',
    id_parroquia: ''
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    obtenerEventos();
    obtenerParroquias();
  }, []);

  const obtenerEventos = async () => {
    try {
      const res = await fetch('http://localhost:5000/eventos_liturgicos');
      const data = await res.json();
      setEventos(data);
    } catch (error) {
      console.error('Error al obtener eventos:', error);
    }
  };

  const obtenerParroquias = async () => {
    try {
      const res = await fetch('http://localhost:5000/parroquias');
      const data = await res.json();
      setParroquias(data);
    } catch (error) {
      console.error('Error al obtener parroquias:', error);
    }
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const url = editando
      ? `http://localhost:5000/eventos_liturgicos/${editando}`
      : 'http://localhost:5000/eventos_liturgicos';
    const method = editando ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.mensaje || 'Error al guardar');
      }

      await obtenerEventos();
      Swal.fire('Éxito', editando ? 'Evento actualizado' : 'Evento registrado', 'success');
      handleCancelar();
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  const handleEditar = e => {
    setFormData({
      tipo_evento: e.tipo_evento,
      nombre: e.nombre,
      fecha: e.fecha,
      hora_inicio: e.hora_inicio,
      hora_fin: e.hora_fin || '',
      observacion: e.observacion || '',
      id_parroquia: e.id_parroquia
    });
    setEditando(e.id_evento);
  };

  const handleEliminar = async id => {
    const result = await Swal.fire({
      title: '¿Eliminar evento?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`http://localhost:5000/eventos_liturgicos/${id}`, {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error('Error al eliminar');
        await obtenerEventos();
        Swal.fire('Eliminado', 'Evento eliminado correctamente', 'success');
      } catch (err) {
        Swal.fire('Error', err.message, 'error');
      }
    }
  };

  const handleCancelar = () => {
    setFormData({
      tipo_evento: 'liturgico',
      nombre: '',
      fecha: '',
      hora_inicio: '',
      hora_fin: '',
      observacion: '',
      id_parroquia: ''
    });
    setEditando(null);
  };

  return (
    <div className="p-6 rounded-xl shadow-md bg-white">
      <h2 className="text-xl font-semibold text-blue-600 mb-4">Gestión de Eventos Litúrgicos</h2>

      <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg shadow border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre del Evento</label>
            <input
              type="text"
              name="tipo_evento"
              value={formData.tipo_evento}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Fecha</label>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Parroquia</label>
            <select
              name="id_parroquia"
              value={formData.id_parroquia}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
              required
            >
              <option value="">Seleccione parroquia</option>
              {parroquias.map(p => (
                <option key={p.id_parroquia} value={p.id_parroquia}>
                  {p.nombre_prrq}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Hora de Inicio</label>
            <input
              type="datetime-local"
              name="hora_inicio"
              value={formData.hora_inicio}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Hora de Fin</label>
            <input
              type="datetime-local"
              name="hora_fin"
              value={formData.hora_fin}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Observación</label>
            <input
              type="text"
              name="observacion"
              value={formData.observacion}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className={`px-4 py-2 rounded-xl text-white text-sm w-full ${
                editando ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {editando ? 'Actualizar' : 'Registrar'}
            </button>
            {editando && (
              <button
                type="button"
                onClick={handleCancelar}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-xl w-full"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="overflow-x-auto shadow rounded-xl border">
        <table className="min-w-full text-sm text-center">
          <thead className="bg-blue-600 text-white uppercase">
            <tr>
              <th className="px-4 py-2">Nombre del Evento</th>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Inicio</th>
              <th className="px-4 py-2">Fin</th>
              <th className="px-4 py-2">Parroquia</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {eventos.length > 0 ? (
              eventos.map(e => (
                <tr key={e.id_evento} className="border-t">
                  <td className="px-3 py-2">{e.tipo_evento}</td>
                  <td className="px-3 py-2">{e.nombre}</td>
                  <td className="px-3 py-2">{e.fecha}</td>
                  <td className="px-3 py-2">{e.hora_inicio}</td>
                  <td className="px-3 py-2">{e.hora_fin || '-'}</td>
                  <td className="px-3 py-2">{e.nombre_parroquia}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-center gap-2">
                      <button
                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => handleEditar(e)}
                      >
                        Editar
                      </button>
                      <button
                        className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={() => handleEliminar(e.id_evento)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-4 py-3 text-gray-500">
                  No hay eventos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EventosLiturgicos;
