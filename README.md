# Vraj Shah — Portfolio

The personal portfolio of Vraj Shah, a computer science student and full-stack, cloud, DevOps, and security-focused developer. It presents selected projects, experience, research, certifications, and contact links in an interactive single-page experience.

## Highlights

- Project case studies for ScholarStack, MediGuard, a secure workflow platform, a DevOps engineering lab, network traffic analysis, mentorship research, and a timetable maker
- Experience at Inspira and as the founder of ScholarStack
- Interactive 3D technology stack built with React Three Fiber, Drei, Three.js, and Rapier
- GSAP-powered scrolling, reveals, pinned project storytelling, and responsive navigation
- Resume preview, research-paper links, certifications, and social/contact links
- Responsive layouts, reduced-motion support, and mobile-friendly interaction patterns

## Tech stack

- React 18 and TypeScript
- Vite
- GSAP and ScrollTrigger
- Three.js, React Three Fiber, Drei, and Rapier
- React Icons and modern CSS

## Run locally

Prerequisites: Node.js 18 or later and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. The development server is exposed to the local network by default.

## Available scripts

```bash
npm run dev      # start the Vite development server
npm run build    # type-check and create a production build
npm run lint     # run ESLint
npm run preview  # preview the production build
```

## Project structure

```text
src/
  App.tsx                 # page content, sections, and interactions
  App.css                 # portfolio layout and responsive styling
  components/
    TechStack.tsx         # lazy-loaded interactive 3D technology section
    ParallaxBackground.tsx
public/
  project-screenshot-*    # project imagery and diagrams
```

## Customising content

The portfolio content is kept in `src/App.tsx`. Update the project, experience, certification, research-paper, and social-link data there. Project screenshots live in `public/`. The resume button and embedded preview use Google Drive links; replace both links together when publishing a new resume.

## Contact form

The contact form (`src/components/ContactForm.tsx`) posts to a Vercel serverless function (`api/contact.ts`) that sends two emails via Gmail SMTP — one notifying the site owner, one confirming receipt to the visitor. See `.env.example` for how to generate a Gmail App Password and configure `GMAIL_USER` / `GMAIL_APP_PASSWORD`. Because `/api` only runs on Vercel's infrastructure, testing it locally requires `vercel dev` (Vercel CLI) rather than plain `npm run dev`.

## License

This repository is licensed under the [Personal Portfolio License](LICENSE). Please review it before reusing the code or assets.
