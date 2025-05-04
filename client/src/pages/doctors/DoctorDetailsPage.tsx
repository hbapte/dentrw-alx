"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useDoctorStore } from "../../store/doctor-store"
import { useNotificationStore } from "../../store/notification-store"
import { useAuthStore } from "../../store/auth-store"
import { getDoctorFullName, formatDayOfWeek, formatRatingAsStars } from "../../utils/doctor.utils"
import { formatDate } from "../../utils/date-utils"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Briefcase,
  Award,
  Globe,
  DollarSign,
  Clock,
  Star,
  Calendar,
  MessageSquare,
} from "lucide-react"
import Loader from "../../components/ui/Loader"
import ErrorAlert from "../../components/ui/ErrorAlert"
import ConfirmDialog from "../../components/ui/ConfirmDialog"
import type { Rating } from "../../types/doctor.types"

const DoctorDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { selectedDoctor, loading, error, fetchDoctorById, deleteDoctor, addRating, clearSelectedDoctor, clearError } =
    useDoctorStore()
  const { showSuccess, showError } = useNotificationStore()
  const { user } = useAuthStore()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false)
  const [ratingValue, setRatingValue] = useState(5)
  const [reviewText, setReviewText] = useState("")

  useEffect(() => {
    if (id) {
      fetchDoctorById(id)
    }

    return () => {
      clearSelectedDoctor()
    }
  }, [id, fetchDoctorById, clearSelectedDoctor])

  const handleDelete = async () => {
    if (id) {
      try {
        await deleteDoctor(id)
        showSuccess("Doctor deleted successfully")
        navigate("/doctors")
      } catch (err) {
        showError("Failed to delete doctor")
      } finally {
        setIsDeleteDialogOpen(false)
      }
    }
  }

  const handleSubmitRating = async () => {
    if (id) {
      try {
        await addRating(id, ratingValue, reviewText)
        showSuccess("Rating submitted successfully")
        setIsRatingDialogOpen(false)
        setRatingValue(5)
        setReviewText("")
      } catch (err) {
        showError("Failed to submit rating")
      }
    }
  }

  const isAdmin = user?.role === "admin"
  const isPatient = user?.role === "patient"

  if (loading && !selectedDoctor) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader size="large" />
      </div>
    )
  }

  if (error) {
    return <ErrorAlert message={error} onClose={clearError} />
  }

  if (!selectedDoctor) {
    return (
      <div className="rounded-md bg-yellow-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Doctor not found</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>The doctor you are looking for does not exist or has been removed.</p>
            </div>
            <div className="mt-4">
              <Link
                to="/doctors"
                className="rounded-md bg-yellow-50 px-2 py-1.5 text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2"
              >
                Go back to doctors
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const doctorName = getDoctorFullName(selectedDoctor)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/doctors" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Details</h1>
        </div>
        {isAdmin && (
          <div className="flex space-x-2">
            <Link
              to={`/doctors/edit/${id}`}
              className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
            <button
              onClick={() => setIsDeleteDialogOpen(true)}
              className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
              <Briefcase className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold text-gray-900">{doctorName}</h2>
              <p className="text-sm text-gray-500">{selectedDoctor.specialization}</p>
            </div>
            <div className="ml-auto flex items-center">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="ml-1 text-lg font-medium">
                  {selectedDoctor.averageRating ? selectedDoctor.averageRating.toFixed(1) : "N/A"}
                </span>
              </div>
              {isPatient && (
                <button
                  onClick={() => setIsRatingDialogOpen(true)}
                  className="ml-4 inline-flex items-center rounded-md bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                >
                  <Star className="mr-1 h-4 w-4" />
                  Rate
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
              <dt className="flex items-center text-sm font-medium text-gray-500">
                <Award className="mr-2 h-5 w-5 text-gray-400" />
                Qualifications
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {selectedDoctor.qualifications?.join(", ") || "Not specified"}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
              <dt className="flex items-center text-sm font-medium text-gray-500">
                <Calendar className="mr-2 h-5 w-5 text-gray-400" />
                Experience
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {selectedDoctor.experience} {selectedDoctor.experience === 1 ? "year" : "years"}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
              <dt className="flex items-center text-sm font-medium text-gray-500">
                <Globe className="mr-2 h-5 w-5 text-gray-400" />
                Languages
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {selectedDoctor.languages?.join(", ") || "Not specified"}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
              <dt className="flex items-center text-sm font-medium text-gray-500">
                <DollarSign className="mr-2 h-5 w-5 text-gray-400" />
                Consultation Fee
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                ${selectedDoctor.consultationFee.toFixed(2)}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
              <dt className="flex items-center text-sm font-medium text-gray-500">
                <MessageSquare className="mr-2 h-5 w-5 text-gray-400" />
                Bio
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {selectedDoctor.bio || "No bio provided"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Availability Schedule */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Availability Schedule</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-6">
            {selectedDoctor.availability?.map((daySchedule) => (
              <div key={daySchedule.day} className="border rounded-md p-4">
                <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-indigo-500" />
                  {formatDayOfWeek(daySchedule.day)}
                </h4>
                {daySchedule.slots.length > 0 ? (
                  <ul className="space-y-1">
                    {daySchedule.slots.map((slot, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {slot.startTime} - {slot.endTime}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">Not available</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ratings and Reviews */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Ratings & Reviews</h3>
        </div>
        <div className="border-t border-gray-200">
          {selectedDoctor.ratings && selectedDoctor.ratings.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {selectedDoctor.ratings.map((rating: Rating, index: number) => (
                <li key={index} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400" />
                      <span className="ml-1 text-sm font-medium text-gray-900">{rating.rating.toFixed(1)}</span>
                      <span className="ml-2 text-sm text-yellow-500">{formatRatingAsStars(rating.rating)}</span>
                    </div>
                    <span className="text-sm text-gray-500">{formatDate(rating.date)}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{rating.review}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-5 text-center text-sm text-gray-500 sm:px-6">No ratings yet</div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Doctor"
        message="Are you sure you want to delete this doctor? This action cannot be undone and will remove all associated data including appointments and ratings."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
        type="danger"
      />

      {/* Rating Dialog */}
      <ConfirmDialog
        isOpen={isRatingDialogOpen}
        title="Rate Doctor"
        confirmText="Submit"
        cancelText="Cancel"
        onConfirm={handleSubmitRating}
        onCancel={() => setIsRatingDialogOpen(false)}
        type="primary"
        customContent={
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
                Rating
              </label>
              <div className="mt-1 flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingValue(star)}
                    className={`rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      ratingValue >= star ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    <Star className="h-6 w-6" />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="review" className="block text-sm font-medium text-gray-700">
                Review
              </label>
              <div className="mt-1">
                <textarea
                  id="review"
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Share your experience with this doctor"
                />
              </div>
            </div>
          </div>
        }
      />
    </div>
  )
}

export default DoctorDetailsPage
