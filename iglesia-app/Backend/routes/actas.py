from flask import Blueprint, request, jsonify, send_file
from db.conexion import get_connection
import io

actas_bp = Blueprint('actas_bp', __name__)

@actas_bp.route('/actas', methods=['GET'])
def listar_actas():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                a.id_acta, 
                a.fecha_emision, 
                a.tipo_documento, 
                a.id_evento_sacramental,
                e.nombre_event, 
                e.fecha_event
            FROM actas a
            JOIN eventos_sacramentales e 
              ON a.id_evento_sacramental = e.id_evento
        """)
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({"mensaje": f"Error al listar actas: {str(e)}"}), 500

@actas_bp.route('/actas', methods=['POST'])
def crear_acta():
    try:
        fecha_emision = request.form['fecha_emision']
        tipo_documento = request.form['tipo_documento']
        id_evento = request.form['id_evento_sacramental']
        archivo = request.files['archivo'].read() if 'archivo' in request.files else None

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO actas (fecha_emision, tipo_documento, archivo, id_evento_sacramental)
            VALUES (%s, %s, %s, %s)
        """, (fecha_emision, tipo_documento, archivo, id_evento))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Acta registrada correctamente"}), 201
    except Exception as e:
        msg = str(e)
        if 'Duplicate entry' in msg and 'uq_evento_doc' in msg:
            return jsonify({"mensaje": "Ya existe un acta o certificado para este evento."}), 409
        return jsonify({"mensaje": f"Error al registrar acta: {msg}"}), 500

@actas_bp.route('/actas/<int:id_acta>', methods=['PUT'])
def actualizar_acta(id_acta):
    try:
        fecha_emision = request.form['fecha_emision']
        tipo_documento = request.form['tipo_documento']
        id_evento = request.form['id_evento_sacramental']
        archivo = request.files['archivo'].read() if 'archivo' in request.files else None

        conn = get_connection()
        cursor = conn.cursor()

        if archivo:
            cursor.execute("""
                UPDATE actas
                SET fecha_emision=%s, tipo_documento=%s, archivo=%s, id_evento_sacramental=%s
                WHERE id_acta=%s
            """, (fecha_emision, tipo_documento, archivo, id_evento, id_acta))
        else:
            cursor.execute("""
                UPDATE actas
                SET fecha_emision=%s, tipo_documento=%s, id_evento_sacramental=%s
                WHERE id_acta=%s
            """, (fecha_emision, tipo_documento, id_evento, id_acta))

        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Acta actualizada correctamente"})
    except Exception as e:
        msg = str(e)
        if 'Duplicate entry' in msg and 'uq_evento_doc' in msg:
            return jsonify({"mensaje": "Ya existe un acta o certificado para este evento."}), 409
        return jsonify({"mensaje": f"Error al actualizar acta: {msg}"}), 500

@actas_bp.route('/actas/archivo/<int:id_acta>', methods=['GET'])
def descargar_archivo(id_acta):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT archivo FROM actas WHERE id_acta = %s", (id_acta,))
        archivo = cursor.fetchone()
        cursor.close()
        conn.close()

        if archivo and archivo[0]:
            return send_file(
                io.BytesIO(archivo[0]), 
                as_attachment=True, 
                download_name=f'acta_{id_acta}.pdf'
            )
        else:
            return jsonify({"mensaje": "Archivo no encontrado"}), 404
    except Exception as e:
        return jsonify({"mensaje": f"Error al descargar archivo: {str(e)}"}), 500
