import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function SacramentosPrecios() {
  const [sacramentos, setSacramentos] = useState([]);
  const [precios, setPrecios] = useState([]);
  const [relaciones, setRelaciones] = useState([]);
  const [formSacramento, setFormSacramento] = useState({ nombre_sacrament: '', descripcion: '' });
  const [formPrecio, setFormPrecio] = useState({ monto_base: '', fecha_inicio: '' });
  const [formRelacion, setFormRelacion] = useState({ id_sacramento: '', id_precio: '' });

  useEffect(() => {
    obtenerSacramentos();
    obtenerPrecios();
    obtenerRelaciones();
  }, []);

  const obtenerSacramentos = async () => {
    const res = await fetch('http://localhost:5000/sacramentos');
    const data = await res.json();
    setSacramentos(data);
  };

  const obtenerPrecios = async () => {
    const res = await fetch('http://localhost:5000/precios');
    const data = await res.json();
    setPrecios(data);
  };

  const obtenerRelaciones = async () => {
    const res = await fetch('http://localhost:5000/sacramento-precios');
    const data = await res.json();
    setRelaciones(data);
  };

  const handleChange = (e, setForm, form) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const registrarSacramento = async e => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/sacramentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formSacramento)
    });
    if (res.ok) {
      obtenerSacramentos();
      setFormSacramento({ nombre_sacrament: '', descripcion: '' });
      Swal.fire('Éxito', 'Sacramento registrado', 'success');
    }
  };

  const registrarPrecio = async e => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/precios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formPrecio)
    });
    if (res.ok) {
      obtenerPrecios();
      setFormPrecio({ monto_base: '', fecha_inicio: '' });
      Swal.fire('Éxito', 'Precio registrado', 'success');
    }
  };

  const registrarRelacion = async e => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/sacramento-precios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formRelacion)
    });
    if (res.ok) {
      obtenerRelaciones();
      setFormRelacion({ id_sacramento: '', id_precio: '' });
      Swal.fire('Éxito', 'Asociación registrada', 'success');
    }
  };

  const eliminarRelacion = async id => {
    const result = await Swal.fire({
      title: '¿Eliminar relación?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      const res = await fetch(`http://localhost:5000/sacramento-precios/${id}`, { method: 'DELETE' });
      if (res.ok) {
        obtenerRelaciones();
        Swal.fire('Eliminado', 'La relación ha sido eliminada', 'success');
      }
    }
  };

return (
  <div className="p-6 bg-gray-100 rounded-2xl shadow-md">
    <h2 className="text-2xl font-bold text-blue-700 mb-6">Gestión de Sacramentos y Precios</h2>

    {/* Formulario Sacramento */}
    <form onSubmit={registrarSacramento} className="flex flex-wrap gap-4 mb-5 bg-white p-4 rounded-xl shadow border border-gray-200">
      <input
        type="text"
        name="nombre_sacrament"
        placeholder="Nombre del sacramento"
        className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring focus:border-blue-500"
        value={formSacramento.nombre_sacrament}
        onChange={(e) => handleChange(e, setFormSacramento, formSacramento)}
        required
      />
      <input
        type="text"
        name="descripcion"
        placeholder="Descripción"
        className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring focus:border-blue-500"
        value={formSacramento.descripcion}
        onChange={(e) => handleChange(e, setFormSacramento, formSacramento)}
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all"
      >
        Registrar Sacramento
      </button>
    </form>

    {/* Formulario Precio */}
    <form onSubmit={registrarPrecio} className="flex flex-wrap gap-4 mb-5 bg-white p-4 rounded-xl shadow border border-gray-200">
      <input
        type="number"
        step="0.01"
        name="monto_base"
        placeholder="Monto base"
        className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring focus:border-blue-500"
        value={formPrecio.monto_base}
        onChange={(e) => handleChange(e, setFormPrecio, formPrecio)}
        required
      />
      <input
        type="datetime-local"
        name="fecha_inicio"
        className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring focus:border-blue-500"
        value={formPrecio.fecha_inicio}
        onChange={(e) => handleChange(e, setFormPrecio, formPrecio)}
        required
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all"
      >
        Registrar Precio
      </button>
    </form>

    {/* Formulario Asociación */}
    <form onSubmit={registrarRelacion} className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-xl shadow border border-gray-200">
      <select
        name="id_sacramento"
        className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring focus:border-blue-500"
        value={formRelacion.id_sacramento}
        onChange={(e) => handleChange(e, setFormRelacion, formRelacion)}
        required
      >
        <option value="">Seleccione sacramento</option>
        {sacramentos.map(s => (
          <option key={s.id_sacramento} value={s.id_sacramento}>{s.nombre_sacrament}</option>
        ))}
      </select>

      <select
        name="id_precio"
        className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring focus:border-blue-500"
        value={formRelacion.id_precio}
        onChange={(e) => handleChange(e, setFormRelacion, formRelacion)}
        required
      >
        <option value="">Seleccione precio</option>
        {precios.map(p => (
          <option key={p.id_precio} value={p.id_precio}>
            S/ {parseFloat(p.monto_base).toFixed(2)} (desde {new Date(p.fecha_inicio).toLocaleString()})
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all"
      >
        Asociar
      </button>
    </form>

    {/* Tabla */}
    <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-200">
      <table className="w-full text-sm text-left">
        <thead className="bg-blue-100 text-blue-800 text-center">
          <tr>
            <th className="px-4 py-2">Sacramento</th>
            <th className="px-4 py-2">Precio</th>
            <th className="px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {relaciones.length > 0 ? relaciones.map(r => (
            <tr key={r.id_relacion} className="text-center border-t">
              <td className="px-4 py-2">{r.nombre_sacrament}</td>
              <td className="px-4 py-2">
                S/ {parseFloat(r.monto_base).toFixed(2)}<br />
                <span className="text-xs text-gray-500">Desde: {new Date(r.fecha_inicio).toLocaleString()}</span>
              </td>
              <td className="px-4 py-2">
                <div className="flex justify-center gap-2">
                  <button className="text-blue-600 hover:text-blue-800" disabled>
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button className="text-red-600 hover:text-red-800" onClick={() => eliminarRelacion(r.id_relacion)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="3" className="text-center text-gray-400 py-4">
                No hay relaciones registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);


}

export default SacramentosPrecios;
