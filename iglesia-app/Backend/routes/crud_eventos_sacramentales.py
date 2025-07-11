from flask import Blueprint, request, jsonify
from db.conexion import get_connection

crud_eventos_sacramentales_bp = Blueprint('crud_eventos_sacramentales_bp', __name__)

# GET: listar eventos sacramentales
@crud_eventos_sacramentales_bp.route('/eventos_sacramentales', methods=['GET'])
def listar_eventos_sacramentales():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT e.id_evento, e.nombre_event, e.fecha_event, e.hora_inicio, e.hora_fin, e.observacion,
                   e.id_parroquia, p.nombre_prrq AS nombre_parroquia,
                   e.id_sacramento, s.nombre_sacrament AS nombre_sacramento,
                   e.id_clerigo, CONCAT(pe.nombres, ' ', pe.apellido1) AS nombre_clerigo
            FROM eventos_sacramentales e
            JOIN parroquias p ON e.id_parroquia = p.id_parroquia
            JOIN sacramentos s ON e.id_sacramento = s.id_sacramento
            JOIN miembros_clericales mc ON e.id_clerigo = mc.id_clerigo
            JOIN personas pe ON mc.id_persona = pe.id_persona
        """)
        eventos = cursor.fetchall()
        from datetime import time, timedelta
        for evento in eventos:
            for campo in ['hora_inicio', 'hora_fin']:
                valor = evento[campo]
                if isinstance(valor, (time, timedelta)):
                    evento[campo] = str(valor)
        cursor.close()
        conn.close()
        return jsonify(eventos)
    except Exception as e:
        return jsonify({"mensaje": f"Error al listar eventos: {str(e)}"}), 500

# POST: crear evento sacramental
@crud_eventos_sacramentales_bp.route('/eventos_sacramentales', methods=['POST'])
def crear_evento_sacramental():
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO eventos_sacramentales 
            (nombre_event, fecha_event, hora_inicio, hora_fin, observacion, 
             id_parroquia, id_sacramento, id_clerigo)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            data['nombre_event'], data['fecha_event'], data['hora_inicio'], data['hora_fin'],
            data['observacion'], data['id_parroquia'], data['id_sacramento'], data['id_clerigo']
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Evento sacramental registrado correctamente"}), 201
    except Exception as e:
        return jsonify({"mensaje": f"Error al registrar evento: {str(e)}"}), 500

# PUT: actualizar evento sacramental
@crud_eventos_sacramentales_bp.route('/eventos_sacramentales/<int:id_evento>', methods=['PUT'])
def actualizar_evento_sacramental(id_evento):
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE eventos_sacramentales 
            SET nombre_event=%s, fecha_event=%s, hora_inicio=%s, hora_fin=%s, observacion=%s, 
                id_parroquia=%s, id_sacramento=%s, id_clerigo=%s
            WHERE id_evento=%s
        """, (
            data['nombre_event'], data['fecha_event'], data['hora_inicio'], data['hora_fin'],
            data['observacion'], data['id_parroquia'], data['id_sacramento'], data['id_clerigo'],
            id_evento
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Evento sacramental actualizado correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al actualizar evento: {str(e)}"}), 500

# DELETE: eliminar evento sacramental
@crud_eventos_sacramentales_bp.route('/eventos_sacramentales/<int:id_evento>', methods=['DELETE'])
def eliminar_evento_sacramental(id_evento):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM eventos_sacramentales WHERE id_evento = %s", (id_evento,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Evento sacramental eliminado correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al eliminar evento: {str(e)}"}), 500
