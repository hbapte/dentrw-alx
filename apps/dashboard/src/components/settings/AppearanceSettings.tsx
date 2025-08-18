"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Switch } from "../ui/switch"
import { Slider } from "../ui/slider"
import { Badge } from "../ui/badge"
import { Palette, Monitor, Sun, Moon, Type, Layout, Eye } from "lucide-react"
import { toast } from "sonner"

export const AppearanceSettings = () => {
  const [theme, setTheme] = useState("system")
  const [fontSize, setFontSize] = useState(16)
  const [compactMode, setCompactMode] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [colorScheme, setColorScheme] = useState("blue")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const colorSchemes = [
    { id: "blue", name: "Ocean Blue", color: "bg-blue-500" },
    { id: "green", name: "Forest Green", color: "bg-green-500" },
    { id: "purple", name: "Royal Purple", color: "bg-purple-500" },
    { id: "orange", name: "Sunset Orange", color: "bg-orange-500" },
    { id: "pink", name: "Cherry Pink", color: "bg-pink-500" },
    { id: "teal", name: "Mint Teal", color: "bg-teal-500" },
  ]

  const handleSaveSettings = () => {
    // Implement save logic here
    toast.success("Appearance settings saved successfully")
  }

  const handleResetToDefaults = () => {
    setTheme("system")
    setFontSize(16)
    setCompactMode(false)
    setHighContrast(false)
    setReducedMotion(false)
    setColorScheme("blue")
    setSidebarCollapsed(false)
    toast.success("Settings reset to defaults")
  }

  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme & Colors
          </CardTitle>
          <CardDescription>Customize the visual appearance of DentRw</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Mode */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Theme Mode</p>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                onClick={() => setTheme("light")}
                className="flex items-center gap-2"
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                onClick={() => setTheme("dark")}
                className="flex items-center gap-2"
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                onClick={() => setTheme("system")}
                className="flex items-center gap-2"
              >
                <Monitor className="h-4 w-4" />
                System
              </Button>
            </div>
          </div>

          {/* Color Scheme */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Color Scheme</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {colorSchemes.map((scheme) => (
                <Button
                  key={scheme.id}
                  variant={colorScheme === scheme.id ? "default" : "outline"}
                  onClick={() => setColorScheme(scheme.id)}
                  className="flex items-center gap-2 justify-start"
                >
                  <div className={`w-4 h-4 rounded-full ${scheme.color}`} />
                  {scheme.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography & Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Typography & Layout
          </CardTitle>
          <CardDescription>Adjust text size and layout preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Font Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Font Size</p>
              <Badge variant="outline">{fontSize}px</Badge>
            </div>
            <Slider
              value={[fontSize]}
              onValueChange={(value) => setFontSize(value[0])}
              max={24}
              min={12}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Small (12px)</span>
              <span>Default (16px)</span>
              <span>Large (24px)</span>
            </div>
          </div>

          {/* Layout Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Compact Mode</p>
                <p className="text-sm text-muted-foreground">Reduce spacing for more content on screen</p>
              </div>
              <Switch checked={compactMode} onCheckedChange={setCompactMode} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Collapsed Sidebar</p>
                <p className="text-sm text-muted-foreground">Keep sidebar collapsed by default</p>
              </div>
              <Switch checked={sidebarCollapsed} onCheckedChange={setSidebarCollapsed} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Accessibility
          </CardTitle>
          <CardDescription>Settings to improve accessibility and usability</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">High Contrast</p>
              <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
            </div>
            <Switch checked={highContrast} onCheckedChange={setHighContrast} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Reduced Motion</p>
              <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
            </div>
            <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} />
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Preview
          </CardTitle>
          <CardDescription>See how your settings will look</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-lg space-y-3" style={{ fontSize: `${fontSize}px` }}>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${colorSchemes.find((s) => s.id === colorScheme)?.color}`} />
              <h3 className="font-semibold">DentRw Appointment</h3>
            </div>
            <p className="text-muted-foreground">
              Your dental checkup is scheduled for tomorrow at 2:00 PM with Dr. Smith.
            </p>
            <div className="flex gap-2">
              <Button size="sm">Confirm</Button>
              <Button variant="outline" size="sm">
                Reschedule
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleResetToDefaults}>
          Reset to Defaults
        </Button>
        <Button onClick={handleSaveSettings}>Save Appearance Settings</Button>
      </div>
    </div>
  )
}
