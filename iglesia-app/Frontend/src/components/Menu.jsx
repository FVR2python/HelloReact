import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Collapse } from 'react-bootstrap';
import cruzar from '../assets/cruzar.png';

function Menu({ usuario, setUsuario, showMenu = true, setShowMenu }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openModules, setOpenModules] = useState({});
  const dropdownRef = useRef();

  const cerrarSesion = () => {
    localStorage.removeItem('usuario');
    setUsuario(null);
    navigate('/');
  };

  const toggleDarkMode = () => {
    document.body.classList.toggle('dark');
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const toggleModule = (label) => {
    setOpenModules((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm === '') setOpenModules({});
  }, [searchTerm]);

  const cargo = usuario?.nombre_cargo?.toLowerCase() || '';

  const menuItems = [
    {
      label: 'Gestión de Sacramentos',
      icon: 'bi-cross',
      subItems: [
        { label: 'Inscripciones a sacramentos', path: '/sacramentos/inscripciones' },
        { label: 'Eventos sacramentales', path: '/sacramentos/eventos' },
        { label: 'Participantes de sacramentos', path: '/sacramentos/participantes' },
        { label: 'Certificados emitidos', path: '/sacramentos/actas' }
      ],
      visibleTo: ['administrador', 'colaborador', 'autoridad']
    },
    {
      label: 'Formación en Catequesis',
      icon: 'bi-book',
      subItems: [
        { label: 'Grupos de catequesis', path: '/catequesis/grupos' },
        { label: 'Clases programadas', path: '/catequesis/clases' },
        { label: 'Registro de asistencia', path: '/catequesis/asistencia' },
        { label: 'Evaluaciones', path: '/catequesis/evaluacion' }
      ],
      visibleTo: ['administrador', 'catequista']
    },
    {
      label: 'Celebraciones Litúrgicas',
      icon: 'bi-calendar-event',
      subItems: [
        { label: 'Eventos litúrgicos', path: '/liturgia/eventos' },
        { label: 'Participantes litúrgicos', path: '/liturgia/participantes' }
      ],
      visibleTo: ['administrador', 'colaborador', 'autoridad']
    },
    {
      label: 'Inventario Parroquial',
      icon: 'bi-box-seam',
      subItems: [
        { label: 'Objetos litúrgicos', path: '/inventario/objetos' },
        { label: 'Uso de objetos', path: '/inventario/uso' }
      ],
      visibleTo: ['administrador', 'colaborador']
    },
    {
      label: 'Tesorería Parroquial',
      icon: 'bi-cash-coin',
      subItems: [
        { label: 'Ingresos y egresos', path: '/finanzas/transacciones' },
        { label: 'Recibos de pago', path: '/finanzas/pagos-inscripcion' },
        { label: 'Gastos de mantenimiento', path: '/finanzas/egresos' },
        { label: 'Auditoría financiera', path: '/finanzas/auditoria' }
      ],
      visibleTo: ['administrador', 'autoridad']
    },
    {
      label: 'Administración de Usuarios',
      icon: 'bi-people',
      subItems: [
        { label: 'Registro de personas', path: '/admin/personas' },
        { label: 'Usuarios del sistema', path: '/admin/usuarios' },
        { label: 'Roles y permisos', path: '/admin/roles' },
        { label: 'Cargos parroquiales', path: '/admin/cargos' },
        { label: 'Clérigos registrados', path: '/admin/clerigos' },
        { label: 'Jerarquías eclesiales', path: '/admin/jerarquias' },
        { label: 'Asignación de roles', path: '/admin/asignacion' }
      ],
      visibleTo: ['administrador']
    },
    {
      label: 'Configuración del Sistema',
      icon: 'bi-gear',
      subItems: [
        { label: 'Parroquias registradas', path: '/config/parroquias' },
        { label: 'Sacramentos y precios', path: '/config/sacramentos' },
        { label: 'Tipos de operación', path: '/config/tipos-transaccion' }
      ],
      visibleTo: ['administrador']
    }
  ];

  const menuFiltrado = menuItems.filter(m => m.visibleTo.includes(cargo));

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-blue-600 text-white p-2 rounded-full shadow-lg"
        onClick={() => setShowMenu(!showMenu)}
      >
        <i className="bi bi-list text-xl"></i>
      </button>

      <aside className={`bg-white dark:bg-zinc-900 shadow-lg h-screen p-4 w-72 fixed top-0 left-0 z-40 transition-all duration-300 ease-in-out overflow-y-auto
        ${showMenu ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>

        <div className="flex justify-between items-center mb-5 border-b pb-2">
          <Link to="/menu" className="flex items-center gap-2 text-xl font-bold text-blue-600 dark:text-blue-400">
            <img src={cruzar} alt="Logo cruz" className="w-7 h-7 object-contain" />ParroquiApp
          </Link>
          <button onClick={() => setShowMenu(false)} className="md:hidden text-xl text-gray-600 dark:text-gray-300">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="mb-5">
          <div className="relative">
            <i className="bi bi-search absolute top-2.5 left-3 text-gray-400 dark:text-gray-500"></i>
            <input
              type="text"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm dark:bg-zinc-800 dark:text-gray-200 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Buscar "
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <ul className="space-y-3 text-sm">
          <li>
            <Link to="/menu" className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 text-gray-800 dark:text-gray-200">
              <i className="bi bi-house-door"></i> Inicio
            </Link>
          </li>

          <li className="text-xs uppercase text-gray-500 dark:text-gray-400 mt-4 mb-1">Módulos</li>

          {menuFiltrado.map((mod) => {
            const matches = mod.label.toLowerCase().includes(searchTerm.toLowerCase());
            const filteredSubs = mod.subItems.filter(sub => sub.label.toLowerCase().includes(searchTerm.toLowerCase()));
            if (!matches && filteredSubs.length === 0) return null;

            return (
              <li key={mod.label}>
                <button
                  onClick={() => toggleModule(mod.label)}
                  className="w-full flex justify-between items-center py-1.5 hover:text-blue-600 dark:hover:text-blue-400 text-gray-800 dark:text-gray-200 focus:outline-none"
                >
                  <span className="flex items-center gap-2">
                    <i className={`bi ${mod.icon}`}></i> {mod.label}
                  </span>
                  <i className={`bi ${openModules[mod.label] ? 'bi-caret-up-fill' : 'bi-caret-down-fill'}`}></i>
                </button>
                <Collapse in={openModules[mod.label]}>
                  <ul className="ml-6 mt-2 flex flex-col gap-1.5 border-l-4 border-blue-500/20 dark:border-blue-400/30 pl-3">
                    {(matches ? mod.subItems : filteredSubs).map((sub) => (
                      <li key={sub.label} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        <Link
                          to={sub.path}
                          className="hover:text-blue-600 dark:hover:text-blue-400 transition text-sm leading-snug"
                        >
                          {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Collapse>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-zinc-700" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="w-full flex justify-between items-center py-2 px-3 rounded-lg bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition text-gray-800 dark:text-gray-200"
          >
            <span className="flex items-center gap-2">
              <i className="bi bi-person-circle text-xl"></i>
              <span className="text-sm font-medium">{usuario?.nombres || 'Usuario'}</span>
            </span>
            <i className={`bi ${dropdownOpen ? 'bi-caret-up-fill' : 'bi-caret-down-fill'}`}></i>
          </button>

          {dropdownOpen && (
            <ul className="mt-2 text-sm space-y-1">
              <li>
                <Link to="/perfil" className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded">
                  <i className="bi bi-person"></i> Mi perfil
                </Link>
              </li>
              <li>
                <button onClick={toggleDarkMode} className="w-full text-left flex items-center gap-2 px-3 py-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded">
                  <i className="bi bi-moon"></i> Modo oscuro
                </button>
              </li>
              <li>
                <button onClick={cerrarSesion} className="w-full text-left flex items-center gap-2 px-3 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-600 dark:hover:text-white rounded">
                  <i className="bi bi-box-arrow-right"></i> Salir
                </button>
              </li>
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}

export default Menu;
