import { render, screen } from "@testing-library/react"

import i18n from "../i18n"
import AnnouncementBar from "./AnnouncementBar"

afterEach(async () => {
  await i18n.changeLanguage("en")
})

test("shows the v4 announcement", () => {
  render(<AnnouncementBar />)
  expect(screen.getByText(/new features and improvements/i)).toBeInTheDocument()
})

test("links to the v4 site in a new tab", () => {
  render(<AnnouncementBar />)
  const link = screen.getByRole("link", { name: /explore now/i })
  expect(link).toHaveAttribute("href", "https://dentrw.hbapte.com")
  expect(link).toHaveAttribute("target", "_blank")
  expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"))
})

test("renders the French copy when the language is French", async () => {
  await i18n.changeLanguage("fr")
  render(<AnnouncementBar />)
  expect(screen.getByText(/nouvelles fonctionnalités/i)).toBeInTheDocument()
  expect(screen.getByRole("link", { name: /découvrir/i })).toBeInTheDocument()
})
