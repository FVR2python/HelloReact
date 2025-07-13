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
    setSacramentos(await res.json());
  };

  const obtenerPrecios = async () => {
    const res = await fetch('http://localhost:5000/precios');
    setPrecios(await res.json());
  };

  const obtenerRelaciones = async () => {
    const res = await fetch('http://localhost:5000/sacramento-precios');
    setRelaciones(await res.json());
  };

  const handleChange = (e, setForm, form) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const registrarSacramento = async e => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/sacramentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formSacramento)
      });
      if (res.ok) {
        await obtenerSacramentos();
        setFormSacramento({ nombre_sacrament: '', descripcion: '' });
        Swal.fire('Éxito', 'Sacramento registrado', 'success');
        setPaso(2);
      } else {
        const error = await res.json();
        Swal.fire('Error', error.mensaje || 'Error al registrar sacramento', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Servidor no disponible', 'error');
    }
  };

  const registrarPrecio = async e => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/precios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formPrecio)
      });
      if (res.ok) {
        await obtenerPrecios();
        setFormPrecio({ monto_base: '', fecha_inicio: '' });
        Swal.fire('Éxito', 'Precio registrado', 'success');
        setPaso(3);
      } else {
        const error = await res.json();
        Swal.fire('Error', error.mensaje || 'Error al registrar precio', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Servidor no disponible', 'error');
    }
  };

  const registrarRelacion = async e => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/sacramento-precios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formRelacion)
      });
      if (res.ok) {
        await obtenerRelaciones();
        setFormRelacion({ id_sacramento: '', id_precio: '' });
        Swal.fire('Éxito', 'Asociación registrada', 'success');
        setPaso(1);
      } else {
        const error = await res.json();
        Swal.fire('Error', error.mensaje || 'Error al asociar sacramento con precio', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Servidor no disponible', 'error');
    }
  };

  const eliminarRelacion = async id => {
    const confirm = await Swal.fire({
      title: '¿Eliminar relación?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (confirm.isConfirmed) {
      const res = await fetch(`http://localhost:5000/sacramento-precios/${id}`, { method: 'DELETE' });
      if (res.ok) {
        obtenerRelaciones();
        Swal.fire('Eliminado', 'La relación ha sido eliminada', 'success');
      } else {
        Swal.fire('Error', 'No se pudo eliminar', 'error');
      }
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-100 rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold text-blue-700 text-center">Gestión de Sacramentos y Precios</h2>

      {/* Pasos */}
      <div className="flex justify-center gap-4">
        {[1, 2, 3].map(n => (
          <span key={n} className={`px-4 py-2 rounded-full text-sm font-semibold border ${paso === n ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border-blue-400'}`}>
            Paso {n}
          </span>
        ))}
      </div>

      {/* Paso 1: Sacramento */}
      {paso === 1 && (
        <form onSubmit={registrarSacramento} className="form-section">
          <h3 className="mb-4 text-lg font-bold">1️⃣ Registrar Sacramento</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" name="nombre_sacrament" placeholder="Nombre *" required value={formSacramento.nombre_sacrament} onChange={(e) => handleChange(e, setFormSacramento, formSacramento)} className="input-form" />
            <input type="text" name="descripcion" placeholder="Descripción" value={formSacramento.descripcion} onChange={(e) => handleChange(e, setFormSacramento, formSacramento)} className="input-form" />
          </div>
          <button type="submit" className="btn bg-blue-600 mt-4 text-white">Guardar y continuar</button>
        </form>
      )}

      {/* Paso 2: Precio */}
      {paso === 2 && (
        <form onSubmit={registrarPrecio} className="form-section">
          <h3 className="mb-4 text-lg font-bold">2️⃣ Registrar Precio</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="number" step="0.01" name="monto_base" required placeholder="Monto base *" value={formPrecio.monto_base} onChange={(e) => handleChange(e, setFormPrecio, formPrecio)} className="input-form" />
            <input type="datetime-local" name="fecha_inicio" required value={formPrecio.fecha_inicio} onChange={(e) => handleChange(e, setFormPrecio, formPrecio)} className="input-form" />
          </div>
          <button type="submit" className="btn bg-blue-600 mt-4 text-white">Guardar y continuar</button>
        </form>
      )}

      {/* Paso 3: Asociación */}
      {paso === 3 && (
        <form onSubmit={registrarRelacion} className="form-section">
          <h3 className="mb-4 text-lg font-bold">3️⃣ Asociar Sacramento con Precio</h3>
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
                <option key={p.id_precio} value={p.id_precio}>
                  S/ {parseFloat(p.monto_base).toFixed(2)} - Desde: {new Date(p.fecha_inicio).toLocaleString()}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn bg-blue-600 mt-4 text-white">Finalizar</button>
        </form>
      )}

      {/* Tabla de relaciones */}
      <div className="overflow-x-auto bg-white rounded-xl shadow border">
        <table className="w-full text-sm text-center">
          <thead className="bg-blue-100 text-blue-800">
            <tr>
              <th className="py-2 px-4">Sacramento</th>
              <th className="py-2 px-4">Precio</th>
              <th className="py-2 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {relaciones.length > 0 ? relaciones.map(r => (
              <tr key={r.id_relacion} className="border-t">
                <td className="py-2 px-4">{r.nombre_sacrament}</td>
                <td className="py-2 px-4">
                  S/ {parseFloat(r.monto_base).toFixed(2)}<br />
                  <span className="text-xs text-gray-500">Desde: {new Date(r.fecha_inicio).toLocaleString()}</span>
                </td>
                <td className="py-2 px-4">
                  <button onClick={() => eliminarRelacion(r.id_relacion)} className="text-red-600 hover:text-red-800">
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="3" className="py-4 text-gray-400">No hay relaciones registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SacramentosPrecios;
