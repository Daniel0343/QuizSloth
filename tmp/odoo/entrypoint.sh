#!/bin/bash
set -e

FLAG_FILE="/var/lib/odoo/.initialized"

echo "[Init] Corrigiendo permisos en /var/lib/odoo..."
chown -R odoo:odoo /var/lib/odoo
chmod -R u+rwX /var/lib/odoo

if [ ! -f "$FLAG_FILE" ]; then
    echo "[Init] Primera ejecucion: creando base de datos e instalando modulos..."
    runuser -u odoo -- odoo -c /etc/odoo/odoo.conf -i sale_management,account --without-demo=all --stop-after-init

    echo "[Init] Cargando traduccion al español..."
    runuser -u odoo -- odoo -c /etc/odoo/odoo.conf -d QuizSloth --load-language=es_ES --stop-after-init

    echo "[Init] Configurando empresa, logo e idioma..."
    runuser -u odoo -- odoo shell -c /etc/odoo/odoo.conf -d QuizSloth --no-http <<EOF
import base64, os

env['res.lang']._activate_lang('es_ES')
lang = env['res.lang'].search([('code', '=', 'es_ES')], limit=1)
if lang:
    lang.active = True

env['ir.config_parameter'].sudo().set_param('lang', 'es_ES')

company = env.company
company.name = 'QuizSloth'
company.currency_id = env.ref('base.EUR')
if os.path.exists('/sloth-logo.png'):
    with open('/sloth-logo.png', 'rb') as f:
        company.logo = base64.b64encode(f.read()).decode()
    print('[Init] Logo configurado')

u = env['res.users'].search([('login', '=', 'admin')], limit=1)
if u:
    u.write({'lang': 'es_ES'})

for user in env['res.users'].search([]):
    user.lang = 'es_ES'

env.cr.commit()
print('[Init] Configuracion completada')
EOF

    touch "$FLAG_FILE"
    echo "[Init] Inicializacion completada."
else
    echo "[Init] Sistema ya inicializado, arrancando directamente..."
fi

echo "[Init] Iniciando Odoo..."
exec runuser -u odoo -- odoo -c /etc/odoo/odoo.conf
