#!/usr/bin/env bash
set -e

pip install --no-cache-dir -r requirements.txt
python manage.py migrate --noinput
python manage.py collectstatic --noinput

python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
username = '${ADMIN_USERNAME:-Admin}'
password = '${ADMIN_PASSWORD:-Admin@123}'
email = '${ADMIN_EMAIL:-admin@example.com}'
user, created = User.objects.get_or_create(username=username, defaults={'email': email, 'is_staff': True, 'is_superuser': True})
if created:
    user.set_password(password)
    user.is_staff = True
    user.is_superuser = True
    user.save()
else:
    user.email = email
    user.is_staff = True
    user.is_superuser = True
    user.set_password(password)
    user.save()
print(f'Superuser ready: {username}')
"
