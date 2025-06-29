from flask import Blueprint, request, jsonify
from db.conexion import get_connection

tipos_bp = Blueprint('tipos_bp', __name__)

@tipos_bp.route('/tipos_transacciones', methods=['GET'])
def listar_tipos():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM tipos_transacciones")
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({"mensaje": f"Error al listar tipos: {str(e)}"}), 500

@tipos_bp.route('/tipos_transacciones', methods=['POST'])
def crear_tipo():
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO tipos_transacciones (nombre, descripcion)
            VALUES (%s, %s)
        """, (
            data['nombre'], data.get('descripcion', '')
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Tipo registrado correctamente"}), 201
    except Exception as e:
        return jsonify({"mensaje": f"Error al registrar tipo: {str(e)}"}), 500

@tipos_bp.route('/tipos_transacciones/<int:id_tipo>', methods=['PUT'])
def actualizar_tipo(id_tipo):
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE tipos_transacciones
            SET nombre=%s, descripcion=%s
            WHERE id_tipo_transaccion=%s
        """, (
            data['nombre'], data.get('descripcion', ''), id_tipo
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Tipo actualizado correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al actualizar tipo: {str(e)}"}), 500

@tipos_bp.route('/tipos_transacciones/<int:id_tipo>', methods=['DELETE'])
def eliminar_tipo(id_tipo):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM tipos_transacciones WHERE id_tipo_transaccion = %s", (id_tipo,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Tipo eliminado correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al eliminar tipo: {str(e)}"}), 500
