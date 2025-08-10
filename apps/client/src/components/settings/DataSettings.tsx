"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Progress } from "../ui/progress"
import { Badge } from "../ui/badge"
import {
  Database,
  Download,
  Upload,
  Trash2,
  HardDrive,
  FileText,
  ImageIcon,
  Calendar,
  Shield,
  RefreshCw,
  Archive,
} from "lucide-react"
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
} from "../ui/alert-dialog"
import { toast } from "sonner"

export const DataSettings = () => {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  // Mock storage data
  const storageData = [
    { type: "Profile Data", size: 0.5, color: "bg-blue-500", icon: FileText },
    { type: "Medical Records", size: 1.2, color: "bg-green-500", icon: FileText },
    { type: "Images & Documents", size: 2.8, color: "bg-purple-500", icon: ImageIcon },
    { type: "Appointment History", size: 0.3, color: "bg-orange-500", icon: Calendar },
    { type: "Cache & Temp Files", size: 0.7, color: "bg-gray-500", icon: Database },
  ]

  const totalUsed = storageData.reduce((sum, item) => sum + item.size, 0)
  const totalAvailable = 5.0

  const handleExportData = async () => {
    setIsExporting(true)
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false)
      toast.success("Data export completed! Check your downloads folder.")
    }, 3000)
  }

  const handleImportData = () => {
    setIsImporting(true)
    // Simulate import process
    setTimeout(() => {
      setIsImporting(false)
      toast.success("Data import completed successfully!")
    }, 2000)
  }

  const handleClearCache = () => {
    toast.success("Cache cleared successfully")
  }

  const handleDeleteAllData = () => {
    toast.error("All data deletion initiated. Please check your email for confirmation.")
  }

  return (
    <div className="space-y-6">
      {/* Storage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Usage
          </CardTitle>
          <CardDescription>Overview of your data storage usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{totalUsed.toFixed(1)} GB</span>
            <span className="text-sm text-muted-foreground">of {totalAvailable} GB used</span>
          </div>

          <Progress value={(totalUsed / totalAvailable) * 100} className="h-2" />

          <div className="space-y-3">
            {storageData.map((item, index) => {
              const Icon = item.icon
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{item.type}</span>
                  </div>
                  <span className="text-sm font-medium">{item.size} GB</span>
                </div>
              )
            })}
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" size="sm" onClick={handleClearCache}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cache
            </Button>
            <Button variant="outline" size="sm">
              <Archive className="h-4 w-4 mr-2" />
              Archive Old Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Your Data
          </CardTitle>
          <CardDescription>Download a copy of all your data from DentRw</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>What's included:</strong> Profile information, medical records, appointment history, uploaded
              documents, and treatment plans. Personal identifiers will be included for your records.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm">Data is encrypted during export</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Exported in standard JSON and PDF formats</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span className="text-sm">Export link expires after 7 days</span>
            </div>
          </div>

          <Button onClick={handleExportData} disabled={isExporting} className="w-full">
            {isExporting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Preparing Export...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export All Data
              </>
            )}
          </Button>

          {isExporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Preparing your data...</span>
                <span>60%</span>
              </div>
              <Progress value={60} className="h-1" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </CardTitle>
          <CardDescription>Import data from another healthcare provider or backup</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
            <p className="text-sm text-orange-800 dark:text-orange-200">
              <strong>Supported formats:</strong> JSON exports from DentRw, HL7 FHIR, and standard medical record
              formats. Large files may take time to process.
            </p>
          </div>

          <div className="space-y-3">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop your data file here, or click to browse
              </p>
              <Button variant="outline" size="sm">
                Choose File
              </Button>
            </div>
          </div>

          <Button onClick={handleImportData} disabled={isImporting} variant="outline" className="w-full bg-transparent">
            {isImporting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Importing Data...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Data Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Automatic Backups
          </CardTitle>
          <CardDescription>Your data is automatically backed up for security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Last Backup</span>
              <Badge variant="default">2 hours ago</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Backup Frequency</span>
              <span className="text-sm font-medium">Every 6 hours</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Backup Retention</span>
              <span className="text-sm font-medium">30 days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Backup Location</span>
              <span className="text-sm font-medium">Encrypted Cloud Storage</span>
            </div>
          </div>

          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Your data is securely backed up
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions that will permanently affect your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg space-y-3">
            <h3 className="font-medium text-red-800 dark:text-red-200">Delete All Data</h3>
            <p className="text-sm text-red-700 dark:text-red-300">
              This will permanently delete all your data including medical records, appointments, and personal
              information. This action cannot be undone.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All My Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete All Data</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete ALL your data from DentRw including:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Personal profile and account information</li>
                      <li>Complete medical and dental history</li>
                      <li>All appointment records and history</li>
                      <li>Treatment plans and progress notes</li>
                      <li>Uploaded documents, images, and files</li>
                      <li>Insurance information and billing records</li>
                    </ul>
                    <br />
                    <strong>This action is irreversible and cannot be undone.</strong>
                    <br />
                    <br />
                    Are you absolutely sure you want to proceed?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAllData} className="bg-red-600 hover:bg-red-700">
                    Yes, Delete Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
