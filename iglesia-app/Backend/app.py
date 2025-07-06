import sys
import os
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from flask import Flask
from flask_cors import CORS

# Importar blueprints válidos
from routes.login import login_bp
from routes.usuarios import usuarios_bp
from routes.cargos import cargos_bp
from routes.roles import roles_bp
from routes.personas_roles import personas_roles_bp
from routes.clerigos import clerigos_bp
from routes.jerarquias import jerarquias_bp
from routes.grupos_catequesis import grupos_bp
from routes.clases_catequesis import clases_bp
from routes.asistencia_cataquesis import asistencia_bp
from routes.personas import personas_bp
from routes.sacramentos_precios import sacramentos_precios_bp
from routes.inscripciones_sacramentales import inscripciones_bp
from routes.actas import actas_bp
from routes.recibos_pago import recibos_bp
from routes.objetos_liturgicos import objetos_bp
from routes.uso_objetos import uso_objetos_bp
from routes.transacciones import transacciones_bp
from routes.recibo_finanzas import recibos_finanzas_bp
from routes.egresos_mantenimiento import egresos_bp
from routes.auditoria_transacciones import auditoria_bp
from routes.parroquias import parroquias_bp
from routes.tipos_transacciones import tipos_bp
from routes.participantes_sacramentales import participantes_sacramentales_bp
from routes.participantes_liturgicos import participantes_liturgicos
from routes.eventos_liturgicos import eventos_liturgicos_bp
from routes.crud_eventos_sacramentales import crud_eventos_sacramentales_bp
from routes.evaluaciones_catequesis import evaluaciones_bp



app = Flask(__name__)
CORS(app)

# Registrar blueprints
app.register_blueprint(login_bp)
app.register_blueprint(usuarios_bp)
app.register_blueprint(cargos_bp)
app.register_blueprint(roles_bp)
app.register_blueprint(personas_roles_bp)
app.register_blueprint(clerigos_bp)
app.register_blueprint(jerarquias_bp)
app.register_blueprint(grupos_bp)
app.register_blueprint(clases_bp)
app.register_blueprint(asistencia_bp)
app.register_blueprint(personas_bp)
app.register_blueprint(sacramentos_precios_bp)
app.register_blueprint(inscripciones_bp)
app.register_blueprint(actas_bp)
app.register_blueprint(recibos_bp)
app.register_blueprint(objetos_bp)
app.register_blueprint(uso_objetos_bp)
app.register_blueprint(transacciones_bp)
app.register_blueprint(recibos_finanzas_bp)
app.register_blueprint(egresos_bp)
app.register_blueprint(auditoria_bp)
app.register_blueprint(parroquias_bp)
app.register_blueprint(tipos_bp)
app.register_blueprint(participantes_sacramentales_bp)
app.register_blueprint(participantes_liturgicos)
app.register_blueprint(eventos_liturgicos_bp)
app.register_blueprint(crud_eventos_sacramentales_bp)
app.register_blueprint(evaluaciones_bp)


@app.route('/')
def home():
    return {"mensaje": "Bienvenido al servidor parroquial"}

if __name__ == '__main__':
    app.run(debug=True)
