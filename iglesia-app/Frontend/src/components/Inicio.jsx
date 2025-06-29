import React from 'react';

function Inicio({ usuario }) {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Encabezado */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-blue-700 mb-1">
          Bienvenido, {usuario?.nombres || 'Usuario'}
        </h2>
        <p className="text-gray-500 text-sm">
          Parroquia San Antonio de Padua - Huaraz
        </p>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Tarjeta */}
        <div className="bg-blue-600 text-white p-5 rounded-2xl shadow hover:shadow-lg transition flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider">Eventos litúrgicos esta semana</p>
            <h3 className="text-3xl font-bold mt-1">4</h3>
          </div>
          <i className="bi bi-calendar2-week-fill text-4xl opacity-80"></i>
        </div>

        <div className="bg-green-600 text-white p-5 rounded-2xl shadow hover:shadow-lg transition flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider">Sacramentos programados este mes</p>
            <h3 className="text-3xl font-bold mt-1">12</h3>
          </div>
          <i className="bi bi-bookmark-check-fill text-4xl opacity-80"></i>
        </div>

        <div className="bg-cyan-600 text-white p-5 rounded-2xl shadow hover:shadow-lg transition flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider">Catequizandos activos</p>
            <h3 className="text-3xl font-bold mt-1">35</h3>
          </div>
          <i className="bi bi-people-fill text-4xl opacity-80"></i>
        </div>

        <div className="bg-yellow-400 text-gray-900 p-5 rounded-2xl shadow hover:shadow-lg transition flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider">Objetos litúrgicos disponibles</p>
            <h3 className="text-3xl font-bold mt-1">128</h3>
          </div>
          <i className="bi bi-box-seam text-4xl opacity-80"></i>
        </div>

        <div className="bg-gray-800 text-white p-5 rounded-2xl shadow hover:shadow-lg transition flex items-center justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <p className="text-xs uppercase tracking-wider">Ingresos registrados este mes</p>
            <h3 className="text-3xl font-bold mt-1">S/ 4800</h3>
          </div>
          <i className="bi bi-cash-stack text-4xl opacity-80"></i>
        </div>
      </div>
    </div>
  );
}

export default Inicio;
