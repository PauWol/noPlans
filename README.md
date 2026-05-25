# noPlans

**Stop deciding, start doing.**

noPlans is a lightweight social idea hub for friend groups who *always talk about what to do… but never actually decide*.

Instead of endless chat loops like “idk what do you want to do?”, noPlans lets you:
- collect ideas
- vote on them
- and let an automatic selection system choose what you actually do next

It removes decision fatigue and turns group ideas into real actions.

## ✨ Features

- 🧠 Create groups for friends, plans, or recurring hangouts
- 💡 Add ideas instantly (activities, places, anything)
- 🗳️ Voting system to let the group decide democratically
- ⚡ Auto-pick algorithm that selects an idea when nobody can decide
- 🔗 Simple join system via group links or codes
- 📱 Clean, fast, mobile-friendly UI
- 🚨 Graceful error handling (invalid groups, missing data, etc.)
- 📦 Installable as a PWA (works like a native app)

## 🧠 How it works

1. Create or join a group
2. Everyone adds ideas (e.g. “go bowling”, “watch a movie”, “chill at park”)
3. The group votes on ideas
4. If nobody decides → hit **Auto Pick**
5. noPlans chooses an idea using a fair selection algorithm

No more endless discussions. Just outcomes.

## 🛠️ Tech Stack

- SvelteKit
- TypeScript
- Vite
- TailwindCSS
- Supabase (database + sync)
- Vercel (deployment)

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/noPlans.git
cd noPlans
````

### 2. Install dependencies

```bash
pnpm install
```

### 3. Run development server

```bash
pnpm run dev
```

App runs at:

```http
http://localhost:5173
```

---

## 📦 Build for Production

```bash
pnpm run build
```

Preview build:

```bash
pnpm run preview
```

---

## 📱 PWA Support

noPlans can be installed on your device like a native app.

To enable PWA features:

* Add/update `manifest.json`
* Configure service worker in SvelteKit
* Place icons in `/static/icons`

## ⚠️ Error Handling

* Custom 404 page for missing routes
* Group-not-found handling
* Safe fallbacks for empty or invalid states

---

## 🧩 Future Ideas

* Smart recommendation system (based on past choices)
* Location-based idea suggestions
* Time-based voting (expires after X hours)
* Chat integration per group
* Emoji reaction voting
* Activity history (“what we actually did” timeline)

---

## 📄 License

MIT License — free to use and modify.

---

## 🤝 Contributing

Pull requests and ideas are welcome. If you’ve got improvements or features, open an issue or contribute directly.

---

## 🌿 Philosophy

noPlans is not about organizing life perfectly.

It’s about turning:

> “We should do something”
> into
> “We’re doing this.”
