import { Column, Heading, Row, Section, Text } from "@react-email/components"

import { EmailLayout } from "./components/EmailLayout.js"

function DetailRow({ label, value }) {
  return (
    <Row>
      <Column className="w-[120px] align-top">
        <Text className="m-0 py-[4px] text-[13px] font-semibold text-gray-500">
          {label}
        </Text>
      </Column>
      <Column className="align-top">
        <Text className="m-0 py-[4px] text-[14px] text-gray-900">
          {value || "—"}
        </Text>
      </Column>
    </Row>
  )
}

export function AppointmentRequest({
  name,
  email,
  phone,
  service,
  date,
  time,
  message,
}) {
  return (
    <EmailLayout preview={`New appointment request from ${name}`}>
      <Heading as="h1" className="m-0 mb-[8px] text-[18px] text-gray-900">
        New appointment request
      </Heading>
      <Text className="mb-[16px] mt-0 text-[14px] text-gray-600">
        Reply to this email to reach {name} directly.
      </Text>
      <Section>
        <DetailRow label="Name" value={name} />
        <DetailRow label="Email" value={email} />
        <DetailRow label="Phone" value={phone} />
        <DetailRow label="Service" value={service} />
        <DetailRow label="Date" value={date} />
        <DetailRow label="Time" value={time} />
        <DetailRow label="Note" value={message} />
      </Section>
    </EmailLayout>
  )
}

AppointmentRequest.PreviewProps = {
  name: "Amara Uwase",
  email: "amara@example.com",
  phone: "+250 788 123 456",
  service: "Root Canal Treatment",
  date: "2026-09-03",
  time: "10:30",
  message: "Some sensitivity on the lower-left molar.",
}

export default AppointmentRequest
