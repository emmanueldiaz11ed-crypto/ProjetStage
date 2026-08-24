# Guide Étape par Étape : Premier Déploiement en Production

Ce document guide un **complet débutant** à travers chaque étape du déploiement, sans présumer aucune connaissance.

---

## ⏱️ Temps Estimé : 2-3 heures pour la première fois

---

## ÉTAPE 0️⃣ : PRÉPARATION

### Avant de Commencer, Vous Avez Besoin De :

✅ **Une machine serveur (VM)** accessible via SSH
- Adresse IP : ex. `192.168.1.100` ou `votre_domaine.com`
- Nom d'utilisateur et mot de passe SSH
- Accès root ou capacité à utiliser `sudo`

✅ **Un domaine internet** (acheté et pointant vers votre serveur)
- ex. `mon-app.com`
- Accès au gestionnaire DNS (pour modifier les enregistrements)

✅ **Git installé** (normalement déjà sur le serveur)

✅ **Votre projet ProjetStage cloné** (ou accès au dépôt)

✅ **Ces informations** :
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=projetstage_user          # À définir
DB_PASSWORD=mon_mot_passe          # À définir (sécurisé!)
DB_NAME=projetstage_db
SECRET_KEY=clé_très_longue        # À générer
```

---

## ÉTAPE 1️⃣ : CONNEXION AU SERVEUR

### Ouvrir un Terminal

**Sur Windows** :
- Appuyez sur `Windows + R`
- Tapez `cmd` ou `powershell`
- Appuyez sur Entrée

**Sur Mac/Linux** :
- Ouvrez Terminal (Cmd + Espace, tapez "Terminal")

### Se Connecter au Serveur par SSH

Tapez cette commande (remplacez les valeurs) :

```bash
ssh utilisateur@adresse_ip
```

**Exemple réel** :
```bash
ssh root@192.168.1.100
```

**Vous verrez** :
```
root@192.168.1.100's password:
```

Entrez le mot de passe et appuyez sur Entrée. **Aucun caractère ne s'affiche** (c'est normal).

**Succès** : vous voyez maintenant :
```
root@vm-server:~#
```

✅ **Bravo !** Vous êtes connecté au serveur.

---

## ÉTAPE 2️⃣ : INSTALLER DOCKER

### Vérifier si Docker est Déjà Installé

Tapez :
```bash
docker --version
```

**Si vous voyez** `Docker version 20.x.x` → Docker est installé ✅
**Si vous voyez** `command not found` → À installer 👇

### Installer Docker (Si Nécessaire)

Pour **Ubuntu/Debian** :

```bash
# Mettre à jour la liste des paquets
sudo apt update

# Installer Docker
sudo apt install docker.io docker-compose -y

# Démarrer Docker immédiatement
sudo systemctl start docker

# Configurer Docker pour démarrer automatiquement
sudo systemctl enable docker
```

**Chaque ligne expliquée** :
- `apt update` : télécharge la liste des paquets disponibles
- `apt install` : installe les paquets
- `-y` : répond "oui" automatiquement
- `systemctl start` : démarre le service maintenant
- `systemctl enable` : configure le démarrage automatique

### Vérifier l'Installation

```bash
docker --version
docker compose version
```

Vous devriez voir des numéros de version (ex: `Docker version 20.10.17`).

✅ **Bravo !** Docker est installé.

---

## ÉTAPE 3️⃣ : CLONER LE PROJET

### Aller au Répertoire Home

```bash
cd ~
```

Le `~` signifie "répertoire personnel". Après cette commande, vous êtes chez vous sur le serveur.

### Cloner le Projet

```bash
git clone https://github.com/votre_utilisateur/ProjetStage.git
cd ProjetStage
```

**Remplacez** `votre_utilisateur` par votre vrai username GitHub.

**Vous devez voir** :
```
Cloning into 'ProjetStage'...
remote: Enumerating objects...
```

Attendez la fin (peut prendre quelques secondes).

### Vérifier que le Projet est Complet

```bash
ls -la
```

Vous devriez voir :
```
drwxr-xr-x  8 root root 4096 Jan 15 10:00 ProjetStage
drwxr-xr-x  2 root root 4096 Jan 15 10:00 Backend_django
drwxr-xr-x  2 root root 4096 Jan 15 10:00 Backend_fastapi
drwxr-xr-x  2 root root 4096 Jan 15 10:00 frontend_next
-rw-r--r--  1 root root  512 Jan 15 10:00 docker-compose.yml
```

✅ **Bravo !** Le projet est cloné.

---

## ÉTAPE 4️⃣ : PRÉPARER LA BASE DE DONNÉES

### Vérifier que PostgreSQL Tourne

```bash
# Vérifier si PostgreSQL écoute
sudo netstat -tuln | grep 5432
```

**Si vous voyez** `LISTEN` sur le port 5432 → PostgreSQL fonctionne ✅

**Si rien n'apparaît** → Demandez à votre administrateur système d'installer PostgreSQL.

### Créer l'Utilisateur et la Base de Données

Connectez-vous à PostgreSQL :

```bash
# Accéder à PostgreSQL
sudo -u postgres psql
```

Vous verrez :
```
postgres=#
```

**Tapez ces commandes** (une par une, appuyez sur Entrée après chaque) :

```sql
-- Créer l'utilisateur
CREATE USER projetstage_user WITH PASSWORD 'votre_mot_de_passe_secure';

