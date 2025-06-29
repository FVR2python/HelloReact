import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function Clerigos() {
  const [clerigos, setClerigos] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [jerarquias, setJerarquias] = useState([]);
  const [formData, setFormData] = useState({
    id_persona: '',
    id_jerarquia: '',
    fecha_ordenacion: ''
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    obtenerClerigos();
    obtenerPersonas();
    obtenerJerarquias();
  }, []);

  const obtenerClerigos = async () => {
    try {
      const res = await fetch('http://localhost:5000/clerigos');
      const data = await res.json();
      setClerigos(Array.isArray(data) ? data : []);
    } catch {
      Swal.fire('Error', 'No se pudieron cargar los clérigos', 'error');
    }
  };

  const obtenerPersonas = async () => {
    try {
      const res = await fetch('http://localhost:5000/personas');
      const data = await res.json();
      setPersonas(Array.isArray(data) ? data : []);
    } catch {
      Swal.fire('Error', 'No se pudieron cargar las personas', 'error');
    }
  };

  const obtenerJerarquias = async () => {
    try {
      const res = await fetch('http://localhost:5000/jerarquias');
      const data = await res.json();
      setJerarquias(Array.isArray(data) ? data : []);
    } catch {
      Swal.fire('Error', 'No se pudieron cargar las jerarquías', 'error');
    }
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!formData.id_persona || !formData.id_jerarquia || !formData.fecha_ordenacion) {
      Swal.fire('Campos incompletos', 'Debes completar todos los campos.', 'warning');
      return;
    }

    if (!editando && clerigos.some(c => c.id_persona === parseInt(formData.id_persona))) {
      Swal.fire('Duplicado', 'Esta persona ya está registrada como clérigo.', 'warning');
      return;
    }

    const url = editando
      ? `http://localhost:5000/clerigos/${editando}`
      : 'http://localhost:5000/clerigos';
    const method = editando ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      obtenerClerigos();
      setFormData({ id_persona: '', id_jerarquia: '', fecha_ordenacion: '' });
      setEditando(null);
      Swal.fire('Éxito', editando ? 'Clérigo actualizado' : 'Clérigo registrado', 'success');
    } else {
      const error = await res.json();
      Swal.fire('Error', error.mensaje || 'Ocurrió un problema al guardar.', 'error');
    }
  };

  const handleEditar = c => {
    setFormData({
      id_persona: c.id_persona.toString(),
      id_jerarquia: c.id_jerarquia.toString(),
      fecha_ordenacion: c.fecha_ordenacion ? c.fecha_ordenacion.split('T')[0] : ''
    });
    setEditando(c.id_clerigo);
  };

  const handleEliminar = async id => {
    const result = await Swal.fire({
      title: '¿Eliminar clérigo?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      const res = await fetch(`http://localhost:5000/clerigos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        obtenerClerigos();
        Swal.fire('Eliminado', 'Clérigo eliminado correctamente.', 'success');
      } else {
        const error = await res.json();
        Swal.fire('Error', error.mensaje || 'No se pudo eliminar el clérigo.', 'error');
      }
    }
  };

  const handleCancelar = () => {
    setFormData({ id_persona: '', id_jerarquia: '', fecha_ordenacion: '' });
    setEditando(null);
  };

 return (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-blue-700 mb-6">Gestión de Clérigos</h2>

    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-md p-6 mb-8 space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Persona</label>
          <select
            name="id_persona"
            value={formData.id_persona}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleccione</option>
            {personas.map((p) => (
              <option key={p.id_persona} value={p.id_persona}>
                {p.nombres} {p.apellido1} ({p.dni})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jerarquía</label>
          <select
            name="id_jerarquia"
            value={formData.id_jerarquia}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleccione</option>
            {jerarquias.map((j) => (
              <option key={j.id_jerarquia} value={j.id_jerarquia}>
                {j.nombre_jerarquia}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Ordenación</label>
          <input
            type="date"
            name="fecha_ordenacion"
            value={formData.fecha_ordenacion}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition"
        >
          {editando ? 'Actualizar' : 'Registrar'}
        </button>
        {editando && (
          <button
            type="button"
            onClick={handleCancelar}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-lg transition"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>

    <h4 className="text-lg font-semibold mb-3 text-gray-800">Clérigos registrados</h4>
    <div className="overflow-x-auto bg-white shadow-md rounded-2xl">
      <table className="min-w-full table-auto text-sm text-center">
        <thead className="bg-blue-600 text-white uppercase">
          <tr>
            <th className="px-4 py-3">Persona</th>
            <th className="px-4 py-3">Jerarquía</th>
            <th className="px-4 py-3">Fecha Ordenación</th>
            <th className="px-4 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {clerigos.length > 0 ? (
            clerigos.map((c) => (
              <tr key={c.id_clerigo} className="border-b">
                <td className="px-4 py-2">{c.nombres} {c.apellido1}</td>
                <td className="px-4 py-2">{c.nombre_jerarquia}</td>
                <td className="px-4 py-2">
                  {c.fecha_ordenacion ? new Date(c.fecha_ordenacion).toLocaleDateString('es-PE') : '—'}
                </td>
                <td className="px-4 py-2">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleEditar(c)}
                      className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(c.id_clerigo)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="px-4 py-3 text-gray-400 italic">
                No hay clérigos registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

}

export default Clerigos;
