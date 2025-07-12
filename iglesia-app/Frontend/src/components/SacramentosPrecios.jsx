import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

function SacramentosPrecios() {
  const [paso, setPaso] = useState(1);
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

  const registrarSacramento = async (e) => {
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
      setPaso(2);
    }
  };

  const registrarPrecio = async (e) => {
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
      setPaso(3);
    }
  };

  const registrarRelacion = async (e) => {
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
      setPaso(1);
    }
  };

  const eliminarRelacion = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar relación?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      const res = await fetch(`http://localhost:5000/sacramento-precios/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        obtenerRelaciones();
        Swal.fire('Eliminado', 'La relación ha sido eliminada', 'success');
      }
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Gestión de Sacramentos y Precios</h2>

      {/* Indicador de pasos */}
      <div className="flex justify-center gap-4 mb-6">
        {[1, 2, 3].map(n => (
          <div
            key={n}
            className={`px-4 py-2 rounded-full border font-semibold transition-all ${paso === n ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border-blue-300'}`}
          >
            Paso {n}
          </div>
        ))}
      </div>

      {/* Paso 1: Sacramento */}
      {paso === 1 && (
        <form onSubmit={registrarSacramento} className="bg-white p-6 rounded-xl shadow mb-6 border border-gray-200">
          <h3 className="text-lg font-bold mb-4">1️⃣ Registrar Sacramento</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" name="nombre_sacrament" placeholder="Nombre del sacramento" required value={formSacramento.nombre_sacrament} onChange={(e) => handleChange(e, setFormSacramento, formSacramento)} className="input-form" />
            <input type="text" name="descripcion" placeholder="Descripción" value={formSacramento.descripcion} onChange={(e) => handleChange(e, setFormSacramento, formSacramento)} className="input-form" />
          </div>
          <button type="submit" className="mt-4 btn bg-blue-600 text-white">Guardar y continuar</button>
        </form>
      )}

      {/* Paso 2: Precio */}
      {paso === 2 && (
        <form onSubmit={registrarPrecio} className="bg-white p-6 rounded-xl shadow mb-6 border border-gray-200">
          <h3 className="text-lg font-bold mb-4">2️⃣ Registrar Precio</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="number" step="0.01" name="monto_base" placeholder="Monto base" required value={formPrecio.monto_base} onChange={(e) => handleChange(e, setFormPrecio, formPrecio)} className="input-form" />
            <input type="datetime-local" name="fecha_inicio" required value={formPrecio.fecha_inicio} onChange={(e) => handleChange(e, setFormPrecio, formPrecio)} className="input-form" />
          </div>
          <button type="submit" className="mt-4 btn bg-blue-600 text-white">Guardar y continuar</button>
        </form>
      )}

      {/* Paso 3: Asociación */}
      {paso === 3 && (
        <form onSubmit={registrarRelacion} className="bg-white p-6 rounded-xl shadow mb-6 border border-gray-200">
          <h3 className="text-lg font-bold mb-4">3️⃣ Asociar Sacramento con Precio</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select name="id_sacramento" required value={formRelacion.id_sacramento} onChange={(e) => handleChange(e, setFormRelacion, formRelacion)} className="input-form">
              <option value="">Seleccione sacramento</option>
              {sacramentos.map(s => (
                <option key={s.id_sacramento} value={s.id_sacramento}>{s.nombre_sacrament}</option>
              ))}
            </select>
            <select name="id_precio" required value={formRelacion.id_precio} onChange={(e) => handleChange(e, setFormRelacion, formRelacion)} className="input-form">
              <option value="">Seleccione precio</option>
              {precios.map(p => (
                <option key={p.id_precio} value={p.id_precio}>S/ {parseFloat(p.monto_base).toFixed(2)} desde {new Date(p.fecha_inicio).toLocaleString()}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="mt-4 btn bg-blue-600 text-white">Finalizar</button>
        </form>
      )}

      {/* Tabla de relaciones */}
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
                <td className="px-4 py-2">S/ {parseFloat(r.monto_base).toFixed(2)}<br /><span className="text-xs text-gray-500">Desde: {new Date(r.fecha_inicio).toLocaleString()}</span></td>
                <td className="px-4 py-2">
                  <button className="text-red-600 hover:text-red-800" onClick={() => eliminarRelacion(r.id_relacion)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="3" className="text-center text-gray-400 py-4">No hay relaciones registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SacramentosPrecios;
