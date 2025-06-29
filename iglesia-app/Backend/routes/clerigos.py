from flask import Blueprint, request, jsonify
from db.conexion import get_connection

clerigos_bp = Blueprint('clerigos_bp', __name__)

# GET Clérigos
@clerigos_bp.route('/clerigos', methods=['GET'])
def listar_clerigos():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT mc.*, p.nombres, p.apellido1, p.dni, j.nombre_jerarquia
            FROM miembros_clericales mc
            JOIN personas p ON mc.id_persona = p.id_persona
            JOIN jerarquias j ON mc.id_jerarquia = j.id_jerarquia
        """)
        datos = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(datos)
    except Exception as e:
        return jsonify({"mensaje": f"Error al listar clérigos: {str(e)}"}), 500

# POST Clérigo
@clerigos_bp.route('/clerigos', methods=['POST'])
def crear_clerigo():
    data = request.get_json()
    if not data.get('id_persona') or not data.get('id_jerarquia') or not data.get('fecha_ordenacion'):
        return jsonify({"mensaje": "Todos los campos son obligatorios."}), 400
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO miembros_clericales (id_persona, id_jerarquia, fecha_ordenacion)
            VALUES (%s, %s, %s)
        """, (data['id_persona'], data['id_jerarquia'], data['fecha_ordenacion']))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Clérigo registrado correctamente"}), 201
    except Exception as e:
        msg = str(e)
        if "Duplicate entry" in msg:
            return jsonify({"mensaje": "Esta persona ya está registrada como clérigo."}), 400
        return jsonify({"mensaje": f"Error al registrar clérigo: {msg}"}), 500

# PUT Clérigo
@clerigos_bp.route('/clerigos/<int:id_clerigo>', methods=['PUT'])
def actualizar_clerigo(id_clerigo):
    data = request.get_json()
    if not data.get('id_persona') or not data.get('id_jerarquia') or not data.get('fecha_ordenacion'):
        return jsonify({"mensaje": "Todos los campos son obligatorios."}), 400
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE miembros_clericales
            SET id_persona=%s, id_jerarquia=%s, fecha_ordenacion=%s
            WHERE id_clerigo=%s
        """, (data['id_persona'], data['id_jerarquia'], data['fecha_ordenacion'], id_clerigo))
        conn.commit()
        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return jsonify({"mensaje": "Clérigo no encontrado."}), 404
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Clérigo actualizado correctamente"})
    except Exception as e:
        msg = str(e)
        if "Duplicate entry" in msg:
            return jsonify({"mensaje": "Esta persona ya está registrada como clérigo."}), 400
        return jsonify({"mensaje": f"Error al actualizar clérigo: {msg}"}), 500

# DELETE Clérigo
@clerigos_bp.route('/clerigos/<int:id_clerigo>', methods=['DELETE'])
def eliminar_clerigo(id_clerigo):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM miembros_clericales WHERE id_clerigo = %s", (id_clerigo,))
        conn.commit()
        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return jsonify({"mensaje": "Clérigo no encontrado."}), 404
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Clérigo eliminado correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al eliminar clérigo: {str(e)}"}), 500

# GET Jerarquías (para combos)
@clerigos_bp.route('/jerarquias', methods=['GET'])
def listar_jerarquias():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM jerarquias ORDER BY nombre_jerarquia")
        datos = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(datos)
    except Exception as e:
        return jsonify({"mensaje": f"Error al listar jerarquías: {str(e)}"}), 500
