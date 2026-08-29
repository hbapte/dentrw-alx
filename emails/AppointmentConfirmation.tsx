import { Heading, Section, Text } from "@react-email/components"

import { brand } from "../config/brand.js"
import { EmailLayout } from "./components/EmailLayout.js"

export function AppointmentConfirmation({ name, service, date, time }) {
  return (
    <EmailLayout preview="We received your appointment request">
      <Heading as="h1" className="m-0 mb-[8px] text-[18px] text-gray-900">
        Thanks, {name} — we received your request
      </Heading>
      <Text className="mb-[16px] mt-0 text-[14px] leading-[22px] text-gray-700">
        Our team will contact you shortly to confirm your appointment. Here is
        what you asked for:
      </Text>
      <Section className="mb-[16px]">
        <Text className="m-0 text-[14px] text-gray-900">
          <strong>Service:</strong> {service || "—"}
        </Text>
        <Text className="m-0 text-[14px] text-gray-900">
          <strong>Preferred date:</strong> {date || "—"}
        </Text>
        <Text className="m-0 text-[14px] text-gray-900">
          <strong>Preferred time:</strong> {time || "—"}
        </Text>
      </Section>
      <Text className="m-0 text-[14px] leading-[22px] text-gray-700">
        Clinic hours — {brand.hours.join(" · ")}. Questions? Call {brand.phone}.
      </Text>
    </EmailLayout>
  )
}

AppointmentConfirmation.PreviewProps = {
  name: "Amara",
  service: "Root Canal Treatment",
  date: "2026-09-03",
  time: "10:30",
}

export default AppointmentConfirmation
