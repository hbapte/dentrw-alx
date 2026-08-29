import { render } from "@react-email/components"
import { describe, expect, it } from "vitest"

import { AppointmentConfirmation } from "./AppointmentConfirmation.js"

describe("AppointmentConfirmation", () => {
  it("renders the patient name and the chosen service", async () => {
    const html = await render(
      <AppointmentConfirmation
        name="Amara"
        service="Root Canal Treatment"
        date="2026-09-03"
        time="10:30"
      />
    )
    expect(html).toContain("Amara")
    expect(html).toContain("Root Canal Treatment")
  })
})
