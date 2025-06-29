from flask import Blueprint, request, jsonify
from db.conexion import get_connection

egresos_bp = Blueprint('egresos_bp', __name__)

@egresos_bp.route('/egresos_mantenimiento', methods=['GET'])
def listar_egresos():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT e.id_egreso, e.proveedor, e.descripcion, e.id_inventario, e.id_transaccion,
                   i.nombre_invent, t.descripcion AS descripcion_transaccion
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
        cursor.execute("""
            INSERT INTO egresos_mantenimiento 
            (proveedor, descripcion, id_inventario, id_transaccion)
            VALUES (%s, %s, %s, %s)
        """, (
            data['proveedor'], data.get('descripcion', ''),
            data['id_inventario'], data['id_transaccion']
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Egreso registrado correctamente"}), 201
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
            SET proveedor=%s, descripcion=%s, id_inventario=%s, id_transaccion=%s
            WHERE id_egreso=%s
        """, (
            data['proveedor'], data.get('descripcion', ''),
            data['id_inventario'], data['id_transaccion'], id_egreso
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
