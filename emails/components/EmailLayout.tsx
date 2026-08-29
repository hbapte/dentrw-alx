import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  pixelBasedPreset,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components"

import { brand } from "../../config/brand.js"

export function EmailLayout({ preview, children }) {
  return (
    <Html lang="en">
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: { extend: { colors: { brand: brand.blue } } },
        }}>
        <Head />
        <Body className="bg-gray-100 font-sans">
          <Preview>{preview}</Preview>
          <Container className="mx-auto my-[24px] max-w-[600px] rounded-[8px] bg-white p-[32px]">
            <Text className="m-0 text-[20px] font-bold text-brand">
              {brand.name}
            </Text>
            <Hr className="my-[20px] border-t border-solid border-gray-200" />
            {children}
            <Hr className="my-[20px] border-t border-solid border-gray-200" />
            <Section>
              <Text className="m-0 text-[12px] leading-[18px] text-gray-500">
                {brand.name} &middot; {brand.phone} &middot; {brand.email}
              </Text>
              <Text className="m-0 text-[12px] leading-[18px] text-gray-500">
                {brand.address}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default EmailLayout
