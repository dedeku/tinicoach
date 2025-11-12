
### 3.1 Mi az a Capacitor?

A **Capacitor** egy **cross-platform natív runtime**, ami lehetővé teszi, hogy webes alkalmazásokat (HTML/CSS/JavaScript) natív mobilappként futtass iOS-en és Androidon.

**Capacitor = Web app → Native app wrapper + Native API bridge**

Készítette: **Ionic Team** (2019)

### 3.2 Főbb Jellemzők

#### ✅ Előnyök

**1. Web-First Architektúra**

```
┌─────────────────────────┐
│   Next.js / React App   │  ← Ugyanaz a kód!
├─────────────────────────┤
│   Capacitor Bridge      │  ← Natív API-k elérése
├─────────────────────────┤
│   iOS / Android Native  │  ← Natív konténer
└─────────────────────────┘
```

**2. Egyetlen Kódbázis**

```typescript
// Camera plugin - működik iOS-en és Androidon
import { Camera } from '@capacitor/camera';

const takePhoto = async () => {
  const photo = await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.Uri
  });
  return photo.webPath;
};
```

**3. Natív Plugin Ecosystem**

**Core Plugins (beépített):**

- 📷 Camera
- 📁 Filesystem
- 📍 Geolocation
- 🔔 Local Notifications
- 🔔 Push Notifications
- 💾 Storage
- 📤 Share
- 📳 Haptics (rezgés)
- 📱 Status Bar
- ⌨️ Keyboard
- 🌐 Network
- 🔋 Battery

**Community Plugins:**

- 🔒 Biometric Auth (Face ID, Touch ID)
- 💳 In-App Purchases
- 📊 Analytics
- 🗄️ SQLite
- 📝 In-App Review
- 🎵 Audio

**4. Platform Ellenőrzés**

```typescript
import { Capacitor } from '@capacitor/core';

const platform = Capacitor.getPlatform(); // 'ios' | 'android' | 'web'

if (Capacitor.isNativePlatform()) {
  // Natív app specifikus kód
  await StatusBar.setBackgroundColor({ color: '#6366f1' });
} else {
  // PWA specifikus kód
  console.log('Running as PWA');
}
```

**5. Live Reload Development**

```bash
# iOS Simulator hot reload
npx cap run ios --livereload --external

# Android Emulator hot reload
npx cap run android --livereload
```

**6. Hot Updates (CodePush alternatíva)**

```bash
npm install @capawesome/capacitor-live-update
```

- JS/CSS/HTML változások **azonnal frissíthetők**
- **Bypass App Store review** (UI bugfix, új feature)
- Natív kód változás esetén kell App Store update

**7. Natív IDE Integráció**

```bash
# Xcode megnyitása
npx cap open ios

# Android Studio megnyitása
npx cap open android
```

- Teljes hozzáférés natív projekthez
- Custom natív kód írható (Swift/Kotlin)
- Natív plugin fejlesztés

**8. PWA Compatibility**

```typescript
// Ugyanaz a kód működik PWA-ban is!
// Capacitor gracefully falls back
const takePicture = async () => {
  if (Capacitor.isPluginAvailable('Camera')) {
    return await Camera.getPhoto({ ... });
  } else {
    // PWA fallback: HTML file input
    return await uploadFromFileInput();
  }
};
```

#### ⚠️ Hátrányok

**1. Natív Build Követelmények**

- **macOS kötelező** iOS build-hez (Xcode)
- Android buildhez bármilyen OS
- VAGY: Cloud build service ($50-100/hó)

**2. App Store Review Process**

- Első release: 2-5 nap
- Minden natív változás: 1-3 nap review
- Rejection lehetőség

**3. Két Platform Maintenance**

- iOS és Android külön build
- Platform specifikus bugok
- Külön tesztelés

**4. Limit a Web API-khoz Képest**

- Bizonyos Web API-k nem érhetők el natívan
- LocalStorage limit más natívan vs PWA-ban

**5. App Store Költségek**

- Apple Developer: **$99/év**
- Google Play: **$25 (egyszeri)**

**6. Static Export Szükséges**

```javascript
// next.config.js
module.exports = {
  output: 'export', // Capacitorhoz kell!
  // API Routes НЕМ működnek!
  // Server Components НЕМ működnek!
};
```

**Megoldás:**

- Frontend: Static export (Capacitor app)
- Backend: Külön API (Vercel, Railway, stb.)

### 3.3 Workflow

#### Development

```bash
# 1. Next.js build
npm run build
npm run export  # → out/ folder

# 2. Capacitor sync (copy web assets to native)
npx cap sync

# 3. Run on simulator with live reload
npx cap run ios --livereload

# Minden Next.js mentés után automatikusan frissül!
```

#### Production Build

```bash
# iOS
npx cap sync ios
npx cap open ios
# Xcode-ban: Product > Archive > Distribute

# Android
npx cap sync android
npx cap open android
# Android Studio-ban: Build > Generate Signed Bundle
```

#### Hot Update Deploy

```bash
# JavaScript/CSS bugfix azonnali deploy
npm run build
capacitor-updater upload

# Users automatikusan kapják a frissítést
# Nincs App Store review! 🎉
```

### 3.4 Pricing & Költségek

**Capacitor maga INGYENES (open source)**

**Költségek:**

- Apple Developer Account: $99/év
- Google Play Console: $25 (egyszeri)
- Cloud Build Service (optional): ~$50-100/hó
    - Codemagic
    - AppFlow (Ionic)
    - Bitrise

**Alternatíva:** Saját macOS gép (Mac Mini, MacBook)

### 3.5 Use Case a tinicoach App-ban

#### PWA vs Capacitor Döntés

**Kezdd PWA-val, ha:**

- ✅ Gyors launch fontos (1-2 hónap)
- ✅ Nincs macOS gép
- ✅ Alacsony budget
- ✅ User feedback kell gyorsan

**Válts Capacitorra később, ha:**

- ✅ Van user traction (100+ aktív user)
- ✅ Kellenek natív funkciók:
    - Biometric login (Face ID)
    - Better offline storage
    - Local notifications
    - Background sync
- ✅ App Store presence marketing szempontból fontos
- ✅ Van budget ($99/év + fejlesztői idő)

#### Capacitor Funkciók tinicoach-hoz

**Hasznos natív API-k:**

```typescript
// 1. Biometric Login
import { NativeBiometric } from '@capacitor-community/native-biometric';
await NativeBiometric.verifyIdentity({
  reason: "Bejelentkezés az appba"
});

// 2. Local Notifications (offline reminder)
import { LocalNotifications } from '@capacitor/local-notifications';
await LocalNotifications.schedule({
  notifications: [{
    title: "Napi napló emlékeztető",
    body: "Írj le 3 dolgot, amiért hálás vagy ma!",
    id: 1,
    schedule: { at: new Date(Date.now() + 1000 * 60 * 60 * 24) }
  }]
});

// 3. Haptic Feedback (habit completion)
import { Haptics } from '@capacitor/haptics';
await Haptics.impact({ style: ImpactStyle.Medium });

// 4. Share (journal export)
import { Share } from '@capacitor/share';
await Share.share({
  title: 'Az én hála naplóm',
  text: gratitudeText,
  url: 'https://tinilany.hu/shared/abc123'
});

// 5. Status Bar styling
import { StatusBar, Style } from '@capacitor/status-bar';
await StatusBar.setBackgroundColor({ color: '#6366f1' });
await StatusBar.setStyle({ style: Style.Dark });
```

---