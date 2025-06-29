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
    const res = await fetch('/actas');
    setActas(await res.json());
  };

  const obtenerEventos = async () => {
    const res = await fetch('/eventos_sacramentales');
    setEventos(await res.json());
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

    const url = editando ? `/actas/${editando}` : '/actas';
    const method = editando ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      body: data
    });

    if (res.ok) {
      obtenerActas();
      Swal.fire('Éxito', editando ? 'Acta actualizada' : 'Acta registrada', 'success');
      handleCancelar();
    } else {
      const error = await res.json();
      Swal.fire('Error', error.mensaje || 'No se pudo guardar el acta', 'error');
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
    const res = await fetch(`/actas/archivo/${id}`);
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
  };

return (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-blue-600">Gestión de Actas</h2>

    {/* Formulario */}
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl shadow-lg p-6"
    >
      <div>
        <label className="block text-sm font-medium mb-1">Fecha de emisión</label>
        <input
          type="date"
          name="fecha_emision"
          value={formData.fecha_emision}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tipo de documento</label>
        <select
          name="tipo_documento"
          value={formData.tipo_documento}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Seleccione tipo</option>
          <option value="acta">Acta</option>
          <option value="certificado">Certificado</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Archivo (opcional)</label>
        <input
          type="file"
          name="archivo"
          onChange={handleChange}
          accept="application/pdf,image/*"
          className="w-full border rounded-lg px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Evento Sacramental</label>
        <select
          name="id_evento_sacramental"
          value={formData.id_evento_sacramental}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Seleccione evento</option>
          {eventos.map(e => (
            <option key={e.id_evento} value={e.id_evento}>
              {e.nombre_event} - {e.fecha_event}
            </option>
          ))}
        </select>
      </div>

      <div className="lg:col-span-4 flex justify-end items-center gap-3 mt-2">
        {editando && (
          <button
            type="button"
            onClick={handleCancelar}
            className="px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white text-sm"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className={`px-4 py-2 rounded text-white text-sm ${
            editando ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {editando ? 'Actualizar' : 'Registrar'}
        </button>
      </div>
    </form>

    {/* Tabla de actas */}
    <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl shadow overflow-x-auto">
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
        <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
          {actas.length > 0 ? (
            actas.map(a => (
              <tr key={a.id_acta}>
                <td className="px-4 py-2">{a.fecha_emision}</td>
                <td className="px-4 py-2">{a.tipo_documento}</td>
                <td className="px-4 py-2">{a.nombre_event} - {a.fecha_event}</td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => handleDescargar(a.id_acta)}
                    className="px-3 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded"
                  >
                    Descargar
                  </button>
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => handleEditar(a)}
                    className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center text-gray-400 dark:text-neutral-500 py-4">
                No hay actas registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
}
export default Actas;
