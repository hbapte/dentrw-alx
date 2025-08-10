'use client'

import { X } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion, AnimatePresence } from 'framer-motion'
import { useMemo, useCallback } from 'react'
import { useDoctorFormStore } from '@/store/doctor-form.store'
import { StaffInfoStep } from './staff-info-step'
import { AssignedServicesStep } from './assigned-services-step'
import { WorkingHoursStep } from './working-hours-step'
import { DaysOffStep } from './days-off-step'
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/components/ui/stepper'

interface DoctorFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const steps = [
  { id: 1, title: 'Staff Info' },
  { id: 2, title: 'Assigned Services' },
  { id: 3, title: 'Working Hours' },
  { id: 4, title: 'Days Off' }
]

export function DoctorFormModal({ open, onOpenChange }: DoctorFormModalProps) {
  const {
    currentStep,
    setCurrentStep,
    validateStep,
    submitForm,
    isSubmitting,
    resetForm
  } = useDoctorFormStore()

  // Memoize the validation result to prevent infinite loops
  const isCurrentStepValid = useMemo(() => {
    return validateStep(currentStep)
  }, [validateStep, currentStep])

  const handleNext = useCallback(() => {
    if (isCurrentStepValid) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1)
      } else {
        submitForm()
      }
    }
  }, [isCurrentStepValid, currentStep, setCurrentStep, submitForm])

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep, setCurrentStep])

  const handleClose = useCallback(() => {
    resetForm()
    onOpenChange(false)
  }, [resetForm, onOpenChange])

  const handleStepClick = useCallback((stepIndex: number) => {
    const targetStep = stepIndex + 1
    // Only allow navigation to previous steps or current step
    if (targetStep <= currentStep) {
      setCurrentStep(targetStep)
    }
  }, [currentStep, setCurrentStep])

  const renderCurrentStep = useMemo(() => {
    switch (currentStep) {
      case 1:
        return <StaffInfoStep />
      case 2:
        return <AssignedServicesStep />
      case 3:
        return <WorkingHoursStep />
      case 4:
        return <DaysOffStep />
      default:
        return <StaffInfoStep />
    }
  }, [currentStep])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl bg-white/95 backdrop-blur-sm border-l border-gray-200/50 flex flex-col p-0"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100">
          <SheetHeader className="px-6 py-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-semibold text-gray-900">
                Add new Doctor Staff
              </SheetTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </SheetHeader>

          {/* Enhanced Stepper */}
          <motion.div
            className="flex justify-center px-6 pb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Stepper
              value={currentStep - 1}
              onValueChange={handleStepClick}
              orientation="horizontal"
              className="w-full max-w-2xl"
            >
              {steps.map((step, index) => (
                <StepperItem
                  key={step.id}
                  step={index + 1}
                  className="relative flex-1"
                  completed={index + 1 < currentStep}
                  disabled={index + 1 > currentStep}
                >
                  <StepperTrigger className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <StepperIndicator className="w-8 h-8 text-sm" />
                    <StepperTitle className="text-xs font-medium text-gray-600">
                      {step.title}
                    </StepperTitle>
                  </StepperTrigger>
                  {index < steps.length - 1 && (
                    <StepperSeparator className="absolute inset-x-0 top-3 left-[calc(50%+0.75rem+0.125rem)] -order-1 m-0 -translate-y-1/2 group-data-[orientation=horizontal]/stepper:w-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/stepper:flex-none" />
                  )}
                </StepperItem>
              ))}
            </Stepper>
          </motion.div>
        </div>

        {/* Scrollable Content Area */}
        <ScrollArea className="flex-1 max-h-[calc(100vh-200px)]">
          <div className="px-6 py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="min-h-[500px]"
              >
                {renderCurrentStep}
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-6 py-4">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isSubmitting || currentStep === 1}
              className="px-6 py-2 border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </Button>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-6 py-2 border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </Button>

              <Button
                onClick={handleNext}
                disabled={isSubmitting || !isCurrentStepValid}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : currentStep === 4 ? 'Save' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
