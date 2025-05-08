import type React from "react"
// import { useLocation } from "react-router-dom"
// import CreatePaymentForm from "../../components/payments/CreatePaymentForm"
import PageHeader from "../../components/ui/page-header"

const CreatePaymentPage: React.FC = () => {
  // const location = useLocation()
  // const queryParams = new URLSearchParams(location.search)
  // const appointmentId = queryParams.get("appointmentId") || undefined
  // const patientId = queryParams.get("patientId") || undefined

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader title="Create Payment" description="Create a new payment for an appointment or service" />

      {/* <CreatePaymentForm appointmentId={appointmentId} patientId={patientId} /> */}
    </div>
  )
}

export default CreatePaymentPage
