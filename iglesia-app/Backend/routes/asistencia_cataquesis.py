from flask import Blueprint, request, jsonify
from db.conexion import get_connection

asistencia_bp = Blueprint('asistencia_bp', __name__)

@asistencia_bp.route('/asistencias', methods=['GET'])
def listar_asistencias():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT a.*, c.fecha, c.tema,
                   CONCAT(p.nombres, ' ', p.apellido1) AS catequizando
            FROM asistencia_catequesis a
            JOIN clases_catequesis c ON a.id_clase = c.id_clase
            JOIN personas p ON a.id_catequizando = p.id_persona
        """)
        asistencias = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(asistencias)
    except Exception as e:
        return jsonify({"mensaje": f"Error al listar asistencias: {str(e)}"}), 500

@asistencia_bp.route('/asistencias', methods=['POST'])
def registrar_asistencia():
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO asistencia_catequesis (asistio, observacion, id_clase, id_catequizando)
            VALUES (%s, %s, %s, %s)
        """, (data['asistio'], data['observacion'], data['id_clase'], data['id_catequizando']))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Asistencia registrada correctamente"}), 201
    except Exception as e:
        return jsonify({"mensaje": f"Error al registrar asistencia: {str(e)}"}), 500

@asistencia_bp.route('/asistencias/<int:id_asistencia>', methods=['PUT'])
def actualizar_asistencia(id_asistencia):
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE asistencia_catequesis
            SET asistio=%s, observacion=%s, id_clase=%s, id_catequizando=%s
            WHERE id_asistencia=%s
        """, (data['asistio'], data['observacion'], data['id_clase'], data['id_catequizando'], id_asistencia))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Asistencia actualizada correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al actualizar asistencia: {str(e)}"}), 500

@asistencia_bp.route('/asistencias/<int:id_asistencia>', methods=['DELETE'])
def eliminar_asistencia(id_asistencia):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM asistencia_catequesis WHERE id_asistencia = %s", (id_asistencia,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Asistencia eliminada correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al eliminar asistencia: {str(e)}"}), 500
