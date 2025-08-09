"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Switch } from "../ui/switch"
import { Badge } from "../ui/badge"
import {
  Smartphone,
  Monitor,
  Tablet,
  Wifi,
  WifiOff,
  Battery,
  HardDrive,
  Trash2,
  RefreshCw,
  MapPin,
  Camera,
  Mic,
  Bell,
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

export const DeviceSettings = () => {
  const [syncEnabled, setSyncEnabled] = useState(true)
  const [offlineMode, setOfflineMode] = useState(false)
  const [locationPermission, setLocationPermission] = useState(true)
  const [cameraPermission, setCameraPermission] = useState(true)
  const [microphonePermission, setMicrophonePermission] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState(true)

  // Mock device data
  const connectedDevices = [
    {
      id: 1,
      name: "iPhone 13 Pro",
      type: "mobile",
      lastSync: "2 minutes ago",
      status: "online",
      storage: { used: 2.1, total: 5.0 },
      battery: 85,
    },
    {
      id: 2,
      name: "MacBook Pro",
      type: "desktop",
      lastSync: "1 hour ago",
      status: "online",
      storage: { used: 1.8, total: 5.0 },
      battery: null,
    },
    {
      id: 3,
      name: "iPad Air",
      type: "tablet",
      lastSync: "3 days ago",
      status: "offline",
      storage: { used: 0.9, total: 5.0 },
      battery: 45,
    },
  ]

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "mobile":
        return Smartphone
      case "tablet":
        return Tablet
      case "desktop":
        return Monitor
      default:
        return Monitor
    }
  }

  const handleRemoveDevice = (deviceId: number) => {
    toast.success("Device removed successfully")
  }

  const handleSyncDevice = (deviceId: number) => {
    toast.success("Syncing device...")
  }

  const handleClearCache = () => {
    toast.success("Cache cleared successfully")
  }

  return (
    <div className="space-y-6">
      {/* Connected Devices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Connected Devices
          </CardTitle>
          <CardDescription>Manage devices connected to your DentRw account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {connectedDevices.map((device) => {
              const DeviceIcon = getDeviceIcon(device.type)
              return (
                <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-lg">
                      <DeviceIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{device.name}</p>
                        <Badge variant={device.status === "online" ? "default" : "secondary"}>
                          {device.status === "online" ? (
                            <>
                              <Wifi className="h-3 w-3 mr-1" />
                              Online
                            </>
                          ) : (
                            <>
                              <WifiOff className="h-3 w-3 mr-1" />
                              Offline
                            </>
                          )}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Last sync: {device.lastSync}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <HardDrive className="h-3 w-3" />
                          {device.storage.used}GB / {device.storage.total}GB
                        </div>
                        {device.battery && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Battery className="h-3 w-3" />
                            {device.battery}%
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleSyncDevice(device.id)}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Device</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove "{device.name}" from your account. You'll need to sign in again on this
                            device.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemoveDevice(device.id)}>
                            Remove Device
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Sync & Storage
          </CardTitle>
          <CardDescription>Control how your data syncs across devices</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Auto Sync</p>
              <p className="text-sm text-muted-foreground">Automatically sync data across all devices</p>
            </div>
            <Switch checked={syncEnabled} onCheckedChange={setSyncEnabled} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Offline Mode</p>
              <p className="text-sm text-muted-foreground">Allow app to work without internet connection</p>
            </div>
            <Switch checked={offlineMode} onCheckedChange={setOfflineMode} />
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Storage Usage</p>
                <p className="text-sm text-muted-foreground">4.8 GB of 5 GB used</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleClearCache}>
                Clear Cache
              </Button>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: "96%" }} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            App Permissions
          </CardTitle>
          <CardDescription>Manage what the app can access on your device</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">For appointment reminders and clinic directions</p>
              </div>
            </div>
            <Switch checked={locationPermission} onCheckedChange={setLocationPermission} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Camera className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Camera</p>
                <p className="text-sm text-muted-foreground">To take photos for dental records</p>
              </div>
            </div>
            <Switch checked={cameraPermission} onCheckedChange={setCameraPermission} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mic className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Microphone</p>
                <p className="text-sm text-muted-foreground">For voice notes and telemedicine calls</p>
              </div>
            </div>
            <Switch checked={microphonePermission} onCheckedChange={setMicrophonePermission} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Notifications</p>
                <p className="text-sm text-muted-foreground">To send appointment reminders and updates</p>
              </div>
            </div>
            <Switch checked={notificationPermission} onCheckedChange={setNotificationPermission} />
          </div>
        </CardContent>
      </Card>

      {/* Device Info */}
      <Card>
        <CardHeader>
          <CardTitle>Current Device Information</CardTitle>
          <CardDescription>Information about this device</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Device Type</span>
              <span className="text-sm font-medium">Desktop</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Browser</span>
              <span className="text-sm font-medium">Chrome 120.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Operating System</span>
              <span className="text-sm font-medium">macOS 14.2</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Screen Resolution</span>
              <span className="text-sm font-medium">1920 × 1080</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Connection</span>
              <Badge variant="default">
                <Wifi className="h-3 w-3 mr-1" />
                Online
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
