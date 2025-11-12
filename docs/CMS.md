# Technológiai Összefoglaló: Prismic, Sanity, Capacitor

> **Nyelv**: Magyar  
> **Projekt kontextus**: tinicoach Teen Coaching App  
> **Dátum**: 2025-11-11

---

## 📋 Tartalomjegyzék

1. [Prismic CMS](https://claude.ai/chat/0dd5ac28-c22a-4e04-b312-67aa2086a94d#1-prismic-cms)
2. [Sanity CMS](https://claude.ai/chat/0dd5ac28-c22a-4e04-b312-67aa2086a94d#2-sanity-cms)
3. [Összehasonlítás](https://claude.ai/chat/0dd5ac28-c22a-4e04-b312-67aa2086a94d#4-%C3%B6sszehasonl%C3%ADt%C3%A1s)
4. [Ajánlás a tinicoach Projekthez](https://claude.ai/chat/0dd5ac28-c22a-4e04-b312-67aa2086a94d#5-aj%C3%A1nl%C3%A1s-a-tinicoach-projekthez)

---

## 1. PRISMIC CMS

### 1.1 Mi az a Prismic?

A **Prismic** egy **headless CMS** (Content Management System), ami lehetővé teszi a tartalomkezelést API-n keresztül. A tartalom szerkesztése egy vizuális editor-ban történik, majd az app REST vagy GraphQL API-n keresztül kéri le az adatokat.

**Headless CMS = Backend (tartalom tárolás) + Frontend (megjelenítés) szétválasztva**

### 1.2 Főbb Jellemzők

#### ✅ Előnyök

**1. Vizuális Szerkesztő (Writing Room)**

- Drag & drop interface
- WYSIWYG editor (What You See Is What You Get)
- Slice Machine: egyedi komponensek építése
- Preview funkció: látod, hogy fog kinézni az app-ban

**2. Content Modeling**

```javascript
// Példa: Video Content Type
{
  "title": "Text field",
  "description": "Rich Text",
  "thumbnail": "Image",
  "vimeo_url": "Link",
  "duration": "Number",
  "category": "Select",
  "is_free": "Boolean"
}
```

**3. Slice Machine**

- Újrafelhasználható tartalom blokkok
- Fejlesztő definiálja a struktúrát TypeScript-ben
- Tartalomkezelő tölti fel az adatokat

```typescript
// slice/Hero.tsx
export default function Hero({ slice }) {
  return (
    <section>
      <h1>{slice.primary.title}</h1>
      <p>{slice.primary.description}</p>
      <img src={slice.primary.image.url} />
    </section>
  );
}
```

**4. Multi-language Support**

- Több nyelv támogatása beépítve
- Magyar + Angol verzió könnyedén kezelhető

**5. API Options**

- REST API
- GraphQL API
- JavaScript SDK (@prismicio/next, @prismicio/react)

**6. Versioning & Scheduling**

- Tartalom verziózás
- Tervezett publikálás (pl. holnapi blog post)
- Draft és Published állapot

**7. Developer Experience**

```bash
# Next.js integráció
npm install @prismicio/client @prismicio/next

# Slice Machine telepítés
npx @slicemachine/init
```

```typescript
// lib/prismic.ts
import * as prismic from '@prismicio/client';

export const client = prismic.createClient('tinilany', {
  routes: [
    { type: 'video', path: '/videos/:uid' },
    { type: 'blog_post', path: '/blog/:uid' }
  ]
});
```

#### ⚠️ Hátrányok

**1. Limit az Ingyenes Planen**

- 1 user (szerkesztő)
- 1 repository
- 1 custom type (pl. csak Video VAGY Blog Post VAGY Daily Message)
- API call limit: ~10,000/hó

**2. Lassabb Admin UI**

- Néha lassú a betöltés
- Komplex tartalomnál lagolhat

**3. Slice Machine Learning Curve**

- Kezdőknek bonyolult lehet
- TypeScript tudás ajánlott

**4. GraphQL nem olyan fejlett**

- REST API jobban dokumentált
- GraphQL néha hibás

### 1.3 Pricing (2025)

|Plan|Ár|Funkciók|
|---|---|---|
|**Free**|$0/hó|1 user, 1 repo, korlátozott API calls|
|**Small**|$7/hó/user|Több repo, több user, localization|
|**Medium**|$25/hó/user|Webhooks, scheduling, role management|
|**Enterprise**|Custom|SLA, support, unlimited|

### 1.4 Use Case a tinicoach App-ban

**Prismic-ban tárolt tartalmak:**

- ✅ Napi motivációs üzenetek
- ✅ Videó könyvtár (metaadatok + Vimeo URL)
- ✅ Közösségi szavazás kérdései
- ✅ Onboarding slide-ok
- ✅ Blog cikkek (később)
- ✅ Erősségkereső kvíz kérdések

**Előny a tinicoach-nál:**

- Feleséged (coach) könnyen szerkesztheti a tartalmakat
- Nem kell backend fejlesztés minden tartalomváltozáshoz
- Verziókezelés: kipróbálhat új üzeneteket draft módban

---

## 2. SANITY CMS

### 2.1 Mi az a Sanity?

A **Sanity** szintén egy **headless CMS**, de sokkal rugalmasabb és fejlesztőbarátabb mint a Prismic. A Sanity filozófiája: "Strukturált tartalom platformja".

**Sanity = Tartalom mint adatbázis**

### 2.2 Főbb Jellemzők

#### ✅ Előnyök

**1. Sanity Studio (Self-hosted Admin)**

```bash
# Sanity Studio telepítése
npm create sanity@latest

# Studio futtatása lokálisan
npm run dev
# → http://localhost:3333
```

- **Saját domaineden hostolható** (pl. admin.tinilany.hu)
- Teljes testreszabhatóság React-tel
- Gyorsabb mint Prismic UI

**2. GROQ Query Language**

```groq
// Összes ingyenes videó, rendezve
*[_type == "video" && isFree == true] | order(publishedAt desc) {
  title,
  description,
  thumbnailUrl,
  duration,
  category
}
```

- Erősebb mint GraphQL
- Kifejezetten tartalomra optimalizált
- Relációk, referenciák kezelése

**3. Real-time Collaboration**

- Több szerkesztő dolgozhat egyszerre
- Live preview
- Látod ki mit szerkeszt

**4. Content Lake**

- Adatok JSON formátumban tárolva
- API-n keresztül teljes hozzáférés
- Exportálható, migrálható

**5. Plugin Ecosystem**

```bash
# Média library plugin
npm install sanity-plugin-media

# Markdown editor
npm install sanity-plugin-markdown

# Internationalization
npm install @sanity/document-internationalization
```

**6. Portable Text (Rich Text formátum)**

```json
{
  "_type": "block",
  "children": [
    { "_type": "span", "text": "Ez egy " },
    { "_type": "span", "text": "félkövér", "marks": ["strong"] },
    { "_type": "span", "text": " szöveg." }
  ]
}
```

- JSON alapú rich text
- Konvertálható HTML-re, React komponensekre
- Egyedi annotációk (pl. "tooltip", "call-to-action")

**7. TypeScript Support (GROQ-Codegen)**

```typescript
// Automatikusan generált típusok
import { Video } from './sanity.types';

const video: Video = await client.fetch(
  `*[_type == "video" && _id == $id][0]`,
  { id: videoId }
);
```

**8. Developer Experience**

```typescript
// lib/sanity.ts
import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: 'abc123',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true // Gyorsabb lekérdezés
});

// Használat
const videos = await client.fetch(`
  *[_type == "video" && category == "stress-management"] {
    title,
    vimeoUrl,
    thumbnail,
    duration
  }
`);
```

#### ⚠️ Hátrányok

**1. Komplexebb Setup**

- Sanity Studio külön kell deployolni (Vercel vagy saját)
- Több konfiguráció szükséges
- Fejlesztői tudás kell

**2. GROQ Learning Curve**

- Új query nyelv tanulása
- Dokumentáció oké, de nem olyan átlátható mint SQL

**3. Ingyenes Plan Limitek**

- 3 user
- 2 non-production dataset (dev, staging)
- 100k API requests/hó (CDN-nel ~1M)
- 10GB bandwidth

**4. Kevesebb "Out of the Box" Feature**

- Scheduling: kézi implementáció vagy plugin
- Preview: kézi setup
- Multi-language: plugin szükséges

### 2.3 Pricing (2025)

|Plan|Ár|Funkciók|
|---|---|---|
|**Free**|$0/hó|3 users, 100k req/hó, 10GB bandwidth|
|**Growth**|$99/hó|10 users, 1M req/hó, 100GB, scheduling|
|**Team**|$249/hó|20 users, 5M req, 500GB, support|
|**Enterprise**|Custom|Unlimited, SLA, dedicated support|

### 2.4 Use Case a tinicoach App-ban

**Sanity előnyök a projekthez:**

- ✅ GROQ-val komplex lekérdezések (pl. "Videók, amiket még nem nézett meg a user")
- ✅ Studio testreszabás magyar nyelvre
- ✅ Real-time preview (coach látja azonnal a változást)
- ✅ Exportálható adatok (migrálás később könnyebb)

**Sanity hátrányok:**

- ❌ Több setup idő
- ❌ Coach-nak tanulnia kell a Studio-t (bár intuitív)
- ❌ Külön deploy kell a Studio-nak

---

[[3. CAPACITOR]]

## 4. ÖSSZEHASONLÍTÁS

### 4.1 Prismic vs Sanity

|Szempont|Prismic|Sanity|
|---|---|---|
|**Használat**|Marketing tartalom|Strukturált adatok|
|**Admin UI**|Cloud-based, lassabb|Self-hosted, gyorsabb|
|**Query**|REST/GraphQL|GROQ (erősebb)|
|**Learning Curve**|Könnyebb (drag&drop)|Nehezebb (kód)|
|**Magyar támogatás**|✅ Beépített|🔶 Plugin kell|
|**Ingyenes plan**|1 user, limitált|3 user, jobb limit|
|**Testreszabás**|Korlátozott|Teljes szabadság|
|**Real-time**|❌|✅|
|**TypeScript**|🔶 Okés|✅ Kiváló|
|**Setup idő**|30 perc|2-3 óra|

**TLDR:**

- **Prismic**: Ha a coach egyszerűen akar tartalmat írni, nincs komplex logika
- **Sanity**: Ha fejlesztő vagy, szereted a kontrollt, komplex tartalom struktúra

### 4.2 PWA vs Capacitor

|Szempont|PWA|Capacitor|
|---|---|---|
|**Platform**|Web (iOS Safari, Chrome)|Natív iOS/Android app|
|**Telepítés**|Home screen (manual)|App Store / Play Store|
|**Natív API**|Korlátozott|Teljes hozzáférés|
|**Offline**|Service Worker (korlátozott)|Jobb storage, natív cache|
|**Push notification**|✅ iOS 16.4+|✅ Mindig|
|**Development**|Egyszerű|Komplexebb|
|**Build idő**|Nincs (web deploy)|iOS: macOS kell, 10 perc|
|**Update idő**|Azonnal|App Store review (1-3 nap)|
|**Költség**|$0|$99/év (iOS) + $25 (Android)|
|**Felfedezhetőség**|SEO, web search|App Store, Play Store|
|**Biometrics**|❌|✅ Face ID, Touch ID|

**TLDR:**

- **PWA**: Gyors start, alacsony költség, instant updates
- **Capacitor**: Natív élmény, App Store presence, több funkció

---

## 5. AJÁNLÁS A TINICOACH PROJEKTHEZ

### 5.1 CMS Választás: **PRISMIC** 🏆

**Miért?**

✅ **Egyszerűbb a coach-nak**

- Drag & drop interface
- Vizuális szerkesztő
- Nem kell kódolást tanulnia

✅ **Gyorsabb setup**

- Next.js integráció 30 perc
- Slice Machine egyszerű

✅ **Elég a kezdéshez**

- Napi üzenetek: egyszerű szöveg field
- Videók: URL + metadata
- Közösségi kérdések: szöveg + opciók

✅ **Multi-language built-in**

- Később könnyebb angol verzió

⚠️ **Limit kezelése:**

```
Ingyenes plan: 1 custom type
→ Megoldás: Használj "Universal Content" type-ot
   ahol "content_type" field határozza meg (video/message/question)
```

**Sanity később, ha:**

- Komplex relációk kellenek (pl. videók + quiz összekapcsolva)
- 3+ user kell (te, feleséged, designer)
- GROQ-ra van szükség (komplex query-k)

### 5.2 Platform Választás: **PWA → Capacitor**

**Fázis 1 (0-3 hónap): PWA** 🚀

✅ Gyors launch ✅ Instant frissítések ✅ User feedback gyűjtés ✅ Validation

**MVP feature set:**

- Auth (email/password)
- Hála napló (3/hét ingyenes)
- 1 szokás követő (ingyenes)
- Erősségkereső kvíz (1x ingyenes)
- Stripe előfizetés
- PWA install prompt

**Fázis 2 (3-6 hónap): Capacitor Migration** 📱

Ha van **100+ aktív user + pozitív feedback**:

✅ App Store presence (marketing) ✅ Push notifications 100% megbízható ✅ Biometric login ✅ Jobb offline experience

**Migration terv:**

1. Ugyanaz a Next.js kód
2. Capacitor setup (1 nap)
3. PWA marad elsődleges, Capacitor secondary
4. Hot updates mindkét platformon

### 5.3 Javasolt Tech Stack

```
Frontend:
├── Next.js 14 (App Router, Static Export Capacitor-hoz)
├── TypeScript
├── Tailwind CSS
├── React Hook Form + Zod
└── PWA (next-pwa)

Backend:
├── Next.js API Routes (külön deploy PWA-hoz)
├── Prisma ORM
├── PostgreSQL (Vercel Postgres)
└── NextAuth.js

CMS:
└── Prismic (kezdéshez)
    └── Sanity (később, ha kell)

Mobile:
├── PWA (Phase 1)
└── Capacitor (Phase 2, optional)

Services:
├── Vercel (hosting)
├── Stripe (payment)
├── OneSignal (push notifications)
└── Resend (email)
```

### 5.4 Költségvetés (MVP + 6 hónap)

**Phase 1 (PWA):**

- Vercel Hobby: **$0/hó** (vagy Pro: $20/hó)
- Vercel Postgres: **$0-25/hó**
- Prismic Free: **$0/hó**
- OneSignal Free: **$0/hó** (<10k users)
- Stripe: **1.4% + 4 Ft** per tranzakció
- Domain: **~$15/év**

**Összesen:** ~$0-30/hó

**Phase 2 (ha Capacitor):**

- Fenti költségek
- Apple Developer: **+$99/év**
- Google Play: **+$25 (egyszeri)**

**Összesen:** ~$30-50/hó + $124/év egyszeri

---

## 📚 További Források

### Prismic

- Dokumentáció: https://prismic.io/docs
- Next.js guide: https://prismic.io/docs/nextjs
- Slice Machine: https://prismic.io/docs/slice-machine

### Sanity

- Dokumentáció: https://www.sanity.io/docs
- GROQ tutorial: https://www.sanity.io/docs/groq
- Next.js integration: https://www.sanity.io/guides/sanity-nextjs-guide

### Capacitor

- Dokumentáció: https://capacitorjs.com/docs
- Plugins: https://capacitorjs.com/docs/plugins
- iOS setup: https://capacitorjs.com/docs/ios
- Android setup: https://capacitorjs.com/docs/android

---

**Készítette**: Claude (Anthropic)  
**Verzió**: 1.0  
**Dátum**: 2025-11-11