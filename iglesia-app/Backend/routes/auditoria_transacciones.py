from flask import Blueprint, request, jsonify
from db.conexion import get_connection

auditoria_bp = Blueprint('auditoria_bp', __name__)

@auditoria_bp.route('/auditoria_transacciones', methods=['GET'])
def listar_auditorias():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT a.id_auditoria, a.accion, a.fecha_accion, a.observacion, a.id_transaccion,
                   t.descripcion AS descripcion_transaccion
            FROM auditoria_transacciones a
            JOIN transacciones t ON a.id_transaccion = t.id_transaccion
        """)
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({"mensaje": f"Error al listar auditorías: {str(e)}"}), 500

@auditoria_bp.route('/auditoria_transacciones', methods=['POST'])
def crear_auditoria():
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO auditoria_transacciones 
            (accion, fecha_accion, observacion, id_transaccion)
            VALUES (%s, %s, %s, %s)
        """, (
            data['accion'], data['fecha_accion'],
            data.get('observacion', ''), data['id_transaccion']
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Auditoría registrada correctamente"}), 201
    except Exception as e:
        return jsonify({"mensaje": f"Error al registrar auditoría: {str(e)}"}), 500

@auditoria_bp.route('/auditoria_transacciones/<int:id_auditoria>', methods=['PUT'])
def actualizar_auditoria(id_auditoria):
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE auditoria_transacciones
            SET accion=%s, fecha_accion=%s, observacion=%s, id_transaccion=%s
            WHERE id_auditoria=%s
        """, (
            data['accion'], data['fecha_accion'],
            data.get('observacion', ''), data['id_transaccion'], id_auditoria
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Auditoría actualizada correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al actualizar auditoría: {str(e)}"}), 500

@auditoria_bp.route('/auditoria_transacciones/<int:id_auditoria>', methods=['DELETE'])
def eliminar_auditoria(id_auditoria):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM auditoria_transacciones WHERE id_auditoria = %s", (id_auditoria,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Auditoría eliminada correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al eliminar auditoría: {str(e)}"}), 500
