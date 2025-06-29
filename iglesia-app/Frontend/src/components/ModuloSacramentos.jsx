import { Routes, Route, Link } from 'react-router-dom';

function ModuloSacramentos() {
  return (
    <div className="container mt-3">
      <h4>Módulo de Sacramentos</h4>

      <nav className="nav nav-pills mb-3">
        <Link className="nav-link" to="inscripciones">Inscripciones</Link>

      </nav>

      <Routes>
        <Route path="*" element={<p>Selecciona una opción del menú sacramental.</p>} />
      </Routes>
    </div>
  );
}

export default ModuloSacramentos;