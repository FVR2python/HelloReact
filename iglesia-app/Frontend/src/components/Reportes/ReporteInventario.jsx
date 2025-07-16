import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // ✅ Este sí lo usamos

const ReporteInventario = () => {
  const [inventario, setInventario] = useState([]);
  const [usos, setUsos] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/objetos_liturgicos')
      .then(res => res.json())
      .then(data => setInventario(data))
      .catch(err => console.error('Error al cargar inventario', err));

    fetch('http://localhost:5000/uso_objetos')
      .then(res => res.json())
      .then(data => setUsos(data))
      .catch(err => console.error('Error al cargar usos', err));
  }, []);

  const generarPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Reporte de Inventario Litúrgico', 14, 15);
    doc.setFontSize(11);
    doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 23);

    // 📌 Tabla 1: Objetos Litúrgicos
    autoTable(doc, {
      startY: 28,
      head: [[
        'Nombre', 'Categoría', 'Estado', 'F. Adquisición', 'F. Revisión', 'Parroquia'
      ]],
      body: inventario.map(obj => [
        obj.nombre_invent,
        obj.categoria_invent,
        obj.estado,
        obj.fecha_adquisicion,
        obj.fecha_ultima_revision,
        obj.nombre_prrq
      ]),
      theme: 'grid',
      headStyles: { fillColor: [63, 81, 181], textColor: 255, halign: 'center' },
      styles: { fontSize: 9, cellPadding: 3 },
    });

    // 📌 Tabla 2: Uso de Objetos
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [[
        'Objeto', 'Tipo Evento', 'Evento Asociado', 'Fecha Evento', 'Estado Post-Uso', 'Observación'
      ]],
      body: usos.map(u => [
        u.nombre_invent,
        u.tipo_evento,
        u.nombre_evento || 'Sin evento',
        u.fecha_evento || 'Sin fecha',
        u.estado_post_uso,
        u.observacion || '-'
      ]),
      theme: 'grid',
      headStyles: { fillColor: [0, 150, 136], textColor: 255, halign: 'center' },
      styles: { fontSize: 9, cellPadding: 3 },
    });

    doc.save('reporte_inventario.pdf');
  };

  return (
    <div className="p-6">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Reporte de Inventario Litúrgico</h2>
        <button
          onClick={generarPDF}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-md"
        >
          Descargar PDF
        </button>
      </div>
    </div>
  );
};

export default ReporteInventario;
