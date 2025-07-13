import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';

function PerfilUsuario({ usuario }) {
  const [persona, setPersona] = useState(null);
  const [detallesCargo, setDetallesCargo] = useState(null);
  const [fotoPerfil, setFotoPerfil] = useState(usuario.foto || '');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formEdicion, setFormEdicion] = useState({});
  const [mostrarPasswordModal, setMostrarPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ actual: '', nueva: '', confirmar: '' });

  useEffect(() => {
    if (!usuario || !usuario.id_usuario) return;

    const obtenerDatos = async () => {
      try {
        const resUsuario = await fetch(`http://localhost:5000/usuarios/${usuario.id_usuario}`);
        if (!resUsuario.ok) throw new Error("Error al obtener datos del usuario");

        const dataUsuario = await resUsuario.json();
        setPersona({
          nombres: dataUsuario.nombres,
          apellido1: dataUsuario.apellido1,
          apellido2: dataUsuario.apellido2,
          dni: dataUsuario.dni,
          email: dataUsuario.email,
          telefono: dataUsuario.telefono,
          direccion: dataUsuario.direccion,
          fecha_nacimiento: dataUsuario.fecha_nacimiento,
        });

        setFotoPerfil(dataUsuario.foto); // ✅ Mantiene la foto actualizada

        const resCargo = await fetch(`http://localhost:5000/perfil/cargo/${dataUsuario.id_cargo}/persona/${dataUsuario.id_persona}`);
        if (!resCargo.ok) throw new Error("Error al obtener detalles del cargo");
        const dataCargo = await resCargo.json();
        setDetallesCargo(dataCargo);
      } catch (error) {
        console.error("Error al cargar perfil:", error);
      }
    };

    obtenerDatos();
  }, [usuario.id_usuario]);

  const calcularEdad = (fechaNacimiento) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
  };

  const editarPerfil = () => {
    setFormEdicion({
      nombres: persona.nombres,
      apellido1: persona.apellido1,
      apellido2: persona.apellido2,
      telefono: persona.telefono,
      direccion: persona.direccion,
      email: persona.email
    });
    setModoEdicion(true);
  };

  const cambiarContrasena = () => setMostrarPasswordModal(true);

  const generarPDF = async () => {
    const doc = new jsPDF();
    const imgWidth = 40;
    const imgHeight = 50;
    const startX = 20;
    const startY = 20;

    const fotoUrl = fotoPerfil
      ? `http://localhost:5000/static/fotos_perfil/${fotoPerfil}`
      : 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

    const getImageBase64 = async (url) => {
      const res = await fetch(url);
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    };

    const imgData = await getImageBase64(fotoUrl);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN PERSONAL', 105, 15, null, null, 'center');
    doc.addImage(imgData, 'JPEG', 150, startY, imgWidth, imgHeight);

    const datos = [
      ['Usuario:', usuario.username],
      ['Nombre:', persona.nombres],
      ['Apellido:', `${persona.apellido1} ${persona.apellido2}`],
      ['Email:', persona.email],
      ['Cargo:', usuario.nombre_cargo],
      ['Edad:', `${calcularEdad(persona.fecha_nacimiento)} años`]
    ];

    let y = startY + 10;
    datos.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, startX, y);
      doc.setFont('helvetica', 'normal');
      doc.text(String(value), startX + 40, y);
      y += 10;
    });

    doc.save(`Perfil_${persona.nombres}.pdf`);
  };

  if (!usuario || !persona) return <div className="p-4">Cargando perfil...</div>;

  return (
  <div className="bg-main p-6 max-w-6xl mx-auto rounded-3xl shadow-xl">
    <input
      type="file"
      id="fileFoto"
      accept="image/*"
      className="hidden"
      onChange={async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("foto", file);
        const res = await fetch(`http://localhost:5000/usuarios/${usuario.id_usuario}/foto`, {
          method: 'POST',
          body: formData
        });

        const data = await res.json();
        if (data.ok) {
          alert("Foto actualizada");
          setFotoPerfil(data.filename);
        } else {
          alert("Error al subir foto");
        }
      }}
    />

    <div className="flex items-center gap-6 mb-6">
      <div className="relative">
        <img
          src={fotoPerfil
            ? `http://localhost:5000/static/fotos_perfil/${fotoPerfil}`
            : 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
          alt="Perfil"
          className="avatar"
        />
        <label htmlFor="fileFoto" className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer">
          <i className="bi bi-camera-fill"></i>
        </label>
      </div>
      <div>
        <h2 className="text-xl font-semibold">{persona.nombres} {persona.apellido1} {persona.apellido2}</h2>
        <p className="text-sm text-gray-600">{usuario.nombre_cargo}</p>
        <p className="text-sm text-gray-600">Edad: {calcularEdad(persona.fecha_nacimiento)} años</p>
      </div>
      <div className="ml-auto flex gap-2">
        <button onClick={editarPerfil} className="btn btn-primary text-sm">
          <i className="bi bi-pencil"></i> Editar
        </button>
        <button onClick={cambiarContrasena} className="btn btn-secondary text-sm">
          <i className="bi bi-lock-fill"></i> Cambiar Contraseña
        </button>
        <button onClick={generarPDF} className="btn btn-primary text-sm">
          <i className="bi bi-download"></i> Descargar PDF
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="card">
        <h3 className="font-semibold mb-2 border-b pb-1">Datos de contacto</h3>
        <p><strong>DNI:</strong> {persona.dni}</p>
        <p><strong>Email:</strong> {persona.email}</p>
        <p><strong>Teléfono:</strong> {persona.telefono}</p>
        <p><strong>Dirección:</strong> {persona.direccion}</p>
      </div>

      {usuario.nombre_cargo === 'Catequista' && detallesCargo && (
        <div className="card col-span-2">
          <h3 className="font-semibold mb-2 border-b pb-1">Grupos de Catequesis a cargo</h3>
          <ul className="list-disc list-inside">
            {detallesCargo.grupos.map((g, i) => (
              <li key={i}>{g.nombre_grupo} ({g.fecha_inicio} - {g.fecha_fin})</li>
            ))}
          </ul>
        </div>
      )}

      {usuario.nombre_cargo === 'Sacerdote' && detallesCargo && (
        <div className="card col-span-2">
          <h3 className="font-semibold mb-2 border-b pb-1">Parroquias asignadas</h3>
          <ul className="list-disc list-inside">
            {detallesCargo.parroquias.map((p, i) => (
              <li key={i}>{p.nombre_prrq} desde {p.fecha_inicio}</li>
            ))}
          </ul>
        </div>
      )}

      {usuario.nombre_cargo === 'Colaborador' && detallesCargo && (
        <div className="card col-span-2">
          <h3 className="font-semibold mb-2 border-b pb-1">Transacciones registradas</h3>
          <ul className="list-disc list-inside">
            {detallesCargo.transacciones.map((t, i) => (
              <li key={i}>{t.num_comprobante} - {t.fecha_transaccion} - S/. {t.monto}</li>
            ))}
          </ul>
        </div>
      )}

      {usuario.nombre_cargo === 'Administrador' && (
        <div className="card col-span-2">
          <h3 className="font-semibold mb-2 border-b pb-1">Resumen general</h3>
          <p>Acceso completo al sistema. Este perfil puede ver toda la información disponible.</p>
        </div>
      )}
    </div>

      {/* Modal Editar */}
      {modoEdicion && (
        <div className="fixed inset-0 bg-blue-100 bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Editar Perfil</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                console.log("FormEdicion a enviar:", JSON.stringify(formEdicion, null, 2));
                const res = await fetch(`http://localhost:5000/personas/${usuario.id_persona}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(formEdicion),
                });
                if (res.ok) {
                  alert("Perfil actualizado");
                  setModoEdicion(false);
                  window.location.reload();
                } else {
                  alert("Error al actualizar");
                }
              }}
            >
              {["nombres", "apellido1", "apellido2", "telefono", "direccion", "email"].map(campo => (
                <input
                  key={campo}
                  className="w-full mb-2 p-2 border rounded"
                  placeholder={campo}
                  value={formEdicion[campo]}
                  onChange={(e) => setFormEdicion({ ...formEdicion, [campo]: e.target.value })}
                />
              ))}
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="text-gray-500" onClick={() => setModoEdicion(false)}>Cancelar</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cambiar Contraseña */}
      {mostrarPasswordModal && (
        <div className="fixed inset-0 bg-blue-100 bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Cambiar Contraseña</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (passwordForm.nueva !== passwordForm.confirmar) {
                  alert("Las contraseñas no coinciden");
                  return;
                }
                const res = await fetch(`http://localhost:5000/usuarios/${usuario.id_usuario}/cambiar-password`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(passwordForm),
                });
                const data = await res.json();
                if (data.ok) {
                  alert("Contraseña actualizada");
                  setMostrarPasswordModal(false);
                } else {
                  alert(data.error || "Error al cambiar contraseña");
                }
              }}
            >
              {["actual", "nueva", "confirmar"].map(campo => (
                <input
                  key={campo}
                  type="password"
                  className="w-full mb-2 p-2 border rounded"
                  placeholder={`Contraseña ${campo}`}
                  value={passwordForm[campo]}
                  onChange={(e) => setPasswordForm({ ...passwordForm, [campo]: e.target.value })}
                />
              ))}
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="text-gray-500" onClick={() => setMostrarPasswordModal(false)}>Cancelar</button>
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Cambiar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PerfilUsuario;
