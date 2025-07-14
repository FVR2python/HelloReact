import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';

function PerfilUsuario({ usuario }) {
  const [persona, setPersona] = useState(null);
  const [cargoData, setCargoData] = useState({});
  const [sacramentos, setSacramentos] = useState([]);
  const [roles, setRoles] = useState([]);
  const [transacciones, setTransacciones] = useState([]);
  const [fotoPerfil, setFotoPerfil] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formEdicion, setFormEdicion] = useState({});
  const [mostrarPasswordModal, setMostrarPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ actual: '', nueva: '', confirmar: '' });

  useEffect(() => {
    if (!usuario?.id_usuario) return;
    const cargarDatos = async () => {
      const urls = [
        `http://localhost:5000/usuarios/${usuario.id_usuario}`,
        `http://localhost:5000/perfil/cargo/${usuario.id_cargo}/persona/${usuario.id_persona}`,
        `http://localhost:5000/perfil/sacramentos/${usuario.id_persona}`,
        `http://localhost:5000/perfil/roles/${usuario.id_persona}`,
        `http://localhost:5000/perfil/transacciones/${usuario.id_persona}`
      ];
      const [u, c, s, r, t] = await Promise.all(urls.map(url => fetch(url).then(res => res.json())));
      setPersona(u); setFotoPerfil(u.foto); setCargoData(c); setSacramentos(s); setRoles(r); setTransacciones(t);
    };
    cargarDatos();
  }, [usuario]);

  const calcularEdad = fecha => {
    const nacimiento = new Date(fecha);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    if (hoy < new Date(hoy.getFullYear(), nacimiento.getMonth(), nacimiento.getDate())) edad--;
    return edad;
  };

 const formatearFecha = fecha => {if (!fecha) return '—';const f = new Date(fecha).toLocaleDateString('es-PE', {year: 'numeric',month: 'long',day: 'numeric'});
  return f.charAt(0).toUpperCase() + f.slice(1);
};

  const handleFotoChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData(); fd.append("foto", file);
    const res = await fetch(`http://localhost:5000/usuarios/${usuario.id_usuario}/foto`, { method: 'POST', body: fd });
    const data = await res.json();
    if (data.ok) setFotoPerfil(data.filename);
    alert(data.mensaje || data.error);
  };

  const guardarEdicion = async e => {
    e.preventDefault();
    const res = await fetch(`http://localhost:5000/personas/${usuario.id_persona}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formEdicion)
    });
    if (res.ok) {
      setPersona({ ...persona, ...formEdicion });
      setModoEdicion(false);
      alert("Perfil actualizado");
    } else alert("Error al actualizar");
  };

  const cambiarPassword = async e => {
    e.preventDefault();
    if (passwordForm.nueva !== passwordForm.confirmar) return alert("No coinciden");
    const res = await fetch(`http://localhost:5000/usuarios/${usuario.id_usuario}/cambiar-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(passwordForm)
    });
    const data = await res.json();
    if (data.ok) setMostrarPasswordModal(false);
    alert(data.mensaje || data.error);
  };

