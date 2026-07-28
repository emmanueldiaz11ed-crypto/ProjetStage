# Guide de configuration de PostgreSQL sur Render

Ce guide explique comment créer et configurer une base de données PostgreSQL sur Render pour votre backend Django.

---

## 1. Créer un compte Render

Si vous n’avez pas encore de compte Render :
- allez sur https://render.com
- créez un compte
- connectez-vous à votre tableau de bord

---

## 2. Créer une base de données PostgreSQL

1. Dans le tableau de bord Render, cliquez sur New +
2. Sélectionnez PostgreSQL
3. Remplissez les informations suivantes :
   - Name : donnez un nom à votre base, par exemple `epl-pedago-db`
   - Region : choisissez la région la plus proche de votre application
   - Database : choisissez un nom de base, par exemple `epl_pedago`
   - User : choisissez un utilisateur, par exemple `epl_user`
   - Plan : choisissez le plan adapté à votre besoin

4. Cliquez sur Create Database

Render va alors créer la base et vous fournir les informations de connexion.

---

## 3. Récupérer les informations de connexion

Après la création, Render affiche généralement :
- Host
- Port
- Database
- User
- Password
- External Database URL

Ces informations seront nécessaires pour configurer votre backend Django.

---

## 4. Configurer les variables d’environnement du service Django

Dans votre service Render pour le backend Django, ajoutez les variables d’environnement suivantes :

```env
DB_NAME=epl_pedago
DB_USER=epl_user
DB_PASSWORD=votre_mot_de_passe
DB_HOST=votre_host_render
DB_PORT=5432
```

Si votre application Django utilise `DATABASE_URL`, vous pouvez aussi ajouter :

```env
DATABASE_URL=postgres://epl_user:votre_mot_de_passe@votre_host_render:5432/epl_pedago
```

> Important : utilisez les valeurs réelles fournies par Render, pas des exemples génériques.

---

## 5. Adapter la configuration Django

Votre projet Django doit être capable de lire ces variables. Dans le fichier de configuration Django, la base est généralement configurée avec :

```python
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

Si vous utilisez `DATABASE_URL`, vous pouvez également configurer Django pour l’utiliser directement.

---

## 6. Déployer et appliquer les migrations

Après avoir ajouté les variables d’environnement, redeployez le service Django sur Render.

Ensuite, exécutez les migrations depuis la console Render :

```bash
python manage.py migrate
```

Si vous avez besoin d’un compte administrateur :

```bash
python manage.py createsuperuser
```

---

## 7. Vérifier que tout fonctionne

Après le déploiement, testez :
- l’API Django,
- l’accès à la base de données,
- les migrations,
- l’interface d’administration si elle est utilisée.

Si l’application ne démarre pas, vérifiez les logs Render car l’erreur vient souvent d’une variable mal renseignée ou d’une mauvaise URL de connexion.

---

## 8. Erreurs fréquentes à éviter

- [ ] Mot de passe incorrect
- [ ] Nom de base incorrect
- [ ] Host Render mal saisi
- [ ] Port non défini à 5432
- [ ] Variable d’environnement absente
- [ ] Service Django déployé avant la création de la base

---

## 9. Exemple concret

Exemple de configuration réelle :

```env
DB_NAME=epl_pedago
DB_USER=epl_user
DB_PASSWORD=abc123xyz
DB_HOST=dpg-xxxxx-a.oregon-postgres.render.com
DB_PORT=5432
```

---

## 10. Résumé rapide

Pour configurer PostgreSQL sur Render :
1. créer une base PostgreSQL sur Render,
2. récupérer l’host, le port, le nom de base, l’utilisateur et le mot de passe,
3. ajouter ces valeurs dans les variables d’environnement du service Django,
4. redeployer l’application,
5. exécuter les migrations.

---

## 11. Conseil important

Pour un déploiement propre, il est préférable d’utiliser les variables d’environnement plutôt que d’écrire directement les informations de connexion dans le code source.
