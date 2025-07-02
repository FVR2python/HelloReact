from flask import Blueprint, request, jsonify
from db.conexion import get_connection

grupos_bp = Blueprint('grupos_bp', __name__)

# 📌 GET - Listar grupos de catequesis
@grupos_bp.route('/grupos-catequesis', methods=['GET'])
def listar_grupos():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT g.*, 
                   s.nombre_sacrament AS nombre_sacramento,
                   p.nombre_prrq AS nombre_parroquia
            FROM grupos_catequesis g
            JOIN sacramentos s ON g.id_sacramento = s.id_sacramento
            JOIN parroquias p ON g.id_parroquia = p.id_parroquia
        """)
        grupos = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(grupos)
    except Exception as e:
        return jsonify({"mensaje": f"Error al listar grupos: {str(e)}"}), 500

# 📌 POST - Crear grupo de catequesis
@grupos_bp.route('/grupos-catequesis', methods=['POST'])
def crear_grupo():
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO grupos_catequesis (nombre_grupo, fecha_inicio, fecha_fin, id_sacramento, id_parroquia)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            data['nombre_grupo'],
            data['fecha_inicio'],
            data['fecha_fin'],
            data['id_sacramento'],
            data['id_parroquia']
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Grupo registrado correctamente"}), 201
    except Exception as e:
        return jsonify({"mensaje": f"Error al registrar grupo: {str(e)}"}), 500

# 📌 PUT - Actualizar grupo de catequesis
@grupos_bp.route('/grupos-catequesis/<int:id_grupo>', methods=['PUT'])
def actualizar_grupo(id_grupo):
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE grupos_catequesis
            SET nombre_grupo=%s, fecha_inicio=%s, fecha_fin=%s, id_sacramento=%s, id_parroquia=%s
            WHERE id_grupo=%s
        """, (
            data['nombre_grupo'],
            data['fecha_inicio'],
            data['fecha_fin'],
            data['id_sacramento'],
            data['id_parroquia'],
            id_grupo
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Grupo actualizado correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al actualizar grupo: {str(e)}"}), 500

# 📌 DELETE - Eliminar grupo de catequesis
@grupos_bp.route('/grupos-catequesis/<int:id_grupo>', methods=['DELETE'])
def eliminar_grupo(id_grupo):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM grupos_catequesis WHERE id_grupo = %s", (id_grupo,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Grupo eliminado correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al eliminar grupo: {str(e)}"}), 500
