from flask import Blueprint, request, jsonify
from db.conexion import get_connection

sacramentos_precios_bp = Blueprint('sacramentos_precios_bp', __name__)

# =====================
# SACRAMENTOS
# =====================
@sacramentos_precios_bp.route('/sacramentos', methods=['GET'])
def listar_sacramentos():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id_sacramento, nombre_sacrament, descripcion FROM sacramentos")
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({"mensaje": f"Error al listar sacramentos: {str(e)}"}), 500

@sacramentos_precios_bp.route('/sacramentos', methods=['POST'])
def registrar_sacramento():
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO sacramentos (nombre_sacrament, descripcion)
            VALUES (%s, %s)
        """, (data['nombre_sacrament'], data.get('descripcion', '')))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Sacramento registrado correctamente"}), 201
    except Exception as e:
        return jsonify({"mensaje": f"Error al registrar sacramento: {str(e)}"}), 500

# =====================
# PRECIOS
# =====================
@sacramentos_precios_bp.route('/precios', methods=['GET'])
def listar_precios():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id_precio, monto_base, fecha_inicio FROM precios")
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({"mensaje": f"Error al listar precios: {str(e)}"}), 500

@sacramentos_precios_bp.route('/precios', methods=['POST'])
def registrar_precio():
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO precios (monto_base, fecha_inicio)
            VALUES (%s, %s)
        """, (data['monto_base'], data['fecha_inicio']))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Precio registrado correctamente"}), 201
    except Exception as e:
        return jsonify({"mensaje": f"Error al registrar precio: {str(e)}"}), 500

# =====================
# RELACIÓN SACRAMENTO - PRECIO
# =====================
@sacramentos_precios_bp.route('/sacramento-precios', methods=['GET'])
def listar_sacramento_precios():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT sp.id_relacion, 
                   s.id_sacramento, s.nombre_sacrament, 
                   p.id_precio, p.monto_base, p.fecha_inicio
            FROM sacramento_precios sp
            JOIN sacramentos s ON sp.id_sacramento = s.id_sacramento
            JOIN precios p ON sp.id_precio = p.id_precio
        """)
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({"mensaje": f"Error al listar relaciones: {str(e)}"}), 500

@sacramentos_precios_bp.route('/sacramento-precios', methods=['POST'])
def registrar_sacramento_precio():
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO sacramento_precios (id_sacramento, id_precio)
            VALUES (%s, %s)
        """, (data['id_sacramento'], data['id_precio']))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Relación registrada correctamente"}), 201
    except Exception as e:
        return jsonify({"mensaje": f"Error al registrar relación: {str(e)}"}), 500

@sacramentos_precios_bp.route('/sacramento-precios/<int:id_relacion>', methods=['DELETE'])
def eliminar_sacramento_precio(id_relacion):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM sacramento_precios WHERE id_relacion = %s", (id_relacion,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Relación eliminada correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al eliminar relación: {str(e)}"}), 500
