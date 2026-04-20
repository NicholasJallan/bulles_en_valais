# Bulles en Valais — site web

Site statique HTML/CSS/JS pour Nicholas, instructeur de plongée multi-agences en Valais.

## Stack

- **HTML statique + React via Babel** (transpilation navigateur — aucun build nécessaire)
- **Pas de backend** : formulaire de contact → `mailto:` fallback, chat → `wa.me` (WhatsApp)
- **FR / EN** natif, switch dans la nav
- **Tweaks** (désactivable) : 4 palettes, 3 layouts hero, 3 layouts cursus, mode sombre

## Lancer en local

```bash
# Depuis le dossier du projet :
python3 -m http.server 8000
# ou
npx serve .
```

Ouvrir `http://localhost:8000`.

## Déploiement sur Raspberry Pi

### 1 — Pousser sur GitHub

Depuis votre machine locale, dans le dossier du projet :

```bash
git init
git add .
git commit -m "Initial commit — Bulles en Valais"
git branch -M main
git remote add origin git@github.com:<votre-user>/bulles-en-valais.git
git push -u origin main
```

### 2 — Installer nginx sur le Pi

```bash
sudo apt update
sudo apt install -y nginx git
```

### 3 — Cloner le repo sur le Pi

```bash
sudo mkdir -p /var/www/bullesenvalais
sudo chown -R $USER:$USER /var/www/bullesenvalais
git clone https://github.com/<votre-user>/bulles-en-valais.git /var/www/bullesenvalais
```

### 4 — Config nginx

`/etc/nginx/sites-available/bullesenvalais` :

```nginx
server {
    listen 80;
    server_name bullesenvalais.ch www.bullesenvalais.ch;
    root /var/www/bullesenvalais;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # Cache les assets statiques
    location ~* \.(jpg|jpeg|png|svg|css|js|woff2)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
```

Activer :

```bash
sudo ln -s /etc/nginx/sites-available/bullesenvalais /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5 — HTTPS (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d bullesenvalais.ch -d www.bullesenvalais.ch
```

Renouvellement auto déjà configuré par certbot.

### 6 — Exposer le Pi à Internet

Deux options :
- **Port forwarding** sur votre box (port 80 + 443 → IP locale du Pi) + DNS dynamique (DuckDNS, No-IP) si IP non fixe
- **Cloudflare Tunnel** (recommandé — pas besoin d'ouvrir de ports) :
  ```bash
  curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb -o cloudflared.deb
  sudo dpkg -i cloudflared.deb
  cloudflared tunnel login
  cloudflared tunnel create bullesenvalais
  # suivre la doc Cloudflare pour mapper le tunnel au domaine
  ```

### 7 — Mise à jour du site

À chaque modification :

```bash
# Sur votre machine locale
git add . && git commit -m "update" && git push

# Sur le Pi
cd /var/www/bullesenvalais
git pull
```

Ou automatiser via webhook GitHub + script shell sur le Pi.

## Structure du projet

```
.
├── index.html          # Shell HTML + styles + imports
├── styles.css          # (inline dans index.html actuellement)
├── app.jsx             # Root App + i18n + tweaks
├── components/
│   ├── i18n.jsx        # Traductions FR/EN (toutes les copies)
│   ├── Icons.jsx       # Icônes SVG
│   ├── Nav.jsx
│   ├── Hero.jsx
│   ├── About.jsx
│   ├── Agencies.jsx    # Cursus PADI / SDI-TDI / FFESSM
│   ├── Compare.jsx
│   ├── Specialties.jsx
│   ├── Places.jsx
│   ├── Gear.jsx
│   ├── Insurance.jsx
│   ├── Testimonials.jsx
│   ├── FAQ.jsx
│   ├── Contact.jsx
│   ├── Chat.jsx        # Bulle WhatsApp
│   ├── Tweaks.jsx      # Panneau de tweaks
│   └── Footer.jsx
└── README.md
```

## À personnaliser

- **Numéros & emails** : `components/Contact.jsx`, `components/Chat.jsx` (numéro WhatsApp `33699660181`)
- **Photos** : portrait instructeur (`components/About.jsx`, section `about-portrait`), photos lieux (`components/Places.jsx`), photo matériel (`styles` `.gear-image`)
- **Tarifs** : `components/i18n.jsx` → `agencies.{padi,tdi,ffessm}.prices`
- **Témoignages** : section actuellement en placeholder — `components/Testimonials.jsx` à rendre réel quand vous aurez les retours

## Notes techniques

- Le site fonctionne **100% statique** : Nginx suffit, pas de Node, pas de PHP.
- Transpilation JSX **côté navigateur** via Babel. Pour de la prod à fort trafic, pré-compilation recommandée (esbuild/vite) — pas nécessaire pour un site perso.
- Les images Unsplash actuelles sont des **placeholders** : remplacez-les par des photos authentiques avant mise en prod.
