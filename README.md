# Mull Me

**Free temporary email for everyone.**

Mull Me is a free, open-source, client-side temporary email application. Generate disposable email addresses, receive messages directly in your browser, and stay safe with built-in link & attachment security analysis — no backend, no tracking, no ads.

![screenshot](https://img.shields.io/badge/React-19-blue.svg)
![screenshot](https://img.shields.io/badge/TypeScript-6-3178C6)
![screenshot](https://img.shields.io/badge/Vite-8-646CFF)
![screenshot](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4)
![screenshot](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

- **One-click generation** — Create a temporary email address instantly. No registration, no personal data.
- **Multiple providers** — Switch between 4 temp mail providers (Mail.tm, 1SecMail, Mail.gw, Guerrilla Mail) for best availability.
- **Real-time inbox** — Auto-polling every 5 seconds with a live/pause toggle. New emails appear instantly.
- **Full CSS rendering** — Emails are sanitized with DOMPurify and rendered inside a sandboxed iframe, preserving original styles.
- **Security warnings** — Automatically detects suspicious links (phishing TLDs, IP-based URLs, suspicious keywords) and dangerous attachments (.exe, .scr, .bat, etc.).
- **Custom lifetime** — Choose how long your mailbox lives: 10 minutes up to 24 hours.
- **Multiple view modes** — Switch between HTML, plain text, and raw source views.
- **Remote image blocking** — Block remote images by default to prevent tracking; toggle on when needed.
- **Mailbox history** — Your last 10 generated addresses are persisted locally for quick restoration.
- **Keyboard shortcuts** — Navigate with `j`/`k`, search with `/`, refresh with `r`, and more.
- **Desktop notifications** — Get notified when new emails arrive, even when the tab isn't focused.
- **Download attachments** — Download individual files or bulk ZIP archives.
- **Export emails** — Download as `.eml` or `.json` format.
- **Light / Dark mode** — Toggle between themes with a single click. Persisted to localStorage.
- **PWA ready** — Install as a standalone app with the manifest and service worker.
- **Responsive** — Mobile-friendly with a slide-over drawer for the email viewer.
- **Privacy first** — No cookies, no tracking, no ads, no backend. Everything runs in your browser.

---

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/lonxzsy/mull-me.git
cd mull-me

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 🧩 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 19 |
| **Language** | TypeScript 6 |
| **Build tool** | Vite 8 |
| **Styling** | Tailwind CSS 3 |
| **State management** | Zustand (with persist middleware) |
| **Routing** | React Router 7 |
| **Animations** | Framer Motion 12 |
| **Icons** | Lucide React |
| **HTTP** | Axios |
| **HTML sanitization** | DOMPurify |
| **UI primitives** | Radix UI (Tooltip, Dialog, Dropdown Menu, Select, Tabs) |
| **File handling** | FileSaver, JSZip |

---

## 🏗 Project Structure

```
src/
├── main.tsx                  # App entry point
├── App.tsx                   # Root layout, routes, page transitions
├── index.css                 # Global styles, Tailwind layers, CSS variables
├── types/
│   └── index.ts              # TypeScript interfaces
├── store/
│   └── appStore.ts           # Zustand state (persisted to localStorage)
├── hooks/
│   └── usePolling.ts         # Custom polling hook
├── lib/
│   ├── utils.ts              # Utility functions (cn, formatDate, copyToClipboard...)
│   ├── email-renderer.ts     # HTML sanitization + iframe document builder
│   └── security.ts           # Link/attachment security analysis
├── providers/
│   ├── index.ts              # Provider registry
│   ├── base.ts               # Base utilities, CORS proxy fallback
│   ├── mailTm.ts             # Mail.tm provider
│   ├── mailGw.ts             # Mail.gw provider
│   ├── oneSecMail.ts         # 1SecMail provider
│   └── guerrillaMail.ts      # Guerrilla Mail provider
├── components/
│   ├── Header.tsx            # Sticky nav header with theme toggle
│   ├── Footer.tsx            # Site footer
│   ├── EmailGenerator.tsx    # Mailbox generation form + active mailbox
│   ├── EmailList.tsx         # Message list with animations
│   ├── EmailViewer.tsx       # Message viewer (HTML/text/raw) + download/export
│   ├── ProviderStatus.tsx    # Provider health monitoring
│   └── ui/                   # Reusable UI primitives
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Badge.tsx
│       ├── Tooltip.tsx
│       └── Toast.tsx
├── pages/
│   ├── HomePage.tsx          # Landing page (hero + generator + features)
│   ├── InboxPage.tsx         # Two-column inbox (list + viewer) with search/sort
│   ├── ProvidersPage.tsx     # Provider status page
│   └── AboutPage.tsx         # About/info page
└── assets/
    ├── vite.svg
    ├── react.svg
    └── hero.png
```

---

## 🔌 Supported Providers

| Provider | Auth | Custom Address | Attachments | CORS Proxy Required |
|----------|------|---------------|-------------|-------------------|
| **Mail.tm** | JWT | ✅ | ❌ | ❌ |
| **1SecMail** | None | ❌ | ✅ | ✅ |
| **Mail.gw** | JWT | ✅ | ❌ | ❌ |
| **Guerrilla Mail** | Session | ❌ | ❌ | ✅ |

Provider availability depends on their public APIs and CORS settings. If one is blocked, try another.

---

## 🔒 Security Architecture

- **HTML sanitization** — All HTML emails are sanitized with DOMPurify using a strict configuration that removes scripts, event handlers, embeds, forms, canvas, and SVG elements.
- **Sandboxed iframe** — Sanitized HTML is rendered in an iframe with `sandbox="allow-same-origin"` only — no scripts, no forms, no popups.
- **Remote image blocking** — `src` attributes are replaced with `data-original-src` to prevent tracking pixels. Toggleable with one click.
- **Link analysis** — Extracts all hrefs and checks against:
  - Suspicious TLDs (`.tk`, `.ml`, `.ga`, `.top`, `.xyz`, `.click`, etc.)
  - Suspicious keywords (verify, login, password, bank, crypto, etc.)
  - IP address domains, overly long domains, domains with multiple hyphens
  - Non-standard protocols
- **Attachment analysis** — Checks file extensions and MIME types against dangerous lists (.exe, .scr, .bat, .vbs, .js, .ps1, .apk, etc.) and flags files > 10 MB.

---

## 🌐 CORS Proxy Fallback

Since browser CORS policies can block API requests to some providers, Mull Me includes a smart fetch system that:

1. Tries direct API calls first
2. Falls back to CORS proxies (corsproxy.io, allorigins.win, codetabs.com) with round-robin rotation

This ensures maximum provider compatibility.

---

## 🤝 Contributing

Contributions are welcome! Here are some ideas:

- Add a new temp mail provider
- Improve the UI with new animations or components
- Add i18n / multi-language support
- Improve CORS proxy fallback logic
- Write tests

---

## 📄 License

MIT &copy; [lonxzsy](https://github.com/lonxzsy/mull-me). See [LICENSE](./LICENSE) for details.
