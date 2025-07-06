from flask import Blueprint, request, jsonify
from db.conexion import get_connection

eventos_liturgicos_bp = Blueprint('eventos_liturgicos_bp', __name__)

# 📌 Listar eventos litúrgicos
@eventos_liturgicos_bp.route('/eventos_liturgicos', methods=['GET'])
def listar_eventos():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                e.id_evento, e.nombre, e.fecha,
                e.hora_inicio, e.hora_fin, e.observacion, e.id_parroquia,
                p.nombre_prrq AS nombre_parroquia
            FROM eventos_liturgicos e
            JOIN parroquias p ON e.id_parroquia = p.id_parroquia
        """)
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({"mensaje": f"Error al listar eventos: {str(e)}"}), 500

# 📌 Crear evento litúrgico
@eventos_liturgicos_bp.route('/eventos_liturgicos', methods=['POST'])
def crear_evento():
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO eventos_liturgicos
            (tipo_evento, nombre, fecha, hora_inicio, hora_fin, observacion, id_parroquia)
            VALUES ('liturgico', %s, %s, %s, %s, %s, %s)
        """, (
            data['nombre'], data['fecha'], data['hora_inicio'],
            data.get('hora_fin'), data.get('observacion'), data['id_parroquia']
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Evento registrado correctamente"}), 201
    except Exception as e:
        return jsonify({"mensaje": f"Error al registrar evento: {str(e)}"}), 500

# 📌 Actualizar evento litúrgico
@eventos_liturgicos_bp.route('/eventos_liturgicos/<int:id_evento>', methods=['PUT'])
def actualizar_evento(id_evento):
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE eventos_liturgicos
            SET tipo_evento='liturgico', nombre=%s, fecha=%s,
                hora_inicio=%s, hora_fin=%s, observacion=%s, id_parroquia=%s
            WHERE id_evento=%s
        """, (
            data['nombre'], data['fecha'], data['hora_inicio'],
            data.get('hora_fin'), data.get('observacion'),
            data['id_parroquia'], id_evento
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Evento actualizado correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al actualizar evento: {str(e)}"}), 500

# 📌 Eliminar evento litúrgico
@eventos_liturgicos_bp.route('/eventos_liturgicos/<int:id_evento>', methods=['DELETE'])
def eliminar_evento(id_evento):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM eventos_liturgicos WHERE id_evento = %s", (id_evento,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Evento eliminado correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al eliminar evento: {str(e)}"}), 500
