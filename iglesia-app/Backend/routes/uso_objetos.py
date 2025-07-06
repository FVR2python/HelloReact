from flask import Blueprint, request, jsonify
from db.conexion import get_connection

uso_objetos_bp = Blueprint('uso_objetos_bp', __name__)

# 📌 GET - Listar usos
@uso_objetos_bp.route('/uso_objetos', methods=['GET'])
def listar_usos():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                u.id_uso,
                u.id_inventario,
                u.tipo_evento,
                u.id_evento_sacramental,
                u.id_evento_liturgico,
                u.estado_post_uso,
                u.observacion,
                i.nombre_invent,
                COALESCE(es.nombre_event, el.nombre) AS nombre_evento,
                COALESCE(es.fecha_event, el.fecha) AS fecha_evento
            FROM uso_inventario u
            JOIN inventario_liturgico i ON u.id_inventario = i.id_inventario
            LEFT JOIN eventos_sacramentales es ON u.id_evento_sacramental = es.id_evento
            LEFT JOIN eventos_liturgicos el ON u.id_evento_liturgico = el.id_evento
        """)
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({"mensaje": f"Error al listar usos: {str(e)}"}), 500

# 📌 POST - Crear nuevo uso
@uso_objetos_bp.route('/uso_objetos', methods=['POST'])
def crear_uso():
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO uso_inventario
            (id_inventario, tipo_evento, id_evento_sacramental, id_evento_liturgico,
             estado_post_uso, observacion)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            data['id_inventario'], 
            data['tipo_evento'],
            data.get('id_evento_sacramental'), 
            data.get('id_evento_liturgico'),
            data['estado_post_uso'], 
            data.get('observacion')
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Uso registrado correctamente"}), 201
    except Exception as e:
        msg = str(e)
        if 'Duplicate entry' in msg:
            return jsonify({"mensaje": "Ya existe un registro de uso para este inventario y evento."}), 409
        return jsonify({"mensaje": f"Error al registrar uso: {msg}"}), 500

# 📌 PUT - Actualizar uso
@uso_objetos_bp.route('/uso_objetos/<int:id_uso>', methods=['PUT'])
def actualizar_uso(id_uso):
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE uso_inventario
            SET id_inventario=%s,
                tipo_evento=%s,
                id_evento_sacramental=%s,
                id_evento_liturgico=%s,
                estado_post_uso=%s,
                observacion=%s
            WHERE id_uso=%s
        """, (
            data['id_inventario'],
            data['tipo_evento'],
            data.get('id_evento_sacramental'),
            data.get('id_evento_liturgico'),
            data['estado_post_uso'],
            data.get('observacion'),
            id_uso
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Uso actualizado correctamente"})
    except Exception as e:
        msg = str(e)
        if 'Duplicate entry' in msg:
            return jsonify({"mensaje": "Ya existe un uso con esos datos."}), 409
        return jsonify({"mensaje": f"Error al actualizar uso: {msg}"}), 500

# 📌 DELETE - Eliminar uso
@uso_objetos_bp.route('/uso_objetos/<int:id_uso>', methods=['DELETE'])
def eliminar_uso(id_uso):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM uso_inventario WHERE id_uso = %s", (id_uso,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Uso eliminado correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al eliminar uso: {str(e)}"}), 500
