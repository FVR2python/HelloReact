import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function ReporteSacramentos({ usuario }) {
  const [inscripciones, setInscripciones] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/inscripciones')
      .then(res => res.json())
      .then(data => setInscripciones(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error al cargar inscripciones:', err));
  }, []);

const exportarPDF = () => {
  const doc = new jsPDF();
  const fechaActual = new Date();
  const fechaFormateada = fechaActual.toLocaleDateString();
  const horaFormateada = fechaActual.toLocaleTimeString();

  // Logo (si tienes uno base64 disponible)
  // doc.addImage(logoBase64, 'PNG', 14, 10, 20, 20);

  // Título
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 80);
  doc.text('Parroquia San Antonio', 105, 20, null, null, 'center');

  doc.setFontSize(14);
  doc.setTextColor(60, 60, 60);
  doc.text('Reporte de Inscripciones Sacramentales', 105, 28, null, null, 'center');

  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Fecha de emisión: ${fechaFormateada} - ${horaFormateada}`, 105, 34, null, null, 'center');

  // Línea decorativa
  doc.setDrawColor(66, 133, 244);
  doc.line(20, 38, 190, 38);

  // Tabla de datos
  autoTable(doc, {
    startY: 44,
    head: [[
      '#', 'Sacramento', 'Persona', 'Fecha',
      'Padrino', 'Madrina', 'Cónyuge',
      'Precio (S/.)', 'Observaciones'
    ]],
    body: inscripciones.map((i, idx) => [
      idx + 1,
      i.nombre_sacramento,
      i.nombre_persona,
      i.fecha_matricula,
      i.nombre_padrino,
      i.nombre_madrina,
      i.nombre_conyuge,
      i.precio_sacramento,
      i.observaciones || '-'
    ]),
    theme: 'striped',
    styles: {
      fontSize: 9,
      cellPadding: 3,
      halign: 'center',
    },
    headStyles: {
      fillColor: [33, 91, 153],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [240, 248, 255]
    },
    margin: { top: 44 }
  });

  // Pie de página
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`Página ${i} de ${pageCount}`, 180, 290);
    doc.text(`Generado por: ${usuario?.nombres || 'Usuario'}`, 14, 290);
  }

  doc.save('reporte_inscripciones_sacramentales.pdf');
};



  return (
    <div className="container mt-4">
      <h2 className="text-xl font-bold mb-4 text-blue-700">Reporte de Inscripciones Sacramentales</h2>

      <button onClick={exportarPDF} className="btn btn-primary mb-3">
        <i className="bi bi-file-earmark-pdf"></i> Exportar a PDF
      </button>

      <div className="overflow-auto">
        <table className="table table-bordered text-sm">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Sacramento</th>
              <th>Persona</th>
              <th>Fecha</th>
              <th>Padrino</th>
              <th>Madrina</th>
              <th>Conyuge</th>
              <th>Precio (S/.)</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {inscripciones.map((i, idx) => (
              <tr key={i.id_inscripcion}>
                <td>{idx + 1}</td>
                <td>{i.nombre_sacramento}</td>
                <td>{i.nombre_persona}</td>
                <td>{i.fecha_matricula}</td>
                <td>{i.nombre_padrino}</td>
                <td>{i.nombre_madrina}</td>
                <td>{i.nombre_conyuge}</td>
                <td>{i.precio_sacramento}</td>
                <td>{i.observaciones || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReporteSacramentos;
