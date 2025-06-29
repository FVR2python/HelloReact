from flask import Blueprint, request, jsonify
from db.conexion import get_connection

personas_roles_bp = Blueprint('personas_roles_bp', __name__)

@personas_roles_bp.route('/personas_roles', methods=['GET'])
def listar_personas_roles():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT pr.*, p.nombres, p.apellido1, r.nombre_rol
            FROM personas_roles pr
            JOIN personas p ON pr.id_persona = p.id_persona
            JOIN roles r ON pr.id_rol = r.id_rol
        """)
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({'mensaje': f'Error al listar: {str(e)}'}), 500

@personas_roles_bp.route('/personas_roles', methods=['POST'])
def crear_persona_rol():
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        query = """
            INSERT INTO personas_roles (id_persona, id_rol, tipo_contexto, fecha_inicio, fecha_fin)
            VALUES (%s, %s, %s, %s, %s)
        """
        valores = (
            data['id_persona'], data['id_rol'], data['tipo_contexto'],
            data['fecha_inicio'], data.get('fecha_fin')
        )
        cursor.execute(query, valores)
        conn.commit()
        nuevo_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return jsonify({'mensaje': 'Asignación registrada', 'id_persona_rol': nuevo_id}), 201
    except Exception as e:
        return jsonify({'mensaje': f'Error al registrar: {str(e)}'}), 500

@personas_roles_bp.route('/personas_roles/<int:id>', methods=['PUT'])
def actualizar_persona_rol(id):
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        query = """
            UPDATE personas_roles
            SET id_persona=%s, id_rol=%s, tipo_contexto=%s,
                fecha_inicio=%s, fecha_fin=%s
            WHERE id_persona_rol = %s
        """
        valores = (
            data['id_persona'], data['id_rol'], data['tipo_contexto'],
            data['fecha_inicio'], data.get('fecha_fin'), id
        )
        cursor.execute(query, valores)
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'mensaje': 'Asignación actualizada'})
    except Exception as e:
        return jsonify({'mensaje': f'Error al actualizar: {str(e)}'}), 500

@personas_roles_bp.route('/personas_roles/<int:id>', methods=['DELETE'])
def eliminar_persona_rol(id):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM personas_roles WHERE id_persona_rol = %s", (id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'mensaje': 'Asignación eliminada'})
    except Exception as e:
        return jsonify({'mensaje': f'Error al eliminar: {str(e)}'}), 500
