from flask import Blueprint, request, jsonify
from db.conexion import get_connection
import cv2
import numpy as np
import base64
import os

login_bp = Blueprint('login_bp', __name__)

# Ruta al modelo HaarCascade para detección de rostro
modelo_path = os.path.join(os.path.dirname(__file__), "..", "modelos", "haarcascade_frontalface_default.xml")
face_cascade = cv2.CascadeClassifier(modelo_path)

# ======================
# INICIAR SESIÓN (LOGIN)
# ======================
@login_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    id_cargo = data.get('cargo')

    if not username or not password or not id_cargo:
        return jsonify({"mensaje": "Debe completar todos los campos"}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Consulta con id_persona incluido
        cursor.execute("""
            SELECT u.id_usuario, u.username, p.id_persona, p.nombres, p.apellido1, p.apellido2,
                   c.id_cargo, c.nombre_cargo
            FROM usuarios u
            JOIN personas p ON u.id_persona = p.id_persona
            JOIN cargos c ON u.id_cargo = c.id_cargo
            WHERE u.username = %s AND u.password = %s AND u.id_cargo = %s
        """, (username, password, id_cargo))

        usuario = cursor.fetchone()
        cursor.close()
        conn.close()

        if usuario:
            return jsonify({
                "mensaje": "Acceso correcto",
                "usuario": usuario
            })
        else:
            return jsonify({"mensaje": "Credenciales o cargo incorrectos"}), 401

    except Exception as e:
        return jsonify({"mensaje": f"Error del servidor: {str(e)}"}), 500


# ===========================
# LISTAR CARGOS PARA COMBOBOX
# ===========================
@login_bp.route('/api/cargos', methods=['GET'])
def obtener_cargos():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id_cargo, nombre_cargo FROM cargos ORDER BY nombre_cargo ASC")
        cargos = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(cargos)
    except Exception as e:
        return jsonify({"mensaje": f"Error al obtener cargos: {str(e)}"}), 500


# =====================
# INICIO DE SESIÓN FACIAL
# =====================
@login_bp.route('/api/login_facial', methods=['POST'])
def login_facial():
    data = request.get_json()
    imagen_base64 = data.get('imagen')

    if not imagen_base64:
        return jsonify({"success": False, "mensaje": "No se recibió la imagen"}), 400

    try:
        # Procesar imagen base64
        img_bytes = base64.b64decode(imagen_base64.split(',')[1])
        nparr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)

        if len(faces) == 0:
            return jsonify({"success": False, "mensaje": "No se detectó ningún rostro"}), 401

        # Aquí podrías hacer comparación con rostros guardados si avanzas a face_recognition

        return jsonify({"success": True,"mensaje": "Rostro detectado. Acceso permitido (simulado)","usuario": {
        "id_usuario": 1,
        "username": "valvas",
        "id_persona": 1,
        "nombres": "valvas",
        "apellido1": "admin",
        "apellido2": "",
        "id_cargo": 1,
        "nombre_cargo": "Administrador"}})


    except Exception as e:
        return jsonify({"success": False, "mensaje": f"Error al procesar imagen: {str(e)}"}), 500
