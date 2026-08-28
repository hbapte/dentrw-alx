import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import i18n from "../i18n"
import LanguageSwitcher from "./LanguageSwitcher"

afterEach(async () => {
  await i18n.changeLanguage("en")
})

test("renders a button per supported language", () => {
  render(<LanguageSwitcher />)
  expect(screen.getByRole("button", { name: "en" })).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "fr" })).toBeInTheDocument()
})

test("changes the active language on click", async () => {
  const user = userEvent.setup()
  render(<LanguageSwitcher />)
  await user.click(screen.getByRole("button", { name: "fr" }))
  expect(i18n.resolvedLanguage).toBe("fr")
})
