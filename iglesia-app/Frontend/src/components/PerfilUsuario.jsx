import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';

function PerfilUsuario({ usuario }) {
  const [persona, setPersona] = useState(null);
  const [detallesCargo, setDetallesCargo] = useState(null);

  useEffect(() => {
    if (!usuario || !usuario.id_persona || !usuario.id_cargo) return;

    const obtenerDatos = async () => {
      try {
        const resPersona = await fetch(`http://localhost:5000/personas/${usuario.id_persona}`);
        if (!resPersona.ok) throw new Error("Error al obtener datos de la persona");
        const dataPersona = await resPersona.json();
        setPersona(dataPersona);

        const resCargo = await fetch(`http://localhost:5000/perfil/cargo/${usuario.id_cargo}/persona/${usuario.id_persona}`);
        if (!resCargo.ok) throw new Error("Error al obtener detalles del cargo");
        const dataCargo = await resCargo.json();
        setDetallesCargo(dataCargo);
      } catch (error) {
        console.error("Error al cargar perfil:", error);
      }
    };

    obtenerDatos();
  }, [usuario]);

  if (!usuario || !persona) {
    return <div className="p-4">Cargando perfil...</div>;
  }

  const calcularEdad = (fechaNacimiento) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const editarPerfil = () => alert('Función para editar perfil próximamente');
  const cambiarContrasena = () => alert('Función para cambiar contraseña próximamente');

  const generarPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Perfil de Usuario", 105, 20, null, null, "center");

    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    let y = 35;
    const espacio = 10;

    const campos = [
      ["Nombre:", `${persona.nombres} ${persona.apellido1} ${persona.apellido2}`],
      ["DNI:", persona.dni],
      ["Email:", persona.email],
      ["Teléfono:", persona.telefono],
      ["Dirección:", persona.direccion],
      ["Cargo:", usuario.nombre_cargo],
      ["Edad:", `${calcularEdad(persona.fecha_nacimiento)} años`],
    ];

    campos.forEach(([label, valor]) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(valor), 60, y);
      y += espacio;
    });

    doc.save(`Perfil_${persona.nombres}.pdf`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-6 mb-6">
        <div className="relative">
          <img
            src={persona.foto || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
            alt="Perfil"
            className="w-24 h-24 rounded-full object-cover border shadow"
          />
          <button
            className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full"
            title="Cambiar foto próximamente"
          >
            <i className="bi bi-camera-fill"></i>
          </button>
        </div>
        <div>
          <h2 className="text-xl font-semibold">{persona.nombres} {persona.apellido1} {persona.apellido2}</h2>
          <p className="text-sm text-gray-600">{usuario.nombre_cargo}</p>
          <p className="text-sm text-gray-600">Edad: {calcularEdad(persona.fecha_nacimiento)} años</p>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={editarPerfil} className="bg-gray-200 text-sm px-3 py-1 rounded flex items-center gap-1">
            <i className="bi bi-pencil"></i> Editar
          </button>
          <button onClick={cambiarContrasena} className="bg-gray-200 text-sm px-3 py-1 rounded flex items-center gap-1">
            <i className="bi bi-lock-fill"></i> Cambiar Contraseña
          </button>
          <button onClick={generarPDF} className="bg-gray-200 text-sm px-3 py-1 rounded flex items-center gap-1">
            <i className="bi bi-download"></i> Descargar PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow dark:bg-zinc-800 dark:text-white">
          <h3 className="font-semibold mb-2 border-b pb-1">Datos de contacto</h3>
          <p><strong>DNI:</strong> {persona.dni}</p>
          <p><strong>Email:</strong> {persona.email}</p>
          <p><strong>Teléfono:</strong> {persona.telefono}</p>
          <p><strong>Dirección:</strong> {persona.direccion}</p>
        </div>

        {usuario.nombre_cargo === 'Catequista' && detallesCargo && (
          <div className="bg-white p-4 rounded shadow col-span-2 dark:bg-zinc-800 dark:text-white">
            <h3 className="font-semibold mb-2 border-b pb-1">Grupos de Catequesis a cargo</h3>
            <ul className="list-disc list-inside">
              {detallesCargo.grupos.map((g, i) => (
                <li key={i}>{g.nombre_grupo} ({g.fecha_inicio} - {g.fecha_fin})</li>
              ))}
            </ul>
          </div>
        )}

        {usuario.nombre_cargo === 'Sacerdote' && detallesCargo && (
          <div className="bg-white p-4 rounded shadow col-span-2 dark:bg-zinc-800 dark:text-white">
            <h3 className="font-semibold mb-2 border-b pb-1">Parroquias asignadas</h3>
            <ul className="list-disc list-inside">
              {detallesCargo.parroquias.map((p, i) => (
                <li key={i}>{p.nombre_prrq} desde {p.fecha_inicio}</li>
              ))}
            </ul>
          </div>
        )}

        {usuario.nombre_cargo === 'Colaborador' && detallesCargo && (
          <div className="bg-white p-4 rounded shadow col-span-2 dark:bg-zinc-800 dark:text-white">
            <h3 className="font-semibold mb-2 border-b pb-1">Transacciones registradas</h3>
            <ul className="list-disc list-inside">
              {detallesCargo.transacciones.map((t, i) => (
                <li key={i}>{t.num_comprobante} - {t.fecha_transaccion} - S/. {t.monto}</li>
              ))}
            </ul>
          </div>
        )}

        {usuario.nombre_cargo === 'Administrador' && (
          <div className="bg-white p-4 rounded shadow col-span-2 dark:bg-zinc-800 dark:text-white">
            <h3 className="font-semibold mb-2 border-b pb-1">Resumen general</h3>
            <p>Acceso completo al sistema. Este perfil puede ver toda la información disponible.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PerfilUsuario;
