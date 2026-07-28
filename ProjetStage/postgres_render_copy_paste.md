# PostgreSQL sur Render — version prête à copier-coller

Ce document est une version ultra simple et directe pour configurer PostgreSQL sur Render avec votre backend Django.

---

## 1. Créer la base sur Render

Sur Render :
1. Cliquez sur New +
2. Choisissez PostgreSQL
3. Remplissez :
   - Name: epl-pedago-db
   - Database: epl_pedago
   - User: epl_user
4. Cliquez sur Create Database

---

## 2. Récupérer les informations de connexion

Render va vous donner :
- Host
- Port: 5432
- Database: epl_pedago
- User: epl_user
- Password

Conservez ces valeurs.

---

## 3. Ajouter les variables d’environnement au service Django sur Render

Dans Render > votre service Django > Environment : ajoutez ceci :

```env
SECRET_KEY=remplacez-par-une-cle-secrete-longue
DEBUG=False
ALLOWED_HOSTS=your-service-name.onrender.com,localhost,127.0.0.1

DB_NAME=epl_pedago
DB_USER=epl_user
DB_PASSWORD=votre_mot_de_passe_render
DB_HOST=votre_host_render
DB_PORT=5432
```

Si vous voulez aussi ajouter l’URL complète :

```env
DATABASE_URL=postgres://epl_user:votre_mot_de_passe_render@votre_host_render:5432/epl_pedago
```

---

## 4. Vérifier que Django lit bien ces variables

Dans votre fichier de configuration Django, assurez-vous d’avoir quelque chose comme :

```python
from decouple import config

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}
```

---

## 5. Déployer le service

Après avoir ajouté les variables :
1. Cliquez sur Deploy Latest Commit
2. Attendez que le déploiement finisse

---

## 6. Exécuter les migrations

Dans la console Render de votre service Django, exécutez :

```bash
python manage.py migrate
```

Si vous avez besoin d’un administrateur :

```bash
python manage.py createsuperuser
```

---

## 7. Vérifier le bon fonctionnement

Testez ensuite :
- l’URL de votre service Django,
- l’API,
- l’interface d’administration si elle existe.

---

## 8. Exemple complet prêt à utiliser

Voici un exemple complet prêt à coller dans Render :

```env
SECRET_KEY=supersecretkey123456789
DEBUG=False
ALLOWED_HOSTS=your-service-name.onrender.com,localhost,127.0.0.1
DB_NAME=epl_pedago
DB_USER=epl_user
DB_PASSWORD=monmotdepasse123
DB_HOST=dpg-xxxxxxx-a.oregon-postgres.render.com
DB_PORT=5432
DATABASE_URL=postgres://epl_user:monmotdepasse123@dpg-xxxxxxx-a.oregon-postgres.render.com:5432/epl_pedago
```

---

## 9. Erreurs fréquentes

- [ ] mot de passe incorrect
- [ ] host incorrect
- [ ] port différent de 5432
- [ ] variable DB_NAME absente
- [ ] service déployé avant la création de la base

---

## 10. Résumé ultra rapide

Copiez-collez ceci dans Render :

```env
DB_NAME=epl_pedago
DB_USER=epl_user
DB_PASSWORD=votre_mot_de_passe
DB_HOST=votre_host_render
DB_PORT=5432
```

Puis exécutez :

```bash
python manage.py migrate
```
