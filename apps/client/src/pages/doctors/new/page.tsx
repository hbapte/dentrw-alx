'use client'

import { useState } from 'react'
import { DoctorFormModal } from '@/components/admin/doctors/doctor-form/doctor-form-modal'
import { DoctorsList } from '@/components/admin/doctors/list/doctors-list'

export default function AdminDoctorsPage() {
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div className="">   

      <DoctorsList />

      <DoctorFormModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal}
      />
    </div>
  )
}
