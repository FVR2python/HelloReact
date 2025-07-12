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
    <div className="space-y-6 p-4 fadeIn">
      <div className="card">
        <h2 className="text-xl font-bold text-blue-700 mb-4">
          Inscripciones Sacramentales
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {sacramentos.length > 0 ? (
            sacramentos.map((s) => (
              <div
                key={s.id_sacramento}
                className="bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-blue-100 rounded-2xl p-6 shadow hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-blue-800 mb-1">
                    {s.nombre_sacrament}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {s.descripcion || 'Sin descripción'}
                  </p>
                </div>
                <button
                  onClick={() => abrirModal(s)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Gestionar inscripción
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm col-span-full text-center">
              No hay sacramentos registrados.
            </p>
          )}
        </div>
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
