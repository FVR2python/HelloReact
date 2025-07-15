from flask import Blueprint, request, jsonify
from db.conexion import get_connection
from datetime import datetime

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

def es_fecha_valida(fecha_str):
    try:
        datetime.strptime(fecha_str, "%Y-%m-%d")
        return True
    except:
        return False

# ========= Rutas =========

@personas_bp.route('/personas', methods=['GET'])
def listar_personas():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT *, DATE_FORMAT(fecha_nacimiento, '%Y-%m-%d') AS fecha_nac_iso
            FROM personas
            WHERE estado = 1
        """)
        personas = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(personas)
    except Exception as e:
        return manejar_error_sql(e, "Error al listar personas")

@personas_bp.route('/personas/<int:id_persona>', methods=['GET'])
def obtener_persona(id_persona):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT *, DATE_FORMAT(fecha_nacimiento, '%Y-%m-%d') AS fecha_nac_iso
            FROM personas
            WHERE id_persona = %s
        """, (id_persona,))
        persona = cursor.fetchone()
        cursor.close()
        conn.close()
        if persona:
            return jsonify(persona)
        return jsonify({"mensaje": "Persona no encontrada"}), 404
    except Exception as e:
        return manejar_error_sql(e, "Error al obtener persona")

@personas_bp.route('/personas', methods=['POST'])
def crear_persona():
    data = request.get_json()
    campos_obligatorios = ['dni', 'nombres', 'apellido1', 'fecha_nacimiento', 'telefono']
    faltantes = validar_campos_obligatorios(data, campos_obligatorios)
    if faltantes:
        return jsonify({"mensaje": f"Faltan campos obligatorios: {', '.join(faltantes)}"}), 400
    if not es_fecha_valida(data['fecha_nacimiento']):
        return jsonify({"mensaje": "Fecha de nacimiento inválida. Formato esperado: YYYY-MM-DD"}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        query = """
            INSERT INTO personas 
            (dni, nombres, apellido1, apellido2, email, fecha_nacimiento, direccion, telefono, genero, estado)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 1)
        """
        valores = (
            data['dni'].strip(),
            data['nombres'].strip(),
            data['apellido1'].strip(),
            data.get('apellido2', '').strip(),
            data.get('email', '').strip(),
            data['fecha_nacimiento'],
            data.get('direccion', '').strip(),
            data['telefono'].strip(),
            data.get('genero', 'No especificado').strip()
        )
        cursor.execute(query, valores)
        conn.commit()
        id_generado = cursor.lastrowid

        cursor.execute("""
            SELECT *, DATE_FORMAT(fecha_nacimiento, '%Y-%m-%d') AS fecha_nac_iso
            FROM personas
            WHERE id_persona = %s
        """, (id_generado,))
        nueva_persona = cursor.fetchone()

        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Persona registrada correctamente", "persona": nueva_persona}), 201
    except Exception as e:
        return manejar_error_sql(e, "Error al registrar persona")

@personas_bp.route('/personas/<int:id_persona>', methods=['PUT'])
def actualizar_persona(id_persona):
    data = request.get_json()
    print("🟡 PUT /personas datos:", data)

    campos_obligatorios = ['dni', 'nombres', 'apellido1', 'fecha_nacimiento', 'telefono']
    faltantes = validar_campos_obligatorios(data, campos_obligatorios)
    if faltantes:
        return jsonify({"mensaje": f"Faltan campos obligatorios: {', '.join(faltantes)}"}), 400
    if not es_fecha_valida(data['fecha_nacimiento']):
        return jsonify({"mensaje": "Fecha de nacimiento inválida. Formato esperado: YYYY-MM-DD"}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        dni = data['dni'].strip()
        nombres = data['nombres'].strip()
        apellido1 = data['apellido1'].strip()
        apellido2 = data.get('apellido2', '').strip()
        email = data.get('email', '').strip()
        fecha_nacimiento = data['fecha_nacimiento']
        direccion = data.get('direccion', '').strip()
        telefono = data['telefono'].strip()
        genero = data.get('genero', 'No especificado').strip()

        # Validar duplicado
        cursor.execute("""
            SELECT id_persona FROM personas 
            WHERE (dni = %s OR email = %s) AND id_persona != %s
        """, (dni, email, id_persona))
        if cursor.fetchone():
            return jsonify({"mensaje": "DNI o correo ya registrados en otra persona."}), 400

        # Realizar actualización
        query = """
            UPDATE personas 
            SET dni=%s, nombres=%s, apellido1=%s, apellido2=%s, email=%s,
                fecha_nacimiento=%s, direccion=%s, telefono=%s, genero=%s
            WHERE id_persona = %s
        """
        valores = (
            dni, nombres, apellido1, apellido2,
            email, fecha_nacimiento, direccion,
            telefono, genero, id_persona
        )
        cursor.execute(query, valores)
        conn.commit()

        # Recuperar siempre los datos actualizados
        cursor.execute("""
            SELECT *, DATE_FORMAT(fecha_nacimiento, '%Y-%m-%d') AS fecha_nac_iso
            FROM personas
            WHERE id_persona = %s
        """, (id_persona,))
        persona_actualizada = cursor.fetchone()

        cursor.close()
        conn.close()

        return jsonify({
            "mensaje": "Persona actualizada correctamente",
            "persona": persona_actualizada
        }), 200
    except Exception as e:
        return manejar_error_sql(e, "Error al actualizar persona")

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
