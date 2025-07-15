import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function ObjetosLiturgicos() {
  const [objetos, setObjetos] = useState([]);
  const [parroquias, setParroquias] = useState([]);
  const [formData, setFormData] = useState({
    nombre_invent: '', categoria_invent: '', fecha_adquisicion: '',
    estado: '', fecha_ultima_revision: '', observacion: '', id_parroquia: ''
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    obtenerObjetos();
    obtenerParroquias();
  }, []);

  const obtenerObjetos = async () => {
    try {
      const res = await fetch('http://localhost:5000/objetos_liturgicos');
      const data = await res.json();
      setObjetos(Array.isArray(data) ? data : []);
    } catch {
      Swal.fire('Error', 'No se pudieron cargar los objetos', 'error');
    }
  };

  const obtenerParroquias = async () => {
    try {
      const res = await fetch('http://localhost:5000/parroquias');
      const data = await res.json();
      setParroquias(Array.isArray(data) ? data : []);
    } catch {
      Swal.fire('Error', 'No se pudieron cargar las parroquias', 'error');
    }
  };

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const url = editando ? `http://localhost:5000/objetos_liturgicos/${editando}` : 'http://localhost:5000/objetos_liturgicos';
    const method = editando ? 'PUT' : 'POST';
    const payload = { ...formData, id_parroquia: parseInt(formData.id_parroquia) };

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      obtenerObjetos();
      Swal.fire('Éxito', editando ? 'Objeto actualizado' : 'Objeto registrado', 'success');
      handleCancelar();
    } else {
      const error = await res.json();
      Swal.fire('Error', error.mensaje || 'No se pudo guardar el objeto', 'error');
    }
  };

const convertirFechaInput = (fecha) => {
  if (!fecha) return '';
  const d = new Date(fecha);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10); // YYYY-MM-DD
};


const handleEditar = o => {
  setFormData({
    nombre_invent: o.nombre_invent || '',
    categoria_invent: o.categoria_invent || '',
    fecha_adquisicion: convertirFechaInput(o.fecha_adquisicion),
    estado: o.estado || '',
    fecha_ultima_revision: convertirFechaInput(o.fecha_ultima_revision),
    observacion: o.observacion || '',
    id_parroquia: o.id_parroquia?.toString() || ''
  });
  setEditando(o.id_inventario);
};

  const handleEliminar = async id => {
    const result = await Swal.fire({
      title: '¿Eliminar objeto?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      const res = await fetch(`http://localhost:5000/objetos_liturgicos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        obtenerObjetos();
        Swal.fire('Eliminado', 'Objeto eliminado correctamente', 'success');
      } else {
        Swal.fire('Error', 'No se pudo eliminar el objeto', 'error');
      }
    }
  };

  const handleCancelar = () => {
    setFormData({
      nombre_invent: '', categoria_invent: '', fecha_adquisicion: '',
      estado: '', fecha_ultima_revision: '', observacion: '', id_parroquia: ''
    });
    setEditando(null);
  };

  const formatearFecha = (fechaISO) => {
  if (!fechaISO) return '—';
  const opciones = { weekday: 'short', year: 'numeric', month: 'long', day: '2-digit' };
  return new Date(fechaISO).toLocaleDateString('es-ES', opciones);
};


  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-blue-700 mb-4">Gestión de Objetos Litúrgicos</h2>

      <div className="bg-white rounded-2xl shadow p-4 mb-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Nombre del objeto', name: 'nombre_invent', type: 'text' },
            { label: 'Fecha adquisición', name: 'fecha_adquisicion', type: 'date' },
            { label: 'Fecha última revisión', name: 'fecha_ultima_revision', type: 'date' }
          ].map(({ label, name, type }) => (
            <div key={name}>
              <label className="text-sm font-medium text-gray-700">{label}</label>
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className="w-full rounded-xl border-gray-300 shadow-sm text-sm"
                required
              />
            </div>
          ))}

          <div>
            <label className="text-sm font-medium text-gray-700">Categoría</label>
            <select
              name="categoria_invent"
              value={formData.categoria_invent}
              onChange={handleChange}
              className="w-full rounded-xl border-gray-300 shadow-sm text-sm"
              required
            >
              <option value="">Seleccione</option>
              <option value="estatuas">Estatuas</option>
              <option value="imágenes">Imágenes</option>
              <option value="objetos_litúrgicos">Objetos litúrgicos</option>
              <option value="vestimenta">Vestimenta</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Estado</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="w-full rounded-xl border-gray-300 shadow-sm text-sm"
              required
            >
              <option value="">Seleccione</option>
              <option value="disponible">Disponible</option>
              <option value="dañado">Dañado</option>
              <option value="en_mantenimiento">En mantenimiento</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Observación</label>
            <input
              type="text"
              name="observacion"
              value={formData.observacion}
              onChange={handleChange}
              className="w-full rounded-xl border-gray-300 shadow-sm text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Parroquia</label>
            <select
              name="id_parroquia"
              value={formData.id_parroquia}
              onChange={handleChange}
              className="w-full rounded-xl border-gray-300 shadow-sm text-sm"
              required
            >
              <option value="">Seleccione</option>
              {parroquias.map(p => (
                <option key={p.id_parroquia} value={p.id_parroquia}>{p.nombre_prrq}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className={`w-full px-4 py-2 rounded-xl text-white text-sm transition ${editando ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {editando ? 'Actualizar' : 'Registrar'}
            </button>
            {editando && (
              <button
                type="button"
                onClick={handleCancelar}
                className="w-full px-4 py-2 rounded-xl bg-gray-400 hover:bg-gray-500 text-white text-sm"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="min-w-full text-sm text-center">
          <thead className="bg-blue-600 text-white rounded-t-xl">
            <tr>
              {['Nombre', 'Categoría', 'Estado', 'Fecha Adquisición', 'Última Revisión', 'Observación', 'Parroquia', 'Acciones'].map(th => (
                <th key={th} className="py-2 px-4">{th}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {objetos.length > 0 ? objetos.map(o => (
              <tr key={o.id_inventario} className="hover:bg-gray-50">
                <td className="py-2 px-4">{o.nombre_invent}</td>
                <td className="py-2 px-4">{o.categoria_invent}</td>
                <td className="py-2 px-4">{o.estado}</td>
                <td className="py-2 px-4">{formatearFecha(o.fecha_adquisicion)}</td>
                <td className="py-2 px-4">{formatearFecha(o.fecha_ultima_revision)}</td>
                <td className="py-2 px-4">{o.observacion || '—'}</td>
                <td className="py-2 px-4">{o.nombre_prrq || '—'}</td>
                <td className="py-2 px-4">
                  <div className="flex justify-center gap-2">
                    <button
                      className="px-3 py-1 rounded-xl text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white transition"
                      onClick={() => handleEditar(o)}
                    >
                      Editar
                    </button>
                    <button
                      className="px-3 py-1 rounded-xl text-red-600 border border-red-600 hover:bg-red-600 hover:text-white transition"
                      onClick={() => handleEliminar(o.id_inventario)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="8" className="py-4 text-gray-400">No hay objetos registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ObjetosLiturgicos;
