from flask import Blueprint, request, jsonify
from db.conexion import get_connection

parroquias_bp = Blueprint('parroquias_bp', __name__)

@parroquias_bp.route('/parroquias', methods=['GET'])
def listar_parroquias():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM parroquias")
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({"mensaje": f"Error al listar parroquias: {str(e)}"}), 500

@parroquias_bp.route('/parroquias', methods=['POST'])
def crear_parroquia():
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO parroquias (nombre_prrq, direccion_prrq, lugar_prrq)
            VALUES (%s, %s, %s)
        """, (
            data['nombre_prrq'], data['direccion_prrq'], data['lugar_prrq']
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Parroquia registrada correctamente"}), 201
    except Exception as e:
        return jsonify({"mensaje": f"Error al registrar parroquia: {str(e)}"}), 500

@parroquias_bp.route('/parroquias/<int:id_parroquia>', methods=['PUT'])
def actualizar_parroquia(id_parroquia):
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE parroquias
            SET nombre_prrq=%s, direccion_prrq=%s, lugar_prrq=%s
            WHERE id_parroquia=%s
        """, (
            data['nombre_prrq'], data['direccion_prrq'], data['lugar_prrq'], id_parroquia
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Parroquia actualizada correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al actualizar parroquia: {str(e)}"}), 500

@parroquias_bp.route('/parroquias/<int:id_parroquia>', methods=['DELETE'])
def eliminar_parroquia(id_parroquia):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM parroquias WHERE id_parroquia = %s", (id_parroquia,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Parroquia eliminada correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al eliminar parroquia: {str(e)}"}), 500
