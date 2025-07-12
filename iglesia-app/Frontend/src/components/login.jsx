import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SanAntonio from '../assets/SanAntonio.jpg';

function Login({ setUsuario }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [cargo, setCargo] = useState('');
  const [cargos, setCargos] = useState([]);
  const [respuesta, setRespuesta] = useState('');
  const [mostrarCamara, setMostrarCamara] = useState(false);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    obtenerCargos();
  }, []);

  const obtenerCargos = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/cargos');
      const data = await res.json();
      setCargos(data);
    } catch {
      setCargos([]);
    }
  };

  const iniciarSesion = async () => {
    if (!username || !password || !cargo) {
      setRespuesta('Debe completar todos los campos');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, cargo }),
      });

      const data = await res.json();

      if (res.ok) {
        setUsuario(data.usuario);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        detenerCamara(); // ✅ detener cámara si estaba abierta
        navigate('/menu');
      } else {
        setRespuesta(data.mensaje);
      }
    } catch (error) {
      setRespuesta('Error al conectar con el servidor');
    }
  };

  const iniciarCamara = async () => {
    setMostrarCamara(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      setRespuesta('No se pudo acceder a la cámara');
    }
  };

  const detenerCamara = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setMostrarCamara(false);
  };

  const capturarYEnviarRostro = async () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageBase64 = canvas.toDataURL('image/jpeg');

    try {
      const res = await fetch('http://localhost:5000/api/login_facial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagen: imageBase64 }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUsuario(data.usuario);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        detenerCamara(); // ✅ detener cámara luego de login facial
        navigate('/menu');
      } else {
        setRespuesta(data.mensaje || 'No se reconoció el rostro');
      }
    } catch (error) {
      setRespuesta('Error al procesar la imagen facial');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-900 relative"
      style={{
        backgroundImage: `url(${SanAntonio})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>

      <div className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-600 p-3 rounded-full shadow">
            <i className="bi bi-shield-lock-fill text-white text-2xl"></i>
          </div>
          <h2 className="text-lg font-semibold mt-3 text-center">Sistema de Gestión</h2>
          <p className="text-sm text-gray-500 text-center">Parroquia San Antonio de Padua</p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Ingrese su usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Ingrese su contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={cargo}
            onChange={(e) => setCargo(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          >
            <option value="" disabled hidden>
              Seleccione su rol
            </option>
            {cargos.map((c) => (
              <option key={c.id_cargo} value={c.id_cargo}>
                {c.nombre_cargo}
              </option>
            ))}
          </select>

          <button
            onClick={iniciarSesion}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200"
          >
            Iniciar Sesión
          </button>

          <div className="text-center text-gray-500 text-xs mt-2">o</div>

          <button
            onClick={iniciarCamara}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2 rounded-lg transition duration-200"
          >
            Iniciar sesión con rostro
          </button>
        </div>

        {mostrarCamara && (
          <div className="mt-4 flex flex-col items-center space-y-2">
            <video ref={videoRef} autoPlay width="320" height="240" className="rounded border" />
            <div className="flex gap-2 mt-2">
              <button
                onClick={capturarYEnviarRostro}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
              >
                Verificar rostro
              </button>
              <button
                onClick={detenerCamara}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {respuesta && (
          <div className="mt-4 text-center text-sm text-yellow-800 bg-yellow-100 border border-yellow-300 px-4 py-2 rounded-lg">
            {respuesta}
          </div>
        )}

        <p className="text-xs text-center text-gray-400 mt-6">© 2025 Parroquia San Antonio</p>
      </div>
    </div>
  );
}

export default Login;
