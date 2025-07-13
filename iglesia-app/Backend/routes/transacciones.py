from flask import Blueprint, request, jsonify
from db.conexion import get_connection

transacciones_bp = Blueprint('transacciones_bp', __name__)

# ================================
# GET - Listar transacciones
# ================================
@transacciones_bp.route('/transacciones', methods=['GET'])
def listar_transacciones():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                t.id_transaccion, t.monto_total, t.estado,
                t.fecha_transaccion, t.num_comprobante, 
                t.descripcion, t.id_evento, t.tipo_evento, t.id_persona,
                p.nombre_prrq AS nombre_parroquia, 
                tt.nombre AS nombre_tipo
            FROM transacciones t
            JOIN parroquias p ON t.id_parroquia = p.id_parroquia
            JOIN tipos_transacciones tt ON t.id_tipo_transaccion = tt.id_tipo_transaccion
        """)
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({"mensaje": f"Error al listar transacciones: {str(e)}"}), 500

# ================================
# POST - Crear transacción
# ================================
@transacciones_bp.route('/transacciones', methods=['POST'])
def crear_transaccion():
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO transacciones 
            (monto_total, estado, fecha_transaccion, num_comprobante, descripcion,
             id_parroquia, id_persona, id_tipo_transaccion, id_evento, tipo_evento)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            data['monto_total'], data['estado'], data['fecha_transaccion'], data['num_comprobante'],
            data['descripcion'], data['id_parroquia'],
            data.get('id_persona'), data['id_tipo_transaccion'],
            data.get('id_evento'), data.get('tipo_evento')
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Transacción registrada correctamente"}), 201
    except Exception as e:
        msg = str(e)
        if 'Duplicate entry' in msg and 'num_comprobante' in msg:
            return jsonify({"mensaje": "El número de comprobante ya existe."}), 409
        return jsonify({"mensaje": f"Error al registrar transacción: {msg}"}), 500

# ================================
# PUT - Actualizar transacción
# ================================
@transacciones_bp.route('/transacciones/<int:id_transaccion>', methods=['PUT'])
def actualizar_transaccion(id_transaccion):
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE transacciones
            SET monto_total=%s, estado=%s, fecha_transaccion=%s, num_comprobante=%s, descripcion=%s,
                id_parroquia=%s, id_persona=%s, id_tipo_transaccion=%s,
                id_evento=%s, tipo_evento=%s
            WHERE id_transaccion=%s
        """, (
            data['monto_total'], data['estado'], data['fecha_transaccion'], data['num_comprobante'],
            data['descripcion'], data['id_parroquia'],
            data.get('id_persona'), data['id_tipo_transaccion'],
            data.get('id_evento'), data.get('tipo_evento'),
            id_transaccion
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Transacción actualizada correctamente"})
    except Exception as e:
        msg = str(e)
        if 'Duplicate entry' in msg and 'num_comprobante' in msg:
            return jsonify({"mensaje": "El número de comprobante ya existe."}), 409
        return jsonify({"mensaje": f"Error al actualizar transacción: {msg}"}), 500

# ================================
# DELETE - Eliminar transacción
# ================================
@transacciones_bp.route('/transacciones/<int:id_transaccion>', methods=['DELETE'])
def eliminar_transaccion(id_transaccion):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM transacciones WHERE id_transaccion = %s", (id_transaccion,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Transacción eliminada correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al eliminar transacción: {str(e)}"}), 500
