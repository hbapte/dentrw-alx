"use client"

import type React from "react"
import { useState } from "react"
import { Shield } from "lucide-react"

interface TwoFactorFormProps {
  onSubmit: (code: string) => Promise<void>
  onCancel: () => void
  loading: boolean
  error?: string
}

const TwoFactorForm: React.FC<TwoFactorFormProps> = ({ onSubmit, onCancel, loading, error }) => {
  const [code, setCode] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length === 6) {
      await onSubmit(code)
    }
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="rounded-md shadow-sm">
        <div className="flex justify-center mb-4">
          <Shield className="h-12 w-12 text-blue-600" />
        </div>
        <p className="text-center text-sm text-gray-600 mb-4">
          Please enter the 6-digit verification code from your authenticator app
        </p>
        <div>
          <label htmlFor="two-factor-code" className="sr-only">
            Verification Code
          </label>
          <input
            id="two-factor-code"
            name="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            autoComplete="one-time-code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-center text-2xl tracking-widest text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="000000"
            disabled={loading}
          />
        </div>
      </div>

      {error && <div className="text-sm text-red-600 text-center">{error}</div>}

      <div>
        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg
                className="mr-2 h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Verifying...
            </>
          ) : (
            "Verify"
          )}
        </button>
      </div>

      <div className="text-center">
        <button type="button" onClick={onCancel} className="text-sm text-blue-600 hover:text-blue-500">
          Back to login
        </button>
      </div>
    </form>
  )
}

export default TwoFactorForm
