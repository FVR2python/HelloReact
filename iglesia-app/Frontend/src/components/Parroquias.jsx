import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function Parroquias() {
  const [parroquias, setParroquias] = useState([]);
  const [formData, setFormData] = useState({
    nombre_prrq: '',
    direccion_prrq: '',
    lugar_prrq: ''
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    obtenerParroquias();
  }, []);

  const obtenerParroquias = async () => {
    const res = await fetch('http://localhost:5000/parroquias');
    setParroquias(await res.json());
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const url = editando
      ? `http://localhost:5000/parroquias/${editando}`
      : 'http://localhost:5000/parroquias';
    const method = editando ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      obtenerParroquias();
      Swal.fire('Éxito', editando ? 'Parroquia actualizada' : 'Parroquia registrada', 'success');
      handleCancelar();
    } else {
      const error = await res.json();
      Swal.fire('Error', error.mensaje || 'No se pudo guardar la parroquia', 'error');
    }
  };

  const handleEditar = p => {
    setFormData({
      nombre_prrq: p.nombre_prrq,
      direccion_prrq: p.direccion_prrq,
      lugar_prrq: p.lugar_prrq
    });
    setEditando(p.id_parroquia);
  };

  const handleEliminar = async id => {
    const result = await Swal.fire({
      title: '¿Eliminar parroquia?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      const res = await fetch(`http://localhost:5000/parroquias/${id}`, { method: 'DELETE' });
      if (res.ok) {
        obtenerParroquias();
        Swal.fire('Eliminado', 'Parroquia eliminada correctamente', 'success');
      } else {
        Swal.fire('Error', 'No se pudo eliminar la parroquia', 'error');
      }
    }
  };

  const handleCancelar = () => {
    setFormData({
      nombre_prrq: '',
      direccion_prrq: '',
      lugar_prrq: ''
    });
    setEditando(null);
  };

return (
  <div className="container mx-auto px-4 py-6">
    <h2 className="text-2xl font-semibold text-blue-700 mb-6">Gestión de Parroquias</h2>

    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 mb-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <input
            type="text"
            name="nombre_prrq"
            value={formData.nombre_prrq}
            onChange={handleChange}
            className="input-form"
            placeholder="Ej. Parroquia San Pedro"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Dirección</label>
          <input
            type="text"
            name="direccion_prrq"
            value={formData.direccion_prrq}
            onChange={handleChange}
            className="input-form"
            placeholder="Ej. Jr. Bolívar 123"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Lugar</label>
          <input
            type="text"
            name="lugar_prrq"
            value={formData.lugar_prrq}
            onChange={handleChange}
            className="input-form"
            placeholder="Ej. Huaraz - Ancash"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button type="submit" className="btn btn-primary">
          {editando ? 'Actualizar' : 'Registrar'}
        </button>
        {editando && (
          <button type="button" onClick={handleCancelar} className="btn btn-secondary">
            Cancelar
          </button>
        )}
      </div>
    </form>

    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <table className="w-full table-auto text-sm text-center">
        <thead className="bg-blue-100 text-blue-800 font-semibold">
          <tr>
            <th className="px-4 py-2">Nombre</th>
            <th className="px-4 py-2">Dirección</th>
            <th className="px-4 py-2">Lugar</th>
            <th className="px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {parroquias.length > 0 ? (
            parroquias.map((p) => (
              <tr key={p.id_parroquia} className="border-t">
                <td className="px-4 py-2">{p.nombre_prrq}</td>
                <td className="px-4 py-2">{p.direccion_prrq}</td>
                <td className="px-4 py-2">{p.lugar_prrq}</td>
                <td className="px-4 py-2 flex justify-center gap-2">
                  <button
                    className="btn-icon-edit"
                    onClick={() => handleEditar(p)}
                    title="Editar"
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  <button
                    className="btn-icon-delete"
                    onClick={() => handleEliminar(p.id_parroquia)}
                    title="Eliminar"
                  >
                    <i className="bi bi-trash-fill"></i>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="px-4 py-4 text-gray-400 italic">
                No hay parroquias registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

}

export default Parroquias;
