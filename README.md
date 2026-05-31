<div align="center">

<h1>⚗️ ChemVibe</h1>

<p><strong>An Interactive, AI-Powered Chemistry Laboratory Platform for Students & Educators</strong></p>

<p>
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img alt="Firebase" src="https://img.shields.io/badge/Firebase-12-FFCA28?style=flat-square&logo=firebase&logoColor=black" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img alt="Gemini AI" src="https://img.shields.io/badge/Gemini%20AI-Powered-4285F4?style=flat-square&logo=google&logoColor=white" />
  <img alt="PWA" src="https://img.shields.io/badge/PWA-Installable-5A0FC8?style=flat-square&logo=pwa&logoColor=white" />
  <img alt="License" src="https://img.shields.io/badge/License-Apache%202.0-green?style=flat-square" />
</p>

</div>

---

## 🧪 What is ChemVibe?

**ChemVibe** is a comprehensive, web-based chemistry education platform that brings the laboratory experience to any browser. It combines interactive virtual simulations, AI-driven tutoring, gamification, and a cloud-backed learning management system — designed for Indonesian high school (SMA) chemistry curriculum (Kelas X–XII), but broadly applicable to all secondary learners.

Students explore chemistry by *doing* — running simulations, building atoms, completing adaptive quizzes, and reviewing flashcards — while teachers manage classrooms, post announcements, and review submitted lab reports from a dedicated portal.

---

## ✨ Key Features

### 🔬 20+ Virtual Chemistry Laboratories
ChemVibe ships with a rich catalog of interactive simulation modules organized by grade level:

| Grade | Lab Module | Topic |
|-------|-----------|-------|
| Kelas X | **Atom Builder Lab** | Atomic structure, electron configuration, quantum numbers |
| Kelas X | **Orbitals Bonding Lab** | Ionic, covalent & metallic bonds, orbital overlap |
| Kelas X | **VSEPR Geometry Lab** | Molecular geometry, hybridization, bond angles |
| Kelas X | **Flame Test Lab** | Metal ion identification via emission spectra |
| Kelas X | **Element Reactivity Lab** | Reactivity series, redox reactions |
| Kelas XI | **Stoichiometry Calculator** | Mole calculations, limiting reagents, yield |
| Kelas XI | **Titration Simulator** | Acid-base titrations with live pH curves |
| Kelas XI | **Kinetics Lab** | Reaction rate, rate laws, temperature effects |
| Kelas XI | **Equilibrium Lab** | Le Chatelier's principle, Kc/Kp calculations |
| Kelas XI | **Thermochemistry Lab** | Enthalpy, Hess's Law, calorimetry |
| Kelas XI | **Colligative Properties Lab** | Boiling point elevation, freezing point depression |
| Kelas XI | **Colloid Lab** | Types of colloids, Tyndall effect |
| Kelas XI | **Electrolysis Lab** | Electrochemical cells, Faraday's laws |
| Kelas XI | **Volta Lab** | Galvanic cells, EMF, electrode potentials |
| Kelas XII | **Acid-Base Intro Lab** | pH, pOH, buffer solutions |
| Kelas XII | **Buffer & Hydrolysis Lab** | Henderson-Hasselbalch, salt hydrolysis |
| Kelas XII | **Solubility & Ksp Lab** | Common-ion effect, precipitation reactions |
| Kelas XII | **Organic Chemistry Lab** | Functional groups, IUPAC nomenclature, reactions |
| Kelas XII | **Macromolecule Lab** | Polymers, proteins, carbohydrates, lipids |
| Kelas XII | **Green Chemistry Lab** | 12 Principles of Green Chemistry, sustainability |
| Kelas XII | **Petroleum Lab** | Fractional distillation, hydrocarbons, refining |

---

### 🤖 AI Chemistry Assistant (Powered by Google Gemini)
- Real-time conversational tutoring on any chemistry topic
- Context-aware, multi-turn conversation with persistent history
- Responses formatted with proper chemical notation (LaTeX/Markdown)
- **Secure server-side API proxy** — the Gemini API key is never exposed to the browser

### 📊 Adaptive Learning Engine
- **Adaptive Quiz System** — quiz difficulty dynamically adjusts based on student performance
- **Mastery Tracking** — visual weekly progress graph shows learning trends over time
- **Activity Feed** — chronological log of all completed quizzes, flashcard reviews, and simulations
- **Real-time Feedback Widget** — instant cognitive feedback after every interaction

### 🃏 Cloud Flashcard System (Anki-style)
- Create, edit, and organize custom flashcard decks by topic
- Synced to Firebase — accessible across all devices
- Spaced-repetition inspired review workflow with success/retry tracking

### 🏆 Gamification & Leaderboard
- **Atom Builder Missions** — earn cryptographically signed achievement badges
- **Periodic Table Game** — high-score competitive element quiz mode
- **Global Leaderboard** — real-time ranking of all students by scores and missions
- **Public Activity Ledger** — live ticker showing community-wide learning activity

### 🏫 Teacher Portal (Guru Mode)
- Create and manage virtual **Classrooms** with unique join codes
- Post **Announcements** (tugas / pengumuman / materi categories)
- Review and **grade student lab reports** with personalized feedback
- Toggle between Teacher and Student views from a single account

### 📄 Virtual Lab Report System
- Students complete structured digital lab reports (objectives, theory, apparatus, observations, conclusion)
- Reports submitted directly to the teacher's grading queue
- Teachers return graded reports with numerical scores and written feedback

### 🔐 Academic Credentials & Verified Badges
- Achievements are **cryptographically signed** by the server using HMAC
- Signed credentials stored in Firestore (`verified_badges` subcollection)
- Tamper-evident badge verification system

