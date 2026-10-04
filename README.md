# Poonji — Multi-Business Capital & Loan Tracker

A Progressive Web App (PWA) for managing capital invested, business income, operating expenses, executive withdrawals, loans given (interest tracking), and EMIs payable across multiple businesses.

Built with **React + Vite + Tailwind CSS + Supabase (PostgreSQL + Realtime WebSockets)**.

---

## 🚀 1. Push to GitHub & Automate Builds

A GitHub Actions workflow is pre-configured in `.github/workflows/deploy.yml`. When you push to `main`, GitHub will automatically build and publish your app.

### Steps to upload to GitHub:
```bash
# 1. Initialize git (if not already done)
git init -b main

# 2. Add all files and make your initial commit
git add .
git commit -m "Initial commit: Poonji PWA with Supabase & GitHub Actions"

# 3. Create a new repository on https://github.com/new (e.g. named 'poonji')
# Then connect your remote repository:
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git

# 4. Push to GitHub
git push -u origin main
```

---

## ⚙️ 2. Enable GitHub Pages Automated Publishing

Once pushed to GitHub:
1. In your GitHub repository, go to **Settings** → **Pages** (under Code and automation).
2. Under **Build and deployment** → **Source**, select **GitHub Actions**.
3. Under the **Actions** tab, the `Build and Deploy to GitHub Pages` workflow will run automatically and provide your live URL:
   `https://<YOUR-USERNAME>.github.io/<YOUR-REPO-NAME>/`

### (Optional) Configure Repository Secrets in GitHub:
If you want to configure or change Supabase credentials for production builds:
1. Go to **Settings** → **Secrets and variables** → **Actions**.
2. Add Repository secrets:
   - `VITE_SUPABASE_URL`: `https://haqwhylcdhtxzghvqxil.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `sb_publishable_wDxh9qcmzFFVPrJLNRiZNQ_-iJMRZVe`

---

## 📱 3. How to Access on iPhone & Android

Poonji is an installable Progressive Web App (PWA) with offline caching and native app feel:

### On iPhone / iPad (iOS Safari):
1. Open your live deployment URL in **Safari**.
2. Tap the **Share** button at the bottom (square with upward arrow).
3. Scroll down and tap **Add to Home Screen**.
4. Tap **Add** in the top right.
5. The **Poonji** icon will appear on your iOS home screen and open in standalone mode with full-screen experience and zero browser bars.

### On Android (Chrome / Edge / Samsung Internet):
1. Open the deployment URL in **Chrome** or your default browser.
2. Tap the in-app **Install Poonji** prompt, or tap the three dots (**⋮**) in the top right.
3. Tap **Install app** or **Add to Home screen**.
4. The app installs to your home screen and app drawer as a native WebAPK.

---

## ⚡ 4. Realtime Database & Multi-Device Sync

- Realtime synchronization is handled via Supabase Postgres changes (`postgres_changes`).
- Any entry made from your iPhone will immediately reflect on your Android device, laptop, or desktop in real time.
- All 7 database tables are connected: `businesses`, `accounts`, `transactions`, `loans`, `loan_txns`, `emis`, `emi_txns`.

---

## 💻 5. Local Development
```bash
npm install
npm run dev
```
Dev server starts at `http://localhost:3000`.

---

## 🍎 6. iOS App Build (GitHub Actions)

`.github/workflows/ios-build.yml` builds the iOS app on a macOS runner (Capacitor wraps the web build) on every push to `main`, or manually from **Actions → Build iOS App → Run workflow**.

- **No Apple account:** produces `Poonji-unsigned-ipa` (download from the run's Artifacts). Install via Sideloadly/AltStore.
- **With Apple Developer account:** add these repo secrets for a signed IPA: `IOS_CERT_P12_BASE64`, `IOS_CERT_PASSWORD`, `IOS_PROFILE_BASE64`, `IOS_TEAM_ID` (optional `IOS_EXPORT_METHOD`, default `app-store-connect`). Add `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_P8` to auto-upload to TestFlight.
- Bundle ID is `com.poonji.app` (edit `capacitor.config.json` to change).
