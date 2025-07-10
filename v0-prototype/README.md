# v0 Prototype – Eat My Bubbles

This folder contains the first working prototype of the **Eat My Bubbles** app.

## 🎯 Features

- Swimmer name and age shown at the top
- Dropdowns to select event and course (default: 50 Free, SCY)
- Compares swimmer’s best time per event to Regional and State cuts
- Supports both SCY and LCM formats
- Reads from an uploaded Excel file (`Swim Data` and `Time Standards` tabs)
- Mobile-friendly layout (SCY + 50 Free defaulted)

## 🛠️ Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router, Static Site Generation)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Shadcn/ui](https://ui.shadcn.com/) for UI components
- [React Select](https://react-select.com/) for dropdowns
- [xlsx](https://github.com/SheetJS/sheetjs) for Excel file parsing
- Deployed on [Vercel](https://vercel.com)

### 🔗 Live App

- **Production URL**: [eat-my-bubbles.vercel.app](https://eat-my-bubbles.vercel.app)

## ⚠️ Known Limitations

- File must be uploaded manually
- Only one swimmer supported at a time
- Some minor UI quirks on mobile (v1 will address)

## 🧹 Clean Project

- `.next/` and `node_modules/` are gitignored
- Tailwind/PostCSS config cleaned up and optimized

---

## 📬 Contact

- LinkedIn: [Revati Khopkar](https://www.linkedin.com/in/revati-khopkar-6449261b/)
- Email: [logically.team@gmail.com](mailto:logically.team@gmail.com)

> Built with 💙 for our family’s swim journey
