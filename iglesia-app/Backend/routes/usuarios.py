from flask import Blueprint, request, jsonify, current_app
from db.conexion import get_connection
import os

usuarios_bp = Blueprint('usuarios_bp', __name__)

def ejecutar_consulta(query, params=(), fetchone=False):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, params)
        resultado = cursor.fetchone() if fetchone else cursor.fetchall()
        cursor.close()
        conn.close()
        return resultado
    except Exception as e:
        return {'error': str(e)}

@usuarios_bp.route('/usuarios', methods=['GET'])
def listar_usuarios():
    query = """
        SELECT u.id_usuario, u.username, u.foto, p.id_persona, p.nombres, p.apellido1, p.apellido2,
               c.id_cargo, c.nombre_cargo
        FROM usuarios u
        JOIN personas p ON u.id_persona = p.id_persona
        JOIN cargos c ON u.id_cargo = c.id_cargo
        ORDER BY u.username
    """
    data = ejecutar_consulta(query)
    return jsonify(data) if isinstance(data, list) else (jsonify(data), 500)

@usuarios_bp.route('/usuarios/<int:id_usuario>', methods=['GET'])
def obtener_usuario(id_usuario):
    query = """
        SELECT u.id_usuario, u.username, u.foto, p.id_persona, p.nombres, p.apellido1, p.apellido2,
               p.dni, p.email, p.telefono, p.direccion, p.fecha_nacimiento, p.estado, p.genero,
               c.id_cargo, c.nombre_cargo
        FROM usuarios u
        JOIN personas p ON u.id_persona = p.id_persona
        JOIN cargos c ON u.id_cargo = c.id_cargo
        WHERE u.id_usuario = %s
    """
    user = ejecutar_consulta(query, (id_usuario,), fetchone=True)
    return jsonify(user) if user else (jsonify({'error': 'No encontrado'}), 404)

@usuarios_bp.route('/usuarios', methods=['POST'])
def crear_usuario():
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO usuarios (username, password, id_persona, id_cargo) VALUES (%s, %s, %s, %s)",
                       (data['username'], data['password'], data['id_persona'], data['id_cargo']))
        conn.commit()
        return jsonify({"mensaje": "Usuario creado"}), 201
    except Exception as e:
        return jsonify({"mensaje": "Nombre de usuario ya existe" if "Duplicate entry" in str(e) else str(e)}), 409
    finally:
        cursor.close()
        conn.close()

