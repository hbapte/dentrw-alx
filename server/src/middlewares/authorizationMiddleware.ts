import type { Request, Response, NextFunction } from "express"
import { forbiddenResponse } from "../utils/responseHandler"

/**
 * Check if user has required permissions
 * @param permissions Array of permissions required
 */
export const hasPermission = (permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return forbiddenResponse(res, "User not authenticated")
    }

    // Check if user has required permissions
    // This is a placeholder - implement your permission logic here
    const userPermissions: string[] = [] // Get from user object or database

    const hasRequiredPermissions = permissions.every((permission) => userPermissions.includes(permission))

    if (!hasRequiredPermissions) {
      return forbiddenResponse(res, "You do not have permission to perform this action")
    }

    next()
  }
}

/**
 * Check if user is the owner of the resource
 * @param getResourceOwnerId Function to get the owner ID from the request
 */
export const isResourceOwner = (getResourceOwnerId: (req: Request) => string | Promise<string>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return forbiddenResponse(res, "User not authenticated")
    }

    try {
      const ownerId = await getResourceOwnerId(req)

      if (req.user._id.toString() !== ownerId) {
        return forbiddenResponse(res, "You do not have permission to access this resource")
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

/**
 * Check if user is an admin or the owner of the resource
 * @param getResourceOwnerId Function to get the owner ID from the request
 */
export const isAdminOrResourceOwner = (getResourceOwnerId: (req: Request) => string | Promise<string>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return forbiddenResponse(res, "User not authenticated")
    }

    // If user is admin, allow access
    if (req.user.role === "admin") {
      return next()
    }

    try {
      const ownerId = await getResourceOwnerId(req)

      if (req.user._id.toString() !== ownerId) {
        return forbiddenResponse(res, "You do not have permission to access this resource")
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

