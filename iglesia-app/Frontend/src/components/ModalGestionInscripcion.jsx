import React, { useEffect, useState, useCallback } from 'react';
import Swal from 'sweetalert2';

function ModalGestionInscripcion({ sacramento, onClose }) {
  const [inscripciones, setInscripciones] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [conyuges, setConyuges] = useState([]);
  const [padrinos, setPadrinos] = useState([]);
  const [madrinas, setMadrinas] = useState([]);
  const [editando, setEditando] = useState(null);
  const [mostrarEvaluacionOral, setMostrarEvaluacionOral] = useState(false);
  const [esMatrimonio, setEsMatrimonio] = useState(false);
  const [cerrando, setCerrando] = useState(false);

  const [formData, setFormData] = useState({
    id_persona: '',
    fecha_matricula: '',
    fecha_ceremonia_acordada: '',
    evaluacion_oral: '',
    descripcion: '',
    estado_matricula: 1,
    tipo_matrimonio: '',
    id_padrino: '',
    id_madrina: '',
    observaciones_matrimonio: '',
    id_sacramento: '',
    id_persona_rol_conyuge: ''
  });

  const obtenerPersonasPorSacramento = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5000/personas-por-sacramento/${sacramento.id_sacramento}`);
      const data = await res.json();
      setPersonas(data);
    } catch (error) {
      console.error('Error al obtener personas:', error);
    }
  }, [sacramento]);

  const obtenerConyuges = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/personas_roles?rol=conyuge');
      const data = await res.json();
      setConyuges(data);
    } catch (error) {
      console.error('Error al obtener cónyuges:', error);
    }
  }, []);

  const obtenerPadrinos = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/personas_roles?rol=padrino');
      const data = await res.json();
      setPadrinos(data);
    } catch (error) {
      console.error('Error al obtener padrinos:', error);
    }
  }, []);

  const obtenerMadrinas = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/personas_roles?rol=madrina');
      const data = await res.json();
      setMadrinas(data);
    } catch (error) {
      console.error('Error al obtener madrinas:', error);
    }
  }, []);

  const obtenerInscripciones = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/inscripciones');
      const data = await res.json();
      setInscripciones(data.filter(ins => ins.id_sacramento === sacramento.id_sacramento));
    } catch (error) {
      console.error('Error al obtener inscripciones:', error);
    }
  }, [sacramento]);

  useEffect(() => {
    if (!sacramento) return;

    const nombreNormalizado = sacramento.nombre_sacrament.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const requiereEvaluacion = ['bautizo', 'primera comunion', 'confirmacion', 'matrimonio'].some(keyword =>
      nombreNormalizado.includes(keyword)
    );
    setMostrarEvaluacionOral(requiereEvaluacion);
    setEsMatrimonio(nombreNormalizado.includes('matrimonio'));

    obtenerPersonasPorSacramento();
    obtenerConyuges();
    obtenerPadrinos();
    obtenerMadrinas();
    obtenerInscripciones();
  }, [sacramento, obtenerPersonasPorSacramento, obtenerConyuges, obtenerPadrinos, obtenerMadrinas, obtenerInscripciones]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      id_sacramento: sacramento.id_sacramento,
      evaluacion_oral: mostrarEvaluacionOral ? formData.evaluacion_oral : 'Sin evaluación oral'
    };

    try {
      const res = await fetch('http://localhost:5000/inscripciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire('Éxito', data.mensaje, 'success');
        setFormData({
          id_persona: '',
          fecha_matricula: '',
          fecha_ceremonia_acordada: '',
          evaluacion_oral: '',
          descripcion: '',
          estado_matricula: 1,
          tipo_matrimonio: '',
          id_padrino: '',
          id_madrina: '',
          observaciones_matrimonio: '',
          id_sacramento: '',
          id_persona_rol_conyuge: ''
        });
        obtenerInscripciones();
      } else {
        Swal.fire('Error', data.mensaje, 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al registrar la inscripción', 'error');
    }
  };

  const handleClose = () => {
    setCerrando(true);
    setTimeout(() => {
      setCerrando(false);
      onClose();
    }, 300);
  };

  const iniciarEdicion = (inscripcion) => {
    setEditando(inscripcion.id_inscripcion);
    setFormData({
      id_persona: inscripcion.id_persona,
      fecha_matricula: inscripcion.fecha_matricula?.split('T')[0] || '',
      fecha_ceremonia_acordada: inscripcion.fecha_ceremonia_acordada?.split('T')[0] || '',
      evaluacion_oral: inscripcion.evaluacion_oral || '',
      descripcion: inscripcion.descripcion || '',
      estado_matricula: inscripcion.estado_matricula,
      tipo_matrimonio: inscripcion.tipo_matrimonio || '',
      id_padrino: inscripcion.id_padrino || '',
      id_madrina: inscripcion.id_madrina || '',
      observaciones_matrimonio: inscripcion.observaciones_matrimonio || '',
      id_sacramento: sacramento.id_sacramento,
      id_persona_rol_conyuge: inscripcion.id_persona_rol_conyuge || ''
    });
  };

return (
  <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${cerrando ? 'animate-fadeOut' : 'animate-fadeIn'} bg-black/50`}>
    <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto mx-4 md:mx-auto card animate-slideDown">
      {/* Encabezado */}
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h2 className="text-xl font-bold text-indigo-700">
          Gestionar Inscripción: {sacramento?.nombre_sacrament}
        </h2>
        <button onClick={handleClose} className="text-gray-500 hover:text-red-600 text-2xl font-bold">&times;</button>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Persona:</label>
          <select name="id_persona" className="input-form" value={formData.id_persona} onChange={handleChange} required>
            <option value="">Seleccione una persona</option>
            {personas.map(p => (
              <option key={p.id_persona} value={p.id_persona}>{p.nombre_completo}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Fecha de Matrícula:</label>
            <input type="date" name="fecha_matricula" className="input-form" value={formData.fecha_matricula} onChange={handleChange} />
          </div>
          <div>
            <label className="block font-medium">Fecha de Ceremonia:</label>
            <input type="date" name="fecha_ceremonia_acordada" className="input-form" value={formData.fecha_ceremonia_acordada} onChange={handleChange} />
          </div>
        </div>

        {mostrarEvaluacionOral && (
          <div>
            <label className="block font-medium">Evaluación Oral:</label>
            <input type="text" name="evaluacion_oral" className="input-form" value={formData.evaluacion_oral} onChange={handleChange} />
          </div>
        )}

        <div>
          <label className="block font-medium">Descripción:</label>
          <textarea name="descripcion" className="input-form" value={formData.descripcion} onChange={handleChange}></textarea>
        </div>

        {esMatrimonio && (
          <div className="bg-purple-50 p-4 rounded-2xl shadow-inner border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-700 mb-2">Datos de Matrimonio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium">Cónyuge:</label>
                <select name="id_persona_rol_conyuge" className="input-form" value={formData.id_persona_rol_conyuge} onChange={handleChange}>
                  <option value="">Seleccione un cónyuge</option>
                  {conyuges.map(p => (
                    <option key={p.id_persona_rol} value={p.id_persona_rol}>{p.nombre_completo}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium">Tipo de Matrimonio:</label>
                <input type="text" name="tipo_matrimonio" className="input-form" value={formData.tipo_matrimonio} onChange={handleChange} />
              </div>
              <div>
                <label className="block font-medium">Padrino:</label>
                <select name="id_padrino" className="input-form" value={formData.id_padrino} onChange={handleChange}>
                  <option value="">Seleccione padrino</option>
                  {padrinos.map(p => (
                    <option key={p.id_persona_rol} value={p.id_persona_rol}>{p.nombre_completo}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium">Madrina:</label>
                <select name="id_madrina" className="input-form" value={formData.id_madrina} onChange={handleChange}>
                  <option value="">Seleccione madrina</option>
                  {madrinas.map(p => (
                    <option key={p.id_persona_rol} value={p.id_persona_rol}>{p.nombre_completo}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block font-medium">Observaciones:</label>
                <textarea name="observaciones_matrimonio" className="input-form" value={formData.observaciones_matrimonio} onChange={handleChange}></textarea>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {editando ? 'Actualizar' : 'Registrar'}
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Cancelar
          </button>
        </div>
      </form>

      {/* Tabla de inscripciones */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-blue-700 mb-2">Inscripciones Registradas</h3>
        <div className="overflow-auto max-h-64 rounded-2xl border bg-white shadow-inner">
          <table className="w-full table-auto text-sm text-center">
            <thead className="bg-blue-600 text-white text-xs">
              <tr>
                <th className="px-2 py-2">Persona</th>
                <th className="px-2 py-2">Fecha Matrícula</th>
                <th className="px-2 py-2">Fecha Ceremonia</th>
                {mostrarEvaluacionOral && <th className="px-2 py-2">Evaluación Oral</th>}
                <th className="px-2 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inscripciones.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">No hay inscripciones registradas.</td>
                </tr>
              ) : (
                inscripciones.map(ins => (
                  <tr key={ins.id_inscripcion} className="hover:bg-gray-100">
                    <td className="px-2 py-1">{ins.nombre_persona}</td>
                    <td className="px-2 py-1">{ins.fecha_matricula?.split('T')[0]}</td>
                    <td className="px-2 py-1">{ins.fecha_ceremonia_acordada?.split('T')[0]}</td>
                    {mostrarEvaluacionOral && <td className="px-2 py-1">{ins.evaluacion_oral}</td>}
                    <td className="px-2 py-1">
                      <button onClick={() => iniciarEdicion(ins)} className="text-indigo-600 hover:text-indigo-800 text-lg">
                        <i className="bi bi-pencil-square"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

}
export default ModalGestionInscripcion;
