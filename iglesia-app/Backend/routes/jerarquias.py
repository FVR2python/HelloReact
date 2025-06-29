from flask import Blueprint, request, jsonify
from db.conexion import get_connection

jerarquias_bp = Blueprint('jerarquias_bp', __name__)

@jerarquias_bp.route('/jerarquias', methods=['GET'])
def listar_jerarquias():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM jerarquias")
        jerarquias = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(jerarquias)
    except Exception as e:
        return jsonify({"mensaje": f"Error al listar jerarquías: {str(e)}"}), 500

@jerarquias_bp.route('/jerarquias', methods=['POST'])
def crear_jerarquia():
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO jerarquias (nombre_jerarquia, descripcion) VALUES (%s, %s)",
            (data['nombre_jerarquia'], data.get('descripcion', ''))
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Jerarquía registrada correctamente"}), 201
    except Exception as e:
        return jsonify({"mensaje": f"Error al registrar jerarquía: {str(e)}"}), 500

@jerarquias_bp.route('/jerarquias/<int:id_jerarquia>', methods=['PUT'])
def actualizar_jerarquia(id_jerarquia):
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE jerarquias SET nombre_jerarquia = %s, descripcion = %s WHERE id_jerarquia = %s",
            (data['nombre_jerarquia'], data.get('descripcion', ''), id_jerarquia)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Jerarquía actualizada correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al actualizar jerarquía: {str(e)}"}), 500

@jerarquias_bp.route('/jerarquias/<int:id_jerarquia>', methods=['DELETE'])
def eliminar_jerarquia(id_jerarquia):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM jerarquias WHERE id_jerarquia = %s", (id_jerarquia,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Jerarquía eliminada correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al eliminar jerarquía: {str(e)}"}), 500
