/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import UploadService from '../services/upload.service'
import DoctorService from '../services/doctor.service'
import type { DoctorFormData, DoctorFormStore } from '../types/doctor.types'

const initialFormData: DoctorFormData = {
  picture: '',
  type: 'full-time',
  names: '',
  specialization: [],
  email: '',
  address: '',
  dentalSpecialties: [],
  workingHours: [
    { day: 'monday', isWorking: true, slots: [{ startTime: '09:00', endTime: '17:00' }] },
    { day: 'tuesday', isWorking: true, slots: [{ startTime: '09:00', endTime: '17:00' }] },
    { day: 'wednesday', isWorking: false, slots: [] },
    { day: 'thursday', isWorking: false, slots: [] },
    { day: 'friday', isWorking: true, slots: [{ startTime: '09:00', endTime: '17:00' }] },
    { day: 'saturday', isWorking: true, slots: [{ startTime: '09:00', endTime: '17:00' }] },
    { day: 'sunday', isWorking: true, slots: [{ startTime: '09:00', endTime: '17:00' }] },
  ],
  daysOff: []
}

export const useDoctorFormStore = create<DoctorFormStore>()(
  devtools(
    (set, get) => ({
      formData: initialFormData,
      currentStep: 1,
      isSubmitting: false,
      uploadProgress: 0,
      errors: {},

      updateFormData: (data) => {
        set((state) => ({
          formData: { ...state.formData, ...data }
        }))
      },

      setCurrentStep: (step) => {
        set({ currentStep: step })
      },

      setError: (field, error) => {
        set((state) => ({
          errors: { ...state.errors, [field]: error }
        }))
      },

      clearErrors: () => {
        set({ errors: {} })
      },

      uploadPicture: async (file) => {
        try {
          set({ uploadProgress: 0 })
          const response = await UploadService.uploadPicture(file, (progress) => {
            set({ uploadProgress: progress })
          })
          
          set((state) => ({
            formData: { 
              ...state.formData, 
              picture: response.pictureUrl,
              pictureFile: file 
            },
            uploadProgress: 100
          }))
        } catch (error: any) {
          set((state) => ({
            errors: { ...state.errors, picture: error.message }
          }))
        }
      },

      validateStep: (step) => {
        const { formData } = get()
        const errors: Record<string, string> = {}

        switch (step) {
          case 1:
            if (!formData.names.trim()) errors.names = 'Name is required'
            if (!formData.email.trim()) errors.email = 'Email is required'
            if (!formData.specialization.length) errors.specialization = 'Please select a specialization'
            if (!formData.address.trim()) errors.address = 'Address is required'
            break
          case 2:
            if (!formData.dentalSpecialties.length) errors.dentalSpecialties = 'Please select at least one service'
            break
          case 3:
            // const hasWorkingDay = formData.workingHours.some(day => day.isWorking)
            // if (!hasWorkingDay) errors.workingHours = 'Please set at least one working day'
            break
        }

        set({ errors })
        return Object.keys(errors).length === 0
      },

      canProceedToNextStep: () => {
        const { currentStep } = get()
        return get().validateStep(currentStep)
      },

      submitForm: async () => {
        try {
          set({ isSubmitting: true })
          const { formData } = get()
          
          // Transform form data to match API expectations
          const doctorData = {
            names: formData.names,
            email: formData.email,
            picture: formData.picture,
            specialization: formData.specialization,
            dentalSpecialties: formData.dentalSpecialties,
            workingHours: formData.workingHours,
            // Add other required fields based on your Doctor model
            role: 'doctor',
            consultationFee: {
              initial: 0,
              followUp: 0,
              emergency: 0,
              currency: 'RWF'
            }
          }

          await DoctorService.createDoctor(doctorData)
          
          // Reset form on success
          get().resetForm()
          
        } catch (error: any) {
          set((state) => ({
            errors: { ...state.errors, submit: error.message }
          }))
        } finally {
          set({ isSubmitting: false })
        }
      },

      resetForm: () => {
        set({
          formData: initialFormData,
          currentStep: 1,
          isSubmitting: false,
          uploadProgress: 0,
          errors: {}
        })
      }
    }),
    { name: 'doctor-form-store' }
  )
)
