"use client"

import type React from "react"
import { Pill, Clock, Calendar, FileText, Plus, Trash2 } from "lucide-react"
import type { Prescription } from "../../types/medical-record.types"

interface PrescriptionFormProps {
  prescriptions: Prescription[]
  onChange: (prescriptions: Prescription[]) => void
  readOnly?: boolean
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({ prescriptions, onChange, readOnly = false }) => {
  const handleAddPrescription = () => {
    const newPrescription: Prescription = {
      id: Math.random().toString(36).substring(2, 9),
      medication: "",
      dosage: "",
      frequency: "",
      duration: "",
      notes: "",
    }
    onChange([...prescriptions, newPrescription])
  }

  const handleRemovePrescription = (index: number) => {
    const updatedPrescriptions = [...prescriptions]
    updatedPrescriptions.splice(index, 1)
    onChange(updatedPrescriptions)
  }

  const handlePrescriptionChange = (index: number, field: keyof Prescription, value: string) => {
    const updatedPrescriptions = [...prescriptions]
    updatedPrescriptions[index] = { ...updatedPrescriptions[index], [field]: value }
    onChange(updatedPrescriptions)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Prescriptions</h3>
        {!readOnly && (
          <button
            type="button"
            onClick={handleAddPrescription}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Prescription
          </button>
        )}
      </div>

      {prescriptions.length === 0 ? (
        <div className="rounded-md bg-gray-50 p-4 text-center text-sm text-gray-500">
          No prescriptions added yet.
          {!readOnly && <div className="mt-2">Click "Add Prescription" to add one.</div>}
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((prescription, index) => (
            <div key={prescription.id || index} className="rounded-md border border-gray-200 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-md font-medium text-gray-700">Prescription #{index + 1}</h4>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleRemovePrescription(index)}
                    className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-sm font-medium text-red-700 hover:bg-red-100"
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor={`medication-${index}`} className="block text-sm font-medium text-gray-700">
                    Medication
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Pill className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id={`medication-${index}`}
                      value={prescription.medication}
                      onChange={(e) => handlePrescriptionChange(index, "medication", e.target.value)}
                      disabled={readOnly}
                      className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="e.g., Amoxicillin"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={`dosage-${index}`} className="block text-sm font-medium text-gray-700">
                    Dosage
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id={`dosage-${index}`}
                      value={prescription.dosage}
                      onChange={(e) => handlePrescriptionChange(index, "dosage", e.target.value)}
                      disabled={readOnly}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="e.g., 500mg"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={`frequency-${index}`} className="block text-sm font-medium text-gray-700">
                    Frequency
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id={`frequency-${index}`}
                      value={prescription.frequency}
                      onChange={(e) => handlePrescriptionChange(index, "frequency", e.target.value)}
                      disabled={readOnly}
                      className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="e.g., 3 times daily"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={`duration-${index}`} className="block text-sm font-medium text-gray-700">
                    Duration
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id={`duration-${index}`}
                      value={prescription.duration}
                      onChange={(e) => handlePrescriptionChange(index, "duration", e.target.value)}
                      disabled={readOnly}
                      className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="e.g., 7 days"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor={`notes-${index}`} className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      id={`notes-${index}`}
                      rows={2}
                      value={prescription.notes}
                      onChange={(e) => handlePrescriptionChange(index, "notes", e.target.value)}
                      disabled={readOnly}
                      className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Special instructions or additional notes"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PrescriptionForm
