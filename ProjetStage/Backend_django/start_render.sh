#!/bin/bash
set -e

cd "$(dirname "$0")"

python manage.py migrate --noinput --run-syncdb
python create_admin.py

exec gunicorn Backend_django.wsgi:application --bind 0.0.0.0:${PORT:-10000}
