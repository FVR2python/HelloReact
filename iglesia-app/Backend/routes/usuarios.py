from flask import Blueprint, request, jsonify, current_app
from db.conexion import get_connection
import os

usuarios_bp = Blueprint('usuarios_bp', __name__)

# ========================
# LISTAR USUARIOS
# ========================
@usuarios_bp.route('/usuarios', methods=['GET'])
def listar_usuarios():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT u.id_usuario, u.username, u.password,
                   u.foto,
                   p.id_persona, p.nombres, p.apellido1, p.apellido2,
                   c.id_cargo, c.nombre_cargo
            FROM usuarios u
            JOIN personas p ON u.id_persona = p.id_persona
            JOIN cargos c ON u.id_cargo = c.id_cargo
            ORDER BY u.username
        """)
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({"mensaje": f"Error al listar usuarios: {str(e)}"}), 500

# ========================
# OBTENER USUARIO POR ID
# ========================
@usuarios_bp.route('/usuarios/<int:id_usuario>', methods=['GET'])
def obtener_usuario(id_usuario):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT u.id_usuario, u.username, u.password,
                   u.foto,
                   p.id_persona, p.nombres, p.apellido1, p.apellido2, p.dni, p.email, p.telefono, p.direccion, p.fecha_nacimiento,
                   c.id_cargo, c.nombre_cargo
            FROM usuarios u
            JOIN personas p ON u.id_persona = p.id_persona
            JOIN cargos c ON u.id_cargo = c.id_cargo
            WHERE u.id_usuario = %s
        """, (id_usuario,))
        usuario = cursor.fetchone()
        cursor.close()
        conn.close()

        if usuario:
            return jsonify(usuario)
        else:
            return jsonify({'error': 'Usuario no encontrado'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ========================
# CREAR USUARIO (SIN HASH)
# ========================
@usuarios_bp.route('/usuarios', methods=['POST'])
def crear_usuario():
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        password = data['password']  # sin encriptar
        cursor.execute("""
            INSERT INTO usuarios (username, password, id_persona, id_cargo)
            VALUES (%s, %s, %s, %s)
        """, (data['username'], password, data['id_persona'], data['id_cargo']))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Usuario creado correctamente"}), 201
    except Exception as e:
        msg = str(e)
        if "Duplicate entry" in msg and "username" in msg:
            return jsonify({"mensaje": "El nombre de usuario ya existe."}), 409
        return jsonify({"mensaje": f"Error al crear usuario: {msg}"}), 500

# ========================
# ACTUALIZAR USUARIO (SIN HASH)
# ========================
@usuarios_bp.route('/usuarios/<int:id_usuario>', methods=['PUT'])
def actualizar_usuario(id_usuario):
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        password = data['password']  # sin encriptar
        cursor.execute("""
            UPDATE usuarios 
            SET username=%s, password=%s, id_persona=%s, id_cargo=%s
            WHERE id_usuario = %s
        """, (data['username'], password, data['id_persona'], data['id_cargo'], id_usuario))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Usuario actualizado correctamente"})
    except Exception as e:
        msg = str(e)
        if "Duplicate entry" in msg and "username" in msg:
            return jsonify({"mensaje": "El nombre de usuario ya existe."}), 409
        return jsonify({"mensaje": f"Error al actualizar usuario: {msg}"}), 500

# ========================
# ELIMINAR USUARIO
# ========================
@usuarios_bp.route('/usuarios/<int:id_usuario>', methods=['DELETE'])
def eliminar_usuario(id_usuario):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM usuarios WHERE id_usuario = %s", (id_usuario,))
        rows = cursor.rowcount
        conn.commit()
        cursor.close()
        conn.close()
        if rows == 0:
            return jsonify({"mensaje": "El usuario no existe."}), 404
        return jsonify({"mensaje": "Usuario eliminado correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al eliminar usuario: {str(e)}"}), 500

# ================================
# SUBIR FOTO DE PERFIL DE USUARIO
# ================================
@usuarios_bp.route('/usuarios/<int:id_usuario>/foto', methods=['POST'])
def subir_foto_usuario(id_usuario):
    if 'foto' not in request.files:
        return jsonify({'error': 'No se envió ninguna imagen'}), 400

    archivo = request.files['foto']
    if archivo.filename == '':
        return jsonify({'error': 'Nombre de archivo vacío'}), 400

    # Asegurar carpeta
    carpeta_destino = os.path.join(current_app.root_path, 'static', 'fotos_perfil')
    os.makedirs(carpeta_destino, exist_ok=True)

    # Usar id como nombre
    extension = os.path.splitext(archivo.filename)[1].lower()  # .jpg, .png
    if extension not in ['.jpg', '.jpeg', '.png']:
        return jsonify({'error': 'Formato de imagen no permitido'}), 400

    filename = f'{id_usuario}{extension}'
    ruta_destino = os.path.join(carpeta_destino, filename)
    archivo.save(ruta_destino)
    # ========================
# CAMBIAR CONTRASEÑA
# ========================
@usuarios_bp.route('/usuarios/<int:id_usuario>/cambiar-password', methods=['POST'])
def cambiar_password_usuario(id_usuario):
    data = request.get_json()
    actual = data.get('actual')
    nueva = data.get('nueva')

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT password FROM usuarios WHERE id_usuario = %s", (id_usuario,))
        usuario = cursor.fetchone()

        if not usuario:
            return jsonify({'error': 'Usuario no encontrado'}), 404

        if usuario['password'] != actual:
            return jsonify({'error': 'Contraseña actual incorrecta'}), 400

        cursor.execute("UPDATE usuarios SET password = %s WHERE id_usuario = %s", (nueva, id_usuario))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'ok': True, 'mensaje': 'Contraseña actualizada'})
    except Exception as e:
        return jsonify({'error': f'Error: {str(e)}'}), 500


# ================================
# OBTENER DETALLE CARGO DE PERFIL
# ================================
@usuarios_bp.route('/perfil/cargo/<int:id_cargo>/persona/<int:id_persona>', methods=['GET'])
def detalle_cargo_perfil(id_cargo, id_persona):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT c.id_cargo, c.nombre_cargo, p.id_persona, p.nombres, p.apellido1, p.apellido2
            FROM cargos c
            JOIN personas p ON p.id_persona = %s
            WHERE c.id_cargo = %s
        """, (id_persona, id_cargo))
        resultado = cursor.fetchone()
        cursor.close()
        conn.close()

        if resultado:
            return jsonify(resultado)
        else:
            return jsonify({'error': 'No encontrado'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ========================
# ACTUALIZAR DATOS PERSONALES
# ========================
@usuarios_bp.route('/personas/<int:id_persona>', methods=['PUT'])
def actualizar_persona(id_persona):
    try:
        data = request.get_json()

        campos_requeridos = ['nombres', 'apellido1', 'apellido2', 'telefono', 'direccion', 'email']
        if not all(campo in data for campo in campos_requeridos):
            return jsonify({'error': 'Faltan campos requeridos'}), 400

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE personas
            SET nombres=%s, apellido1=%s, apellido2=%s,
                telefono=%s, direccion=%s, email=%s
            WHERE id_persona=%s
        """, (
            data['nombres'], data['apellido1'], data['apellido2'],
            data['telefono'], data['direccion'], data['email'],
            id_persona
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'mensaje': 'Persona actualizada correctamente'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    # Actualizar campo en BD
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE usuarios SET foto = %s WHERE id_usuario = %s", (filename, id_usuario))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'ok': True, 'filename': filename})
    except Exception as e:
        return jsonify({'error': f'Error al guardar la foto en la BD: {str(e)}'}), 500
