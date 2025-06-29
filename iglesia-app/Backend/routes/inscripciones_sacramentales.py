from flask import Blueprint, request, jsonify
from db.conexion import get_connection

inscripciones_bp = Blueprint('inscripciones_bp', __name__)

# =====================
# LISTAR INSCRIPCIONES
# =====================
@inscripciones_bp.route('/inscripciones', methods=['GET'])
def listar_inscripciones():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT i.id_inscripcion, i.estado_matricula, i.fecha_matricula, 
                   i.fecha_ceremonia_acordada, i.evaluacion_oral, i.descripcion,
                   p.id_persona, p.dni, p.nombres, p.apellido1, p.apellido2, 
                   p.email, p.telefono, p.fecha_nacimiento, p.direccion,
                   s.id_sacramento, s.nombre_sacrament
            FROM inscripciones_sacramentales i
            JOIN personas p ON i.id_persona = p.id_persona
            JOIN sacramentos s ON i.id_sacramento = s.id_sacramento
        """)
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({"mensaje": f"Error al listar inscripciones: {str(e)}"}), 500

# =====================
# LISTAR PERSONAS COMBO
# =====================
@inscripciones_bp.route('/personas-combo', methods=['GET'])
def obtener_personas_combo():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id_persona, CONCAT(nombres, ' ', apellido1, ' ', apellido2) AS nombre_completo, dni
            FROM personas
            ORDER BY nombres ASC
        """)
        personas = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(personas)
    except Exception as e:
        return jsonify({"mensaje": f"Error al obtener personas: {str(e)}"}), 500

# =====================
# REGISTRAR INSCRIPCIÓN
# =====================
@inscripciones_bp.route('/inscripciones', methods=['POST'])
def registrar_inscripcion():
    data = request.get_json()
    try:
        if not data.get('id_persona') or not data.get('id_sacramento'):
            return jsonify({"mensaje": "Faltan campos requeridos: Persona o Sacramento"}), 400

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO inscripciones_sacramentales 
            (estado_matricula, fecha_matricula, fecha_ceremonia_acordada, 
             evaluacion_oral, descripcion, id_persona, id_sacramento)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            data.get('estado_matricula', 1),
            data.get('fecha_matricula') or None,
            data.get('fecha_ceremonia_acordada') or None,
            data.get('evaluacion_oral') or None,
            data.get('descripcion', ''),
            data['id_persona'],
            data['id_sacramento']
        ))

        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Inscripción registrada correctamente"}), 201

    except Exception as e:
        return jsonify({"mensaje": f"Error al registrar inscripción: {str(e)}"}), 500

# =====================
# ACTUALIZAR INSCRIPCIÓN
# =====================
@inscripciones_bp.route('/inscripciones/<int:id_inscripcion>', methods=['PUT'])
def actualizar_inscripcion(id_inscripcion):
    data = request.get_json()
    try:
        if not data.get('id_sacramento'):
            return jsonify({"mensaje": "Debe indicar el sacramento"}), 400

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE inscripciones_sacramentales
            SET estado_matricula = %s, 
                fecha_matricula = %s,
                fecha_ceremonia_acordada = %s,
                evaluacion_oral = %s,
                descripcion = %s,
                id_sacramento = %s
            WHERE id_inscripcion = %s
        """, (
            data.get('estado_matricula', 1),
            data.get('fecha_matricula') or None,
            data.get('fecha_ceremonia_acordada') or None,
            data.get('evaluacion_oral') or None,
            data.get('descripcion', ''),
            data['id_sacramento'],
            id_inscripcion
        ))

        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Inscripción actualizada correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al actualizar inscripción: {str(e)}"}), 500

# =====================
# ELIMINAR INSCRIPCIÓN
# =====================
@inscripciones_bp.route('/inscripciones/<int:id_inscripcion>', methods=['DELETE'])
def eliminar_inscripcion(id_inscripcion):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM inscripciones_sacramentales WHERE id_inscripcion = %s", (id_inscripcion,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Inscripción eliminada correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al eliminar inscripción: {str(e)}"}), 500
