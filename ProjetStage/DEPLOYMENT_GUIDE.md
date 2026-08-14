# Deployment guide (VM with NGINX, Docker)

This guide explains step-by-step how to deploy the ProjetStage stack in production using Docker Compose. It's written for beginners.

Summary:
- Services: `django` (8000), `fastapi` (8001), `frontend` (3000)
- Compose file: `docker-compose.yml` at project root
- Environment: copy `.env.example` -> `.env` and fill values
- PostgreSQL: running on the VM host (configure `DB_HOST=host.docker.internal` in `.env`)

Basic steps:

1) SSH into the VM

2) Install Docker and Docker Compose (if not present)

3) Clone repository and go to project root

4) Copy env file and fill secrets:
```bash
cp .env.example .env
# Edit .env and set SECRET_KEY, DB_* and NEXT_PUBLIC_* values
```

5) Build and run containers:
```bash
./scripts/deploy.sh
```

6) Run post-deploy checks:
```bash
./scripts/post_deploy_check.sh
```

7) Configure NGINX (example in `nginx/DOMAIN_NAME.conf.example`). After editing NGINX config:
```bash
nginx -t
systemctl reload nginx
```

Database migration procedure (safe):
1. Backup DB
```bash
PGHOST=$DB_HOST PGPORT=$DB_PORT PGUSER=$DB_USER pg_dump -Fc $DB_NAME > /root/db_backup_$(date +%F).dump
```
2. Check status:
```bash
docker compose exec django python manage.py check
docker compose exec django python manage.py showmigrations
```
3. Run migrate plan:
```bash
docker compose exec django python manage.py migrate --plan
```
4. Apply migrations:
```bash
docker compose exec django python manage.py migrate
```

Rollback strategy:
- Repoint NGINX to the previous (old) application and `systemctl reload nginx`.
- Stop new containers: `docker compose down` if desired.
- Restore DB only if schema changes require it using `pg_restore`.

Security checklist:
- Do not commit `.env` or secrets.
- Set `DEBUG=False`.
- Use firewall to restrict PostgreSQL access.
- Use Let's Encrypt for TLS (configure certbot on VM).

Notes & limitations:
- Django healthcheck uses the root path; if your site returns 404 at `/` healthcheck may report unhealthy. You can run `docker compose exec django python manage.py check` to verify app health.
- The compose file configures `host.docker.internal` to allow containers to reach the host PostgreSQL. If your Docker version or host differs, set `DB_HOST` to the VM IP.
