import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useEffect, useState } from 'react';

const ReporteCelebraciones = () => {
  const [eventos, setEventos] = useState([]);
  const [participantes, setParticipantes] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/eventos_liturgicos')
      .then(res => res.json())
      .then(data => setEventos(data))
      .catch(err => console.error('Error al cargar eventos:', err));

    fetch('http://localhost:5000/api/participantes-liturgicos')
      .then(res => res.json())
      .then(data => setParticipantes(data))
      .catch(err => console.error('Error al cargar participantes:', err));
  }, []);

  const generarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.text('Parroquia San Antonio', 15, 15);
    doc.setFontSize(13);
    doc.text('Reporte de Celebraciones Litúrgicas', 15, 25);
    doc.setFontSize(10);
    doc.text(`Fecha de emisión: ${new Date().toLocaleString()}`, 15, 32);

    let startY = 40;

    eventos.forEach((evento, index) => {
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Evento ${index + 1}: ${evento.nombre}`, 15, startY);

      autoTable(doc, {
        startY: startY + 5,
        head: [[
          'Fecha', 'Hora Inicio', 'Hora Fin', 'Parroquia', 'Observaciones'
        ]],
        body: [[
          evento.fecha || '---',
          evento.hora_inicio || '---',
          evento.hora_fin || '---',
          evento.nombre_parroquia || '---',
          evento.observacion || '---'
        ]],
        headStyles: {
          fillColor: [52, 152, 219],
          halign: 'center',
        },
        styles: { fontSize: 9, cellPadding: 3 },
      });

      const participantesEvento = participantes.filter(p => p.id_evento_liturgico === evento.id_evento);

      if (participantesEvento.length > 0) {
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 5,
          head: [['Participante', 'Rol']],
          body: participantesEvento.map(p => [
            `${p.nombres} ${p.apellido1}`,
            p.nombre_rol
          ]),
          headStyles: {
            fillColor: [155, 89, 182],
            halign: 'center'
          },
          styles: { fontSize: 9, cellPadding: 3 }
        });

        startY = doc.lastAutoTable.finalY + 10;
      } else {
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('No hay participantes registrados.', 15, doc.lastAutoTable.finalY + 8);
        startY = doc.lastAutoTable.finalY + 12;
      }
    });

    doc.save('Reporte_Celebraciones_Liturgicas.pdf');
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-2xl font-semibold text-center text-gray-800 mb-2">
        Reporte de Celebraciones Litúrgicas
      </h1>
      <p className="text-sm text-center text-gray-500 mb-6">
        Genera un reporte detallado de eventos y sus participantes.
      </p>

      <div className="flex justify-center">
        <button
          onClick={generarPDF}
          className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-2 rounded-full shadow-md transition duration-200"
        >
          Descargar PDF
        </button>
      </div>
    </div>
  );
};

export default ReporteCelebraciones;
