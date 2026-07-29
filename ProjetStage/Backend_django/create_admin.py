import os
import subprocess
import sys
import time
from pathlib import Path

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Backend_django.settings")

BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))


def run_migrations(max_retries=3, delay=3):
    for attempt in range(1, max_retries + 1):
        print(f"Applying database migrations (attempt {attempt}/{max_retries})...")
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

        if result.returncode == 0:
            return True

        if attempt < max_retries:
            print(f"Migrations failed, retrying in {delay} seconds...")
            time.sleep(delay)

    return False


def ensure_admin_user():
    try:
        import django

        django.setup()
        from django.contrib.auth import get_user_model

        User = get_user_model()
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
        return True
    except Exception as exc:
        print(f"Admin user creation skipped: {exc}", file=sys.stderr)
        return False


if __name__ == "__main__":
    if run_migrations():
        ensure_admin_user()
    else:
        print("Skipping admin user creation because migrations were not successful.")
