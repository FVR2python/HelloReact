from flask import Blueprint, request, jsonify
from db.conexion import get_connection

participantes_sacramentales_bp = Blueprint('participantes_sacramentales_bp', __name__)

# 📌 GET - Obtener todos los participantes de eventos sacramentales
@participantes_sacramentales_bp.route('/participantes_sacramentales', methods=['GET'])
def obtener_participantes_sacramentales():
    try:
        conn = get_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute("""
            SELECT pe.id_participante,
                   pe.id_evento_sacramental, es.nombre_event,
                   pe.id_persona, p.nombres, p.apellido1,
                   pe.id_rol, r.nombre_rol
            FROM participantes_evento pe
            JOIN eventos_sacramentales es ON pe.id_evento_sacramental = es.id_evento
            JOIN personas p ON pe.id_persona = p.id_persona
            JOIN roles r ON pe.id_rol = r.id_rol
            WHERE pe.tipo_evento = 'sacramental'
        """)
        participantes = cur.fetchall()
        return jsonify(participantes)
    except Exception as e:
        return jsonify({'error': f'Error al obtener participantes: {str(e)}'}), 500
    finally:
        cur.close()
        conn.close()

# 📌 POST - Agregar participante a evento sacramental
@participantes_sacramentales_bp.route('/participantes_sacramentales', methods=['POST'])
def agregar_participante_sacramental():
    try:
        data = request.get_json()
        id_evento = data.get('id_evento_sacramental')
        id_persona = data.get('id_persona')
        id_rol = data.get('id_rol')

        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO participantes_evento (id_evento_sacramental, id_persona, id_rol, tipo_evento)
            VALUES (%s, %s, %s, 'sacramental')
        """, (id_evento, id_persona, id_rol))
        conn.commit()
        return jsonify({'message': 'Participante agregado correctamente'}), 201
    except Exception as e:
        return jsonify({'error': f'Error al agregar participante: {str(e)}'}), 500
    finally:
        cur.close()
        conn.close()

# 📌 DELETE - Eliminar participante por ID
@participantes_sacramentales_bp.route('/participantes_sacramentales/<int:id_participante>', methods=['DELETE'])
def eliminar_participante_sacramental(id_participante):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            DELETE FROM participantes_evento
            WHERE id_participante = %s AND tipo_evento = 'sacramental'
        """, (id_participante,))
        conn.commit()
        return jsonify({'message': 'Participante eliminado correctamente'})
    except Exception as e:
        return jsonify({'error': f'Error al eliminar participante: {str(e)}'}), 500
    finally:
        cur.close()
        conn.close()
