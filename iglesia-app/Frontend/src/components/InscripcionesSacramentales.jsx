import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function InscripcionesSacramentales() {
  const [inscripciones, setInscripciones] = useState([]);
  const [sacramentos, setSacramentos] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [editando, setEditando] = useState(null);
  const [mostrarEvaluacionOral, setMostrarEvaluacionOral] = useState(false);
  const [esMatrimonio, setEsMatrimonio] = useState(false);

  const [formData, setFormData] = useState({
    id_persona: '',
    fecha_matricula: '',
    fecha_ceremonia_acordada: '',
    evaluacion_oral: '',
    descripcion: '',
    estado_matricula: 1,
    tipo_matrimonio: '',
    padrino: '',
    madrina: '',
    observaciones_matrimonio: '',
    id_sacramento: '',
    id_conyuge: ''
  });

  useEffect(() => {
    obtenerInscripciones();
    obtenerSacramentos();
    obtenerPersonas();
  }, []);

  useEffect(() => {
    if (!formData.id_sacramento || sacramentos.length === 0) {
      setMostrarEvaluacionOral(false);
      setEsMatrimonio(false);
      return;
    }

    const sacramentoSeleccionado = sacramentos.find(
      s => String(s.id_sacramento) === String(formData.id_sacramento)
    );

    if (!sacramentoSeleccionado) {
      setMostrarEvaluacionOral(false);
      setEsMatrimonio(false);
      return;
    }

    const nombre = sacramentoSeleccionado.nombre_sacrament
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    const sacramentosConEvaluacion = ['confirmacion', 'primera comunion', 'bautizo'];

    setMostrarEvaluacionOral(sacramentosConEvaluacion.includes(nombre));
    setEsMatrimonio(nombre === 'matrimonio');
  }, [formData.id_sacramento, sacramentos]);

  const obtenerInscripciones = async () => {
    try {
      const res = await fetch('http://localhost:5000/inscripciones');
      const data = await res.json();
      setInscripciones(data);
    } catch {
      setInscripciones([]);
      Swal.fire('Error', 'No se pudieron cargar las inscripciones', 'error');
    }
  };

  const obtenerSacramentos = async () => {
    try {
      const res = await fetch('http://localhost:5000/sacramentos');
      const data = await res.json();
      setSacramentos(data);
    } catch {
      setSacramentos([]);
    }
  };

  const obtenerPersonas = async () => {
    try {
      const res = await fetch('http://localhost:5000/personas');
      const data = await res.json();
      setPersonas(data);
    } catch {
      setPersonas([]);
    }
  };

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const formatFecha = (f) => {
    if (!f) return null;
    const date = new Date(f);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
  };

  const formatFechaBonita = (fecha) => {
    if (!fecha || fecha === 'Sin evaluación oral') return 'Sin evaluación oral';
    const date = new Date(fecha);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.id_persona || !formData.id_sacramento || !formData.fecha_ceremonia_acordada) {
      Swal.fire('Campos requeridos', 'Debe completar persona, sacramento y fecha de ceremonia', 'warning');
      return;
    }

    const payload = {
      ...formData,
      fecha_matricula: formatFecha(formData.fecha_matricula),
      fecha_ceremonia_acordada: formatFecha(formData.fecha_ceremonia_acordada),
      evaluacion_oral: mostrarEvaluacionOral ? formatFecha(formData.evaluacion_oral) : 'Sin evaluación oral'
    };

    const url = editando
      ? `http://localhost:5000/inscripciones/${editando}`
      : 'http://localhost:5000/inscripciones';

    const method = editando ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        obtenerInscripciones();
        Swal.fire('Éxito', editando ? 'Inscripción actualizada' : 'Inscripción registrada', 'success');
        resetForm();
      } else {
        const error = await res.json();
        Swal.fire('Error', error.mensaje || 'No se pudo guardar la inscripción', 'error');
      }
    } catch {
      Swal.fire('Error', 'Error en la conexión', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      id_persona: '',
      fecha_matricula: '',
      fecha_ceremonia_acordada: '',
      evaluacion_oral: '',
      descripcion: '',
      estado_matricula: 1,
      tipo_matrimonio: '',
      padrino: '',
      madrina: '',
      observaciones_matrimonio: '',
      id_sacramento: '',
      id_conyuge: ''
    });
    setEditando(null);
  };

  const handleEditar = (i) => {
    setFormData({
      id_persona: i.id_persona,
      fecha_matricula: i.fecha_matricula?.replace(' ', 'T') || '',
      fecha_ceremonia_acordada: i.fecha_ceremonia_acordada?.replace(' ', 'T') || '',
      evaluacion_oral: i.evaluacion_oral === 'Sin evaluación oral' ? '' : i.evaluacion_oral?.replace(' ', 'T') || '',
      descripcion: i.descripcion,
      id_sacramento: i.id_sacramento,
      estado_matricula: i.estado_matricula,
      tipo_matrimonio: i.tipo_matrimonio || '',
      padrino: i.padrino || '',
      madrina: i.madrina || '',
      observaciones_matrimonio: i.observaciones || '',
      id_conyuge: i.id_conyuge || ''
    });
    setEditando(i.id_inscripcion);
  };

  const handleEliminar = async id => {
    const result = await Swal.fire({
      title: '¿Eliminar inscripción?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`http://localhost:5000/inscripciones/${id}`, {
          method: 'DELETE'
        });

        if (res.ok) {
          obtenerInscripciones();
          Swal.fire('Eliminado', 'La inscripción fue eliminada', 'success');
        } else {
          Swal.fire('Error', 'No se pudo eliminar la inscripción', 'error');
        }
      } catch {
        Swal.fire('Error', 'Error en la conexión', 'error');
      }
    }
  };