-- Créer la base de données
CREATE DATABASE projetstage_db OWNER projetstage_user;

-- Accorder tous les droits
ALTER DATABASE projetstage_db OWNER TO projetstage_user;

-- Quitter PostgreSQL
\q
```

**Important** :
- Remplacez `votre_mot_de_passe_secure` par un mot de passe fort (ex: `Aj$7kL#mN2pQr8`)
- **Gardez ce mot de passe secret** !

✅ **Bravo !** Base de données créée.

---

## ÉTAPE 5️⃣ : CONFIGURER LES FICHIERS D'ENVIRONNEMENT

### Créer le Fichier .env

```bash
# Se placer dans le répertoire du projet
cd ~/ProjetStage

# Copier le fichier d'exemple
cp .env.example .env
```

### Éditer le Fichier .env

Ouvrez le fichier avec un éditeur :

```bash
# Avec nano (éditeur simple)
nano .env
```

**Vous verrez le contenu** du fichier. Éditer les lignes suivantes :

Cherchez ces lignes et **modifiez-les** :

```env
# Base de données
DB_HOST=host.docker.internal
DB_PORT=5432
DB_USER=projetstage_user
DB_PASSWORD=votre_mot_de_passe_secure    # Entrez le mot de passe que vous avez défini
DB_NAME=projetstage_db

# Django
DEBUG=False
SECRET_KEY=votre_clé_secrète_très_longue_et_aléatoire

# Domaine
ALLOWED_HOSTS=mon-domaine.com,www.mon-domaine.com

# Frontend
NEXT_PUBLIC_API_URL=https://mon-domaine.com/api

# Autres
ENVIRONMENT=production
```

### Comment Éditer dans Nano

1. Naviguez avec les **flèches du clavier**
2. Pour modifier une ligne :
   - Positionnez-vous sur la ligne
   - Effacez avec **Backspace**
   - Tapez la nouvelle valeur
3. Pour quitter :
   - Appuyez sur **Ctrl + X**
   - Tapez **O** (Oui, enregistrer)
   - Appuyez sur **Entrée**

### Générer une SECRET_KEY Sécurisée

Si vous n'en avez pas, générez une :

```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

**Vous verrez** une longue chaîne aléatoire (ex: `k$8jh2@nQ!7m#p0d...`). Copiez-la et mettez-la dans `SECRET_KEY=`.

### Vérifier le Fichier

```bash
# Afficher le fichier
cat .env

# Vérifier que tout est correct (pas de lignes vides, pas de typos)
```

✅ **Bravo !** Configuration prête.

---

## ÉTAPE 6️⃣ : SAUVEGARDE INITIALE

### Créer un Dossier pour les Sauvegardes

```bash
mkdir -p /root/backups
```

### Sauvegarder la Base de Données

⚠️ **ÉTAPE CRITIQUE** : Toujours faire une sauvegarde avant le déploiement !

```bash
# La commande de sauvegarde
PGHOST=localhost PGPORT=5432 PGUSER=projetstage_user pg_dump -Fc projetstage_db > /root/backups/db_backup_$(date +%Y-%m-%d_%H-%M-%S).dump
```

**Vous serez invité à entrer le mot de passe PostgreSQL**. Entrez-le.

### Vérifier la Sauvegarde

```bash
ls -lh /root/backups/
```

Vous devriez voir un fichier `db_backup_2026-01-15_10-30-45.dump` (avec la date/heure actuelles).

✅ **Bravo !** Sauvegarde créée.

---

## ÉTAPE 7️⃣ : DÉPLOYER AVEC DOCKER

### Construire et Démarrer les Services

```bash
# Se assurer d'être dans le répertoire du projet
cd ~/ProjetStage

# Construire les images Docker et démarrer
docker compose up -d --build
```

**Vous verrez** :
```
[+] Running 3/3
 ✔ Container projetstage-frontend Running
 ✔ Container projetstage-django Running
 ✔ Container projetstage-fastapi Running
```

⏳ **Attendre 30-60 secondes** que les services démarrent complètement.

