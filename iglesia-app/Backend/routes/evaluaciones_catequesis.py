from flask import Blueprint, request, jsonify
from db.conexion import get_connection

evaluaciones_bp = Blueprint('evaluaciones_bp', __name__)

# 📌 GET - Listar evaluaciones
@evaluaciones_bp.route('/evaluaciones', methods=['GET'])
def listar_evaluaciones():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT e.*, 
                   g.nombre_grupo,
                   CONCAT(p.nombres, ' ', p.apellido1) AS catequizando
            FROM evaluaciones_catequesis e
            JOIN grupos_catequesis g ON e.id_grupo = g.id_grupo
            JOIN personas p ON e.id_persona = p.id_persona
        """)
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({"mensaje": f"Error al listar evaluaciones: {str(e)}"}), 500

# 📌 POST - Registrar evaluación
@evaluaciones_bp.route('/evaluaciones', methods=['POST'])
def registrar_evaluacion():
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO evaluaciones_catequesis
            (id_persona, id_grupo, nota, estado_final, observaciones, fecha_evaluacion)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            data['id_persona'],
            data['id_grupo'],
            data['nota'],
            data['estado_final'],
            data.get('observaciones', ''),
            data['fecha_evaluacion']
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Evaluación registrada correctamente"}), 201
    except Exception as e:
        return jsonify({"mensaje": f"Error al registrar evaluación: {str(e)}"}), 500

# 📌 PUT - Actualizar evaluación
@evaluaciones_bp.route('/evaluaciones/<int:id_evaluacion>', methods=['PUT'])
def actualizar_evaluacion(id_evaluacion):
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE evaluaciones_catequesis
            SET id_persona=%s, id_grupo=%s, nota=%s, estado_final=%s, observaciones=%s, fecha_evaluacion=%s
            WHERE id_evaluacion=%s
        """, (
            data['id_persona'],
            data['id_grupo'],
            data['nota'],
            data['estado_final'],
            data.get('observaciones', ''),
            data['fecha_evaluacion'],
            id_evaluacion
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Evaluación actualizada correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al actualizar evaluación: {str(e)}"}), 500

# 📌 DELETE - Eliminar evaluación
@evaluaciones_bp.route('/evaluaciones/<int:id_evaluacion>', methods=['DELETE'])
def eliminar_evaluacion(id_evaluacion):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM evaluaciones_catequesis WHERE id_evaluacion = %s", (id_evaluacion,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Evaluación eliminada correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al eliminar evaluación: {str(e)}"}), 500
