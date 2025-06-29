from flask import Blueprint, request, jsonify
from db.conexion import get_connection

cargos_bp = Blueprint('cargos_bp', __name__)

# ========= UTILIDAD =========
def manejar_error_sql(e, mensaje_base="Error"):
    msg = str(e)
    if "Duplicate entry" in msg:
        return jsonify({"mensaje": "El nombre del cargo ya existe."}), 400
    return jsonify({"mensaje": f"{mensaje_base}: {msg}"}), 500

# ========= ENDPOINTS =========

# GET - Listar todos los cargos
@cargos_bp.route('/cargos', methods=['GET'])
def listar_cargos():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM cargos")
        cargos = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(cargos)
    except Exception as e:
        return manejar_error_sql(e, "Error al listar cargos")

# POST - Registrar nuevo cargo
@cargos_bp.route('/cargos', methods=['POST'])
def crear_cargo():
    data = request.get_json()
    if not data.get('nombre_cargo'):
        return jsonify({"mensaje": "El nombre del cargo es obligatorio."}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor()
        query = "INSERT INTO cargos (nombre_cargo, descripcion) VALUES (%s, %s)"
        valores = (data['nombre_cargo'], data.get('descripcion', ''))
        cursor.execute(query, valores)
        conn.commit()
        id_generado = cursor.lastrowid
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Cargo registrado correctamente", "id_cargo": id_generado}), 201
    except Exception as e:
        return manejar_error_sql(e, "Error al registrar cargo")

# PUT - Actualizar cargo existente
@cargos_bp.route('/cargos/<int:id_cargo>', methods=['PUT'])
def actualizar_cargo(id_cargo):
    data = request.get_json()
    if not data.get('nombre_cargo'):
        return jsonify({"mensaje": "El nombre del cargo es obligatorio."}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor()
        query = """
            UPDATE cargos
            SET nombre_cargo = %s, descripcion = %s
            WHERE id_cargo = %s
        """
        valores = (data['nombre_cargo'], data.get('descripcion', ''), id_cargo)
        cursor.execute(query, valores)
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Cargo actualizado correctamente"})
    except Exception as e:
        return manejar_error_sql(e, "Error al actualizar cargo")

# DELETE - Eliminar cargo
@cargos_bp.route('/cargos/<int:id_cargo>', methods=['DELETE'])
def eliminar_cargo(id_cargo):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM cargos WHERE id_cargo = %s", (id_cargo,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Cargo eliminado correctamente"})
    except Exception as e:
        return manejar_error_sql(e, "Error al eliminar cargo")

# GET - Obtener detalles de perfil de una persona por cargo
@cargos_bp.route('/perfil/cargo/<int:id_cargo>/persona/<int:id_persona>', methods=['GET'])
def obtener_detalles_perfil(id_cargo, id_persona):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                p.id_persona, p.nombres, p.apellido1, p.apellido2, p.dni, p.email,
                p.fecha_nacimiento, p.telefono, p.direccion,
                c.id_cargo, c.nombre_cargo,
                TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) AS edad
            FROM personas p
            JOIN usuarios u ON p.id_persona = u.id_persona
            JOIN cargos c ON u.id_cargo = c.id_cargo
            WHERE p.id_persona = %s AND c.id_cargo = %s
        """, (id_persona, id_cargo))

        detalles = cursor.fetchone()
        cursor.close()
        conn.close()

        if detalles:
            return jsonify(detalles)
        else:
            return jsonify({"mensaje": "No se encontraron detalles para este perfil"}), 404

    except Exception as e:
        return manejar_error_sql(e, "Error al obtener detalles del perfil")
