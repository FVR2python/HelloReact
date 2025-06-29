import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function Personas() {
  const [personas, setPersonas] = useState([]);
  const [formData, setFormData] = useState({
    dni: '',
    nombres: '',
    apellido1: '',
    apellido2: '',
    email: '',
    fecha_nacimiento: '',
    direccion: '',
    telefono: ''
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    obtenerPersonas();
  }, []);

  const obtenerPersonas = async () => {
    const res = await fetch('http://localhost:5000/personas');
    const data = await res.json();
    setPersonas(data);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editando
      ? `http://localhost:5000/personas/${editando}`
      : 'http://localhost:5000/personas';
    const method = editando ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await res.json();
    if (res.ok) {
      Swal.fire('Éxito', data.mensaje, 'success');
      setFormData({
        dni: '',
        nombres: '',
        apellido1: '',
        apellido2: '',
        email: '',
        fecha_nacimiento: '',
        direccion: '',
        telefono: ''
      });
      setEditando(null);
      obtenerPersonas();
    } else {
      Swal.fire('Error', data.mensaje, 'error');
    }
  };

  const handleEditar = (persona) => {
    setFormData(persona);
    setEditando(persona.id_persona);
  };

  const handleEliminar = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar persona?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (confirm.isConfirmed) {
      const res = await fetch(`http://localhost:5000/personas/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire('Eliminado', data.mensaje, 'success');
        obtenerPersonas();
      } else {
        Swal.fire('Error', data.mensaje, 'error');
      }
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Formulario */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-2xl shadow border">
        <h2 className="md:col-span-3 text-lg font-bold text-blue-700">
          {editando ? '✏️ Editar persona' : '➕ Registrar nueva persona'}
        </h2>

        <div>
          <label className="label-form">DNI *</label>
          <input name="dni" value={formData.dni} onChange={handleChange} className="input-form" required />
        </div>
        <div>
          <label className="label-form">Nombres *</label>
          <input name="nombres" value={formData.nombres} onChange={handleChange} className="input-form" required />
        </div>
        <div>
          <label className="label-form">Apellido Paterno *</label>
          <input name="apellido1" value={formData.apellido1} onChange={handleChange} className="input-form" required />
        </div>
        <div>
          <label className="label-form">Apellido Materno</label>
          <input name="apellido2" value={formData.apellido2} onChange={handleChange} className="input-form" />
        </div>
        <div>
          <label className="label-form">Correo electrónico</label>
          <input name="email" type="email" value={formData.email} onChange={handleChange} className="input-form" />
        </div>
        <div>
          <label className="label-form">Fecha de nacimiento *</label>
          <input name="fecha_nacimiento" type="date" value={formData.fecha_nacimiento} onChange={handleChange} className="input-form" required />
        </div>
        <div>
          <label className="label-form">Dirección</label>
          <input name="direccion" value={formData.direccion} onChange={handleChange} className="input-form" />
        </div>
        <div>
          <label className="label-form">Teléfono *</label>
          <input name="telefono" value={formData.telefono} onChange={handleChange} className="input-form" required />
        </div>

        <div className="md:col-span-3 flex justify-end gap-3 mt-2">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            {editando ? 'Actualizar' : 'Registrar'}
          </button>
          {editando && (
            <button
              type="button"
              onClick={() => {
                setEditando(null);
                setFormData({
                  dni: '',
                  nombres: '',
                  apellido1: '',
                  apellido2: '',
                  email: '',
                  fecha_nacimiento: '',
                  direccion: '',
                  telefono: ''
                });
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Tabla de personas */}
      <div className="overflow-x-auto rounded-2xl border shadow bg-white">
        <table className="min-w-full text-sm text-center">
          <thead className="bg-blue-600 text-white uppercase text-xs">
            <tr>
              <th className="py-3 px-2">DNI</th>
              <th className="py-3 px-2">Nombre completo</th>
              <th className="py-3 px-2">Fecha nacimiento</th>
              <th className="py-3 px-2">Teléfono</th>
              <th className="py-3 px-2">Correo</th>
              <th className="py-3 px-2">Dirección</th>
              <th className="py-3 px-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {personas.map((p) => (
              <tr key={p.id_persona} className="hover:bg-gray-100">
                <td className="table-td">{p.dni}</td>
                <td className="table-td">{`${p.nombres} ${p.apellido1} ${p.apellido2}`}</td>
                <td className="table-td">
                  {new Date(p.fecha_nacimiento).toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </td>
                <td className="table-td">{p.telefono}</td>
                <td className="table-td">{p.email}</td>
                <td className="table-td">{p.direccion}</td>
                <td className="table-td flex items-center justify-center gap-2">
                  <button onClick={() => handleEditar(p)} className="text-blue-600 hover:text-blue-800 text-lg">
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  <button onClick={() => handleEliminar(p.id_persona)} className="text-red-600 hover:text-red-800 text-lg">
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
            {personas.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  No hay personas registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Personas;
