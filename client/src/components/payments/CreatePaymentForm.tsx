"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate } from "react-router-dom"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import toast from "react-hot-toast"
import { usePaymentStore } from "../../store/payment-store"
import type { PaymentFormData } from "../../types/payment.types"

// Define the form schema
const formSchema = z.object({
  appointmentId: z.string().min(1, "Appointment is required"),
  patientId: z.string().min(1, "Patient is required"),
  serviceId: z.string().optional(),
  amount: z.number().min(0, "Amount must be greater than 0").optional(),
  currency: z.string().default("RWF"),
  paymentMethod: z.enum(["stripe", "MoMo", "cash"], {
    required_error: "Payment method is required",
  }),
})

interface CreatePaymentFormProps {
  appointmentId?: string
  patientId?: string
  onSuccess?: () => void
}

const CreatePaymentForm: React.FC<CreatePaymentFormProps> = ({ appointmentId, patientId, onSuccess }) => {
  const { createPayment, loading, error, clearError } = usePaymentStore()
  const navigate = useNavigate()
  const [services, setServices] = useState<{ id: string; name: string; price: number }[]>([])
  const [selectedServicePrice, setSelectedServicePrice] = useState<number | null>(null)

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      appointmentId: appointmentId || "",
      patientId: patientId || "",
      serviceId: "",
      amount: undefined,
      currency: "RWF",
      paymentMethod: "cash",
    },
  })

  // Fetch services (mock data for now)
  useEffect(() => {
    // In a real app, you would fetch this from your API
    setServices([
      { id: "1", name: "Dental Checkup", price: 15000 },
      { id: "2", name: "Teeth Cleaning", price: 25000 },
      { id: "3", name: "Tooth Extraction", price: 35000 },
      { id: "4", name: "Root Canal", price: 75000 },
      { id: "5", name: "Dental Filling", price: 30000 },
    ])
  }, [])

  // Handle service selection
  const handleServiceChange = (serviceId: string) => {
    form.setValue("serviceId", serviceId)

    if (serviceId) {
      const service = services.find((s) => s.id === serviceId)
      if (service) {
        setSelectedServicePrice(service.price)
        form.setValue("amount", service.price)
      }
    } else {
      setSelectedServicePrice(null)
      form.setValue("amount", undefined)
    }
  }

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const paymentData: PaymentFormData = {
        appointmentId: data.appointmentId,
        patientId: data.patientId,
        serviceId: data.serviceId,
        amount: data.amount,
        currency: data.currency,
        paymentMethod: data.paymentMethod,
      }

      const result = await createPayment(paymentData)

      toast({
        title: "Payment created",
        description: `Payment ${result.payment.status} successfully.`,
      })

      if (onSuccess) {
        onSuccess()
      } else {
        navigate(`/payments/${result.payment._id}`)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create payment",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Payment</CardTitle>
        <CardDescription>Create a new payment for an appointment or service</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="appointmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Appointment ID</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!!appointmentId} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient ID</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!!patientId} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service</FormLabel>
                  <Select onValueChange={handleServiceChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="no_service">No service (custom amount)</SelectItem>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} -{" "}
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "RWF",
                          }).format(service.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (RWF)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                      value={field.value || ""}
                      disabled={!!selectedServicePrice}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="stripe">Credit Card</SelectItem>
                      <SelectItem value="MoMo">Mobile Money</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="text-red-500 text-sm mt-2">
                {error}
                <Button variant="link" className="p-0 h-auto text-red-500 underline ml-2" onClick={() => clearError()}>
                  Dismiss
                </Button>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Payment"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default CreatePaymentForm