const generarPDF = async () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Obtener imagen de perfil
  const imgData = await fetch(fotoPerfil ? `http://localhost:5000/static/fotos_perfil/${fotoPerfil}` : 'https://cdn-icons-png.flaticon.com/512/149/149071.png')
    .then(r => r.blob())
    .then(blob => new Promise(res => {
      const reader = new FileReader();
      reader.onloadend = () => res(reader.result);
      reader.readAsDataURL(blob);
    }));

  // Título central decorado
  doc.setFont("helvetica", "bold");
  doc.setTextColor(88, 56, 134); // púrpura litúrgico
  doc.setFontSize(18);
  doc.text("✝ PERFIL PARROQUIAL ✝", pageWidth / 2, 20, { align: "center" });

  // Imagen del perfil
  doc.addImage(imgData, 'JPEG', pageWidth - 50, 25, 30, 30);

  // Datos personales
  const datos = [
    ["Usuario", usuario.username],
    ["Nombre", persona.nombres],
    ["Apellidos", `${persona.apellido1} ${persona.apellido2}`],
    ["Email", persona.email],
    ["DNI", persona.nrodoc || "—"],
    ["Teléfono", persona.telefono || "—"],
    ["Dirección", persona.direccion || "—"],
    ["Cargo", usuario.nombre_cargo],
    ["Edad", `${calcularEdad(persona.fecha_nacimiento)} años`]
  ];

  doc.setFontSize(12);
  doc.setTextColor(0);
  let y = 35;

  datos.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(value), 60, y);
    y += 8;
  });

  // Línea divisoria
  doc.setDrawColor(180); doc.line(20, y + 2, pageWidth - 20, y + 2);
  y += 10;

  // Sacramentos
  if (sacramentos.length) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(99, 50, 168); // morado
    doc.text("▪ Sacramentos Inscritos", 20, y); y += 7;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    sacramentos.forEach(s => {
      const estado = s.estado === "Activo" ? "[Activo]" : "[Inactivo]";
      doc.text(`• ${s.nombre_sacrament} - ${formatearFecha(s.fecha_matricula)} ${estado}`, 25, y);
      y += 7;
    });
    y += 5;
  }

  // Transacciones
  if (transacciones.length) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(32, 91, 158); // azul
    doc.text("▪ Transacciones Realizadas", 20, y); y += 7;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    transacciones.forEach(t => {
      doc.text(`• ${t.num_comprobante} - ${formatearFecha(t.fecha_transaccion)} - S/. ${t.monto_total} [${t.estado}]`, 25, y);
      y += 7;
    });
    y += 5;
  }

  // Pie de página
  doc.setFontSize(10);
  doc.setTextColor(130);
  doc.text(`📅 Emitido el ${formatearFecha(new Date())}`, 20, y + 10);
  doc.text("Sistema Parroquial © 2025", 20, y + 16);

  doc.save(`Perfil_${persona.nombres}.pdf`);
};



  if (!persona) return <div className="p-4">Cargando perfil...</div>;

  const Bloque = ({ titulo, items }) => (
    <div className="card w-full md:w-[48%] xl:w-[31%]">
      <h3 className="font-semibold mb-2 border-b pb-1">{titulo}</h3>
      <ul className="list-disc list-inside">{items}</ul>
    </div>
  );

  return (
    <div className="container mx-auto p-6 rounded-3xl shadow-xl bg-main">
      <input type="file" id="fileFoto" accept="image/*" className="hidden" onChange={handleFotoChange} />
      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
        <div className="relative w-fit">
          <img src={fotoPerfil ? `http://localhost:5000/static/fotos_perfil/${fotoPerfil}` : 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} alt="Foto de perfil" className="avatar w-24 h-24 rounded-full object-cover border-2 border-white shadow-md" />
          <label htmlFor="fileFoto" className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer"><i className="bi bi-camera-fill" /></label>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold">{persona.nombres} {persona.apellido1} {persona.apellido2}</h2>
          <p className="text-sm text-gray-600">{usuario.nombre_cargo}</p>
          <p className="text-sm text-gray-600">Edad: {calcularEdad(persona.fecha_nacimiento)} años</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => { setFormEdicion({ ...persona }); setModoEdicion(true); }} className="btn btn-primary text-sm"><i className="bi bi-pencil" /> Editar</button>
          <button onClick={() => setMostrarPasswordModal(true)} className="btn btn-secondary text-sm"><i className="bi bi-lock-fill" /> Contraseña</button>
          <button onClick={generarPDF} className="btn btn-primary text-sm"><i className="bi bi-download" /> PDF</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Bloque titulo="Datos de contacto" items={['dni', 'email', 'telefono', 'direccion'].map(k => <li key={k}><strong>{k[0].toUpperCase() + k.slice(1)}:</strong> {persona[k]}</li>)} />
        {sacramentos.length > 0 && <Bloque titulo="Sacramentos inscritos" items={sacramentos.map((s, i) => <li key={i}>{s.nombre_sacrament} - {formatearFecha(s.fecha_matricula)} <span className={`ml-2 text-sm font-bold ${s.estado === 'Activo' ? 'text-green-600' : 'text-red-600'}`}>[{s.estado}]</span></li>)} />}
        {roles.length > 0 && <Bloque titulo="Roles asignados" items={roles.map((r, i) => <li key={i}>{r.nombre_rol} en {r.tipo_contexto} ({formatearFecha(r.fecha_inicio)} - {r.fecha_fin ? formatearFecha(r.fecha_fin) : 'actual'})</li>)} />}
        {transacciones.length > 0 && <Bloque titulo="Transacciones realizadas" items={transacciones.map((t, i) => <li key={i}>{t.num_comprobante} - {formatearFecha(t.fecha_transaccion)} - S/. {t.monto_total} <span className={`ml-2 text-sm font-bold ${t.estado === 'completo' ? 'text-green-600' : 'text-yellow-600'}`}>[{t.estado}]</span></li>)} />}
        {usuario.nombre_cargo === 'Catequista' && cargoData.grupos && <Bloque titulo="Grupos a cargo" items={cargoData.grupos.map((g, i) => <li key={i}>{g.nombre_grupo} ({formatearFecha(g.fecha_inicio)} - {formatearFecha(g.fecha_fin)})</li>)} />}
        {usuario.nombre_cargo === 'Sacerdote' && cargoData.parroquias && <Bloque titulo="Parroquias asignadas" items={cargoData.parroquias.map((p, i) => <li key={i}>{p.nombre_prrq} desde {formatearFecha(p.fecha_inicio)}</li>)} />}
        {usuario.nombre_cargo === 'Colaborador' && cargoData.transacciones && <Bloque titulo="Transacciones registradas" items={cargoData.transacciones.map((t, i) => <li key={i}>{t.num_comprobante} - {formatearFecha(t.fecha_transaccion)} - S/. {t.monto}</li>)} />}
      </div>

      {modoEdicion && (
        <Modal title="Editar Perfil" onClose={() => setModoEdicion(false)} onSubmit={guardarEdicion}>
          {['nombres', 'apellido1', 'apellido2', 'telefono', 'direccion', 'email'].map(campo => (
            <input key={campo} className="w-full mb-2 p-2 border rounded" placeholder={campo} value={formEdicion[campo] || ''} onChange={e => setFormEdicion({ ...formEdicion, [campo]: e.target.value })} />
          ))}
        </Modal>
      )}

      {mostrarPasswordModal && (
        <Modal title="Cambiar Contraseña" onClose={() => setMostrarPasswordModal(false)} onSubmit={cambiarPassword}>
          {['actual', 'nueva', 'confirmar'].map(campo => (
            <input key={campo} type="password" className="w-full mb-2 p-2 border rounded" placeholder={`Contraseña ${campo}`} value={passwordForm[campo]} onChange={e => setPasswordForm({ ...passwordForm, [campo]: e.target.value })} />
          ))}
        </Modal>
      )}
    </div>
  );
}

const Modal = ({ title, children, onClose, onSubmit }) => (
  <div className="fixed inset-0 bg-blue-100 bg-opacity-60 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md">
      <h3 className="text-lg font-bold mb-4">{title}</h3>
      <form onSubmit={onSubmit}>
        {children}
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" className="text-gray-500" onClick={onClose}>Cancelar</button>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
        </div>
      </form>
    </div>
  </div>
);

export default PerfilUsuario;
