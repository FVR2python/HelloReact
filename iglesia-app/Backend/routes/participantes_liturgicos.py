from flask import Blueprint, request, jsonify
from db.conexion import get_connection

participantes_liturgicos = Blueprint('participantes_liturgicos', __name__)

@participantes_liturgicos.route('/api/participantes-liturgicos', methods=['GET'])
def obtener_participantes_liturgicos():
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT pe.id_participante, pe.id_evento_liturgico, el.nombre,
                   pe.id_persona, p.nombres, p.apellido1,
                   pe.id_rol, r.nombre_rol
            FROM participantes_evento pe
            JOIN eventos_liturgicos el ON pe.id_evento_liturgico = el.id_evento
            JOIN personas p ON pe.id_persona = p.id_persona
            JOIN roles r ON pe.id_rol = r.id_rol
            WHERE pe.tipo_evento = 'liturgico'
        """)
        participantes = cur.fetchall()
        resultados = [
            {
                'id_participante': p[0],
                'id_evento_liturgico': p[1],
                'nombre': p[2],
                'id_persona': p[3],
                'nombres': p[4],
                'apellido1': p[5],
                'id_rol': p[6],
                'nombre_rol': p[7]
            } for p in participantes
        ]
        cur.close()
        conn.close()
        return jsonify(resultados)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@participantes_liturgicos.route('/api/participantes-liturgicos', methods=['POST'])
def agregar_participante_liturgico():
    try:
        data = request.get_json()
        id_evento = data.get('id_evento_liturgico')
        id_persona = data.get('id_persona')
        id_rol = data.get('id_rol')

        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO participantes_evento (id_evento_liturgico, id_persona, id_rol, tipo_evento)
            VALUES (%s, %s, %s, 'liturgico')
        """, (id_evento, id_persona, id_rol))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'message': 'Participante agregado correctamente'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@participantes_liturgicos.route('/api/participantes-liturgicos/<int:id_participante>', methods=['DELETE'])
def eliminar_participante_liturgico(id_participante):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM participantes_evento WHERE id_participante = %s AND tipo_evento = 'liturgico'", (id_participante,))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'message': 'Participante eliminado correctamente'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
