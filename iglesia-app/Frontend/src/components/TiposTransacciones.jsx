import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function TiposTransacciones() {
  const [tipos, setTipos] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    obtenerTipos();
  }, []);

  const obtenerTipos = async () => {
    const res = await fetch('http://localhost:5000/tipos_transacciones');
    setTipos(await res.json());
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const url = editando
      ? `http://localhost:5000/tipos_transacciones/${editando}`
      : 'http://localhost:5000/tipos_transacciones';
    const method = editando ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      obtenerTipos();
      Swal.fire('Éxito', editando ? 'Tipo actualizado' : 'Tipo registrado', 'success');
      handleCancelar();
    } else {
      const error = await res.json();
      Swal.fire('Error', error.mensaje || 'No se pudo guardar el tipo', 'error');
    }
  };

  const handleEditar = t => {
    setFormData({
      nombre: t.nombre,
      descripcion: t.descripcion || ''
    });
    setEditando(t.id_tipo_transaccion);
  };

  const handleEliminar = async id => {
    const result = await Swal.fire({
      title: '¿Eliminar tipo de transacción?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      const res = await fetch(`http://localhost:5000/tipos_transacciones/${id}`, { method: 'DELETE' });
      if (res.ok) {
        obtenerTipos();
        Swal.fire('Eliminado', 'Tipo eliminado correctamente', 'success');
      } else {
        Swal.fire('Error', 'No se pudo eliminar el tipo', 'error');
      }
    }
  };

  const handleCancelar = () => {
    setFormData({
      nombre: '',
      descripcion: ''
    });
    setEditando(null);
  };

return (
  <div className="p-6 bg-gray-100 rounded-2xl shadow-md">
    <h2 className="text-2xl font-bold text-blue-700 mb-6">Gestión de Tipos de Transacción</h2>

    {/* Formulario */}
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap gap-4 bg-white p-4 rounded-xl shadow border border-gray-200 mb-6"
    >
      <input
        type="text"
        name="nombre"
        placeholder="Nombre"
        value={formData.nombre}
        onChange={handleChange}
        className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring focus:border-blue-500"
        required
      />
      <input
        type="text"
        name="descripcion"
        placeholder="Descripción"
        value={formData.descripcion}
        onChange={handleChange}
        className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring focus:border-blue-500"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all"
      >
        {editando ? 'Actualizar' : 'Registrar'}
      </button>
      {editando && (
        <button
          type="button"
          onClick={handleCancelar}
          className="bg-gray-500 text-white px-4 py-2 rounded-xl hover:bg-gray-600 transition-all"
        >
          Cancelar
        </button>
      )}
    </form>

    {/* Tabla */}
    <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-200">
      <table className="w-full text-sm text-left">
        <thead className="bg-blue-100 text-blue-800 text-center">
          <tr>
            <th className="px-4 py-2">Nombre</th>
            <th className="px-4 py-2">Descripción</th>
            <th className="px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tipos.length > 0 ? (
            tipos.map((t) => (
              <tr key={t.id_tipo_transaccion} className="text-center border-t">
                <td className="px-4 py-2">{t.nombre}</td>
                <td className="px-4 py-2">{t.descripcion}</td>
                <td className="px-4 py-2">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleEditar(t)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Editar"
                    >
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <button
                      onClick={() => handleEliminar(t.id_tipo_transaccion)}
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center text-gray-400 py-4">
                No hay tipos registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

}

export default TiposTransacciones;
