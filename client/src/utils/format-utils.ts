export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "")

  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
  } else if (cleaned.length > 10) {
    return `+${cleaned.slice(0, cleaned.length - 10)} (${cleaned.slice(cleaned.length - 10, cleaned.length - 7)}) ${cleaned.slice(cleaned.length - 7, cleaned.length - 4)}-${cleaned.slice(cleaned.length - 4)}`
  }

  // Return original if can't format
  return phone
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export const truncateText = (text: string, maxLength = 100): string => {
  if (!text || text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

export const getFullName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`
}
