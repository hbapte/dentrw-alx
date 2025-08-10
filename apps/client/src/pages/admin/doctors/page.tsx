'use client'

import { useState } from 'react'
import { DoctorFormModal } from '@/components/admin/doctors/doctor-form/doctor-form-modal'
import { AdminDoctorsPageComponent } from '@/components/admin/doctors/list/doctors-page'

export default function AdminDoctorsPage() {
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div className="">   

      <AdminDoctorsPageComponent />
      <DoctorFormModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal}
      />
    </div>
  )
}
