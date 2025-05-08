/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Stethoscope, Clipboard, FileText, Calendar, Check } from "lucide-react"
import { medicalRecordSchema, type MedicalRecordSchema } from "../../validations/medical-record.validations"
import type { MedicalRecordFormData, Prescription } from "../../types/medical-record.types"
import PrescriptionForm from "./PrescriptionForm"
import api from "../../services/api"

interface MedicalRecordFormProps {
  initialData?: MedicalRecordFormData
  onSubmit: (data: MedicalRecordFormData) => void
  isEditing?: boolean
  patientId?: string
  doctorId?: string
  appointmentId?: string
}

interface Patient {
  id: string
  name: string
}

interface Doctor {
  id: string
  name: string
}

interface Appointment {
  id: string
  date: string
}

const MedicalRecordForm: React.FC<MedicalRecordFormProps> = ({
  initialData,
  onSubmit,
  isEditing = false,
  patientId,
  doctorId,
  appointmentId,
}) => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loadingOptions, setLoadingOptions] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MedicalRecordSchema>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: initialData || {
      patientId: patientId || "",
      doctorId: doctorId || "",
      appointmentId: appointmentId || "",
      diagnosis: "",
      treatment: "",
      notes: "",
      followUpRequired: false,
      followUpDate: "",
      prescription: [],
    },
  })

  const followUpRequired = watch("followUpRequired")
  const selectedPatientId = watch("patientId")

  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true)
      try {
        // Fetch patients
        const patientsResponse = await api.get("/patients")
        const patientsData = patientsResponse.data.data.patients || []
        setPatients(
          patientsData.map((patient: any) => ({
            id: patient._id,
            name:
              patient.firstName && patient.lastName ? `${patient.firstName} ${patient.lastName}` : "Unknown Patient",
          })),
        )

        // Fetch doctors
        const doctorsResponse = await api.get("/doctors")
        const doctorsData = doctorsResponse.data.data.doctors || []
        setDoctors(
          doctorsData.map((doctor: any) => ({
            id: doctor._id,
            name: doctor.user?.names || "Dr. Unknown",
          })),
        )

        // If we have a patient ID, fetch their appointments
        if (selectedPatientId) {
          await fetchPatientAppointments(selectedPatientId)
        }
      } catch (error) {
        console.error("Error fetching options:", error)
      } finally {
        setLoadingOptions(false)
      }
    }

    fetchOptions()
  }, [])

  useEffect(() => {
    if (selectedPatientId) {
      fetchPatientAppointments(selectedPatientId)
    }
  }, [selectedPatientId])

  const fetchPatientAppointments = async (patientId: string) => {
    try {
      const appointmentsResponse = await api.get(`/appointments?patientId=${patientId}`)
      const appointmentsData = appointmentsResponse.data.data.appointments || []
      setAppointments(
        appointmentsData.map((appointment: any) => ({
          id: appointment._id,
          date: new Date(appointment.date).toLocaleDateString(),
        })),
      )
    } catch (error) {
      console.error("Error fetching appointments:", error)
    }
  }

  const handlePrescriptionChange = (prescriptions: Prescription[]) => {
    setValue("prescription", prescriptions)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">
            Patient
          </label>
          <div className="mt-1">
            <select
              id="patientId"
              {...register("patientId")}
              disabled={!!patientId || loadingOptions}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="">Select a patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>
          {errors.patientId && <p className="mt-1 text-sm text-red-600">{errors.patientId.message}</p>}
        </div>

        <div>
          <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700">
            Doctor
          </label>
          <div className="mt-1">
            <select
              id="doctorId"
              {...register("doctorId")}
              disabled={!!doctorId || loadingOptions}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="">Select a doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </option>
              ))}
            </select>
          </div>
          {errors.doctorId && <p className="mt-1 text-sm text-red-600">{errors.doctorId.message}</p>}
        </div>

        <div>
          <label htmlFor="appointmentId" className="block text-sm font-medium text-gray-700">
            Appointment
          </label>
          <div className="mt-1">
            <select
              id="appointmentId"
              {...register("appointmentId")}
              disabled={!!appointmentId || loadingOptions || !selectedPatientId}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="">Select an appointment</option>
              {appointments.map((appointment) => (
                <option key={appointment.id} value={appointment.id}>
                  {appointment.date}
                </option>
              ))}
            </select>
          </div>
          {errors.appointmentId && <p className="mt-1 text-sm text-red-600">{errors.appointmentId.message}</p>}
        </div>

        <div>
          <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700">
            Diagnosis
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Stethoscope className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="diagnosis"
              {...register("diagnosis")}
              className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="e.g., Acute Bronchitis"
            />
          </div>
          {errors.diagnosis && <p className="mt-1 text-sm text-red-600">{errors.diagnosis.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="treatment" className="block text-sm font-medium text-gray-700">
            Treatment
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
              <Clipboard className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              id="treatment"
              rows={3}
              {...register("treatment")}
              className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Treatment details and instructions"
            />
          </div>
          {errors.treatment && <p className="mt-1 text-sm text-red-600">{errors.treatment.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              id="notes"
              rows={3}
              {...register("notes")}
              className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Additional notes or observations"
            />
          </div>
          {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <div className="flex items-center">
            <input
              id="followUpRequired"
              type="checkbox"
              {...register("followUpRequired")}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="followUpRequired" className="ml-2 block text-sm font-medium text-gray-700">
              Follow-up Required
            </label>
          </div>
        </div>

        {followUpRequired && (
          <div>
            <label htmlFor="followUpDate" className="block text-sm font-medium text-gray-700">
              Follow-up Date
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="followUpDate"
                {...register("followUpDate")}
                className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            {errors.followUpDate && <p className="mt-1 text-sm text-red-600">{errors.followUpDate.message}</p>}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-6">
        <Controller
          control={control}
          name="prescription"
          render={({ field }) => <PrescriptionForm prescriptions={field.value} onChange={handlePrescriptionChange} />}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {isSubmitting ? (
            "Saving..."
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              {isEditing ? "Update Record" : "Create Record"}
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default MedicalRecordForm
