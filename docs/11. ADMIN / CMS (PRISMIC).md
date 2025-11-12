## 11. ADMIN / CMS

> **Status**: ⏳ TBD - Döntés függőben (Prismic vs Sanity)  
> **Prioritás**: Future iteration (lásd: MVP PRIORITÁS.md)

### 11.1 Content Types

**Megjegyzés**: Az alábbi struktúra Prismic-re van tervezve, de a döntés még függőben van. A végleges implementáció lehet Prismic vagy Sanity CMS alapú.

**Tervezett Content Types:**

**DailyMessage:**

- message (text, required)
- scheduled_date (date, required)
- category (select: "self-love", "motivation", "gratitude")

**Video:**

- title (text)
- description (rich text)
- vimeo_url (link)
- thumbnail (image)
- duration (number, minutes)
- is_free (boolean)
- category (select)

**CommunityQuestion:**

- question (text)
- options[] (group: option_text)
- active_from (date)
- active_to (date)

**OnboardingSlide:**

- title (text)
- description (rich text)
- image (image)
- order (number)

### 11.2 Content Sync (Backend)

**Tervezett Flow:**

- CMS content updated
- Webhook triggers → `/api/cms-webhook` (endpoint név függ a választott CMS-től)
- Backend cache invalidates
- Next fetch: new content

**Megjegyzés**: A pontos implementáció (Prismic vs Sanity) függ a döntéstől. Mindkét CMS támogat webhook-okat és cache invalidation-t.

### 11.3 CMS Választás

Lásd: `docs/CMS.md` - részletes összehasonlítás Prismic vs Sanity között.

**Döntési szempontok:**
- Prismic: Egyszerűbb, kevesebb konfiguráció, managed service
- Sanity: Rugalmasabb, fejlesztőbarát, self-hosted Studio

---