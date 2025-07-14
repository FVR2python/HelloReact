import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import ModalGestionInscripcion from './ModalGestionInscripcion';
import { FaChurch } from 'react-icons/fa'; // Ícono para tarjetas

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
      if (!res.ok) throw new Error('Error al cargar sacramentos');
      const data = await res.json();
      setSacramentos(data);
    } catch (error) {
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
    <div className="p-4 space-y-6 fadeIn bg-gradient-to-br from-blue-50 via-purple-50 to-white min-h-screen">
      <div className="card">
        <h2 className="text-2xl font-bold text-indigo-700 mb-6 flex items-center gap-2">
          <FaChurch className="text-blue-600" />
          Inscripciones Sacramentales
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {sacramentos.length > 0 ? (
            sacramentos.map((s) => (
              <div
                key={s.id_sacramento}
                className="bg-white rounded-2xl border border-blue-100 shadow-lg hover:shadow-xl p-6 flex flex-col justify-between transition-all duration-300"
              >
                <div>
                  <h3 className="text-lg font-semibold text-indigo-800 mb-1">
                    {s.nombre_sacrament}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {s.descripcion || 'Sin descripción'}
                  </p>
                </div>
                <button
                  onClick={() => abrirModal(s)}
                  className="mt-auto w-full py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Gestionar inscripción
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">
              No hay sacramentos registrados.
            </div>
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
