from flask import Blueprint, request, jsonify
from db.conexion import get_connection
import json

auditoria_bp = Blueprint('auditoria_bp', __name__)

# ========= LISTAR ==========
@auditoria_bp.route('/auditoria_transacciones', methods=['GET'])
def listar_auditorias():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT a.id_auditoria, a.accion, a.fecha_accion, a.observacion,
                   a.usuario, a.ip, a.modulo, a.datos_anteriores, a.datos_nuevos,
                   a.id_transaccion, t.descripcion AS descripcion_transaccion
            FROM auditoria_transacciones a
            JOIN transacciones t ON a.id_transaccion = t.id_transaccion
        """)
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({"mensaje": f"Error al listar auditorías: {str(e)}"}), 500


# ========= CREAR ==========
@auditoria_bp.route('/auditoria_transacciones', methods=['POST'])
def crear_auditoria():
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Simulación de usuario actual (ideal: sacarlo de sesión/login)
        usuario = "admin"
        ip = request.remote_addr
        modulo = "transacciones"
        datos_nuevos = json.dumps(data)
        datos_anteriores = None

        cursor.execute("""
            INSERT INTO auditoria_transacciones 
            (accion, fecha_accion, observacion, id_transaccion,
             usuario, ip, modulo, datos_anteriores, datos_nuevos)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            data['accion'], data['fecha_accion'], data.get('observacion', ''), data['id_transaccion'],
            usuario, ip, modulo, datos_anteriores, datos_nuevos
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Auditoría registrada correctamente"}), 201
    except Exception as e:
        return jsonify({"mensaje": f"Error al registrar auditoría: {str(e)}"}), 500


# ========= ACTUALIZAR ==========
@auditoria_bp.route('/auditoria_transacciones/<int:id_auditoria>', methods=['PUT'])
def actualizar_auditoria(id_auditoria):
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Obtener datos anteriores
        cursor.execute("SELECT * FROM auditoria_transacciones WHERE id_auditoria = %s", (id_auditoria,))
        anterior = cursor.fetchone()
        datos_anteriores = json.dumps(anterior) if anterior else None
        datos_nuevos = json.dumps(data)

        usuario = "admin"
        ip = request.remote_addr
        modulo = "transacciones"

        cursor.execute("""
            UPDATE auditoria_transacciones
            SET accion=%s, fecha_accion=%s, observacion=%s, id_transaccion=%s,
                usuario=%s, ip=%s, modulo=%s, datos_anteriores=%s, datos_nuevos=%s
            WHERE id_auditoria=%s
        """, (
            data['accion'], data['fecha_accion'], data.get('observacion', ''), data['id_transaccion'],
            usuario, ip, modulo, datos_anteriores, datos_nuevos,
            id_auditoria
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Auditoría actualizada correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al actualizar auditoría: {str(e)}"}), 500


# ========= ELIMINAR ==========
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
