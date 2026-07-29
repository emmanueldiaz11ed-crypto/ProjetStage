import os
import subprocess
import sys
from pathlib import Path

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Backend_django.settings")

BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import django

django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()


def run_migrations():
    print("Applying database migrations...")
    result = subprocess.run(
        [sys.executable, "manage.py", "migrate", "--noinput"],
        cwd=str(BASE_DIR),
        text=True,
        capture_output=True,
    )

    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print(result.stderr, file=sys.stderr)

    if result.returncode != 0:
        raise RuntimeError(f"Database migrations failed with code {result.returncode}")


def ensure_admin_user():
    username = os.environ.get("ADMIN_USERNAME", "admin")
    email = os.environ.get("ADMIN_EMAIL", "admin@example.com")
    password = os.environ.get("ADMIN_PASSWORD", "adminpassword")

    user, created = User.objects.get_or_create(
        username=username,
        defaults={
            "email": email,
            "is_staff": True,
            "is_superuser": True,
            "role": "admin",
            "doit_changer_mdp": False,
        },
    )

    user.email = email
    user.set_password(password)
    user.is_staff = True
    user.is_superuser = True
    user.role = "admin"
    user.doit_changer_mdp = False
    user.save()

    print(f"{'Created' if created else 'Updated'} admin user: {user.username}")


if __name__ == "__main__":
    run_migrations()
    ensure_admin_user()
