from flask import Blueprint, request, jsonify
from db.conexion import get_connection

personas_bp = Blueprint('personas_bp', __name__)

# ========= Funciones auxiliares =========
def manejar_error_sql(e, mensaje_base="Error en la operación"):
    msg = str(e)
    if "Duplicate entry" in msg:
        return jsonify({"mensaje": "El DNI o email ya están registrados."}), 400
    return jsonify({"mensaje": f"{mensaje_base}: {msg}"}), 500

def validar_campos_obligatorios(data, campos):
    faltantes = [campo for campo in campos if campo not in data or not str(data[campo]).strip()]
    return faltantes

# ========= Rutas sin /api =========

# GET - Listar personas activas
@personas_bp.route('/personas', methods=['GET'])
def listar_personas():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM personas WHERE estado = 1")
        personas = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(personas)
    except Exception as e:
        return manejar_error_sql(e, "Error al listar personas")

# GET - Obtener persona por ID
@personas_bp.route('/personas/<int:id_persona>', methods=['GET'])
def obtener_persona(id_persona):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM personas WHERE id_persona = %s", (id_persona,))
        persona = cursor.fetchone()
        cursor.close()
        conn.close()
        if persona:
            return jsonify(persona)
        return jsonify({"mensaje": "Persona no encontrada"}), 404
    except Exception as e:
        return manejar_error_sql(e, "Error al obtener persona")

# POST - Crear nueva persona
@personas_bp.route('/personas', methods=['POST'])
def crear_persona():
    data = request.get_json()
    campos_obligatorios = ['dni', 'nombres', 'apellido1', 'fecha_nacimiento', 'telefono']
    faltantes = validar_campos_obligatorios(data, campos_obligatorios)
    if faltantes:
        return jsonify({"mensaje": f"Faltan campos obligatorios: {', '.join(faltantes)}"}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        query = """
            INSERT INTO personas 
            (dni, nombres, apellido1, apellido2, email, fecha_nacimiento, direccion, telefono, estado)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 1)
        """
        valores = (
            data['dni'], data['nombres'], data['apellido1'], data.get('apellido2', ''),
            data.get('email', ''), data['fecha_nacimiento'], data.get('direccion', ''),
            data['telefono']
        )
        cursor.execute(query, valores)
        conn.commit()
        id_generado = cursor.lastrowid

        cursor.execute("SELECT * FROM personas WHERE id_persona = %s", (id_generado,))
        nueva_persona = cursor.fetchone()

        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Persona registrada correctamente", "persona": nueva_persona}), 201
    except Exception as e:
        return manejar_error_sql(e, "Error al registrar persona")

# PUT - Actualizar persona
@personas_bp.route('/personas/<int:id_persona>', methods=['PUT'])
def actualizar_persona(id_persona):
    data = request.get_json()
    campos_obligatorios = ['dni', 'nombres', 'apellido1', 'fecha_nacimiento', 'telefono']
    faltantes = validar_campos_obligatorios(data, campos_obligatorios)
    if faltantes:
        return jsonify({"mensaje": f"Faltan campos obligatorios: {', '.join(faltantes)}"}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id_persona FROM personas 
            WHERE (dni = %s OR email = %s) AND id_persona != %s
        """, (data['dni'], data.get('email', ''), id_persona))
        existe = cursor.fetchone()
        if existe:
            return jsonify({"mensaje": "DNI o correo ya registrados en otra persona."}), 400

        query = """
            UPDATE personas 
            SET dni=%s, nombres=%s, apellido1=%s, apellido2=%s, email=%s,
                fecha_nacimiento=%s, direccion=%s, telefono=%s
            WHERE id_persona = %s
        """
        valores = (
            data['dni'], data['nombres'], data['apellido1'], data.get('apellido2', ''),
            data.get('email', ''), data['fecha_nacimiento'], data.get('direccion', ''),
            data['telefono'], id_persona
        )
        cursor.execute(query, valores)
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Persona actualizada correctamente"})
    except Exception as e:
        return manejar_error_sql(e, "Error al actualizar persona")

# DELETE - Desactivar persona
@personas_bp.route('/personas/<int:id_persona>', methods=['DELETE'])
def eliminar_persona(id_persona):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE personas SET estado = 0 WHERE id_persona = %s", (id_persona,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Persona desactivada correctamente"})
    except Exception as e:
        return manejar_error_sql(e, "Error al desactivar persona")
