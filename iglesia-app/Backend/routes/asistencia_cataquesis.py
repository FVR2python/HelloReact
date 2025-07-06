from flask import Blueprint, request, jsonify
from db.conexion import get_connection

asistencia_bp = Blueprint('asistencia_bp', __name__)

# ✅ Listar todas las asistencias (incluye sacramento y su ID)
@asistencia_bp.route('/asistencias', methods=['GET'])
def listar_asistencias():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT a.*, c.fecha, c.tema,
                   CONCAT(p.nombres, ' ', p.apellido1) AS catequizando,
                   s.nombre_sacrament AS sacramento,
                   s.id_sacramento
            FROM asistencia_catequesis a
            JOIN clases_catequesis c ON a.id_clase = c.id_clase
            JOIN personas p ON a.id_catequizando = p.id_persona
            JOIN inscripciones_sacramentales i ON p.id_persona = i.id_persona
            JOIN sacramentos s ON i.id_sacramento = s.id_sacramento
            WHERE s.nombre_sacrament IN ('Confirmación', 'Primera Comunion', 'Bautizo')
        """)
        asistencias = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(asistencias)
    except Exception as e:
        return jsonify({"mensaje": f"Error al listar asistencias: {str(e)}"}), 500

# ✅ Registrar nueva asistencia
@asistencia_bp.route('/asistencias', methods=['POST'])
def registrar_asistencia():
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO asistencia_catequesis (asistio, observacion, id_clase, id_catequizando)
            VALUES (%s, %s, %s, %s)
        """, (data['asistio'], data['observacion'], data['id_clase'], data['id_catequizando']))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Asistencia registrada correctamente"}), 201
    except Exception as e:
        return jsonify({"mensaje": f"Error al registrar asistencia: {str(e)}"}), 500

# ✅ Actualizar asistencia existente
@asistencia_bp.route('/asistencias/<int:id_asistencia>', methods=['PUT'])
def actualizar_asistencia(id_asistencia):
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE asistencia_catequesis
            SET asistio=%s, observacion=%s, id_clase=%s, id_catequizando=%s
            WHERE id_asistencia=%s
        """, (data['asistio'], data['observacion'], data['id_clase'], data['id_catequizando'], id_asistencia))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Asistencia actualizada correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al actualizar asistencia: {str(e)}"}), 500

# ✅ Eliminar asistencia
@asistencia_bp.route('/asistencias/<int:id_asistencia>', methods=['DELETE'])
def eliminar_asistencia(id_asistencia):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM asistencia_catequesis WHERE id_asistencia = %s", (id_asistencia,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Asistencia eliminada correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al eliminar asistencia: {str(e)}"}), 500

# ✅ Obtener catequizandos (inscritos en sacramentos con catequesis)
@asistencia_bp.route('/catequizandos', methods=['GET'])
def obtener_catequizandos():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT DISTINCT p.id_persona, p.nombres, p.apellido1, p.apellido2
            FROM inscripciones_sacramentales i
            JOIN personas p ON i.id_persona = p.id_persona
            JOIN sacramentos s ON i.id_sacramento = s.id_sacramento
            WHERE s.nombre_sacrament IN ('Confirmación', 'Primera Comunion', 'Bautizo')
        """)
        catequizandos = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(catequizandos)
    except Exception as e:
        return jsonify({'mensaje': f'Error al obtener catequizandos: {str(e)}'}), 500

# ✅ Obtener clases de catequesis
@asistencia_bp.route('/clases-catequesis', methods=['GET'])
def obtener_clases_catequesis():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT c.id_clase, c.fecha, c.hora_inicio, c.hora_fin, c.tema, g.nombre_grupo
            FROM clases_catequesis c
            JOIN grupos_catequesis g ON c.id_grupo = g.id_grupo
        """)
        clases = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(clases)
    except Exception as e:
        return jsonify({'mensaje': f'Error al obtener clases: {str(e)}'}), 500

# ✅ Obtener sacramentos catequéticos (para el filtro en el frontend)
@asistencia_bp.route('/sacramentos-catequesis', methods=['GET'])
def obtener_sacramentos_catequesis():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id_sacramento, nombre_sacrament
            FROM sacramentos
            WHERE nombre_sacrament IN ('Confirmación', 'Primera Comunion', 'Bautizo')
        """)
        sacramentos = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(sacramentos)
    except Exception as e:
        return jsonify({'mensaje': f'Error al obtener sacramentos: {str(e)}'}), 500
