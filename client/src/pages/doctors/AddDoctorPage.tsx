/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDoctorStore } from "../../store/doctor-store"
import { useNotificationStore } from "../../store/notification-store"
import { ArrowLeft } from "lucide-react"
import DoctorForm from "../../components/doctors/DoctorForm"
import type { DoctorFormData } from "../../types/doctor.types"
import api from "../../services/api"

interface User {
  id: string
  name: string
}

const AddDoctorPage: React.FC = () => {
  const navigate = useNavigate()
  const { createDoctor } = useDoctorStore()
  const { showSuccess, showError } = useNotificationStore()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await api.get("/users?role=doctor")
        const userData = response.data.data.users || []
        setUsers(
          userData.map((user: any) => ({
            id: user._id,
            name: user.names || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
          })),
        )
      } catch (error) {
        console.error("Failed to fetch users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleSubmit = async (data: DoctorFormData) => {
    try {
      await createDoctor(data)
      showSuccess("Doctor created successfully")
      navigate("/doctors")
    } catch (error) {
      showError("Failed to create doctor")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/doctors" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Doctor</h1>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <DoctorForm onSubmit={handleSubmit} users={users} />
        </div>
      </div>
    </div>
  )
}

export default AddDoctorPage
