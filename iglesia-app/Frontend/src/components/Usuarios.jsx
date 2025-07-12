import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    id_persona: '',
    id_cargo: ''
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    obtenerUsuarios();
    obtenerPersonas();
    obtenerCargos();
  }, []);

  const obtenerUsuarios = async () => {
    try {
      const res = await fetch('http://localhost:5000/usuarios');
      const data = await res.json();
      setUsuarios(data);
    } catch {
      Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error');
    }
  };

  const obtenerPersonas = async () => {
    try {
      const res = await fetch('http://localhost:5000/personas');
      const data = await res.json();
      setPersonas(data);
    } catch {
      Swal.fire('Error', 'No se pudieron cargar las personas', 'error');
    }
  };

  const obtenerCargos = async () => {
    try {
      const res = await fetch('http://localhost:5000/cargos');
      const data = await res.json();
      setCargos(data);
    } catch {
      Swal.fire('Error', 'No se pudieron cargar los cargos', 'error');
    }
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!formData.username || !formData.password || !formData.id_persona || !formData.id_cargo) {
      return Swal.fire('Campos incompletos', 'Complete todos los campos requeridos.', 'warning');
    }

    const url = editando
      ? `http://localhost:5000/usuarios/${editando}`
      : 'http://localhost:5000/usuarios';
    const method = editando ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      obtenerUsuarios();
      Swal.fire('Éxito', editando ? 'Usuario actualizado' : 'Usuario registrado', 'success');
      handleCancelar();
    } else {
      const error = await res.json();
      Swal.fire('Error', error.mensaje || 'No se pudo guardar el usuario.', 'error');
    }
  };

  const handleEditar = (u) => {
    setFormData({
      username: u.username,
      password: '', // se fuerza el cambio por seguridad
      id_persona: u.id_persona.toString(),
      id_cargo: u.id_cargo.toString()
    });
    setEditando(u.id_usuario);
  };

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar usuario?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      const res = await fetch(`http://localhost:5000/usuarios/${id}`, { method: 'DELETE' });
      if (res.ok) {
        obtenerUsuarios();
        Swal.fire('Eliminado', 'Usuario eliminado correctamente', 'success');
      } else {
        Swal.fire('Error', 'No se pudo eliminar el usuario.', 'error');
      }
    }
  };

  const handleCancelar = () => {
    setFormData({ username: '', password: '', id_persona: '', id_cargo: '' });
    setEditando(null);
  };

return (
  <div className="space-y-6 p-4">
    <h2 className="text-2xl font-bold text-blue-700">Gestión de Usuarios</h2>

    {/* Formulario */}
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-2xl shadow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <input
        type="text"
        name="username"
        value={formData.username}
        onChange={handleChange}
        placeholder="Nombre de usuario *"
        className="input-form"
        required
      />

      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Contraseña *"
        className="input-form"
        required
      />

      <select
        name="id_persona"
        value={formData.id_persona}
        onChange={handleChange}
        className="input-form"
        required
      >
        <option value="">Seleccione persona</option>
        {personas.map(p => (
          <option key={p.id_persona} value={p.id_persona}>
            {p.nombres} {p.apellido1}
          </option>
        ))}
      </select>

      <select
        name="id_cargo"
        value={formData.id_cargo}
        onChange={handleChange}
        className="input-form"
        required
      >
        <option value="">Seleccione cargo</option>
        {cargos.map(c => (
          <option key={c.id_cargo} value={c.id_cargo}>{c.nombre_cargo}</option>
        ))}
      </select>

      <div className="col-span-full flex justify-end gap-3 mt-2">
        {editando && (
          <button
            type="button"
            onClick={handleCancelar}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className={`px-4 py-2 text-white rounded-lg transition ${editando ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {editando ? 'Actualizar' : 'Registrar'}
        </button>
      </div>
    </form>

    {/* Tabla */}
    <div className="overflow-x-auto rounded-2xl border shadow bg-white">
      <table className="min-w-full text-sm text-center">
        <thead className="bg-blue-600 text-white uppercase text-xs">
          <tr>
            <th className="py-3 px-2">Usuario</th>
            <th className="py-3 px-2">Persona</th>
            <th className="py-3 px-2">Cargo</th>
            <th className="py-3 px-2">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {usuarios.length > 0 ? (
            usuarios.map(u => (
              <tr key={u.id_usuario} className="hover:bg-gray-100">
                <td className="py-2 px-2">{u.username}</td>
                <td className="py-2 px-2">{u.nombres} {u.apellido1}</td>
                <td className="py-2 px-2">{u.nombre_cargo}</td>
                <td className="py-2 px-2 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleEditar(u)}
                    className="text-blue-600 hover:text-blue-800 text-lg"
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  <button
                    onClick={() => handleEliminar(u.id_usuario)}
                    className="text-red-600 hover:text-red-800 text-lg"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center py-4 text-gray-500">
                No hay usuarios registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

}
export default Usuarios;
