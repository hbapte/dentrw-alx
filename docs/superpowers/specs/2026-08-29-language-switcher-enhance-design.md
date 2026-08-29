# Language switcher: flags, two variants, better a11y — design

**Date:** 2026-08-29
**Status:** Approved (design)
**Branch:** `advisor/language-switcher-enhance`

## Problem

`src/components/LanguageSwitcher.jsx` is a plain pair of `en` / `fr` text buttons. It is
mounted twice (Navbar desktop nav + Navbar mobile menu) and nowhere else. We want it to look
world-class, to carry flags, and to have a second presentation for the footer.

Two concrete shortcomings today:

- **Accessible name is the language _code_.** Screen readers announce "en, button". The
  visible uppercase comes from CSS `uppercase`, so the accessible name is the raw lowercase
  code.
- **No footer presence.** The footer has no language control at all.

## Decisions

| Question         | Decision                                                                                                                                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Flag rendering   | **Inline SVG** components in the switcher file. Emoji flags are rejected — Windows ships no flag glyphs and renders "GB"/"FR" letters instead. A package is rejected — ~250 flags of dead weight for 2 languages. |
| Flag for English | **United Kingdom** (Union Jack). Conventional for "English" internationally, and Rwanda is a Commonwealth member.                                                                                                 |
| Navbar form      | **Segmented pill toggle** with a sliding active indicator. One click to switch; both options always discoverable. Best pattern for exactly 2 options.                                                             |
| Footer form      | **Upward dropdown** with a globe icon and the native language name (Stripe/Vercel footer convention). Genuinely distinct from the navbar pill.                                                                    |

## Component API

One component, two presentations, shared language metadata:

```jsx
<LanguageSwitcher />                    // variant="pill" (default) — Navbar
<LanguageSwitcher variant="dropdown" /> // Footer
```

`Navbar.jsx` is untouched: the default variant keeps both existing call sites working.

## Flags

Two local SVG components, ~350 bytes each:

- **`FlagGB`** — Union Jack: `#012169` field, white saltire (stroke 8), red saltire
  (`#C8102E`, stroke 4), white cross (stroke 13), red cross (stroke 8). The official flag
  counterchanges (offsets) the red saltire; at a 20×14px render that is invisible, and
  flag-icon libraries draw it centred at small sizes too.
- **`FlagFR`** — three vertical bands: `#002395`, `#fff`, `#ED2939`.

Both:

- normalised to `viewBox="0 0 60 40"` (3:2) so they sit on a consistent baseline,
- `aria-hidden="true"` (the button carries the accessible name),
- `rounded-[2px]` plus **`ring-1 ring-black/10`** — without the ring, the Tricolore's white
  band and the Union Jack's white areas disappear against the white navbar. On the dark
  footer the ring is `ring-black/10` still, which reads as a subtle edge.

## Pill variant (navbar)

- Container: `relative inline-flex items-center rounded-full bg-blue-50 p-0.5 ring-1 ring-blue-100`,
  `role="group"`, `aria-label={t("language.label")}`.
- **Sliding indicator**: an `absolute` `bg-blue-600 rounded-full shadow-sm` element covering
  half the container, `transition-transform`, translated to the active index. Uses
  `motion-reduce:transition-none`. `aria-hidden`.
- Buttons: `relative z-10 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold`.
  Active `text-white`; inactive `text-blue-900/70 hover:text-blue-900`.
- Both labels are 2 characters (`EN` / `FR`), so an even 50/50 split is safe.

## Dropdown variant (footer)

- Trigger `<button>`: globe icon + **native language name** + chevron.
  `border border-white/20 bg-white/5 text-white hover:bg-white/10`, tuned for the navy footer.
  `aria-haspopup="listbox"`, `aria-expanded`, `aria-label={t("language.label")}`.
- Menu: `absolute bottom-full left-0 mb-2` (**opens upward** — the footer is at the page
  bottom), `min-w-full rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5`.
- Rows: flag + native name, with a check icon on the active one.
- Behaviour: closes on **Esc**, on **outside click** (a `mousedown` listener on `document`),
  and on selection; focus returns to the trigger after Esc/selection.

## Accessibility

Both variants label each option with the **native language name** from the existing i18n
keys — `t("language.en")` → "English", `t("language.fr")` → "Français" (identical in both
locales, which is correct for a language picker). This replaces the current `"en"` / `"fr"`
accessible names.

- Pill: `aria-pressed={isActive}` on each button.
- Dropdown: `aria-expanded` on the trigger; the active row also carries `aria-current="true"`.

No new i18n keys — `language.label`, `language.en`, `language.fr` already exist in
`en/common.json` and `fr/common.json`.

## Footer placement

Into the existing bottom bar as the first item, matching the Stripe/Vercel convention:

```
[🌐 English ▴]        ©2023 - DentRW        Developed by hbapte
```

The row becomes `flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between` so it
stacks cleanly on mobile.

## Tests (`src/components/LanguageSwitcher.test.jsx`)

Existing two tests are updated for the new accessible names (`"English"` / `"Français"`
instead of `"en"` / `"fr"`), then:

- pill renders a flag SVG per language,
- pill marks the active language with `aria-pressed="true"`,
- dropdown trigger shows the current native name and is collapsed initially,
- dropdown opens on click and lists both languages,
- selecting from the dropdown changes the language and closes the menu,
- Esc closes the menu.

## Files

| File                                       | Change                          |
| ------------------------------------------ | ------------------------------- |
| `src/components/LanguageSwitcher.jsx`      | rewrite — flags, both variants  |
| `src/components/Footer.jsx`                | import + bottom-bar row         |
| `src/components/LanguageSwitcher.test.jsx` | update 2, add ~6                |
| `src/components/Navbar.jsx`                | **unchanged** (default variant) |

## Out of scope

- Arrow-key roving focus inside the dropdown (Tab is adequate for 2 items).
- Adding a third language.
- Persisting the choice — `i18next-browser-languagedetector` already caches to
  `localStorage`.
