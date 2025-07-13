import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import PerfilUsuario from './components/PerfilUsuario';
import Login from './components/login';
import Layout from './components/Layout';
import Inicio from './components/Inicio';

// Módulos principales
import ModuloSacramentos from './components/ModuloSacramentos';
import Usuarios from './components/Usuarios';
import Cargos from './components/Cargos';
import Roles from './components/Roles';
import PersonasRoles from './components/PersonasRoles';
import Clerigos from './components/Clerigos';
import Jerarquias from './components/Jerarquias';
import Personas from './components/Personas';

// Catequesis
import GruposCatequesis from './components/GruposCatequesis';
import ClasesCatequesis from './components/ClasesCatequesis';
import AsistenciaCatequesis from './components/AsistenciaCatequesis';

// Sacramentos
import InscripcionesSacramentales from './components/InscripcionesSacramentales';
import EventosSacramentales from './components/EventosSacramentales';
import Actas from './components/Actas';
import ParticipantesEventosSacramentales from './components/ParticipantesEventosSacramentales';

// Liturgia e inventario
import EventosLiturgicos from './components/EventosLiturgicos';
import ParticipantesEventosLiturgicos from './components/ParticipantesEventosLiturgicos';
import ObjetosLiturgicos from './components/ObjetosLiturgicos';
import UsoObjetos from './components/UsoObjetos';

// Tesorería
import Transacciones from './components/Transacciones';
import RecibosPago from './components/RecibosPago';
import EgresosMantenimiento from './components/EgresosMantenimiento';
import AuditoriaTransacciones from './components/AuditoriaTransacciones';

// Configuración
import TiposTransacciones from './components/TiposTransacciones';
import SacramentosPrecios from './components/SacramentosPrecios';

import './css/style.css';


function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
    setCargando(false);
  }, []);

  if (cargando) {
    return <div className="p-6 text-center text-gray-500">Cargando sistema...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route
          path="/"
          element={
            usuario ? <Navigate to="/menu" /> : <Login setUsuario={setUsuario} />
          }
        />

        {usuario ? (
          <Route element={<Layout usuario={usuario} setUsuario={setUsuario} />}>
            <Route path="/menu" element={<Inicio usuario={usuario} />} />

            {/* Sacramentos */}
            <Route path="/sacramentos/*" element={<ModuloSacramentos />} />
            <Route path="/sacramentos/inscripciones" element={<InscripcionesSacramentales />} />
            <Route path="/sacramentos/eventos" element={<EventosSacramentales />} />
            <Route path="/sacramentos/actas" element={<Actas />} />
            <Route path="/sacramentos/participantes" element={<ParticipantesEventosSacramentales />} />

            {/* Catequesis */}
            <Route path="/catequesis/grupos" element={<GruposCatequesis />} />
            <Route path="/catequesis/clases" element={<ClasesCatequesis />} />
            <Route path="/catequesis/asistencia" element={<AsistenciaCatequesis />} />

            {/* Liturgia e inventario */}
            <Route path="/liturgia/eventos" element={<EventosLiturgicos />} />
            <Route path="/liturgia/participantes" element={<ParticipantesEventosLiturgicos />} />
            <Route path="/inventario/objetos" element={<ObjetosLiturgicos />} />
            <Route path="/inventario/uso" element={<UsoObjetos />} />

            {/* Tesorería */}
            <Route path="/finanzas/transacciones" element={<Transacciones />} />
            <Route path="/finanzas/pagos-inscripcion" element={<RecibosPago />} />
            <Route path="/finanzas/egresos" element={<EgresosMantenimiento />} />
            <Route path="/finanzas/auditoria" element={<AuditoriaTransacciones />} />

            {/* Administración */}
            <Route path="/admin/personas" element={<Personas />} />
            <Route path="/admin/usuarios" element={<Usuarios />} />
            <Route path="/admin/cargos" element={<Cargos />} />
            <Route path="/admin/roles" element={<Roles />} />
            <Route path="/admin/asignacion" element={<PersonasRoles />} />
            <Route path="/admin/clerigos" element={<Clerigos />} />
            <Route path="/admin/jerarquias" element={<Jerarquias />} />

            {/* Configuración */}
            <Route path="/config/sacramentos" element={<SacramentosPrecios />} />
            <Route path="/config/tipos-transaccion" element={<TiposTransacciones />} />

            {/* Perfil */}
            <Route path="/perfil" element={<PerfilUsuario usuario={usuario} />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/" />} />
        )}
      </Routes>
    </div>
  );
}

export default App;
