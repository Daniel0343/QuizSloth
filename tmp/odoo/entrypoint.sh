#!/bin/bash
set -e

echo "Esperando a PostgreSQL..."
until python3 -c "
import psycopg2, os, sys
try:
    psycopg2.connect(
        host=os.environ.get('HOST','postgres'),
        user=os.environ.get('USER','administrador'),
        password=os.environ.get('PASSWORD','1234'),
        dbname='postgres'
    )
except:
    sys.exit(1)
" 2>/dev/null; do
    sleep 3
done
echo "PostgreSQL listo."

DB_EXISTS=$(python3 -c "
import psycopg2, os
conn = psycopg2.connect(
    host=os.environ.get('HOST','postgres'),
    user=os.environ.get('USER','administrador'),
    password=os.environ.get('PASSWORD','1234'),
    dbname='postgres'
)
conn.autocommit = True
cur = conn.cursor()
cur.execute(\"SELECT 1 FROM pg_database WHERE datname='QuizSloth'\")
print('yes' if cur.fetchone() else 'no')
conn.close()
")

if [ "$DB_EXISTS" = "no" ]; then
    echo "Creando base de datos e instalando modulos..."
    odoo -c /etc/odoo/odoo.conf -d QuizSloth -i sale_management,account --without-demo=all --load-language=es_ES --stop-after-init
    echo "Base de datos lista."

    echo "Configurando logo y empresa..."
    python3 -c "
import psycopg2, base64, os
with open('/sloth-logo.png', 'rb') as f:
    logo = base64.b64encode(f.read()).decode()
conn = psycopg2.connect(
    host=os.environ.get('HOST','postgres'),
    user=os.environ.get('USER','administrador'),
    password=os.environ.get('PASSWORD','1234'),
    dbname='QuizSloth'
)
conn.autocommit = True
cur = conn.cursor()
cur.execute(\"UPDATE res_company SET logo = %s, logo_web = %s, name = 'QuizSloth'\", (logo, logo))
cur.execute(\"UPDATE res_users SET lang = 'es_ES' WHERE id = 2\")
conn.close()
print('Logo configurado.')
"
fi

echo "Iniciando Odoo..."
exec odoo -c /etc/odoo/odoo.conf
