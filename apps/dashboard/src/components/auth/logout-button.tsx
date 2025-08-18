"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LogOut } from "lucide-react";
import { Loader } from "@/components/common/loader";
import { useAuthStore } from "@/store/auth-store";

interface LogoutButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
}

export function LogoutButton({
  variant = "ghost",
  size = "md",
  showIcon = true,
  showText = true,
  className = "hover:cursor-pointer",
}: LogoutButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const { logout, loading } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    setShowConfirm(false);
  };

  const buttonSizes = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
      <AlertDialogTrigger asChild>
        <motion.div>
          <Button
            variant={variant}
            className={`${buttonSizes[size]} ${className}`}
            disabled={loading}>
            {loading ? (
              <Loader size="sm" />
            ) : (
              <>
                {showIcon && <LogOut className="h-4 w-4" />}
                {showText && (
                  <span className={showIcon ? "ml-2" : ""}>
                    {loading ? "Logging out..." : "Logout"}
                  </span>
                )}
              </>
            )}
          </Button>
        </motion.div>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to log out? You will need to sign in again to
            access your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLogout}
            disabled={loading}
            className="bg-primary hover:bg-red-700">
            {loading ? (
              <>
                <Loader size="sm" className="mr-2 animate-spin" />
                Logging out...
              </>
            ) : (
              "Logout"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
