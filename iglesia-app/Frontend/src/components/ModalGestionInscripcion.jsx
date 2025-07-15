import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Swal from 'sweetalert2';

function ModalGestionInscripcion({ sacramento, onClose }) {
  const [inscripciones, setInscripciones] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [conyuges, setConyuges] = useState([]);
  const [padrinos, setPadrinos] = useState([]);
  const [madrinas, setMadrinas] = useState([]);
  const [editando, setEditando] = useState(null);
  const [cerrando, setCerrando] = useState(false);
  const [mostrarPadrinos, setMostrarPadrinos] = useState(false);
  const [mostrarConyuge, setMostrarConyuge] = useState(false);

  const estadoInicial = {
    id_persona: '',
    fecha_matricula: '',
    descripcion: '',
    estado_matricula: 1,
    id_padrino: '',
    id_madrina: '',
    observaciones: '',
    id_sacramento: '',
    id_persona_rol_conyuge: ''
  };

  const [formData, setFormData] = useState(estadoInicial);

  const resetForm = () => {
    setFormData(estadoInicial);
    setEditando(null);
  };

  const obtenerDatos = useCallback(async () => {
    try {
      const [insRes, personasRes, conyugesRes, padrinosRes, madrinasRes] = await Promise.all([
        fetch('http://localhost:5000/inscripciones'),
        fetch(`http://localhost:5000/personas-por-sacramento/${sacramento.id_sacramento}`),
        fetch('http://localhost:5000/personas-rol/Cónyuge'),
        fetch('http://localhost:5000/personas-rol/Padrino'),
        fetch('http://localhost:5000/personas-rol/Madrina')
      ]);
      setInscripciones(await insRes.json());
      setPersonas(await personasRes.json());
      setConyuges(await conyugesRes.json());
      setPadrinos(await padrinosRes.json());
      setMadrinas(await madrinasRes.json());
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar los datos.', 'error');
    }
  }, [sacramento.id_sacramento]);

  const sacramentosConPadrinos = useMemo(() => [
    'matrimonio', 'bautizo', 'bautismo', 'confirmacion', 'primera comunion'
  ], []);

  const sacramentosConConyuge = useMemo(() => ['matrimonio'], []);

  useEffect(() => {
    if (!sacramento) return;
    const nombre = sacramento.nombre_sacrament?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    setMostrarPadrinos(sacramentosConPadrinos.some(s => nombre.includes(s)));
    setMostrarConyuge(sacramentosConConyuge.some(s => nombre.includes(s)));
    obtenerDatos();
  }, [sacramento, obtenerDatos, sacramentosConPadrinos, sacramentosConConyuge]);

  const handleChange = ({ target: { name, value } }) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_persona || !formData.fecha_matricula) {
      return Swal.fire('Campos requeridos', 'Debe seleccionar persona y fecha de inscripción', 'warning');
    }

    const payload = {
      ...formData,
      id_sacramento: sacramento.id_sacramento,
      id_padrino: formData.id_padrino || null,
      id_madrina: formData.id_madrina || null,
      id_persona_rol_conyuge: formData.id_persona_rol_conyuge || null
    };

    try {
      const url = editando
        ? `http://localhost:5000/inscripciones/${editando}`
        : 'http://localhost:5000/inscripciones';
      const method = editando ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire('Éxito', data.mensaje, 'success');
        resetForm();
        obtenerDatos();
      } else {
        Swal.fire('Error', data.mensaje, 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al registrar la inscripción', 'error');
    }
  };

  const eliminarInscripcion = async (id) => {
    const confirmacion = await Swal.fire({
      title: '¿Eliminar inscripción?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
      try {
        const res = await fetch(`http://localhost:5000/inscripciones/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok) {
          Swal.fire('Eliminado', data.mensaje, 'success');
          obtenerDatos();
        } else {
          Swal.fire('Error', data.mensaje, 'error');
        }
      } catch {
        Swal.fire('Error', 'No se pudo eliminar la inscripción', 'error');
      }
    }
  };

  const handleClose = () => {
    setCerrando(true);
    setTimeout(() => {
      setCerrando(false);
      onClose();
    }, 300);
  };

 const iniciarEdicion = (ins) => {
  setEditando(ins.id_inscripcion);
  setFormData({
    id_persona: ins.id_persona?.toString() || '',
    fecha_matricula: ins.fecha_matricula || '',
    descripcion: ins.descripcion || '',
    estado_matricula: ins.estado_matricula,
    id_padrino: ins.id_padrino?.toString() || '',
    id_madrina: ins.id_madrina?.toString() || '',
    id_persona_rol_conyuge: ins.id_persona_rol_conyuge?.toString() || '',
    observaciones: ins.observaciones || '',
    id_sacramento: sacramento.id_sacramento
  });
};

  const inscripcionesFiltradas = useMemo(() =>
    inscripciones.filter(i => i.id_sacramento === sacramento.id_sacramento),
    [inscripciones, sacramento]
  );

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${cerrando ? 'animate-fadeOut' : 'animate-fadeIn'}`}>
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-6xl relative animate-slideDown">
        <button onClick={handleClose} className="absolute top-2 right-4 text-gray-600 hover:text-red-500 text-2xl font-bold">&times;</button>
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Gestión de Inscripciones - {sacramento?.nombre_sacrament}</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border shadow mb-6">
          <div>
            <label className="text-sm font-medium">Persona *</label>
            <select name="id_persona" value={formData.id_persona} onChange={handleChange} className="input-form" required>
              <option value="">Seleccione persona</option>
              {personas.map(p => (
                <option key={p.id_persona} value={p.id_persona}>{p.nombre_completo} - {p.dni}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Fecha de inscripción *</label>
            <input type="date" name="fecha_matricula" value={formData.fecha_matricula} onChange={handleChange} className="input-form" required />
          </div>
          <div>
            <label className="text-sm font-medium">Estado</label>
            <select name="estado_matricula" value={formData.estado_matricula} onChange={handleChange} className="input-form">
              <option value="1">Activo</option>
              <option value="0">Inactivo</option>
            </select>
          </div>

          {mostrarConyuge && (
            <div>
              <label className="text-sm font-medium">Cónyuge</label>
              <select name="id_persona_rol_conyuge" value={formData.id_persona_rol_conyuge || ''} onChange={handleChange} className="input-form">
                <option value="">Sin cónyuge</option>
                {conyuges.map(c => (
                  <option key={c.id_persona_rol} value={c.id_persona_rol}>{c.nombre_persona}</option>
                ))}
              </select>
            </div>
          )}

          {mostrarPadrinos && (
            <>
              <div>
                <label className="text-sm font-medium">Padrino</label>
                <select name="id_padrino" value={formData.id_padrino || ''} onChange={handleChange} className="input-form">
                  <option value="">Sin padrino</option>
                  {padrinos.map(p => (
                    <option key={p.id_persona_rol} value={p.id_persona_rol}>{p.nombre_persona}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Madrina</label>
                <select name="id_madrina" value={formData.id_madrina || ''} onChange={handleChange} className="input-form">
                  <option value="">Sin madrina</option>
                  {madrinas.map(m => (
                    <option key={m.id_persona_rol} value={m.id_persona_rol}>{m.nombre_persona}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="md:col-span-2">
            <label className="text-sm font-medium">Observaciones</label>
            <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} className="input-form" rows="2" />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 mt-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              {editando ? 'Actualizar' : 'Registrar'}
            </button>
            {editando && (
              <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">
                Cancelar
              </button>
            )}
          </div>
        </form>

        <h3 className="text-lg font-semibold mb-2 text-blue-700">Inscripciones Registradas</h3>
        <div className="overflow-x-auto rounded-2xl border shadow bg-white">
          <table className="min-w-full text-sm text-center">
            <thead className="bg-blue-600 text-white uppercase text-xs">
              <tr>
                <th className="py-3 px-2">Persona</th>
                <th className="py-3 px-2">Fecha</th>
                <th className="py-3 px-2">Estado</th>
                {mostrarConyuge && <th className="py-3 px-2">Cónyuge</th>}
                {mostrarPadrinos && <th className="py-3 px-2">Padrino</th>}
                {mostrarPadrinos && <th className="py-3 px-2">Madrina</th>}
                <th className="py-3 px-2">Precio</th>
                <th className="py-3 px-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inscripcionesFiltradas.length > 0 ? (
                inscripcionesFiltradas.map(ins => (
                  <tr key={ins.id_inscripcion} className="hover:bg-gray-100 border-t">
                    <td className="py-2 px-3">{ins.nombre_persona}</td>
                    <td className="py-2 px-3">{ins.fecha_matricula}</td>
                    <td className="py-2 px-3">
                      <span className={`font-semibold ${ins.estado_matricula === 1 ? 'text-green-600' : 'text-red-600'}`}>
                        {ins.estado_matricula === 1 ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    {mostrarConyuge && <td className="py-2 px-3">{ins.nombre_conyuge || 'Sin cónyuge'}</td>}
                    {mostrarPadrinos && <td className="py-2 px-3">{ins.nombre_padrino || 'Sin padrino'}</td>}
                    {mostrarPadrinos && <td className="py-2 px-3">{ins.nombre_madrina || 'Sin madrina'}</td>}
                    <td className="py-2 px-3">
                      {!isNaN(parseFloat(ins.precio_sacramento)) ? `S/. ${parseFloat(ins.precio_sacramento).toFixed(2)}` : '—'}
                    </td>
                    <td className="py-2 px-3 flex justify-center gap-2">
                      <button onClick={() => iniciarEdicion(ins)} className="text-yellow-600 hover:text-yellow-800 text-lg">
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button onClick={() => eliminarInscripcion(ins.id_inscripcion)} className="text-red-600 hover:text-red-800 text-lg">
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">
                    No hay inscripciones registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ModalGestionInscripcion;
