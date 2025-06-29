import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Menu from './Menu';

function Layout({ usuario, setUsuario }) {
  useEffect(() => {
    document.body.classList.remove('bg-dark', 'text-light', 'text-dark', 'bg-black');
    document.documentElement.classList.remove('dark');
  }, []);

  return (
    <div className="flex bg-gray-100 dark:bg-neutral-900 transition-colors duration-300 min-h-screen overflow-hidden">
      {/* Menú lateral */}
      <Menu usuario={usuario} setUsuario={setUsuario} />

      {/* Contenedor principal */}
      <main className="ml-64 w-full max-h-screen overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1400px] mx-auto bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl shadow ring-1 ring-black/5 p-6 sm:p-8 transition-all duration-300">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
