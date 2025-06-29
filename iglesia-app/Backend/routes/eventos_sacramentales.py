from flask import Blueprint, request, jsonify
from db.conexion import get_connection

sacramentales_bp = Blueprint('sacramentales_bp', __name__)

@sacramentales_bp.route('/eventos_sacramentales', methods=['GET'])
def listar_eventos():
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
        cursor.close()
        conn.close()
        return jsonify(eventos)
    except Exception as e:
        return jsonify({"mensaje": f"Error al listar eventos: {str(e)}"}), 500


