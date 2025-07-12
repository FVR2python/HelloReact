import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function Actas() {
  const [actas, setActas] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [formData, setFormData] = useState({
    fecha_emision: '',
    tipo_documento: '',
    archivo: null,
    id_evento_sacramental: ''
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    obtenerActas();
    obtenerEventos();
  }, []);

  const obtenerActas = async () => {
    try {
      const res = await fetch('http://localhost:5000/actas');
      const data = await res.json();
      setActas(data);
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar las actas', 'error');
    }
  };

  const obtenerEventos = async () => {
    try {
      const res = await fetch('http://localhost:5000/eventos_sacramentales');
      const data = await res.json();
      setEventos(data);
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar los eventos', 'error');
    }
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
    data.append('fecha_emision', formData.fecha_emision);
    data.append('tipo_documento', formData.tipo_documento);
    data.append('id_evento_sacramental', formData.id_evento_sacramental);
    if (formData.archivo) data.append('archivo', formData.archivo);

    const url = editando
      ? `http://localhost:5000/actas/${editando}`
      : 'http://localhost:5000/actas';
    const method = editando ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, { method, body: data });
      if (res.ok) {
        obtenerActas();
        Swal.fire('Éxito', editando ? 'Acta actualizada' : 'Acta registrada', 'success');
        handleCancelar();
      } else {
        const error = await res.json();
        Swal.fire('Error', error.mensaje || 'No se pudo guardar el acta', 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Fallo la conexión con el servidor', 'error');
    }
  };

  const handleEditar = a => {
    setFormData({
      fecha_emision: a.fecha_emision,
      tipo_documento: a.tipo_documento,
      archivo: null,
      id_evento_sacramental: a.id_evento_sacramental
    });
    setEditando(a.id_acta);
  };

  const handleEliminar = id => {
    Swal.fire({
      title: '¿Eliminar acta?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async result => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`http://localhost:5000/actas/${id}`, {
            method: 'DELETE'
          });
          if (res.ok) {
            obtenerActas();
            Swal.fire('Eliminado', 'El acta fue eliminada.', 'success');
            if (editando === id) handleCancelar();
          } else {
            Swal.fire('Error', 'No se pudo eliminar el acta.', 'error');
          }
        } catch {
          Swal.fire('Error', 'Fallo la conexión al eliminar.', 'error');
        }
      }
    });
  };

  const handleCancelar = () => {
    setFormData({
      fecha_emision: '',
      tipo_documento: '',
      archivo: null,
      id_evento_sacramental: ''
    });
    setEditando(null);
  };

  const handleDescargar = async id => {
    try {
      const res = await fetch(`http://localhost:5000/actas/archivo/${id}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `acta_${id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        Swal.fire('Error', 'No se pudo descargar el archivo', 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Fallo la descarga del archivo', 'error');
    }
  };

  return (
    <div className="p-6 space-y-6 fadeIn">
      <h2 className="text-2xl font-bold text-blue-600">Gestión de Actas</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow p-6 border border-blue-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div>
          <label className="text-sm font-semibold">Fecha de emisión</label>
          <input
            type="date"
            name="fecha_emision"
            value={formData.fecha_emision}
            onChange={handleChange}
            className="input-form"
            required
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Tipo de documento</label>
          <select
            name="tipo_documento"
            value={formData.tipo_documento}
            onChange={handleChange}
            className="input-form"
            required
          >
            <option value="">Seleccione tipo</option>
            <option value="acta">Acta</option>
            <option value="certificado">Certificado</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold">Archivo (opcional)</label>
          <input
            type="file"
            name="archivo"
            onChange={handleChange}
            accept="application/pdf,image/*"
            className="input-form file:mr-3 file:py-1 file:px-3 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Evento Sacramental</label>
          <select
            name="id_evento_sacramental"
            value={formData.id_evento_sacramental}
            onChange={handleChange}
            className="input-form"
            required
          >
            <option value="">Seleccione evento</option>
            {eventos.map(e => (
              <option key={e.id_evento} value={e.id_evento}>
                {e.nombre_event} - {new Date(e.fecha_event).toLocaleDateString('es-PE')}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-4 flex justify-end items-center gap-3 mt-2">
          {editando && (
            <button
              type="button"
              onClick={handleCancelar}
              className="btn bg-gray-500 hover:bg-gray-600 text-white"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className={`btn ${
              editando ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-600 hover:bg-green-700'
            } text-white`}
          >
            {editando ? 'Actualizar' : 'Registrar'}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-2xl shadow border border-blue-100 overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Tipo</th>
              <th className="px-4 py-2">Evento</th>
              <th className="px-4 py-2 text-center">Archivo</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {actas.length > 0 ? (
              actas.map(a => (
                <tr key={a.id_acta}>
                  <td className="px-4 py-2">{new Date(a.fecha_emision).toLocaleDateString('es-PE')}</td>
                  <td className="px-4 py-2 capitalize">{a.tipo_documento}</td>
                  <td className="px-4 py-2">{a.nombre_event} - {new Date(a.fecha_event).toLocaleDateString('es-PE')}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleDescargar(a.id_acta)}
                      className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded text-xs"
                    >
                      Descargar
                    </button>
                  </td>
                  <td className="px-4 py-2 text-center space-x-1">
                    <button
                      onClick={() => handleEditar(a)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-xs"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(a.id_acta)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-xs"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-gray-400 py-4">No hay actas registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Actas;
