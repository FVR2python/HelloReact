from flask import Blueprint, request, jsonify
from db.conexion import get_connection
from datetime import datetime

egresos_bp = Blueprint('egresos_bp', __name__)

@egresos_bp.route('/egresos_mantenimiento', methods=['GET'])
def listar_egresos():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                e.id_egreso, e.proveedor, e.descripcion, e.fecha_egreso,
                i.id_inventario, i.nombre_invent,
                t.id_transaccion, t.descripcion AS descripcion_transaccion,
                t.monto_total, t.estado
            FROM egresos_mantenimiento e
            JOIN inventario_liturgico i ON e.id_inventario = i.id_inventario
            JOIN transacciones t ON e.id_transaccion = t.id_transaccion
        """)
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({"mensaje": f"Error al listar egresos: {str(e)}"}), 500

@egresos_bp.route('/egresos_mantenimiento', methods=['POST'])
def crear_egreso():
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Validar claves foráneas mínimamente (opcional)
        cursor.execute("SELECT 1 FROM inventario_liturgico WHERE id_inventario = %s", (data['id_inventario'],))
        if not cursor.fetchone():
            return jsonify({"mensaje": "Inventario no válido"}), 400
        cursor.execute("SELECT 1 FROM transacciones WHERE id_transaccion = %s", (data['id_transaccion'],))
        if not cursor.fetchone():
            return jsonify({"mensaje": "Transacción no válida"}), 400

        cursor.execute("""
            INSERT INTO egresos_mantenimiento 
            (proveedor, descripcion, fecha_egreso, id_inventario, id_transaccion)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            data['proveedor'],
            data.get('descripcion', ''),
            data.get('fecha_egreso', datetime.today().strftime('%Y-%m-%d')),
            data['id_inventario'],
            data['id_transaccion']
        ))
        conn.commit()
        nuevo_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Egreso registrado correctamente", "id_egreso": nuevo_id}), 201
    except Exception as e:
        return jsonify({"mensaje": f"Error al registrar egreso: {str(e)}"}), 500

@egresos_bp.route('/egresos_mantenimiento/<int:id_egreso>', methods=['PUT'])
def actualizar_egreso(id_egreso):
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE egresos_mantenimiento
            SET proveedor=%s, descripcion=%s, fecha_egreso=%s,
                id_inventario=%s, id_transaccion=%s
            WHERE id_egreso=%s
        """, (
            data['proveedor'],
            data.get('descripcion', ''),
            data.get('fecha_egreso', datetime.today().strftime('%Y-%m-%d')),
            data['id_inventario'],
            data['id_transaccion'],
            id_egreso
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Egreso actualizado correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al actualizar egreso: {str(e)}"}), 500

@egresos_bp.route('/egresos_mantenimiento/<int:id_egreso>', methods=['DELETE'])
def eliminar_egreso(id_egreso):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM egresos_mantenimiento WHERE id_egreso = %s", (id_egreso,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Egreso eliminado correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al eliminar egreso: {str(e)}"}), 500
