from flask import Blueprint, request, jsonify, send_file
from db.conexion import get_connection
import io

recibos_bp = Blueprint('recibos_bp', __name__)

# ===============================
# LISTAR RECIBOS DE PAGO
# ===============================
@recibos_bp.route('/recibos_pago', methods=['GET'])
def listar_recibos():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT r.id_recibo, r.monto_adelanto, r.saldo_pendiente, r.fecha_vencimiento, 
                   r.metodo_pago, r.id_inscripcion, r.id_transaccion,
                   i.id_persona, i.id_sacramento,
                   p.nombres, p.apellido1, p.apellido2,
                   s.nombre_sacrament,
                   t.descripcion AS descripcion_transaccion
            FROM recibos_pago r
            JOIN inscripciones_sacramentales i ON r.id_inscripcion = i.id_inscripcion
            JOIN personas p ON i.id_persona = p.id_persona
            JOIN sacramentos s ON i.id_sacramento = s.id_sacramento
            JOIN transacciones t ON r.id_transaccion = t.id_transaccion
        """)
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({"mensaje": f"Error al listar pagos: {str(e)}"}), 500

# ===============================
# CREAR RECIBO DE PAGO
# ===============================
@recibos_bp.route('/recibos_pago', methods=['POST'])
def crear_recibo():
    try:
        monto_adelanto = float(request.form['monto_adelanto'])
        fecha_vencimiento = request.form['fecha_vencimiento']
        metodo_pago = request.form['metodo_pago']
        id_inscripcion = request.form['id_inscripcion']
        id_transaccion = request.form['id_transaccion']
        archivo = request.files['archivo'].read() if 'archivo' in request.files else None

        # Obtener monto_total desde la transacción relacionada
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT monto_total FROM transacciones WHERE id_transaccion = %s", (id_transaccion,))
        resultado = cursor.fetchone()

        if not resultado:
            return jsonify({"mensaje": "Transacción no encontrada"}), 404

        monto_total = float(resultado['monto_total'])
        saldo_pendiente = monto_total - monto_adelanto

        # Insertar el nuevo recibo
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO recibos_pago (monto_adelanto, saldo_pendiente, fecha_vencimiento, 
                                      metodo_pago, archivo, id_inscripcion, id_transaccion)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (monto_adelanto, saldo_pendiente, fecha_vencimiento,
              metodo_pago, archivo, id_inscripcion, id_transaccion))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Pago registrado correctamente"}), 201
    except Exception as e:
        return jsonify({"mensaje": f"Error al registrar pago: {str(e)}"}), 500

# ===============================
# ACTUALIZAR RECIBO DE PAGO
# ===============================
@recibos_bp.route('/recibos_pago/<int:id_recibo>', methods=['PUT'])
def actualizar_recibo(id_recibo):
    try:
        monto_adelanto = float(request.form['monto_adelanto'])
        fecha_vencimiento = request.form['fecha_vencimiento']
        metodo_pago = request.form['metodo_pago']
        id_inscripcion = request.form['id_inscripcion']
        id_transaccion = request.form['id_transaccion']
        archivo = request.files['archivo'].read() if 'archivo' in request.files else None

        # Obtener monto_total actualizado
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT monto_total FROM transacciones WHERE id_transaccion = %s", (id_transaccion,))
        resultado = cursor.fetchone()

        if not resultado:
            return jsonify({"mensaje": "Transacción no encontrada"}), 404

        monto_total = float(resultado['monto_total'])
        saldo_pendiente = monto_total - monto_adelanto

        cursor = conn.cursor()
        if archivo:
            cursor.execute("""
                UPDATE recibos_pago
                SET monto_adelanto=%s, saldo_pendiente=%s, fecha_vencimiento=%s,
                    metodo_pago=%s, archivo=%s, id_inscripcion=%s, id_transaccion=%s
                WHERE id_recibo=%s
            """, (monto_adelanto, saldo_pendiente, fecha_vencimiento,
                  metodo_pago, archivo, id_inscripcion, id_transaccion, id_recibo))
        else:
            cursor.execute("""
                UPDATE recibos_pago
                SET monto_adelanto=%s, saldo_pendiente=%s, fecha_vencimiento=%s,
                    metodo_pago=%s, id_inscripcion=%s, id_transaccion=%s
                WHERE id_recibo=%s
            """, (monto_adelanto, saldo_pendiente, fecha_vencimiento,
                  metodo_pago, id_inscripcion, id_transaccion, id_recibo))

        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Pago actualizado correctamente"})
    except Exception as e:
        return jsonify({"mensaje": f"Error al actualizar pago: {str(e)}"}), 500

# ===============================
# DESCARGAR ARCHIVO DE COMPROBANTE
# ===============================
@recibos_bp.route('/recibos_pago/archivo/<int:id_recibo>', methods=['GET'])
def descargar_archivo(id_recibo):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT archivo FROM recibos_pago WHERE id_recibo = %s", (id_recibo,))
        archivo = cursor.fetchone()
        cursor.close()
        conn.close()
        if archivo and archivo[0]:
            return send_file(io.BytesIO(archivo[0]), as_attachment=True, download_name=f'pago_{id_recibo}.pdf')
        else:
            return jsonify({"mensaje": "Archivo no encontrado"}), 404
    except Exception as e:
        return jsonify({"mensaje": f"Error al descargar archivo: {str(e)}"}), 500
