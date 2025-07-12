import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import ModalGestionInscripcion from './ModalGestionInscripcion';

function InscripcionesSacramentales() {
  const [sacramentos, setSacramentos] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [sacramentoActivo, setSacramentoActivo] = useState(null);

  useEffect(() => {
    obtenerSacramentos();
  }, []);

  const obtenerSacramentos = async () => {
    try {
      const res = await fetch('http://localhost:5000/sacramentos');
      const data = await res.json();
      setSacramentos(data);
    } catch {
      setSacramentos([]);
      Swal.fire('Error', 'No se pudieron cargar los sacramentos', 'error');
    }
  };

  const abrirModal = (sacramento) => {
    setSacramentoActivo(sacramento);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setSacramentoActivo(null);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Inscripciones Sacramentales</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {sacramentos.map((s) => (
          <div
            key={s.id_sacramento}
            className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition"
          >
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">{s.nombre_sacrament}</h3>
              <p className="text-sm text-gray-600">{s.descripcion || 'Sin descripción'}</p>
            </div>
            <button
              onClick={() => abrirModal(s)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Gestionar inscripción
            </button>
          </div>
        ))}
      </div>

      {modalAbierto && sacramentoActivo && (
        <ModalGestionInscripcion
          sacramento={sacramentoActivo}
          onClose={cerrarModal}
        />
      )}
    </div>
  );
}

export default InscripcionesSacramentales;
