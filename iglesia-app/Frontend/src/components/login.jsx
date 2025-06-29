import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SanAntonio from '../assets/SanAntonio.jpg';

function Login({ setUsuario }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [cargo, setCargo] = useState('');
  const [cargos, setCargos] = useState([]);
  const [respuesta, setRespuesta] = useState('');
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
        navigate('/menu');
      } else {
        setRespuesta(data.mensaje);
      }
    } catch (error) {
      setRespuesta('Error al conectar con el servidor');
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
      {/* Fondo oscuro + desenfoque sutil */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>

      {/* Card login */}
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
        </div>

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
