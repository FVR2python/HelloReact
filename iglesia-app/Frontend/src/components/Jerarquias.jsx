import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function Jerarquias() {
  const [jerarquias, setJerarquias] = useState([]);
  const [formData, setFormData] = useState({
    nombre_jerarquia: '',
    descripcion: ''
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    obtenerJerarquias();
  }, []);

  const obtenerJerarquias = async () => {
    const res = await fetch('http://localhost:5000/jerarquias');
    const data = await res.json();
    setJerarquias(data);
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.nombre_jerarquia.trim()) {
      return Swal.fire('Campo vacío', 'El nombre de la jerarquía es obligatorio', 'warning');
    }

    const url = editando
      ? `http://localhost:5000/jerarquias/${editando}`
      : 'http://localhost:5000/jerarquias';
    const method = editando ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_jerarquia: formData.nombre_jerarquia.trim(),
        descripcion: formData.descripcion.trim()
      })
    });

    if (res.ok) {
      Swal.fire('Éxito', editando ? 'Jerarquía actualizada' : 'Jerarquía registrada', 'success');
      setFormData({ nombre_jerarquia: '', descripcion: '' });
      setEditando(null);
      obtenerJerarquias();
    } else {
      Swal.fire('Error', 'Hubo un problema al guardar', 'error');
    }
  };

  const handleEditar = (j) => {
    setFormData({
      nombre_jerarquia: j.nombre_jerarquia,
      descripcion: j.descripcion || ''
    });
    setEditando(j.id_jerarquia);
  };

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      const res = await fetch(`http://localhost:5000/jerarquias/${id}`, { method: 'DELETE' });
      if (res.ok) {
        Swal.fire('Eliminado', 'Jerarquía eliminada correctamente', 'success');
        obtenerJerarquias();
      } else {
        Swal.fire('Error', 'No se pudo eliminar la jerarquía', 'error');
      }
    }
  };

  const handleCancelar = () => {
    setFormData({ nombre_jerarquia: '', descripcion: '' });
    setEditando(null);
  };

return (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-blue-700 mb-6">Gestión de Jerarquías</h2>

    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-md space-y-4 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Jerarquía</label>
          <input
            type="text"
            name="nombre_jerarquia"
            value={formData.nombre_jerarquia}
            onChange={handleChange}
            placeholder="Ej. Diácono, Presbítero..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <input
            type="text"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Ej. Nivel inicial del clero"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-sm transition"
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

    <h4 className="text-xl font-semibold mb-3 text-gray-800">Listado de Jerarquías</h4>
    <div className="overflow-x-auto bg-white shadow-md rounded-2xl">
      <table className="min-w-full table-auto text-sm text-center">
        <thead className="bg-blue-600 text-white text-sm uppercase">
          <tr>
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Descripción</th>
            <th className="px-4 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {jerarquias.length > 0 ? jerarquias.map((j, index) => (
            <tr key={j.id_jerarquia} className="border-b">
              <td className="px-4 py-2">{index + 1}</td>
              <td className="px-4 py-2">{j.nombre_jerarquia}</td>
              <td className="px-4 py-2">{j.descripcion || '—'}</td>
              <td className="px-4 py-2">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => handleEditar(j)}
                    className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(j.id_jerarquia)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="4" className="px-4 py-3 text-gray-400 italic">
                No hay jerarquías registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

}

export default Jerarquias;
