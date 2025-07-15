import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function EventosSacramentales() {
  const [eventos, setEventos] = useState([]);
  const [parroquias, setParroquias] = useState([]);
  const [sacramentos, setSacramentos] = useState([]);
  const [clerigos, setClerigos] = useState([]);
  const [formData, setFormData] = useState({
    nombre_event: '',
    fecha_event: '',
    hora_inicio: '',
    hora_fin: '',
    observacion: '',
    id_parroquia: '',
    id_sacramento: '',
    id_clerigo: ''
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    obtenerEventos();
    obtenerParroquias();
    obtenerSacramentos();
    obtenerClerigos();
  }, []);

  const obtenerEventos = async () => {
    const res = await fetch('http://localhost:5000/eventos_sacramentales');
    const data = await res.json();
    if (Array.isArray(data)) {
      setEventos(data);
    } else {
      setEventos([]);
      Swal.fire('Error', data.mensaje || 'No se pudo cargar los eventos.', 'error');
    }
  };

  const obtenerParroquias = async () => {
    const res = await fetch('http://localhost:5000/parroquias');
    setParroquias(await res.json());
  };

  const obtenerSacramentos = async () => {
    const res = await fetch('http://localhost:5000/sacramentos');
    setSacramentos(await res.json());
  };

  const obtenerClerigos = async () => {
    const res = await fetch('http://localhost:5000/clerigos');
    setClerigos(await res.json());
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const url = editando
      ? `http://localhost:5000/eventos_sacramentales/${editando}`
      : 'http://localhost:5000/eventos_sacramentales';
    const method = editando ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      obtenerEventos();
      setFormData({
        nombre_event: '',
        fecha_event: '',
        hora_inicio: '',
        hora_fin: '',
        observacion: '',
        id_parroquia: '',
        id_sacramento: '',
        id_clerigo: ''
      });
      setEditando(null);
      Swal.fire('Éxito', editando ? 'Evento actualizado' : 'Evento registrado', 'success');
    } else {
      const error = await res.json();
      Swal.fire('Error', error.mensaje || 'No se pudo guardar el evento.', 'error');
    }
  };

const handleEditar = (e) => {
  const fechaFormateada = e.fecha_event
    ? new Date(e.fecha_event).toISOString().split('T')[0]
    : '';

  setFormData({
    nombre_event: e.nombre_event,
    fecha_event: fechaFormateada, // <- aquí el cambio
    hora_inicio: e.hora_inicio,
    hora_fin: e.hora_fin,
    observacion: e.observacion,
    id_parroquia: e.id_parroquia,
    id_sacramento: e.id_sacramento,
    id_clerigo: e.id_clerigo
  });
  setEditando(e.id_evento);
};


  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar evento?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      const res = await fetch(`http://localhost:5000/eventos_sacramentales/${id}`, { method: 'DELETE' });
      if (res.ok) {
        obtenerEventos();
        Swal.fire('Eliminado', 'Evento eliminado correctamente', 'success');
      } else {
        Swal.fire('Error', 'No se pudo eliminar el evento.', 'error');
      }
    }
  };

  const handleCancelar = () => {
    setFormData({
      nombre_event: '',
      fecha_event: '',
      hora_inicio: '',
      hora_fin: '',
      observacion: '',
      id_parroquia: '',
      id_sacramento: '',
      id_clerigo: ''
    });
    setEditando(null);
  };

  const formatearFecha = (valor) => {
    return valor
      ? new Date(valor).toLocaleDateString('es-PE', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      : '-';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-blue-600">Gestión de Eventos Sacramentales</h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl shadow-lg p-6"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Nombre del Evento</label>
          <input type="text" name="nombre_event" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.nombre_event} onChange={handleChange} required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Fecha</label>
          <input type="date" name="fecha_event" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.fecha_event} onChange={handleChange} required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Observación</label>
          <input type="text" name="observacion" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.observacion} onChange={handleChange} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Hora Inicio</label>
          <input
            type="time"
            name="hora_inicio"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.hora_inicio}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Hora Fin</label>
          <input
            type="time"
            name="hora_fin"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.hora_fin}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Parroquia</label>
          <select name="id_parroquia" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.id_parroquia} onChange={handleChange} required>
            <option value="">Seleccione</option>
            {parroquias.map(p => (
              <option key={p.id_parroquia} value={p.id_parroquia}>{p.nombre_prrq}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sacramento</label>
          <select name="id_sacramento" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.id_sacramento} onChange={handleChange} required>
            <option value="">Seleccione</option>
            {sacramentos.map(s => (
              <option key={s.id_sacramento} value={s.id_sacramento}>{s.nombre_sacrament}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Clérigo</label>
          <select name="id_clerigo" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.id_clerigo} onChange={handleChange} required>
            <option value="">Seleccione</option>
            {clerigos.map(c => (
              <option key={c.id_clerigo} value={c.id_clerigo}>{c.nombres} {c.apellido1}</option>
            ))}
          </select>
        </div>

        <div className="col-span-full flex justify-end gap-3 mt-2">
          {editando && (
            <button type="button" onClick={handleCancelar}
              className="px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white">
              Cancelar
            </button>
          )}
          <button type="submit"
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white">
            {editando ? 'Actualizar' : 'Registrar'}
          </button>
        </div>
      </form>

      {/* Tabla */}
      <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl shadow overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Inicio</th>
              <th className="px-4 py-2">Fin</th>
              <th className="px-4 py-2">Parroquia</th>
              <th className="px-4 py-2">Sacramento</th>
              <th className="px-4 py-2">Clérigo</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
            {eventos.map(e => {
              const fecha = formatearFecha(e.fecha_event);
              const horaInicio = e.hora_inicio ? e.hora_inicio.slice(0, 5) : '';
              const horaFin = e.hora_fin ? e.hora_fin.slice(0, 5) : '';

              return (
                <tr key={e.id_evento}>
                  <td className="px-4 py-2">{e.nombre_event}</td>
                  <td className="px-4 py-2">{fecha}</td>
                  <td className="px-4 py-2">{horaInicio}</td>
                  <td className="px-4 py-2">{horaFin}</td>
                  <td className="px-4 py-2">{e.nombre_parroquia}</td>
                  <td className="px-4 py-2">{e.nombre_sacramento}</td>
                  <td className="px-4 py-2">{e.nombre_clerigo}</td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEditar(e)}
                        className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded">
                        Editar
                      </button>
                      <button onClick={() => handleEliminar(e.id_evento)}
                        className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded">
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {eventos.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center text-gray-400 dark:text-neutral-500 py-4">
                  No hay eventos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EventosSacramentales;
