# DentRW — Dental Clinic Website

[![Live Demo](https://img.shields.io/badge/Live-dentrw.vercel.app-blue?style=flat-square)](https://dentrw.vercel.app)
[![v4 Live](https://img.shields.io/badge/v4-dentrw.hbapte.com-6366f1?style=flat-square)](https://dentrw.hbapte.com)
[![Built with React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Deployed on Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel)](https://vercel.com)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-f7df1e?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
![GitHub Repo Views](https://gitviews.com/repo/hbapte/dentrw-alx.svg?label-color=green&style=flat-square)

![Screenshot](/src/components/Images/screenshot.jpg)

DentRW is a responsive web application for a dental clinic, built as the ALX Software Engineering Frontend final project. It covers appointment booking, newsletter subscription, live chat, and automated data collection — all in a clean, mobile-friendly interface.

> **DentRW v4 is live!** Rebuilt with a new design and additional features.
> Check it out at [dentrw.hbapte.com](https://dentrw.hbapte.com)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [License](#license)
- [Acknowledgements](#acknowledgements)
- [Room for Improvement](#room-for-improvement)
- [Contact](#contact)

---

## Features

- **Responsive Design** — Fully responsive layout that works seamlessly across all screen sizes and devices.
- **Appointment Booking** — Patients can book appointments online by selecting a service, date, and time. Submissions are sent with Resend using React Email templates, via a Vercel serverless function (`/api/contact`).
- **Newsletter Subscription** — Visitors can subscribe to clinic updates and announcements. The signup is forwarded to ConvertKit server-side (`/api/subscribe`) so no API key ships to the browser.
- **Live Chat (Typebot)** — 24/7 chatbot assistant for instant support and guidance.
- **Data Collection Automation** — Resend delivers the appointment emails (clinic notification + patient confirmation); ConvertKit manages newsletter subscribers.
- **Analytics** — Google Analytics tracks visitor behaviour to inform future improvements.

---

## Tech Stack

| Tool                                             | Purpose                                                  |
| ------------------------------------------------ | -------------------------------------------------------- |
| [React 19](https://react.dev)                    | Component-based UI framework                             |
| [Tailwind CSS](https://tailwindcss.com)          | Utility-first styling                                    |
| [Resend](https://resend.com)                     | Transactional email delivery (appointment notifications) |
| [React Email](https://react.email)               | Component-based HTML email templates                     |
| [ConvertKit](https://convertkit.com)             | Newsletter subscription management (called server-side)  |
| [Typebot](https://www.typebot.io)                | Embedded chatbot assistant                               |
| [Google Analytics](https://analytics.google.com) | Visitor analytics and behaviour tracking                 |
| [Vercel](https://vercel.com)                     | Hosting and continuous deployment                        |

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/hbapte/dentrw-alx.git
cd dentrw-alx

# Install dependencies
bun install

# Copy the environment variables template and fill in your values
cp .env.example .env.local

# Start the development server
bun run dev   # http://localhost:3000
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values. See `.env.example` for descriptions of each variable, and `docs/email.md` for how the email system works.

```env
RESEND_API_KEY=
SENDER_EMAIL=
SENDER_NAME=
ADMIN_EMAIL=
CONVERTKIT_API_KEY=
CONVERTKIT_FORM_ID=
```

These are server-side only (no `VITE_` prefix, so never bundled into the client) and must also be set in the Vercel project settings for production.

---

## License

This project is licensed under the [MIT License](/LICENCE).

---

## Acknowledgements

Thanks to the following tools and resources that made this project possible:

- [Tailwind CSS](https://tailwindcss.com)
- [React](https://reactjs.org)
- [Resend](https://resend.com)
- [React Email](https://react.email)
- [ConvertKit](https://convertkit.com)
- [Typebot](https://www.typebot.io)
- [Free Frontend](https://freefrontend.com) — UI component inspiration
- [Componentland](https://component.land) — UI component inspiration

Special thanks to the ALX Graduation Program for the opportunity to build and ship this project.

---

## Room for Improvement

- **Online payments** — Integrate a payment gateway for deposits or consultation fees.
- **Electronic health records** — Allow patients to view their appointment history securely.
- **User accounts** — Patient login for managing bookings and preferences.
- **Multilingual support** — Add Kinyarwanda and French translations for local accessibility.

Suggestions and contributions are welcome — open an issue or submit a PR.

---

## Contact

**Ishimwe Jean Baptiste**

- GitHub: [hbapte](https://github.com/hbapte)
- Portfolio: [hbapte.com](https://hbapte.com)
- Email: [ijbapte@gmail.com](mailto:ijbapte@gmail.com)

---

## Repobeats Analytics

![Alt](https://repobeats.axiom.co/api/embed/a42375af2d02cd0db80ac8b9f3e6a45fbcb9421a.svg "Repobeats analytics image")

## Star History

[![Star Stats](https://starchart.cc/hbapte/dentrw-alx.svg?variant=adaptive&line=%23f59e0b)](https://starchart.cc/hbapte/dentrw-alx)
