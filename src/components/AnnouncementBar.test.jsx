import { render, screen } from "@testing-library/react"

import AnnouncementBar from "./AnnouncementBar"

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
