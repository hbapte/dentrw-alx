import React from "react"
import { Link } from "react-router-dom"
import { ChevronRight, Home } from 'lucide-react'

interface Breadcrumb {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
  breadcrumbs?: Breadcrumb[]
   actions?: React.ReactNode
}

const PageHeader = ({ title, description, children, breadcrumbs, actions }: PageHeaderProps) => {
  return (
    <div className="mb-6">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-3 flex items-center text-sm text-gray-500">
          <Link to="/dashboard" className="flex items-center hover:text-blue-600">
            <Home size={14} className="mr-1" />
            Home
          </Link>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              <ChevronRight size={14} className="mx-2" />
              {crumb.href ? (
                <Link to={crumb.href} className="hover:text-blue-600">
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-medium text-gray-700">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
          {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        </div>
        {children && <div className="mt-4 sm:mt-0">{children}</div>}
      </div>

         {actions && <div className="flex-shrink-0 flex items-center gap-2">{actions}</div>}
    </div>
  )
}

export default PageHeader
