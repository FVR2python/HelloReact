from flask import Blueprint, request, jsonify
from db.conexion import get_connection

objetos_bp = Blueprint('objetos_bp', __name__)

@objetos_bp.route('/objetos_liturgicos', methods=['GET'])
def listar_objetos():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT i.*, p.nombre_prrq
            FROM inventario_liturgico i
            JOIN parroquias p ON i.id_parroquia = p.id_parroquia
        """)
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({"mensaje": f"Error al listar objetos: {str(e)}"}), 500

@objetos_bp.route('/objetos_liturgicos', methods=['POST'])
def crear_objeto():
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO inventario_liturgico 
            (nombre_invent, categoria_invent, fecha_adquisicion, estado, fecha_ultima_revision, observacion, id_parroquia)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            data['nombre_invent'], data['categoria_invent'], data['fecha_adquisicion'],
            data['estado'], data['fecha_ultima_revision'],
            data.get('observacion', ''), data['id_parroquia']
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Objeto registrado correctamente"}), 201
    except Exception as e:
        return jsonify({"mensaje": f"Error al registrar objeto: {str(e)}"}), 500

@objetos_bp.route('/objetos_liturgicos/<int:id_inventario>', methods=['PUT'])
def actualizar_objeto(id_inventario):
    data = request.get_json()
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE inventario_liturgico
            SET nombre_invent=%s, categoria_invent=%s, fecha_adquisicion=%s,
                estado=%s, fecha_ultima_revision=%s, observacion=%s, id_parroquia=%s
            WHERE id_inventario=%s
        """, (
            data['nombre_invent'], data['categoria_invent'], data['fecha_adquisicion'],
            data['estado'], data['fecha_ultima_revision'], data.get('observacion', ''),
            data['id_parroquia'], id_inventario
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Objeto actualizado correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al actualizar objeto: {str(e)}"}), 500

@objetos_bp.route('/objetos_liturgicos/<int:id_inventario>', methods=['DELETE'])
def eliminar_objeto(id_inventario):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM inventario_liturgico WHERE id_inventario = %s", (id_inventario,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Objeto eliminado correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al eliminar objeto: {str(e)}"}), 500
