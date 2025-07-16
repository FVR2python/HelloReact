import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function ReporteCatequesis() {
  const [grupos, setGrupos] = useState([]);
  const [clases, setClases] = useState([]);
  const [asistencias, setAsistencias] = useState([]);

  useEffect(() => {
    obtenerDatos();
  }, []);

  const obtenerDatos = async () => {
    try {
      const [resGrupos, resClases, resAsistencias] = await Promise.all([
        fetch('http://localhost:5000/grupos-catequesis'),
        fetch('http://localhost:5000/clases-catequesis'),
        fetch('http://localhost:5000/asistencias')
      ]);

      const dataGrupos = await resGrupos.json();
      const dataClases = await resClases.json();
      const dataAsistencias = await resAsistencias.json();

      setGrupos(dataGrupos);
      setClases(dataClases);
      setAsistencias(dataAsistencias);
    } catch (error) {
      console.error('Error al obtener los datos:', error);
    }
  };

  const generarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Reporte de Catequesis', 105, 15, null, null, 'center');
    doc.setFontSize(12);
    doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 25);

    // Tabla de Grupos
  // Tabla de Grupos - Color azul suave
autoTable(doc, {
  startY: 35,
  head: [['Grupo', 'Sacramento', 'Parroquia', 'Inicio', 'Fin']],
  body: grupos.map(g => [
    g.nombre_grupo,
    g.nombre_sacramento,
    g.nombre_parroquia,
    g.fecha_inicio,
    g.fecha_fin
  ]),
  theme: 'grid',
  headStyles: {
    fillColor: [52, 152, 219],
    textColor: 255,
    halign: 'center',
    fontStyle: 'bold',
  },
  bodyStyles: {
    halign: 'center',
    fontSize: 10,
  },
  styles: {
    cellPadding: 3,
    lineColor: 200,
    lineWidth: 0.5,
  }
});

// Tabla de Clases - Verde
autoTable(doc, {
  startY: doc.lastAutoTable.finalY + 12,
  head: [['Tema', 'Fecha', 'Hora Inicio', 'Hora Fin', 'Grupo']],
  body: clases.map(c => [
    c.tema,
    c.fecha,
    c.hora_inicio,
    c.hora_fin,
    c.nombre_grupo || 'N/A'
  ]),
  theme: 'grid',
  headStyles: {
    fillColor: [46, 204, 113],
    textColor: 255,
    halign: 'center',
    fontStyle: 'bold'
  },
  bodyStyles: {
    halign: 'center',
    fontSize: 10
  },
  styles: {
    cellPadding: 3,
    lineColor: 200,
    lineWidth: 0.5,
  }
});

// Tabla de Asistencias - Púrpura
autoTable(doc, {
  startY: doc.lastAutoTable.finalY + 12,
  head: [['Catequizando', 'Sacramento', 'Fecha Clase', 'Tema', 'Asistió']],
  body: asistencias.map(a => [
    a.catequizando,
    a.sacramento,
    a.fecha,
    a.tema,
    a.asistio ? '✅ Sí' : '❌ No'
  ]),
  theme: 'grid',
  headStyles: {
    fillColor: [155, 89, 182],
    textColor: 255,
    halign: 'center',
    fontStyle: 'bold'
  },
  bodyStyles: {
    halign: 'center',
    fontSize: 10
  },
  styles: {
    cellPadding: 3,
    lineColor: 200,
    lineWidth: 0.5,
  }
});

    // Tabla de Clases
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Tema', 'Fecha', 'Hora Inicio', 'Hora Fin', 'Grupo']],
      body: clases.map(c => [
        c.tema,
        c.fecha,
        c.hora_inicio,
        c.hora_fin,
        c.nombre_grupo || 'N/A'
      ]),
      theme: 'grid',
      headStyles: { fillColor: [39, 174, 96] }
    });

    // Tabla de Asistencias
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Catequizando', 'Sacramento', 'Fecha Clase', 'Tema', 'Asistió']],
      body: asistencias.map(a => [
        a.catequizando,
        a.sacramento,
        a.fecha,
        a.tema,
        a.asistio ? 'Sí' : 'No'
      ]),
      theme: 'grid',
      headStyles: { fillColor: [142, 68, 173] }
    });

    doc.save('Reporte_Catequesis.pdf');
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-center mb-6 text-blue-800">📘 Reporte de Catequesis</h2>

      <div className="flex justify-center mb-6">
        <button
          onClick={generarPDF}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300"
        >
          📄 Generar PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Grupos */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-lg font-bold text-blue-700 mb-3">📌 Grupos</h3>
          <ul className="text-sm space-y-2">
            {grupos.map((g, idx) => (
              <li key={idx}>
                <strong>{g.nombre_grupo}</strong> | {g.nombre_sacramento} - {g.nombre_parroquia}<br />
                🗓️ {g.fecha_inicio} → {g.fecha_fin}
              </li>
            ))}
          </ul>
        </div>

        {/* Clases */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-lg font-bold text-green-700 mb-3">📖 Clases</h3>
          <ul className="text-sm space-y-2">
            {clases.map((c, idx) => (
              <li key={idx}>
                <strong>{c.tema}</strong> - {c.nombre_grupo || 'N/A'}<br />
                🗓️ {c.fecha} ⏰ {c.hora_inicio} - {c.hora_fin}
              </li>
            ))}
          </ul>
        </div>

        {/* Asistencias */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-lg font-bold text-purple-700 mb-3">✅ Asistencias</h3>
          <ul className="text-sm space-y-2">
            {asistencias.map((a, idx) => (
              <li key={idx}>
                👤 {a.catequizando} - {a.sacramento}<br />
                📆 {a.fecha} ({a.tema}) → {a.asistio ? '✅ Asistió' : '❌ No asistió'}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ReporteCatequesis;
