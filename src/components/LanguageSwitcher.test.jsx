import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import i18n from "../i18n"
import LanguageSwitcher from "./LanguageSwitcher"

afterEach(async () => {
  await i18n.changeLanguage("en")
})

describe("pill variant", () => {
  test("renders a button per supported language, named in its own language", () => {
    render(<LanguageSwitcher />)
    expect(screen.getByRole("button", { name: "English" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Français" })).toBeInTheDocument()
  })

  test("changes the active language on click", async () => {
    const user = userEvent.setup()
    render(<LanguageSwitcher />)
    await user.click(screen.getByRole("button", { name: "Français" }))
    expect(i18n.resolvedLanguage).toBe("fr")
  })

  test("marks the active language with aria-pressed", () => {
    render(<LanguageSwitcher />)
    expect(screen.getByRole("button", { name: "English" })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
    expect(screen.getByRole("button", { name: "Français" })).toHaveAttribute(
      "aria-pressed",
      "false"
    )
  })

  test("renders a decorative flag for each language", () => {
    const { container } = render(<LanguageSwitcher />)
    const flags = container.querySelectorAll("svg[aria-hidden='true']")
    expect(flags.length).toBeGreaterThanOrEqual(2)
  })
})

describe("dropdown variant", () => {
  test("shows the current language and starts collapsed", () => {
    render(<LanguageSwitcher variant="dropdown" />)
    const trigger = screen.getByRole("button", { expanded: false })
    expect(trigger).toHaveTextContent("English")
    expect(screen.queryByRole("button", { name: "Français" })).toBeNull()
  })

  test("opens on click and lists both languages", async () => {
    const user = userEvent.setup()
    render(<LanguageSwitcher variant="dropdown" />)
    await user.click(screen.getByRole("button", { expanded: false }))
    expect(screen.getByRole("button", { expanded: true })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "English" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Français" })).toBeInTheDocument()
  })

  test("selecting a language changes it and closes the menu", async () => {
    const user = userEvent.setup()
    render(<LanguageSwitcher variant="dropdown" />)
    await user.click(screen.getByRole("button", { expanded: false }))
    await user.click(screen.getByRole("button", { name: "Français" }))
    expect(i18n.resolvedLanguage).toBe("fr")
    expect(screen.getByRole("button", { expanded: false })).toBeInTheDocument()
  })

  test("closes on Escape", async () => {
    const user = userEvent.setup()
    render(<LanguageSwitcher variant="dropdown" />)
    await user.click(screen.getByRole("button", { expanded: false }))
    await user.keyboard("{Escape}")
    expect(screen.getByRole("button", { expanded: false })).toBeInTheDocument()
  })
})
