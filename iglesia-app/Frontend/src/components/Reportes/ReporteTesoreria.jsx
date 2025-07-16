import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ReporteTesoreria = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [recibos, setRecibos] = useState([]);
  const [egresos, setEgresos] = useState([]);

  useEffect(() => {
    fetch('/transacciones')
      .then(res => res.json())
      .then(data => setTransacciones(data))
      .catch(err => console.error('Error al obtener transacciones:', err));

    fetch('/tipos_transacciones')
      .then(res => res.json())
      .then(data => setTipos(data))
      .catch(err => console.error('Error al obtener tipos:', err));

    fetch('/recibos_pago')
      .then(res => res.json())
      .then(data => setRecibos(data))
      .catch(err => console.error('Error al obtener recibos:', err));

    fetch('/egresos_mantenimiento')
      .then(res => res.json())
      .then(data => setEgresos(data))
      .catch(err => console.error('Error al obtener egresos:', err));
  }, []);

  const generarPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Reporte Tesorería Parroquial', 14, 20);

    // 🧾 TRANSACCIONES
    autoTable(doc, {
      startY: 30,
      head: [['#', 'Monto Total', 'Estado', 'Fecha', 'Comprobante', 'Descripción', 'Parroquia', 'Tipo']],
      body: transacciones.map((t, i) => [
        i + 1,
        `S/ ${(Number(t.monto_total) || 0).toFixed(2)}`,
        t.estado,
        t.fecha_transaccion,
        t.num_comprobante,
        t.descripcion,
        t.nombre_parroquia,
        t.nombre_tipo,
      ]),
      theme: 'grid',
      headStyles: { fillColor: [52, 152, 219] },
    });

    // 🧾 TIPOS DE TRANSACCIONES
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['#', 'Nombre', 'Descripción']],
      body: tipos.map((t, i) => [
        i + 1,
        t.nombre,
        t.descripcion,
      ]),
      theme: 'grid',
      headStyles: { fillColor: [39, 174, 96] },
    });

    // 🧾 RECIBOS DE PAGO
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['#', 'Persona', 'Sacramento', 'Transacción', 'Adelanto', 'Saldo', 'Vencimiento']],
      body: recibos.map((r, i) => [
        i + 1,
        `${r.nombres} ${r.apellido1} ${r.apellido2}`,
        r.nombre_sacrament,
        r.descripcion_transaccion,
        `S/ ${(Number(r.monto_adelanto) || 0).toFixed(2)}`,
        `S/ ${(Number(r.saldo_pendiente) || 0).toFixed(2)}`,
        r.fecha_vencimiento,
      ]),
      theme: 'grid',
      headStyles: { fillColor: [241, 196, 15] },
    });

    // 🧾 EGRESOS DE MANTENIMIENTO
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['#', 'Proveedor', 'Descripción', 'Fecha', 'Inventario', 'Transacción', 'Monto', 'Estado']],
      body: egresos.map((e, i) => [
        i + 1,
        e.proveedor,
        e.descripcion,
        e.fecha_egreso,
        e.nombre_invent,
        e.descripcion_transaccion,
        `S/ ${(Number(e.monto_total) || 0).toFixed(2)}`,
        e.estado,
      ]),
      theme: 'grid',
      headStyles: { fillColor: [231, 76, 60] },
    });

    doc.save('reporte_tesoreria.pdf');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold text-center mb-6">Reporte Tesorería Parroquial</h2>
      <button
        onClick={generarPDF}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow-md"
      >
        Generar PDF
      </button>
    </div>
  );
};

export default ReporteTesoreria;