### 🌍 Periodic Table Explorer
- Full interactive periodic table with all 118 elements
- Detailed element cards: configuration, electronegativity, shells, phase, discovery, real-world uses
- Filter and search by category (alkali metals, noble gases, lanthanides, etc.)
- **3D Molecule Viewer** for visualizing molecular geometry

### 🔑 Science Laws Quick Reference
- Instant access to a curated reference card of key physics & chemistry laws
- Covers thermodynamics, reaction kinetics, equilibrium, electrochemistry, and more

---

## 🏗️ Technical Architecture

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript 5.8 |
| **Build Tool** | Vite 6 |
| **Styling** | Tailwind CSS 4 |
| **Animations** | Motion (Framer Motion) |
| **3D Rendering** | Three.js |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Backend** | Express.js + Node.js (TypeScript) |
| **Database** | Firebase Firestore |
| **Auth** | Firebase Authentication |
| **AI** | Google Gemini API (`@google/genai`) |
| **PWA** | Web App Manifest + Service Worker |

### Backend & Security
- **Express server** (`server.ts`) acts as a secure proxy between the React client and Gemini API
- All AI calls go through `/api/gemini/*` endpoints — API key never reaches the browser
- **Firestore Security Rules** enforce per-user data isolation and role-based access
- **HMAC-signed badges** prevent client-side score manipulation

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18 or later
- A **Firebase project** with Firestore and Authentication enabled
- A **Google Gemini API key** (from [Google AI Studio](https://aistudio.google.com/))

### 1. Clone the repository
```bash
git clone https://github.com/your-username/chemvibe.git
cd chemvibe
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:
```env
GEMINI_API_KEY="your_gemini_api_key_here"
APP_URL="http://localhost:3000"
BADGE_SECRET_KEY="your_random_secret_string_here"
```

### 4. Configure Firebase
Copy your Firebase project config into `firebase-applet-config.json`:
```json
{
  "apiKey": "...",
  "authDomain": "...",
  "projectId": "...",
  "storageBucket": "...",
  "messagingSenderId": "...",
  "appId": "..."
}
```

Deploy Firestore security rules:
```bash
firebase deploy --only firestore:rules
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
chemvibe/
├── src/
│   ├── App.tsx                  # Root application, routing, auth state
│   ├── main.tsx                 # React entry point
│   ├── index.css                # Global styles & theme tokens
│   ├── types.ts                 # Shared TypeScript interfaces
│   ├── data.ts                  # Initial mastery data & element references
│   ├── elementsData.ts          # Full periodic table dataset (118 elements)
│   ├── realWorldUses.ts         # Real-world chemistry applications data
│   ├── lib/
│   │   └── firebase.ts          # Firebase SDK initialization & helpers
│   ├── data/
│   │   └── laws.ts              # Science laws reference data
│   └── components/
│       ├── DashboardHome.tsx    # Main dashboard with progress overview
│       ├── PeriodicTable.tsx    # Interactive periodic table
│       ├── AtomBuilderLab.tsx   # Atom builder game & missions
│       ├── AIAssistant.tsx      # Gemini-powered AI tutor
│       ├── AdaptiveQuiz.tsx     # Adaptive quiz engine
│       ├── FlashcardReview.tsx  # Anki-style flashcard system
│       ├── Leaderboard.tsx      # Global rankings
│       ├── TeacherPortal.tsx    # Teacher management dashboard
│       ├── AcademicCredentials.tsx # Verified badge showcase
│       ├── VirtualReportLab.tsx # Lab report submission system
│       ├── [20+ Lab components] # Individual simulation modules
│       └── ...
├── server.ts                    # Express backend (AI proxy, PWA serving)
├── firebase-blueprint.json      # Firestore schema documentation
├── firestore.rules              # Firebase security rules
├── firebase-applet-config.json  # Firebase project config (not committed)
├── vite.config.ts               # Vite build configuration
├── tsconfig.json                # TypeScript configuration
└── .env.example                 # Environment variable template
```

---

## 🎭 Roles & Modes

ChemVibe has a dual-role system:

| Role | Description |
|------|-------------|
| **Siswa (Student)** | Access all labs, quizzes, flashcards, and the leaderboard. Submit lab reports. |
| **Guru (Teacher)** | Everything students have, plus classroom management, announcements, and grading. |

Users can also switch between **Mandiri (Independent)** and **Bimbingan (Guided)** learning modes:
- **Mandiri** — hides cognitive hints to test self-recall
- **Bimbingan** — displays theory summaries, key formulas, and step-by-step guides inside labs

---

## 📱 Progressive Web App (PWA)

ChemVibe is installable as a native-like app on desktop and mobile:
1. Open ChemVibe in a supported browser (Chrome, Edge)
2. Look for the **Install** prompt in the settings panel or browser address bar
3. Install and launch from your home screen or Start menu

---

## 🔒 Privacy & Data

- User emails and personal data are **never shared publicly**
- Leaderboards display names and scores only — no PII exposed
- Activity logs use server-generated IDs, not user-identifiable metadata
- All Firestore access is governed by strict security rules (see `firestore.rules`)

---

## 📜 License

This project is licensed under the **Apache License 2.0**. See the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/new-lab-module`)
3. Commit your changes (`git commit -m 'Add: Electrochemistry Lab v2'`)
4. Push to the branch (`git push origin feature/new-lab-module`)
5. Open a Pull Request

---

<div align="center">
  <p>Built with ⚗️ for chemistry students everywhere.</p>
  <p><strong>ChemVibe</strong> — <em>Where Chemistry Comes Alive</em></p>
</div>
