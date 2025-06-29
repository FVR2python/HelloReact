import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function InscripcionesSacramentales() {
  const [inscripciones, setInscripciones] = useState([]);
  const [sacramentos, setSacramentos] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [editando, setEditando] = useState(null);
  const [mostrarEvaluacionOral, setMostrarEvaluacionOral] = useState(false);

  const [formData, setFormData] = useState({
    id_persona: '',
    fecha_matricula: '',
    fecha_ceremonia_acordada: '',
    evaluacion_oral: '',
    descripcion: '',
    id_sacramento: '',
    estado_matricula: 1
  });

  useEffect(() => {
    obtenerInscripciones();
    obtenerSacramentos();
    obtenerPersonas();
  }, []);

  useEffect(() => {
    const sacramentoSeleccionado = sacramentos.find(s => s.id_sacramento === formData.id_sacramento);
    const nombre = sacramentoSeleccionado?.nombre_sacrament?.toLowerCase();
    setMostrarEvaluacionOral(nombre === 'confirmación' || nombre === 'primera comunión');
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

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const formatFecha = (f) => {
    if (!f) return null;
    const date = new Date(f);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
  };

  const formatFechaBonita = (fecha) => {
    if (!fecha) return 'Sin evaluación oral';
    const date = new Date(fecha);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.id_persona || !formData.id_sacramento) {
      Swal.fire('Campos requeridos', 'Seleccione persona y sacramento', 'warning');
      return;
    }

    const payload = {
      ...formData,
      fecha_matricula: formatFecha(formData.fecha_matricula),
      fecha_ceremonia_acordada: formatFecha(formData.fecha_ceremonia_acordada),
      evaluacion_oral: mostrarEvaluacionOral ? formatFecha(formData.evaluacion_oral) : null
    };

    const url = editando ? `http://localhost:5000/inscripciones/${editando}` : 'http://localhost:5000/inscripciones';
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
      id_sacramento: '',
      estado_matricula: 1
    });
    setEditando(null);
  };

  const handleEditar = (i) => {
    setFormData({
      id_persona: i.id_persona,
      fecha_matricula: i.fecha_matricula?.replace(' ', 'T') || '',
      fecha_ceremonia_acordada: i.fecha_ceremonia_acordada?.replace(' ', 'T') || '',
      evaluacion_oral: i.evaluacion_oral?.replace(' ', 'T') || '',
      descripcion: i.descripcion,
      id_sacramento: i.id_sacramento,
      estado_matricula: i.estado_matricula
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
        const res = await fetch(`http://localhost:5000/inscripciones/${id}`, { method: 'DELETE' });
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
  }


   return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Gestión de Inscripciones Sacramentales</h2>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {/* Persona */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Persona</label>
          <select name="id_persona" value={formData.id_persona || ''} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
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
          <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha Matrícula</label>
          <input type="datetime-local" name="fecha_matricula" value={formData.fecha_matricula || ''} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        {/* Fecha Ceremonia */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha Ceremonia</label>
          <input type="datetime-local" name="fecha_ceremonia_acordada" value={formData.fecha_ceremonia_acordada || ''} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        {/* Evaluación Oral (solo si aplica) */}
        {mostrarEvaluacionOral && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Evaluación Oral</label>
            <input type="datetime-local" name="evaluacion_oral" value={formData.evaluacion_oral || ''} onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        )}

        {/* Descripción */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
          <input type="text" name="descripcion" value={formData.descripcion || ''} onChange={handleChange}
            placeholder="Ingrese una descripción opcional"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        {/* Sacramento */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Sacramento</label>
          <select name="id_sacramento" value={formData.id_sacramento || ''} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
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
          <label className="block text-sm font-semibold text-gray-700 mb-1">Estado</label>
          <select name="estado_matricula" value={formData.estado_matricula ?? 1} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value={1}>Activo</option>
            <option value={0}>Inactivo</option>
          </select>
        </div>

        {/* Botón registrar */}
        <div className="md:col-span-2 lg:col-span-3 flex justify-end pt-2">
          <button type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition text-sm shadow-md">
            {editando ? 'Actualizar' : 'Registrar'}
          </button>
        </div>
      </form>

      {/* Tabla de resultados */}
      <div className="bg-white shadow-md rounded-xl overflow-x-auto">
        <table className="min-w-full text-sm text-left border-separate border-spacing-y-1">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3">Apellidos y Nombres</th>
              <th className="p-3">Sacramento</th>
              <th className="p-3">Estado</th>
              <th className="p-3">F. Matrícula</th>
              <th className="p-3">F. Ceremonia</th>
              <th className="p-3">Evaluación Oral</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {inscripciones.length > 0 ? inscripciones.map(i => (
              <tr key={i.id_inscripcion} className="bg-white hover:bg-blue-50 shadow-sm">
                <td className="p-3">{i.nombres} {i.apellido1} {i.apellido2}</td>
                <td className="p-3">{i.nombre_sacrament}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${i.estado_matricula ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {i.estado_matricula ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="p-3">{i.fecha_matricula}</td>
                <td className="p-3">{i.fecha_ceremonia_acordada}</td>
                <td className="p-3">{i.evaluacion_oral ? formatFechaBonita(i.evaluacion_oral) : <span className="text-gray-400 italic">Sin evaluación oral</span>}</td>
                <td className="p-3 text-center">
                  <button onClick={() => handleEditar(i)} className="text-blue-600 hover:underline mr-2">Editar</button>
                  <button onClick={() => handleEliminar(i.id_inscripcion)} className="text-red-600 hover:underline">Eliminar</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-400">No hay inscripciones registradas</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


export default InscripcionesSacramentales;