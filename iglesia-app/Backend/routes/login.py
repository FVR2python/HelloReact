from flask import Blueprint, request, jsonify
from db.conexion import get_connection

login_bp = Blueprint('login_bp', __name__)

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