### Vérifier que Tout Fonctionne

```bash
# Afficher l'état des conteneurs
docker compose ps
```

**Vous verrez** :
```
NAME                    STATUS
projetstage-django      Up 2 minutes
projetstage-fastapi     Up 2 minutes
projetstage-frontend    Up 2 minutes
```

Si vous voyez **"Exited"** au lieu de **"Up"**, c'est qu'il y a un problème. Consultez les logs :

```bash
docker compose logs django
```

### Tester que Django Fonctionne

```bash
# Vérifier la santé de Django
docker compose exec -T django python manage.py check
```

**Réponse attendue** :
```
System check identified no issues (0 silenced).
```

✅ **Bravo !** Services déployés.

---

## ÉTAPE 8️⃣ : MIGRER LA BASE DE DONNÉES

### Voir les Migrations en Attente

```bash
docker compose exec -T django python manage.py showmigrations
```

### Appliquer les Migrations

```bash
docker compose exec -T django python manage.py migrate
```

**Vous verrez** :
```
Operations to perform:
  Apply all migrations: ...
Running migrations:
  Applying authentification.0001_initial... OK
  Applying authentification.0002_alter_user_email... OK
  ...
```

✅ **Bravo !** Migrations appliquées.

---

## ÉTAPE 9️⃣ : INSTALLER ET CONFIGURER NGINX

### Installer Nginx

```bash
# Installer Nginx
sudo apt install nginx -y

# Démarrer Nginx
sudo systemctl start nginx

# Configurer le démarrage automatique
sudo systemctl enable nginx
```

### Créer la Configuration Nginx

Copiez le fichier de configuration :

```bash
# Si vous êtes dans ~/ProjetStage
cd nginx

# Copier vers Nginx
sudo cp projetstage.conf /etc/nginx/sites-available/projetstage.conf
```

### Éditer la Configuration

**Important** : Vous devez remplacer les placeholders :

```bash
sudo nano /etc/nginx/sites-available/projetstage.conf
```

**À remplacer** :
- `votre_domaine.com` → votre vrai domaine (ex: `mon-app.com`)
- `/home/utilisateur/ProjetStage` → le chemin réel (ex: `/root/ProjetStage`)

**Comment faire** :

1. Appuyez sur **Ctrl + H** (rechercher-remplacer)
2. Cherchez : `votre_domaine.com`
3. Remplacez par : `mon-app.com`
4. Répétez pour les autres placeholders

### Activer la Configuration

```bash
# Créer un lien symbolique
sudo ln -s /etc/nginx/sites-available/projetstage.conf /etc/nginx/sites-enabled/projetstage.conf

# Désactiver la configuration par défaut
sudo rm /etc/nginx/sites-enabled/default 2>/dev/null || true
```

### Tester la Configuration

```bash
sudo nginx -t
```

**Réponse attendue** :
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Recharger Nginx

```bash
sudo systemctl reload nginx
```

✅ **Bravo !** Nginx configuré.

---

## 🔟 ÉTAPE 10 : OBTENIR UN CERTIFICAT SSL

### Installer Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Créer le Certificat

```bash
sudo certbot certonly --nginx -d mon-domaine.com -d www.mon-domaine.com
```

**Remplacez** `mon-domaine.com` par votre vrai domaine.

**Processus** :
1. Entrez votre adresse email
2. Acceptez les conditions d'utilisation (tapez "A")
3. Choisissez si vous acceptez les communications marketing (tapez "N")

**Succès** :
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/mon-domaine.com/fullchain.pem
```

✅ **Bravo !** Certificat SSL obtenu.

---

## 1️⃣1️⃣ ÉTAPE 11 : CONFIGURER LE DOMAINE (DNS)

### Vérifier que le Domaine Pointe vers le Serveur

Allez sur le site de votre registrar (GoDaddy, Namecheap, OVH, etc.).

Trouvez la section **"DNS Records"** ou **"Manage DNS"**.

### Créer les Enregistrements

Vous avez besoin de deux enregistrements A :

| Hostname | Type | Valeur |
|----------|------|--------|
| `@` ou vide | A | `123.45.67.89` (votre IP) |
| `www` | A | `123.45.67.89` (votre IP) |

**Comment ajouter** :
1. Cliquez sur "Add Record" ou "New Record"
2. Type : **A**
3. Hostname : **@** (ou laissez vide)
4. Value : votre adresse IP
5. Cliquez "Save"
6. Répétez pour le `www`

### Attendre la Propagation

Les changements DNS prennent **24-48 heures** pour se propager partout sur Internet.

**Pour tester immédiatement** (sur votre machine locale) :

```bash
# Windows PowerShell ou Mac Terminal
nslookup mon-domaine.com
```

Vous devriez voir votre adresse IP.

✅ **Bravo !** Domaine configuré.

---

## 1️⃣2️⃣ ÉTAPE 12 : TESTER LE SITE

### Attendre la Propagation DNS

Attendez **10 minutes à 48 heures** (généralement quelques minutes).

### Accéder au Site

Ouvrez votre navigateur et allez à :
```
https://mon-domaine.com
```

### Que Devriez-Vous Voir ?

✅ **Succès** : La page d'accueil de votre application
- L'URL est **verte** (certificat SSL valide)
- La page charge sans erreur

❌ **Problème** : Page blanche, erreur 502, etc.

**Vérifier les logs** :
```bash
# Logs Nginx
sudo tail -20 /var/log/nginx/error.log

