import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function ModalGestionInscripcion({ sacramento, onClose }) {
  const [inscripciones, setInscripciones] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [editando, setEditando] = useState(null);
  const [mostrarEvaluacionOral, setMostrarEvaluacionOral] = useState(false);
  const [esMatrimonio, setEsMatrimonio] = useState(false);
  const [cerrando, setCerrando] = useState(false);

  const [padrinos, setPadrinos] = useState([]);
  const [madrinas, setMadrinas] = useState([]);
  const [conyuges, setConyuges] = useState([]);

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
    id_conyuge: '',
    observaciones_matrimonio: '',
    id_sacramento: ''
  });

  useEffect(() => {
    obtenerInscripciones();
    obtenerPersonas();
    if (sacramentoRequiereEvaluacionOral(sacramento)) {
      setMostrarEvaluacionOral(true);
    } else {
      setMostrarEvaluacionOral(false);
    }
    if (sacramentoEsMatrimonio(sacramento)) {
      setEsMatrimonio(true);
      obtenerPadrinos();
      obtenerMadrinas();
      obtenerConyuges();
    } else {
      setEsMatrimonio(false);
    }
  }, [sacramento]);

  const sacramentoRequiereEvaluacionOral = (s) => {
    const nombre = (s?.nombre_sacrament || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return ['confirmacion', 'primera comunion', 'bautizo', 'matrimonio'].includes(nombre);
  };

  const sacramentoEsMatrimonio = (s) => {
    const nombre = (s?.nombre_sacrament || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return nombre === 'matrimonio';
  };

  const obtenerInscripciones = async () => {
    const res = await fetch('http://localhost:5000/inscripciones');
    const data = await res.json();
    setInscripciones(Array.isArray(data) ? data : []);
  };

  const obtenerPersonas = async () => {
    const res = await fetch('http://localhost:5000/personas');
    const data = await res.json();
    setPersonas(Array.isArray(data) ? data : []);
  };

  const obtenerPadrinos = async () => {
    try {
      const res = await fetch("http://localhost:5000/personas-por-rol/Padrino");
      const data = await res.json();
      setPadrinos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener padrinos:", error);
      setPadrinos([]);
    }
  };

  const obtenerMadrinas = async () => {
    try {
      const res = await fetch("http://localhost:5000/personas-por-rol/Madrina");
      const data = await res.json();
      setMadrinas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener madrinas:", error);
      setMadrinas([]);
    }
  };

  const obtenerConyuges = async () => {
    try {
      const res = await fetch("http://localhost:5000/personas-por-rol/Cónyuge");
      const data = await res.json();
      setConyuges(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener cónyuges:", error);
      setConyuges([]);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCerrar = () => {
    setCerrando(true);
    setTimeout(() => {
      onClose();
      setCerrando(false);
    }, 300);
  };

  const handleEditar = (inscripcion) => {
    setEditando(inscripcion.id_inscripcion);
    setFormData({
      ...inscripcion,
      id_persona: inscripcion.id_persona,
      id_sacramento: sacramento.id_sacramento
    });
  };

  const handleCancelarEdicion = () => {
    setEditando(null);
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
      id_conyuge: '',
      observaciones_matrimonio: '',
      id_sacramento: ''
    });
  };

  const handleEliminar = async (id) => {
    const confirmacion = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta inscripción se eliminará permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
      try {
        const res = await fetch(`http://localhost:5000/inscripciones/${id}`, {
          method: 'DELETE'
        });

        if (res.status === 204) {
          Swal.fire('Eliminado', 'Inscripción eliminada correctamente.', 'success');
        } else {
          const data = await res.json();
          Swal.fire('Eliminado', data.mensaje || 'Inscripción eliminada.', 'success');
        }

        obtenerInscripciones();
      } catch (error) {
        console.error("Error al eliminar inscripción:", error);
        Swal.fire('Error', 'Ocurrió un error al intentar eliminar.', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editando
      ? `http://localhost:5000/inscripciones/${editando}`
      : 'http://localhost:5000/inscripciones';
    const method = editando ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        id_sacramento: sacramento.id_sacramento
      })
    });

    const data = await res.json();
    Swal.fire('Éxito', data.mensaje, 'success');
    obtenerInscripciones();
    handleCancelarEdicion();
  };

return (
  <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${cerrando ? 'fadeOut' : 'fadeIn'}`}>
    <div className={`card w-full max-w-5xl transition-all duration-300 ${cerrando ? 'slideUp' : 'slideDown'}`}>
      <h2 className="section-title">Gestión de Inscripciones - {sacramento?.nombre_sacrament}</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label-form">Persona:</label>
          <select name="id_persona" value={formData.id_persona} onChange={handleChange} required className="input-form">
            <option value="">Seleccione</option>
            {personas.map(p => (
              <option key={p.id_persona} value={p.id_persona}>
                {p.nombres} {p.apellido1} {p.apellido2}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-form">Fecha de Matrícula:</label>
          <input type="date" name="fecha_matricula" value={formData.fecha_matricula} onChange={handleChange} required className="input-form" />
        </div>

        <div>
          <label className="label-form">Fecha de Ceremonia Acordada:</label>
          <input type="date" name="fecha_ceremonia_acordada" value={formData.fecha_ceremonia_acordada} onChange={handleChange} className="input-form" />
        </div>

        {mostrarEvaluacionOral && (
          <div>
            <label className="label-form">Evaluación Oral:</label>
            <input type="text" name="evaluacion_oral" value={formData.evaluacion_oral} onChange={handleChange} className="input-form" />
          </div>
        )}

        <div className="md:col-span-2">
          <label className="label-form">Descripción:</label>
          <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} className="input-form" />
        </div>

        {esMatrimonio && (
          <>
            <div>
              <label className="label-form">Tipo de Matrimonio:</label>
              <input type="text" name="tipo_matrimonio" value={formData.tipo_matrimonio} onChange={handleChange} className="input-form" />
            </div>

            <div>
              <label className="label-form">Cónyuge:</label>
              <select name="id_conyuge" value={formData.id_conyuge} onChange={handleChange} className="input-form">
                <option value="">Seleccione</option>
                {conyuges.map(p => (
                  <option key={p.id_persona} value={p.id_persona}>
                    {p.nombre_completo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-form">Padrino:</label>
              <select name="id_padrino" value={formData.id_padrino} onChange={handleChange} className="input-form">
                <option value="">Seleccione</option>
                {padrinos.map(p => (
                  <option key={p.id_persona} value={p.id_persona}>
                    {p.nombre_completo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-form">Madrina:</label>
              <select name="id_madrina" value={formData.id_madrina} onChange={handleChange} className="input-form">
                <option value="">Seleccione</option>
                {madrinas.map(p => (
                  <option key={p.id_persona} value={p.id_persona}>
                    {p.nombre_completo}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="label-form">Observaciones Matrimonio:</label>
              <textarea name="observaciones_matrimonio" value={formData.observaciones_matrimonio} onChange={handleChange} className="input-form" />
            </div>
          </>
        )}

        <div className="md:col-span-2 flex justify-end gap-3 mt-4">
          <button type="submit" className="btn btn-primary">
            {editando ? 'Actualizar' : 'Registrar'}
          </button>
          {editando && (
            <button type="button" onClick={handleCancelarEdicion} className="btn btn-secondary">
              Cancelar
            </button>
          )}
          <button type="button" onClick={handleCerrar} className="btn btn-danger">
            Cerrar
          </button>
        </div>
      </form>

      <hr className="my-6 border-gray-200" />

      <h3 className="section-title">Inscripciones Registradas</h3>
      <input
        type="text"
        placeholder="Buscar por nombre..."
        className="input-form mb-4"
        onChange={(e) => {
          const filtro = e.target.value.toLowerCase();
          const filtradas = inscripciones.filter(i =>
            i.nombre_persona?.toLowerCase().includes(filtro)
          );
          setInscripciones(filtro === '' ? inscripciones : filtradas);
        }}
      />

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="table-th">Persona</th>
              <th className="table-th">Fecha Matrícula</th>
              <th className="table-th">Fecha Ceremonia</th>
              <th className="table-th">Evaluación Oral</th>
              <th className="table-th">Descripción</th>
              <th className="table-th">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {inscripciones.map(insc => (
              <tr key={insc.id_inscripcion} className="table-row-hover">
                <td className="table-td">{insc.nombre_persona}</td>
                <td className="table-td">{insc.fecha_matricula}</td>
                <td className="table-td">{insc.fecha_ceremonia_acordada}</td>
                <td className="table-td">{insc.evaluacion_oral}</td>
                <td className="table-td">{insc.descripcion}</td>
                <td className="table-td flex justify-center gap-2">
                  <button onClick={() => handleEditar(insc)} className="btn-icon-edit">Editar</button>
                  <button onClick={() => handleEliminar(insc.id_inscripcion)} className="btn-icon-delete">Eliminar</button>
                </td>
              </tr>
            ))}
            {inscripciones.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 py-4">No hay inscripciones registradas.</td>
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
