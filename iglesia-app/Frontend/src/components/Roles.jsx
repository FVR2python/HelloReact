import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function Roles() {
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    nombre_rol: '',
    descripcion: ''
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    obtenerRoles();
  }, []);

  const obtenerRoles = async () => {
    const res = await fetch('http://localhost:5000/roles');
    const data = await res.json();
    setRoles(data);
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const url = editando
      ? `http://localhost:5000/roles/${editando}`
      : 'http://localhost:5000/roles';
    const method = editando ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      obtenerRoles();
      Swal.fire({
        icon: 'success',
        title: editando ? 'Modificación exitosa' : 'Rol registrado',
        showConfirmButton: false,
        timer: 1500
      });
      setFormData({ nombre_rol: '', descripcion: '' });
      setEditando(null);
    } else {
      Swal.fire('Error', 'Hubo un problema al guardar', 'error');
    }
  };

  const handleEditar = (r) => {
    setFormData({
      nombre_rol: r.nombre_rol,
      descripcion: r.descripcion
    });
    setEditando(r.id_rol);
  };

  const handleEliminar = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (confirm.isConfirmed) {
      const res = await fetch(`http://localhost:5000/roles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        obtenerRoles();
        Swal.fire('Eliminado', 'El rol ha sido eliminado', 'success');
      } else {
        Swal.fire('Error', 'No se pudo eliminar el rol', 'error');
      }
    }
  };

  const handleCancelar = () => {
    setFormData({ nombre_rol: '', descripcion: '' });
    setEditando(null);
  };

return (
  <div className="p-6">
    <h2 className="text-2xl font-semibold text-blue-700 mb-6">Gestión de Roles</h2>

    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 mb-8 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Rol</label>
          <input
            type="text"
            name="nombre_rol"
            value={formData.nombre_rol}
            onChange={handleChange}
            className="input-form"
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
            className="input-form"
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
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

    <div className="bg-white rounded-2xl shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Roles Registrados</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-blue-600 text-white text-center">
            <tr>
              <th className="px-4 py-2 font-medium">Nombre</th>
              <th className="px-4 py-2 font-medium">Descripción</th>
              <th className="px-4 py-2 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-center">
            {roles.length > 0 ? (
              roles.map((r) => (
                <tr key={r.id_rol}>
                  <td className="px-4 py-2">{r.nombre_rol}</td>
                  <td className="px-4 py-2">{r.descripcion}</td>
                  <td className="px-4 py-2">
                    <div className="flex justify-center gap-2">
                      <button className="btn-icon-edit" onClick={() => handleEditar(r)}>Editar</button>
                      <button className="btn-icon-delete" onClick={() => handleEliminar(r.id_rol)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-4 py-4 text-gray-400 italic">No hay roles registrados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

}

export default Roles;