# Logs Docker
docker compose logs --tail=50
```

---

## 🔐 ÉTAPE 13 : CHECKLIST DE SÉCURITÉ

### Avant de Considérer Comme "Prêt en Production"

Vérifiez chaque point :

```bash
# 1. DEBUG est False
grep "DEBUG=" .env  # Doit afficher DEBUG=False

# 2. Fichier .env est protégé
chmod 600 .env

# 3. Pas de secrets en git
git log --all --full-history -S "SECRET_KEY" | head -5

# 4. Nginx redirige HTTP vers HTTPS
curl -I http://mon-domaine.com | grep "301"

# 5. SSL fonctionne
openssl s_client -connect mon-domaine.com:443 -servername mon-domaine.com | grep "CN="

# 6. Sauvegardes existent
ls -lh /root/backups/ | tail -5
```

✅ **Bravo !** Tout est sécurisé.

---

## 📋 CHECKLIST RÉCAPITULATIVE

Cochez chaque étape au fur et à mesure :

- [ ] 0. Préparation (VM, domaine, infos)
- [ ] 1. Connexion SSH au serveur
- [ ] 2. Docker et Docker Compose installés
- [ ] 3. Projet cloné depuis Git
- [ ] 4. PostgreSQL configuré (user, DB)
- [ ] 5. Fichier .env créé et rempli
- [ ] 6. Sauvegarde initiale faite
- [ ] 7. Services Docker déployés
- [ ] 8. Migrations appliquées
- [ ] 9. Nginx installé et configuré
- [ ] 10. Certificat SSL obtenu
- [ ] 11. Domaine DNS pointant vers le serveur
- [ ] 12. Site accessible via HTTPS
- [ ] 13. Sécurité vérifiée

✅ **Félicitations !** Votre application est en production ! 🎉

---

## 🆘 EN CAS DE PROBLÈME

### Les Services ne Démarrent Pas

```bash
# Voir les erreurs
docker compose logs --tail=50

# Redémarrer
docker compose restart

# Ou tout arrêter et recommencer
docker compose down
docker compose up -d --build
```

### Nginx Retourne une Erreur 502

```bash
# Vérifier que les services tournent
docker compose ps

# Vérifier la configuration Nginx
sudo nginx -t

# Recharger
sudo systemctl reload nginx

# Voir les logs d'erreur Nginx
sudo tail -20 /var/log/nginx/error.log
```

### Le Site Retourne une Erreur 500

```bash
# Voir les logs Django
docker compose logs django

# Vérifier la santé de Django
docker compose exec -T django python manage.py check

# Peut-être qu'une migration a échoué ?
docker compose exec -T django python manage.py showmigrations
```

### Le Certificat SSL n'est Pas Trouvé

```bash
# Vérifier que le certificat existe
ls -la /etc/letsencrypt/live/mon-domaine.com/

# Si absent : régénérer avec Certbot
sudo certbot certonly --nginx -d mon-domaine.com
```

### Restaurer à partir d'une Sauvegarde

```bash
# Lister les sauvegardes
ls -lh /root/backups/

# Restaurer une sauvegarde
PGHOST=localhost PGPORT=5432 PGUSER=projetstage_user pg_restore -d projetstage_db /root/backups/db_backup_2026-01-15_10-30-45.dump
```

---

## 📞 AIDE RAPIDE

| Problème | Commande |
|----------|----------|
| Vérifier l'état | `docker compose ps` |
| Voir les logs | `docker compose logs -f django` |
| Redémarrer services | `docker compose restart` |
| Arrêter services | `docker compose down` |
| Tester Nginx | `sudo nginx -t` |
| Recharger Nginx | `sudo systemctl reload nginx` |
| Vérifier SSL | `sudo certbot certificates` |
| Connexion DB | `PGHOST=localhost PGPORT=5432 PGUSER=projetstage_user psql projetstage_db` |

---

**Dernière mise à jour** : 2026-08-17

**Bonne chance pour votre déploiement ! 🚀**
