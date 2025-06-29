from flask import Blueprint, request, jsonify
from db.conexion import get_connection

usuarios_bp = Blueprint('usuarios_bp', __name__)

# ========================
# LISTAR USUARIOS
# ========================
@usuarios_bp.route('/usuarios', methods=['GET'])
def listar_usuarios():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT u.id_usuario, u.username, u.password,
                   p.id_persona, p.nombres, p.apellido1, p.apellido2,
                   c.id_cargo, c.nombre_cargo
            FROM usuarios u
            JOIN personas p ON u.id_persona = p.id_persona
            JOIN cargos c ON u.id_cargo = c.id_cargo
            ORDER BY u.username
        """)
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({"mensaje": f"Error al listar usuarios: {str(e)}"}), 500

# ========================
# CREAR USUARIO (SIN HASH)
# ========================
@usuarios_bp.route('/usuarios', methods=['POST'])
def crear_usuario():
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        password = data['password']  # 👈 se guarda tal cual
        cursor.execute("""
            INSERT INTO usuarios (username, password, id_persona, id_cargo)
            VALUES (%s, %s, %s, %s)
        """, (data['username'], password, data['id_persona'], data['id_cargo']))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Usuario creado correctamente"}), 201
    except Exception as e:
        msg = str(e)
        if "Duplicate entry" in msg and "username" in msg:
            return jsonify({"mensaje": "El nombre de usuario ya existe."}), 409
        return jsonify({"mensaje": f"Error al crear usuario: {msg}"}), 500

# ========================
# ACTUALIZAR USUARIO (SIN HASH)
# ========================
@usuarios_bp.route('/usuarios/<int:id_usuario>', methods=['PUT'])
def actualizar_usuario(id_usuario):
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        password = data['password']  # 👈 sin encriptar
        cursor.execute("""
            UPDATE usuarios 
            SET username=%s, password=%s, id_persona=%s, id_cargo=%s
            WHERE id_usuario = %s
        """, (data['username'], password, data['id_persona'], data['id_cargo'], id_usuario))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Usuario actualizado correctamente"})
    except Exception as e:
        msg = str(e)
        if "Duplicate entry" in msg and "username" in msg:
            return jsonify({"mensaje": "El nombre de usuario ya existe."}), 409
        return jsonify({"mensaje": f"Error al actualizar usuario: {msg}"}), 500

# ========================
# ELIMINAR USUARIO
# ========================
@usuarios_bp.route('/usuarios/<int:id_usuario>', methods=['DELETE'])
def eliminar_usuario(id_usuario):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM usuarios WHERE id_usuario = %s", (id_usuario,))
        rows = cursor.rowcount
        conn.commit()
        cursor.close()
        conn.close()
        if rows == 0:
            return jsonify({"mensaje": "El usuario no existe."}), 404
        return jsonify({"mensaje": "Usuario eliminado correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al eliminar usuario: {str(e)}"}), 500
