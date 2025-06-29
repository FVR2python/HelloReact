from flask import Blueprint, request, jsonify
from db.conexion import get_connection

roles_bp = Blueprint('roles_bp', __name__)

# 📌 GET - Listar roles
@roles_bp.route('/roles', methods=['GET'])
def listar_roles():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM roles")
        roles = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(roles)
    except Exception as e:
        return jsonify({"mensaje": f"Error al listar roles: {str(e)}"}), 500

# 📌 POST - Crear rol
@roles_bp.route('/roles', methods=['POST'])
def crear_rol():
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        query = "INSERT INTO roles (nombre_rol, descripcion) VALUES (%s, %s)"
        valores = (data['nombre_rol'], data.get('descripcion', ''))
        cursor.execute(query, valores)
        conn.commit()
        id_generado = cursor.lastrowid
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Rol registrado correctamente", "id_rol": id_generado}), 201
    except Exception as e:
        return jsonify({"mensaje": f"Error al registrar rol: {str(e)}"}), 500

# 📌 PUT - Actualizar rol
@roles_bp.route('/roles/<int:id_rol>', methods=['PUT'])
def actualizar_rol(id_rol):
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        query = "UPDATE roles SET nombre_rol=%s, descripcion=%s WHERE id_rol=%s"
        valores = (data['nombre_rol'], data.get('descripcion', ''), id_rol)
        cursor.execute(query, valores)
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Rol actualizado correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al actualizar rol: {str(e)}"}), 500

# 📌 DELETE - Eliminar rol
@roles_bp.route('/roles/<int:id_rol>', methods=['DELETE'])
def eliminar_rol(id_rol):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM roles WHERE id_rol = %s", (id_rol,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Rol eliminado correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al eliminar rol: {str(e)}"}), 500
