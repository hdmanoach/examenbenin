# 🇧🇯 ExamBénin — Plateforme de préparation aux examens nationaux

Plateforme Next.js moderne pour consulter et télécharger les épreuves des filières **ASSRI** et **SIL**, classées par session (pratique/théorique) et par année.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/TON_USERNAME/epreuves-bj)

---

## ✨ Fonctionnalités

- 📚 **Épreuves officielles** : ASSRI et SIL, toutes années
- 🔍 **Filtrage avancé** : par filière, session, année, matière
- 📧 **Notifications email** : inscription aux nouvelles épreuves
- 📱 **Responsive** : fonctionne sur mobile et desktop
- ⚡ **Temps réel** : mises à jour automatiques via Supabase
- 🎨 **Design moderne** : thème sombre inspiré du drapeau béninois

---

## 🚀 Déploiement rapide

### Prérequis
- Node.js 18+
- Compte Supabase
- Compte Vercel (gratuit)

### Étape 1 — Cloner et installer
```bash
git clone https://github.com/TON_USERNAME/epreuves-bj.git
cd epreuves-bj
npm install
```

### Étape 2 — Configurer Supabase
1. Crée un projet sur [supabase.com](https://supabase.com)
2. Va dans **SQL Editor** et exécute ces scripts :
   - `SUPABASE_SETUP.sql` (tables et politiques)
   - `SUPABASE_SECURITY_HARDENING.sql` (sécurité)
3. Dans **Settings → API**, copie :
   - `Project URL`
   - `anon public` key

### Étape 3 — Variables d'environnement
Crée un fichier `.env.local` :
```env
NEXT_PUBLIC_SUPABASE_URL=https://ton-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ta-cle-anon
API_SECRET_KEY=cle-secrete-pour-admin
GMAIL_USER=ton-email@gmail.com
GMAIL_APP_PASSWORD=mot-de-passe-app-gmail
NEXT_PUBLIC_SITE_URL=https://ton-site.vercel.app
```

### Étape 4 — Déployer sur Vercel
```bash
npm install -g vercel
vercel
# Suis les instructions et ajoute les variables d'environnement
```

### Étape 5 — Ajouter des épreuves
Utilise l'interface admin (`admin-epreuves`) pour uploader les documents via Supabase Storage.

---

## 📁 Architecture

```
epreuves-bj/          # Site public (Vercel)
├── app/
│   ├── api/
│   │   ├── notifier/     # API d'envoi d'emails
│   │   └── ping/         # Health check
│   ├── components/       # Composants React
│   ├── lib/
│   │   └── epreuves.ts   # Fonctions Supabase
│   ├── globals.css       # Styles Tailwind
│   ├── layout.tsx        # Layout + metadata
│   ├── page.tsx          # Page principale
│   ├── robots.ts         # SEO robots.txt
│   └── sitemap.ts        # SEO sitemap.xml
└── public/
    └── favicon.svg       # Icône personnalisée

admin-epreuves/       # Interface admin (privée)
├── app/
│   ├── api/
│   │   ├── proxy-notifier/  # Proxy vers site public
│   │   └── logs/            # API de logs
│   ├── components/
│   │   ├── FormulaireUpload.tsx
│   │   └── ListeEpreuves.tsx
│   └── lib/
│       ├── supabase.ts      # Config Supabase
│       └── logs.ts          # Gestion des logs
```

---

## 🛠️ Technologies

- **Frontend** : Next.js 16, React 18, TypeScript
- **Styling** : Tailwind CSS, animations CSS
- **Base de données** : Supabase (PostgreSQL)
- **Storage** : Supabase Storage (PDFs/Images)
- **Emails** : Nodemailer + Gmail SMTP
- **Déploiement** : Vercel
- **Authentification** : GitHub OAuth (admin)

---

## 🎨 Design System

### Couleurs (drapeau béninois)
```css
--vert: #008751;
--jaune: #FCD116;
--rouge: #EF2B2D;
--fond: #0a0f0d;
--carte: #111a14;
```

### Fonts
- **Titres** : Syne (Google Fonts)
- **Corps** : DM Sans (Google Fonts)

### Animations
- Citation machine à écrire
- Cartes avec hover effects
- Transitions fluides

---

## 🔧 Scripts disponibles

```bash
npm run dev      # Développement local
npm run build    # Build de production
npm run start    # Serveur de production
```

---

## 📊 Base de données Supabase

### Tables principales
- `epreuves` : documents (PDFs/images)
- `filieres` : ASSRI, SIL, etc.
- `abonnes` : emails pour notifications
- `suggestions` : feedback utilisateurs

### Politiques RLS
- Lecture publique pour `epreuves` et `filieres`
- Écriture réservée à l'admin pour uploads
- Abonnements avec vérification email

---

## 🚨 Sécurité

- **Variables sensibles** : jamais dans le code
- **CORS** : configuré pour admin uniquement
- **Authentification** : GitHub OAuth pour admin
- **Logs** : conditionnels (dev uniquement)
- **Rate limiting** : via Supabase

---

## 📈 SEO & Performance

- **Meta tags** : Open Graph, Twitter Cards
- **Sitemap** : généré automatiquement
- **Robots.txt** : indexation autorisée
- **Core Web Vitals** : optimisé
- **Images** : lazy loading, WebP

---

## 🤝 Contribution

1. Fork le projet
2. Crée une branche (`git checkout -b feature/nouvelle-fonction`)
3. Commit (`git commit -m 'Ajoute nouvelle fonctionnalité'`)
4. Push (`git push origin feature/nouvelle-fonction`)
5. Ouvre une Pull Request

---

## 📄 Licence

MIT - Libre utilisation pour l'éducation.

---

## 📞 Support

Pour des questions :
- Ouvre une issue GitHub
- Contact : ton-email@exemple.com

---

*🇧🇯 Fait avec ❤️ pour les étudiants béninois*

Dans `app/lib/epreuves.ts`, modifie le tableau :
```typescript
export const ANNEES_DISPONIBLES = [2024, 2025, 2026] // Ajoute 2026
```

---

## 💡 Conseils

- Nomme tes fichiers  clairement : `assri_2025_maths_theo.pdf`
- Préfère le format PDF pour les épreuves textuelles
- Pour les schémas ou images scannées, utilise JPG/PNG
