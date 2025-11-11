## 11. ADMIN / CMS (PRISMIC)

### 11.1 Content Types (Prismic-ben)

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

**Webhook:** Prismic → /api/prismic-webhook

**Flow:**

- Prismic content updated
- Webhook triggers
- Backend cache invalidates
- Next fetch: new content

---