@usuarios_bp.route('/usuarios/<int:id_usuario>', methods=['PUT'])
def actualizar_usuario(id_usuario):
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE usuarios SET username=%s, password=%s, id_persona=%s, id_cargo=%s
            WHERE id_usuario=%s
        """, (data['username'], data['password'], data['id_persona'], data['id_cargo'], id_usuario))
        conn.commit()
        return jsonify({"mensaje": "Usuario actualizado"})
    except Exception as e:
        return jsonify({"mensaje": "Nombre de usuario ya existe" if "Duplicate entry" in str(e) else str(e)}), 409
    finally:
        cursor.close()
        conn.close()

@usuarios_bp.route('/usuarios/<int:id_usuario>', methods=['DELETE'])
def eliminar_usuario(id_usuario):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM usuarios WHERE id_usuario = %s", (id_usuario,))
        conn.commit()
        return jsonify({"mensaje": "Eliminado" if cursor.rowcount else "No existe"}), 200 if cursor.rowcount else 404
    except Exception as e:
        return jsonify({"mensaje": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@usuarios_bp.route('/usuarios/<int:id_usuario>/foto', methods=['POST'])
def subir_foto_usuario(id_usuario):
    if 'foto' not in request.files: return jsonify({'error': 'Sin imagen'}), 400
    archivo = request.files['foto']
    if archivo.filename == '': return jsonify({'error': 'Archivo vacío'}), 400
    ext = os.path.splitext(archivo.filename)[1].lower()
    if ext not in ['.jpg', '.jpeg', '.png']: return jsonify({'error': 'Formato inválido'}), 400
    ruta = os.path.join(current_app.root_path, 'static', 'fotos_perfil')
    os.makedirs(ruta, exist_ok=True)
    filename = f'{id_usuario}{ext}'
    archivo.save(os.path.join(ruta, filename))
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE usuarios SET foto=%s WHERE id_usuario=%s", (filename, id_usuario))
        conn.commit()
        return jsonify({'ok': True, 'filename': filename})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@usuarios_bp.route('/usuarios/<int:id_usuario>/cambiar-password', methods=['POST'])
def cambiar_password_usuario(id_usuario):
    data = request.get_json()
    query = "SELECT password FROM usuarios WHERE id_usuario = %s"
    usuario = ejecutar_consulta(query, (id_usuario,), fetchone=True)
    if not usuario: return jsonify({'error': 'No encontrado'}), 404
    if usuario['password'] != data.get('actual'): return jsonify({'error': 'Contraseña incorrecta'}), 400
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE usuarios SET password = %s WHERE id_usuario = %s", (data['nueva'], id_usuario))
        conn.commit()
        return jsonify({'ok': True, 'mensaje': 'Contraseña actualizada'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@usuarios_bp.route('/personas/<int:id_persona>', methods=['PUT'])
def actualizar_persona(id_persona):
    data = request.get_json()
    if not all(k in data for k in ['nombres','apellido1','apellido2','telefono','direccion','email']):
        return jsonify({'error': 'Campos incompletos'}), 400
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE personas SET nombres=%s, apellido1=%s, apellido2=%s,
            telefono=%s, direccion=%s, email=%s WHERE id_persona=%s
        """, (data['nombres'], data['apellido1'], data['apellido2'],
              data['telefono'], data['direccion'], data['email'], id_persona))
        conn.commit()
        return jsonify({'mensaje': 'Persona actualizada'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@usuarios_bp.route('/perfil/cargo/<int:id_cargo>/persona/<int:id_persona>', methods=['GET'])
def detalle_cargo_perfil(id_cargo, id_persona):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        if id_cargo == 4:
            cursor.execute("""SELECT g.nombre_grupo, g.fecha_inicio, g.fecha_fin FROM grupos_catequesis g
                              JOIN personas_roles pr ON pr.tipo_contexto='grupo_catequesis' AND pr.id_persona=%s
                              WHERE pr.id_rol IN (SELECT id_rol FROM roles WHERE nombre_rol LIKE '%%catequista%%')""", (id_persona,))
            return jsonify({'grupos': cursor.fetchall()})
        elif id_cargo == 2:
            cursor.execute("""SELECT p.nombre_prrq, cp.fecha_inicio FROM clerigos_parroquias cp
                              JOIN parroquias p ON cp.id_parroquia = p.id_parroquia
                              WHERE cp.id_clerigo = (SELECT id_clerigo FROM miembros_clericales WHERE id_persona = %s)""", (id_persona,))
            return jsonify({'parroquias': cursor.fetchall()})
        elif id_cargo == 3:
            cursor.execute("""SELECT num_comprobante, fecha_transaccion, monto_total AS monto FROM transacciones
                              WHERE id_persona = %s""", (id_persona,))
            return jsonify({'transacciones': cursor.fetchall()})
        return jsonify({'mensaje': 'Sin detalles específicos'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@usuarios_bp.route('/perfil/sacramentos/<int:id_persona>', methods=['GET'])
def sacramentos_persona(id_persona):
    query = """
        SELECT s.nombre_sacrament, i.fecha_matricula,
        CASE i.estado_matricula WHEN 1 THEN 'Activo' ELSE 'Inactivo' END AS estado
        FROM inscripciones_sacramentales i
        JOIN sacramentos s ON i.id_sacramento = s.id_sacramento
        WHERE i.id_persona = %s
    """
    data = ejecutar_consulta(query, (id_persona,))
    return jsonify(data) if isinstance(data, list) else (jsonify(data), 500)

@usuarios_bp.route('/perfil/roles/<int:id_persona>', methods=['GET'])
def roles_persona(id_persona):
    query = """
        SELECT r.nombre_rol, pr.tipo_contexto, pr.fecha_inicio, pr.fecha_fin
        FROM personas_roles pr JOIN roles r ON pr.id_rol = r.id_rol
        WHERE pr.id_persona = %s
    """
    data = ejecutar_consulta(query, (id_persona,))
    return jsonify(data) if isinstance(data, list) else (jsonify(data), 500)

@usuarios_bp.route('/perfil/transacciones/<int:id_persona>', methods=['GET'])
def transacciones_persona(id_persona):
    query = """
        SELECT num_comprobante, fecha_transaccion, monto_total, estado
        FROM transacciones WHERE id_persona = %s ORDER BY fecha_transaccion DESC
    """
    data = ejecutar_consulta(query, (id_persona,))
    return jsonify(data) if isinstance(data, list) else (jsonify(data), 500)

