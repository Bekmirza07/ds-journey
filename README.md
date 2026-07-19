# DS Journey — Prep Manifest

An interactive 28-week roadmap tracker for going from Junior Data Analyst to a hireable Data Scientist. Sign in, check off checkpoints, and your progress syncs across every device via Firebase.

**Live demo:** _add your GitHub Pages URL here once deployed_

---

## Features

- 6 phases, 28 weeks, each with topics, curated resources, and a "Done means" checklist (a week only clears when every criterion is checked — not just when you watched a video)
- Weekly stretch goals
- Monthly reflection prompts (every 4 weeks)
- Mission control dashboard: overall progress, hours logged, streak, estimated completion date, and editable stat counters (projects, repos, interview problems, applications)
- Phase-completion badges
- Google or GitHub sign-in, with progress stored per-account in Firestore — check a box on your laptop, see it on your phone

---

## Tech stack

- **Frontend:** vanilla HTML/CSS/JS (no build step, no framework)
- **Hosting:** GitHub Pages (free)
- **Auth + database:** Firebase Authentication + Firestore (free tier is more than enough for personal use)

---

## Setup

### 1. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project** → give it a name (e.g. `ds-journey`) → finish the wizard.
2. In the project, click **Build → Authentication → Get started**.
   - Enable **Google** as a sign-in provider (just toggle it on, no extra setup needed).
   - Optionally enable **GitHub** as a sign-in provider — this requires registering an OAuth App in your GitHub account settings first ([GitHub's guide](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)) and pasting the Client ID/Secret into Firebase. Skip this if you only want Google login — just remove the GitHub button in `index.html` and the `githubProvider` lines in `app.js`.
3. Click **Build → Firestore Database → Create database** → start in **production mode** → pick a region close to you.

### 2. Get your web app config

1. In Firebase Console: **Project settings** (gear icon) → **General** tab → scroll to **Your apps** → click the **</>** (web) icon → register an app (any nickname).
2. Firebase shows you a `firebaseConfig` object. Copy it into `firebase-config.js` in this repo, replacing the placeholder values.
3. This file is safe to commit publicly — it's a client identifier, not a secret. Real protection comes from Firestore Security Rules (next step).

### 3. Lock down Firestore so users can only touch their own data

In Firebase Console → **Firestore Database → Rules**, replace the default rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /progress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Click **Publish**. This means each signed-in user can only read/write the document matching their own `uid` — nobody can see or overwrite anyone else's progress.

### 4. Authorize your GitHub Pages domain

In Firebase Console → **Authentication → Settings → Authorized domains**, add your GitHub Pages domain, e.g. `yourusername.github.io`. Without this, sign-in popups will fail on the deployed site (localhost is allowed by default for testing).

### 5. Push to GitHub and enable Pages

```bash
git init
git add .
git commit -m "Initial commit: DS Journey prep manifest"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ds-journey.git
git push -u origin main
```

Then: repo **Settings → Pages → Source → Deploy from a branch → main / (root)** → Save. GitHub gives you a URL like `https://YOUR_USERNAME.github.io/ds-journey/` within a minute or two.

### 6. Test it

Open the Pages URL, sign in with Google, check a box, then open the same URL on your phone and sign in with the same account — it should already be checked.

---

## File structure

```
ds-journey/
├── index.html          # page shell, auth gate, mission control markup
├── style.css            # all styling (dark theme, mono/display fonts)
├── app.js                # plan data, rendering, Firebase auth + Firestore sync
├── firebase-config.js  # your Firebase project keys (safe to commit)
└── README.md
```

## Editing your plan

All roadmap content (weeks, topics, resources, checklists, stretch goals) lives in the `PLAN` array at the top of `app.js`. Edit it directly — the UI renders entirely from that data structure, so adding, removing, or reordering weeks doesn't require touching the rendering logic.

## Notes / possible extensions

- Calendar heatmap of activity (data is already being tracked in `state.activity`, just needs a visual)
- A proper chart (e.g. hours logged per week) — Chart.js or a plain SVG bar chart would drop in cleanly
- Export progress as JSON/PDF for a portfolio writeup
