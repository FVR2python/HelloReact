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
  <div className="p-6 max-w-7xl mx-auto space-y-6">
    <h2 className="text-2xl font-bold text-blue-700">Gestión de Usuarios</h2>

    {/* Formulario */}
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <label className="label-form">Usuario</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="input-form"
          required
        />
      </div>

      <div>
        <label className="label-form">Contraseña</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="input-form"
          required
        />
      </div>

      <div>
        <label className="label-form">Persona</label>
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
      </div>

      <div>
        <label className="label-form">Cargo</label>
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
      </div>

      <div className="flex items-end justify-end gap-3 col-span-full">
        {editando && (
          <button type="button" className="btn btn-secondary" onClick={handleCancelar}>Cancelar</button>
        )}
        <button type="submit" className={`btn ${editando ? 'btn-warning' : 'btn-primary'}`}>
          {editando ? 'Actualizar' : 'Registrar'}
        </button>
      </div>
    </form>

    {/* Tabla */}
    <div className="bg-white rounded-2xl shadow overflow-x-auto">
      <h3 className="text-lg font-semibold px-4 pt-4 text-gray-700">Usuarios Registrados</h3>
      <table className="min-w-full text-sm text-center mt-2">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="table-th">Usuario</th>
            <th className="table-th">Persona</th>
            <th className="table-th">Cargo</th>
            <th className="table-th">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {usuarios.length > 0 ? usuarios.map(u => (
            <tr key={u.id_usuario}>
              <td className="table-td">{u.username}</td>
              <td className="table-td">{u.nombres} {u.apellido1}</td>
              <td className="table-td">{u.nombre_cargo}</td>
              <td className="table-td">
                <div className="flex justify-center gap-2">
                  <button onClick={() => handleEditar(u)} className="btn-icon-edit">✏️</button>
                  <button onClick={() => handleEliminar(u.id_usuario)} className="btn-icon-delete">🗑️</button>
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="4" className="py-4 text-gray-400">No hay usuarios registrados.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
}

export default Usuarios;
