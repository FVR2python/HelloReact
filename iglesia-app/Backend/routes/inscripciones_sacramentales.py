from flask import Blueprint, request, jsonify
from db.conexion import get_connection

inscripciones_bp = Blueprint('inscripciones_bp', __name__)

# =====================
# FUNCIÓN AUXILIAR DE VALIDACIÓN DE ROL
# =====================
def validar_rol_persona_rol(conn, id_persona_rol, roles_permitidos):
    if not id_persona_rol:
        return True  # Puede ser NULL
    cursor = conn.cursor()
    placeholders = ','.join(['%s'] * len(roles_permitidos))
    cursor.execute(f"""
        SELECT COUNT(*) FROM personas_roles pr
        JOIN roles r ON pr.id_rol = r.id_rol
        WHERE pr.id_persona_rol = %s AND r.nombre_rol IN ({placeholders})
    """, (id_persona_rol, *roles_permitidos))
    result = cursor.fetchone()[0]
    return result > 0

# =====================
# LISTAR INSCRIPCIONES
# =====================
@inscripciones_bp.route('/inscripciones', methods=['GET'])
def listar_inscripciones():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                i.id_inscripcion,
                i.estado_matricula,
                DATE_FORMAT(i.fecha_matricula, '%Y-%m-%d') AS fecha_matricula,
                i.descripcion,
                p.id_persona,
                s.id_sacramento,
                s.nombre_sacrament AS nombre_sacramento,
                CONCAT(p.nombres, ' ', p.apellido1, ' ', IFNULL(p.apellido2, '')) AS nombre_persona,

                i.id_persona_rol_conyuge,
                i.id_padrino,
                i.id_madrina,

                IFNULL(CONCAT(pc.nombres, ' ', pc.apellido1, ' ', IFNULL(pc.apellido2, '')), 'No tiene cónyuge') AS nombre_conyuge,
                IFNULL(CONCAT(pp.nombres, ' ', pp.apellido1, ' ', IFNULL(pp.apellido2, '')), 'No tiene padrino') AS nombre_padrino,
                IFNULL(CONCAT(pm.nombres, ' ', pm.apellido1, ' ', IFNULL(pm.apellido2, '')), 'No tiene madrina') AS nombre_madrina,

                i.observaciones,
                pr.monto_base AS precio_sacramento

            FROM inscripciones_sacramentales i
            JOIN personas p ON i.id_persona = p.id_persona
            JOIN sacramentos s ON i.id_sacramento = s.id_sacramento

            LEFT JOIN personas_roles prc ON i.id_persona_rol_conyuge = prc.id_persona_rol
            LEFT JOIN personas pc ON prc.id_persona = pc.id_persona

            LEFT JOIN personas_roles prp ON i.id_padrino = prp.id_persona_rol
            LEFT JOIN personas pp ON prp.id_persona = pp.id_persona

            LEFT JOIN personas_roles prm ON i.id_madrina = prm.id_persona_rol
            LEFT JOIN personas pm ON prm.id_persona = pm.id_persona

            LEFT JOIN sacramento_precios sp ON s.id_sacramento = sp.id_sacramento
            LEFT JOIN precios pr ON sp.id_precio = pr.id_precio
        """)

        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({"mensaje": f"Error al listar inscripciones: {str(e)}"}), 500

# ===========================
# REGISTRAR INSCRIPCIÓN
# ===========================
@inscripciones_bp.route('/inscripciones', methods=['POST'])
def registrar_inscripcion():
    data = request.get_json()
    try:
        if not data.get('id_persona') or not data.get('id_sacramento'):
            return jsonify({"mensaje": "Faltan campos obligatorios"}), 400

        conn = get_connection()

        if not validar_rol_persona_rol(conn, data.get('id_padrino'), ['Padrino']):
            return jsonify({"mensaje": "El padrino no es válido"}), 400
        if not validar_rol_persona_rol(conn, data.get('id_madrina'), ['Madrina']):
            return jsonify({"mensaje": "La madrina no es válida"}), 400
        if not validar_rol_persona_rol(conn, data.get('id_persona_rol_conyuge'), ['Cónyuge']):
            return jsonify({"mensaje": "El cónyuge no es válido"}), 400

        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO inscripciones_sacramentales 
            (estado_matricula, fecha_matricula, descripcion, id_persona, id_sacramento, 
             id_persona_rol_conyuge, id_padrino, id_madrina, observaciones)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            data.get('estado_matricula', 1),
            data.get('fecha_matricula'),
            data.get('descripcion', ''),
            data['id_persona'],
            data['id_sacramento'],
            data.get('id_persona_rol_conyuge'),
            data.get('id_padrino'),
            data.get('id_madrina'),
            data.get('observaciones')
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Inscripción registrada exitosamente"}), 201
    except Exception as e:
        return jsonify({"mensaje": f"Error al registrar inscripción: {str(e)}"}), 500

# ===========================
# ACTUALIZAR INSCRIPCIÓN
# ===========================
@inscripciones_bp.route('/inscripciones/<int:id_inscripcion>', methods=['PUT'])
def actualizar_inscripcion(id_inscripcion):
    data = request.get_json()
    try:
        conn = get_connection()

        if not validar_rol_persona_rol(conn, data.get('id_padrino'), ['Padrino']):
            return jsonify({"mensaje": "El padrino no es válido"}), 400
        if not validar_rol_persona_rol(conn, data.get('id_madrina'), ['Madrina']):
            return jsonify({"mensaje": "La madrina no es válida"}), 400
        if not validar_rol_persona_rol(conn, data.get('id_persona_rol_conyuge'), ['Cónyuge']):
            return jsonify({"mensaje": "El cónyuge no es válido"}), 400

        cursor = conn.cursor()
        cursor.execute("""
            UPDATE inscripciones_sacramentales
            SET estado_matricula = %s,
                fecha_matricula = %s,
                descripcion = %s,
                id_sacramento = %s,
                id_persona = %s,
                id_persona_rol_conyuge = %s,
                id_padrino = %s,
                id_madrina = %s,
                observaciones = %s
            WHERE id_inscripcion = %s
        """, (
            data.get('estado_matricula', 1),
            data.get('fecha_matricula'),
            data.get('descripcion', ''),
            data['id_sacramento'],
            data['id_persona'],
            data.get('id_persona_rol_conyuge'),
            data.get('id_padrino'),
            data.get('id_madrina'),
            data.get('observaciones'),
            id_inscripcion
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Inscripción actualizada correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al actualizar inscripción: {str(e)}"}), 500

# ===========================
# ELIMINAR INSCRIPCIÓN
# ===========================
@inscripciones_bp.route('/inscripciones/<int:id_inscripcion>', methods=['DELETE'])
def eliminar_inscripcion(id_inscripcion):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM inscripciones_sacramentales WHERE id_inscripcion = %s", (id_inscripcion,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Inscripción eliminada correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al eliminar inscripción: {str(e)}"}), 500

# ===============================
# COMBO DINÁMICO DE PERSONAS POR ROL
# ===============================
@inscripciones_bp.route('/personas-rol/<string:rol>', methods=['GET'])
def obtener_personas_por_rol(rol):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                pr.id_persona_rol,
                CONCAT(p.nombres, ' ', p.apellido1, ' ', IFNULL(p.apellido2, '')) AS nombre_persona,
                p.dni
            FROM personas_roles pr
            JOIN personas p ON pr.id_persona = p.id_persona
            JOIN roles r ON pr.id_rol = r.id_rol
            WHERE r.nombre_rol = %s
            ORDER BY p.nombres
        """, (rol,))
        personas = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(personas)
    except Exception as e:
        return jsonify({"mensaje": f"Error al obtener personas con rol {rol}: {str(e)}"}), 500

# ===============================
# PERSONAS FILTRADAS POR SACRAMENTO
# ===============================
@inscripciones_bp.route('/personas-por-sacramento/<int:id_sacramento>', methods=['GET'])
def obtener_personas_para_inscripcion(id_sacramento):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                p.id_persona, 
                CONCAT(p.nombres, ' ', p.apellido1, ' ', IFNULL(p.apellido2, '')) AS nombre_completo, 
                p.dni
            FROM personas p
            WHERE p.estado = 1 
               OR p.id_persona IN (
                   SELECT id_persona 
                   FROM inscripciones_sacramentales 
                   WHERE id_sacramento = %s
               )
            ORDER BY p.nombres ASC
        """, (id_sacramento,))
        personas = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(personas)
    except Exception as e:
        return jsonify({"mensaje": f"Error al obtener personas: {str(e)}"}), 500
