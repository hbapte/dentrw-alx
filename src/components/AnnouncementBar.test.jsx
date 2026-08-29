import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import i18n from "../i18n"
import AnnouncementBar from "./AnnouncementBar"

beforeEach(() => {
  localStorage.clear()
})

afterEach(async () => {
  localStorage.clear()
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

test("can be dismissed with the close button", async () => {
  const user = userEvent.setup()
  render(<AnnouncementBar />)
  await user.click(screen.getByRole("button", { name: /dismiss/i }))
  expect(
    screen.queryByText(/new features and improvements/i)
  ).not.toBeInTheDocument()
})

test("stays dismissed after a remount", async () => {
  const user = userEvent.setup()
  const first = render(<AnnouncementBar />)
  await user.click(screen.getByRole("button", { name: /dismiss/i }))
  first.unmount()

  render(<AnnouncementBar />)
  expect(
    screen.queryByText(/new features and improvements/i)
  ).not.toBeInTheDocument()
})
