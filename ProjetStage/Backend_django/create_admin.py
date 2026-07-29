import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Backend_django.settings")

import django
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

username = os.environ.get("ADMIN_USERNAME", "admin")
email = os.environ.get("ADMIN_EMAIL", "admin@example.com")
password = os.environ.get("ADMIN_PASSWORD", "adminpassword")

user, created = User.objects.get_or_create(username=username)
user.email = email
user.set_password(password)
user.is_staff = True
user.is_superuser = True
user.role = "admin"
user.doit_changer_mdp = False
user.save()

print(f"{'Created' if created else 'Updated'} admin user: {user.username}")
