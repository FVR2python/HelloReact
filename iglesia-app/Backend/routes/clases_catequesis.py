from flask import Blueprint, request, jsonify
from db.conexion import get_connection

clases_bp = Blueprint('clases_bp', __name__)

@clases_bp.route('/clases-catequesis', methods=['GET'])
def listar_clases():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT c.*, g.nombre_grupo
            FROM clases_catequesis c
            JOIN grupos_catequesis g ON c.id_grupo = g.id_grupo
        """)
        clases = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(clases)
    except Exception as e:
        return jsonify({"mensaje": f"Error al listar clases: {str(e)}"}), 500

@clases_bp.route('/clases-catequesis', methods=['POST'])
def crear_clase():
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO clases_catequesis (fecha, hora_inicio, hora_fin, tema, id_grupo)
            VALUES (%s, %s, %s, %s, %s)
        """, (data['fecha'], data['hora_inicio'], data['hora_fin'], data['tema'], data['id_grupo']))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Clase registrada correctamente"}), 201
    except Exception as e:
        return jsonify({"mensaje": f"Error al registrar clase: {str(e)}"}), 500

@clases_bp.route('/clases-catequesis/<int:id_clase>', methods=['PUT'])
def actualizar_clase(id_clase):
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE clases_catequesis
            SET fecha=%s, hora_inicio=%s, hora_fin=%s, tema=%s, id_grupo=%s
            WHERE id_clase=%s
        """, (data['fecha'], data['hora_inicio'], data['hora_fin'], data['tema'], data['id_grupo'], id_clase))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Clase actualizada correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al actualizar clase: {str(e)}"}), 500

@clases_bp.route('/clases-catequesis/<int:id_clase>', methods=['DELETE'])
def eliminar_clase(id_clase):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM clases_catequesis WHERE id_clase = %s", (id_clase,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Clase eliminada correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al eliminar clase: {str(e)}"}), 500
