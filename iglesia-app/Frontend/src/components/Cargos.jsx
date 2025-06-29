import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function Cargos() {
  const [cargos, setCargos] = useState([]);
  const [formData, setFormData] = useState({
    nombre_cargo: '',
    descripcion: ''
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    obtenerCargos();
  }, []);

  const obtenerCargos = async () => {
    const res = await fetch('http://localhost:5000/cargos');
    const data = await res.json();
    setCargos(data);
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!formData.nombre_cargo.trim() || !formData.descripcion.trim()) {
      Swal.fire('Campos incompletos', 'Debes completar nombre y descripción.', 'warning');
      return;
    }

    const url = editando
      ? `http://localhost:5000/cargos/${editando}`
      : 'http://localhost:5000/cargos';
    const method = editando ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_cargo: formData.nombre_cargo.trim(),
        descripcion: formData.descripcion.trim()
      })
    });

    if (res.ok) {
      obtenerCargos();
      setFormData({ nombre_cargo: '', descripcion: '' });
      setEditando(null);
      Swal.fire('Éxito', editando ? 'Cargo actualizado' : 'Cargo registrado', 'success');
    } else {
      const error = await res.json();
      Swal.fire('Error', error.mensaje || 'Ocurrió un problema al guardar.', 'error');
    }
  };

  const handleEditar = (cargo) => {
    setFormData({
      nombre_cargo: cargo.nombre_cargo,
      descripcion: cargo.descripcion
    });
    setEditando(cargo.id_cargo);
  };

  const handleEliminar = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar este cargo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (confirm.isConfirmed) {
      const res = await fetch(`http://localhost:5000/cargos/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        obtenerCargos();
        Swal.fire('Eliminado', 'Cargo eliminado correctamente', 'success');
      } else {
        const error = await res.json();
        Swal.fire('Error', error.mensaje || 'No se pudo eliminar el cargo.', 'error');
      }
    }
  };

  const handleCancelar = () => {
    setFormData({ nombre_cargo: '', descripcion: '' });
    setEditando(null);
  };

return (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-blue-700 mb-6">Gestión de Cargos</h2>

    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-md space-y-4 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del cargo</label>
          <input
            type="text"
            name="nombre_cargo"
            value={formData.nombre_cargo}
            onChange={handleChange}
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
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
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

    <h4 className="text-xl font-semibold mb-3 text-gray-800">Lista de Cargos</h4>
    <div className="overflow-x-auto bg-white shadow-md rounded-2xl">
      <table className="min-w-full table-auto text-sm text-center">
        <thead className="bg-blue-600 text-white text-sm uppercase">
          <tr>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Descripción</th>
            <th className="px-4 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {cargos.length > 0 ? (
            cargos.map((c) => (
              <tr key={c.id_cargo} className="border-b">
                <td className="px-4 py-2">{c.nombre_cargo}</td>
                <td className="px-4 py-2">{c.descripcion}</td>
                <td className="px-4 py-2">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleEditar(c)}
                      className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(c.id_cargo)}
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
              <td colSpan="3" className="px-4 py-3 text-gray-400 italic">
                No hay cargos registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

}

export default Cargos;