return (
  <div className="container mx-auto px-4 py-10">
    <h2 className="text-3xl font-bold text-blue-800 text-center mb-10">
      Gestión de Inscripciones Sacramentales
    </h2>

    {/* Formulario */}
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl shadow-lg p-8 space-y-6 border border-gray-200"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Persona */}
        <div>
          <label className="block text-sm font-semibold mb-1">Persona</label>
          <select
            name="id_persona"
            value={formData.id_persona || ''}
            onChange={handleChange}
            required
            className="input-form"
          >
            <option value="">Seleccione persona</option>
            {personas.map(p => (
              <option key={p.id_persona} value={p.id_persona}>
                {p.nombres} {p.apellido1} {p.apellido2}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha Matrícula */}
        <div>
          <label className="block text-sm font-semibold mb-1">Fecha Matrícula</label>
          <input
            type="datetime-local"
            name="fecha_matricula"
            value={formData.fecha_matricula || ''}
            onChange={handleChange}
            className="input-form"
          />
        </div>

        {/* Fecha Ceremonia */}
        <div>
          <label className="block text-sm font-semibold mb-1">Fecha Ceremonia</label>
          <input
            type="datetime-local"
            name="fecha_ceremonia_acordada"
            value={formData.fecha_ceremonia_acordada || ''}
            onChange={handleChange}
            required
            className="input-form"
          />
        </div>

        {/* Evaluación Oral */}
        {mostrarEvaluacionOral && (
          <div>
            <label className="block text-sm font-semibold mb-1">Evaluación Oral</label>
            <input
              type="datetime-local"
              name="evaluacion_oral"
              value={formData.evaluacion_oral || ''}
              onChange={handleChange}
              className="input-form"
            />
          </div>
        )}

        {/* Descripción */}
        <div>
          <label className="block text-sm font-semibold mb-1">Descripción</label>
          <input
            type="text"
            name="descripcion"
            value={formData.descripcion || ''}
            onChange={handleChange}
            placeholder="Ingrese una descripción"
            className="input-form"
          />
        </div>

        {/* Sacramento */}
        <div>
          <label className="block text-sm font-semibold mb-1">Sacramento</label>
          <select
            name="id_sacramento"
            value={formData.id_sacramento || ''}
            onChange={handleChange}
            required
            className="input-form"
          >
            <option value="">Seleccione sacramento</option>
            {sacramentos.map(s => (
              <option key={s.id_sacramento} value={s.id_sacramento}>
                {s.nombre_sacrament}
              </option>
            ))}
          </select>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-semibold mb-1">Estado</label>
          <select
            name="estado_matricula"
            value={formData.estado_matricula ?? 1}
            onChange={handleChange}
            className="input-form"
          >
            <option value={1}>Activo</option>
            <option value={0}>Inactivo</option>
          </select>
        </div>
      </div>

      {/* Matrimonio */}
      {esMatrimonio && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-blue-700 mb-4">Datos del Matrimonio</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-1">Tipo de Matrimonio</label>
              <input
                type="text"
                name="tipo_matrimonio"
                value={formData.tipo_matrimonio || ''}
                onChange={handleChange}
                className="input-form"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Cónyuge</label>
              <select
                name="id_conyuge"
                value={formData.id_conyuge || ''}
                onChange={handleChange}
                className="input-form"
              >
                <option value="">Seleccione cónyuge</option>
                {personas.map(p => (
                  <option key={p.id_persona} value={p.id_persona}>
                    {p.nombres} {p.apellido1} {p.apellido2}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Padrino</label>
              <input
                type="text"
                name="padrino"
                value={formData.padrino || ''}
                onChange={handleChange}
                className="input-form"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Madrina</label>
              <input
                type="text"
                name="madrina"
                value={formData.madrina || ''}
                onChange={handleChange}
                className="input-form"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-sm font-semibold mb-1">Observaciones</label>
              <textarea
                name="observaciones_matrimonio"
                value={formData.observaciones_matrimonio || ''}
                onChange={handleChange}
                rows={3}
                className="input-form"
              />
            </div>
          </div>
        </div>
      )}

<div className="flex justify-end pt-4 space-x-3">
  {editando && (

    <button
      type="button"
      onClick={resetForm}
      className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-2 rounded-lg shadow-sm transition text-sm flex items-center gap-1"
    >
      <i className="bi bi-x-circle"></i> Cancelar
    </button>
  )}

  <button
    type="submit"
    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-sm transition text-sm flex items-center gap-1"
  >
    <i className="bi bi-save"></i> {editando ? 'Actualizar' : 'Registrar'}
  </button>
</div>
 
    </form>

    {/* Tabla de inscripciones */}
    <div className="bg-white mt-12 rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <table className="w-full table-auto text-sm text-center">
        <thead className="bg-blue-100 text-blue-800 font-semibold">
          <tr>
            <th className="px-4 py-2">Persona</th>
            <th className="px-4 py-2">Sacramento</th>
            <th className="px-4 py-2">Ceremonia</th>
            <th className="px-4 py-2">Estado</th>
            <th className="px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {inscripciones.length > 0 ? (
            inscripciones.map(i => (
              <tr key={i.id_inscripcion} className="border-t">
                <td className="px-4 py-2">{i.nombre_persona}</td>
                <td className="px-4 py-2">{i.nombre_sacramento}</td>
                <td className="px-4 py-2">{formatFechaBonita(i.fecha_ceremonia_acordada)}</td>
                <td className="px-4 py-2">{i.estado_matricula ? 'Activo' : 'Inactivo'}</td>
                <td className="px-4 py-2 flex justify-center gap-2">
                  <button
                    onClick={() => handleEditar(i)}
                    className="btn-icon-edit"
                    title="Editar"
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  <button
                    onClick={() => handleEliminar(i.id_inscripcion)}
                    className="btn-icon-delete"
                    title="Eliminar"
                  >
                    <i className="bi bi-trash-fill"></i>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="px-4 py-4 text-gray-400 italic">
                No hay inscripciones registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

}
export default InscripcionesSacramentales;






