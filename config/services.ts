export const services = [
  { value: "checkup_Consultation", label: "Dental Check-ups and Consultation" },
  { value: "x-rays", label: "X-rays" },
  { value: "fillings", label: "Fillings" },
  { value: "crowns_Bridges", label: "Crowns and Bridges" },
  { value: "RCT", label: "Root Canal Treatment" },
  { value: "teethWhitening", label: "Cleaning and Teeth Whitening" },
  { value: "orthodontic", label: "Orthodontic Treatment" },
  { value: "periodontal", label: "Periodontal Treatment" },
  { value: "dentalImplants", label: "Dental Implants" },
]

export function serviceLabel(value) {
  return services.find((s) => s.value === value)?.label ?? value ?? "—"
}
