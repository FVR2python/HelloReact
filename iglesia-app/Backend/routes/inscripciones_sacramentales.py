from flask import Blueprint, request, jsonify
from db.conexion import get_connection

inscripciones_bp = Blueprint('inscripciones_bp', __name__)

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

                CONCAT(p.nombres, ' ', p.apellido1, ' ', IFNULL(p.apellido2, '')) AS nombre_persona,
                s.nombre_sacrament AS nombre_sacramento,
                p.id_persona, 
                s.id_sacramento,

                dm.observaciones AS observaciones_matrimonio,
                prc.id_persona_rol AS id_persona_rol_conyuge,
                prp.id_persona_rol AS id_padrino,
                prm.id_persona_rol AS id_madrina,

                CONCAT(pc.nombres, ' ', pc.apellido1, ' ', IFNULL(pc.apellido2, '')) AS nombre_conyuge,
                CONCAT(pp.nombres, ' ', pp.apellido1, ' ', IFNULL(pp.apellido2, '')) AS nombre_padrino,
                CONCAT(pm.nombres, ' ', pm.apellido1, ' ', IFNULL(pm.apellido2, '')) AS nombre_madrina,

                pr.monto_base AS precio_sacramento

            FROM inscripciones_sacramentales i
            JOIN personas p ON i.id_persona = p.id_persona
            JOIN sacramentos s ON i.id_sacramento = s.id_sacramento

            LEFT JOIN datos_matrimonio dm ON i.id_inscripcion = dm.id_inscripcion
            LEFT JOIN personas_roles prc ON dm.id_persona_rol_conyuge = prc.id_persona_rol
            LEFT JOIN personas pc ON prc.id_persona = pc.id_persona
            LEFT JOIN personas_roles prp ON dm.id_padrino = prp.id_persona_rol
            LEFT JOIN personas pp ON prp.id_persona = pp.id_persona
            LEFT JOIN personas_roles prm ON dm.id_madrina = prm.id_persona_rol
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



# =====================
# COMBO DE PERSONAS
# =====================
@inscripciones_bp.route('/personas-combo', methods=['GET'])
def obtener_personas_combo():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id_persona, CONCAT(nombres, ' ', apellido1, ' ', IFNULL(apellido2, '')) AS nombre_completo, dni
            FROM personas
            ORDER BY nombres ASC
        """)
        personas = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(personas)
    except Exception as e:
        return jsonify({"mensaje": f"Error al obtener personas: {str(e)}"}), 500


# =====================
# REGISTRAR INSCRIPCIÓN
# =====================
@inscripciones_bp.route('/inscripciones', methods=['POST'])
def registrar_inscripcion():
    data = request.get_json()
    try:
        if not data.get('id_persona') or not data.get('id_sacramento'):
            return jsonify({"mensaje": "Faltan campos requeridos"}), 400

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO inscripciones_sacramentales 
            (estado_matricula, fecha_matricula, descripcion, id_persona, id_sacramento)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            data.get('estado_matricula', 1),
            data.get('fecha_matricula') or None,
            data.get('descripcion', ''),
            data['id_persona'],
            data['id_sacramento']
        ))

        id_inscripcion = cursor.lastrowid

        # Guardar padrino/madrina/conyuge si hay al menos uno
        if any([data.get('id_persona_rol_conyuge'), data.get('id_padrino'), data.get('id_madrina')]):
            cursor.execute("""
                INSERT INTO datos_matrimonio 
                (id_inscripcion, id_persona_rol_conyuge, id_padrino, id_madrina, observaciones)
                VALUES (%s, %s, %s, %s, %s)
            """, (
                id_inscripcion,
                data.get('id_persona_rol_conyuge'),
                data.get('id_padrino'),
                data.get('id_madrina'),
                data.get('observaciones_matrimonio')
            ))

        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Inscripción registrada correctamente", "id_inscripcion": id_inscripcion}), 201
    except Exception as e:
        return jsonify({"mensaje": f"Error al registrar inscripción: {str(e)}"}), 500


# ===========================
# ACTUALIZAR INSCRIPCIÓN
# ===========================
@inscripciones_bp.route('/inscripciones/<int:id_inscripcion>', methods=['PUT'])
def actualizar_inscripcion(id_inscripcion):
    data = request.get_json()
    try:
        if not data.get('id_sacramento'):
            return jsonify({"mensaje": "Debe indicar el sacramento"}), 400

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE inscripciones_sacramentales
            SET estado_matricula = %s, 
                fecha_matricula = %s,
                descripcion = %s,
                id_sacramento = %s
            WHERE id_inscripcion = %s
        """, (
            data.get('estado_matricula', 1),
            data.get('fecha_matricula') or None,
            data.get('descripcion', ''),
            data['id_sacramento'],
            id_inscripcion
        ))

        cursor.execute("SELECT 1 FROM datos_matrimonio WHERE id_inscripcion = %s", (id_inscripcion,))
        existe = cursor.fetchone()

        if any([data.get('id_persona_rol_conyuge'), data.get('id_padrino'), data.get('id_madrina')]):
            if existe:
                cursor.execute("""
                    UPDATE datos_matrimonio
                    SET id_persona_rol_conyuge = %s,
                        id_padrino = %s,
                        id_madrina = %s,
                        observaciones = %s
                    WHERE id_inscripcion = %s
                """, (
                    data.get('id_persona_rol_conyuge'),
                    data.get('id_padrino'),
                    data.get('id_madrina'),
                    data.get('observaciones_matrimonio'),
                    id_inscripcion
                ))
            else:
                cursor.execute("""
                    INSERT INTO datos_matrimonio
                    (id_inscripcion, id_persona_rol_conyuge, id_padrino, id_madrina, observaciones)
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    id_inscripcion,
                    data.get('id_persona_rol_conyuge'),
                    data.get('id_padrino'),
                    data.get('id_madrina'),
                    data.get('observaciones_matrimonio')
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
# PERSONAS FILTRADAS POR SACRAMENTO
# ===============================
@inscripciones_bp.route('/personas-por-sacramento/<int:id_sacramento>', methods=['GET'])
def obtener_personas_por_sacramento(id_sacramento):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT DISTINCT p.id_persona, CONCAT(p.nombres, ' ', p.apellido1, ' ', IFNULL(p.apellido2, '')) AS nombre_completo, p.dni
            FROM personas p
            JOIN inscripciones_sacramentales i ON p.id_persona = i.id_persona
            WHERE i.id_sacramento = %s
            ORDER BY p.nombres ASC
        """, (id_sacramento,))
        personas = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(personas)
    except Exception as e:
        return jsonify({"mensaje": f"Error al obtener personas filtradas: {str(e)}"}), 500
