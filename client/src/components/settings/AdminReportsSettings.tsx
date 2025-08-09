/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Download, Calendar, FileText, TrendingUp } from "lucide-react"

export const AdminReportsSettings = () => {
  const [reportSettings, setReportSettings] = useState({
    autoGenerate: true,
    frequency: "weekly",
    emailReports: true,
    recipients: ["admin@dentrw.com"],
    includePatientData: true,
    includeFinancialData: true,
    includeSystemMetrics: true,
    dataRetention: "365",
    exportFormat: "pdf",
  })

  const [availableReports] = useState([
    {
      id: "patient-summary",
      name: "Patient Summary Report",
      description: "Overview of patient registrations and demographics",
      lastGenerated: "2024-01-15",
      status: "active",
    },
    {
      id: "appointment-analytics",
      name: "Appointment Analytics",
      description: "Appointment booking trends and statistics",
      lastGenerated: "2024-01-15",
      status: "active",
    },
    {
      id: "financial-summary",
      name: "Financial Summary",
      description: "Revenue, payments, and billing analytics",
      lastGenerated: "2024-01-14",
      status: "active",
    },
    {
      id: "system-performance",
      name: "System Performance",
      description: "System usage and performance metrics",
      lastGenerated: "2024-01-15",
      status: "active",
    },
    {
      id: "user-activity",
      name: "User Activity Report",
      description: "User login patterns and system usage",
      lastGenerated: "2024-01-13",
      status: "inactive",
    },
  ])

  const handleSettingChange = (key: string, value: any) => {
    setReportSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleRecipientAdd = (email: string) => {
    if (email && !reportSettings.recipients.includes(email)) {
      setReportSettings((prev) => ({
        ...prev,
        recipients: [...prev.recipients, email],
      }))
    }
  }

  const handleRecipientRemove = (email: string) => {
    setReportSettings((prev) => ({
      ...prev,
      recipients: prev.recipients.filter((r) => r !== email),
    }))
  }

  const generateReport = (reportId: string) => {
    console.log(`Generating report: ${reportId}`)
  }

  return (
    <div className="space-y-6">
      {/* Report Generation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Report Generation Settings
          </CardTitle>
          <CardDescription>Configure automatic report generation and distribution</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-generate Reports</Label>
                <p className="text-sm text-muted-foreground">Automatically generate reports on schedule</p>
              </div>
              <Switch
                checked={reportSettings.autoGenerate}
                onCheckedChange={(checked) => handleSettingChange("autoGenerate", checked)}
              />
            </div>

            {reportSettings.autoGenerate && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Generation Frequency</Label>
                  <Select
                    value={reportSettings.frequency}
                    onValueChange={(value) => handleSettingChange("frequency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Reports</Label>
                    <p className="text-sm text-muted-foreground">Send generated reports via email</p>
                  </div>
                  <Switch
                    checked={reportSettings.emailReports}
                    onCheckedChange={(checked) => handleSettingChange("emailReports", checked)}
                  />
                </div>

                {reportSettings.emailReports && (
                  <div className="space-y-2">
                    <Label>Email Recipients</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {reportSettings.recipients.map((email) => (
                        <Badge key={email} variant="secondary" className="gap-1">
                          {email}
                          <button
                            onClick={() => handleRecipientRemove(email)}
                            className="ml-1 text-xs hover:text-red-600"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter email address"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleRecipientAdd((e.target as HTMLInputElement).value)
                            ;(e.target as HTMLInputElement).value = ""
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          const input = document.querySelector(
                            'input[placeholder="Enter email address"]',
                          ) as HTMLInputElement
                          if (input) {
                            handleRecipientAdd(input.value)
                            input.value = ""
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Report Content Settings</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Include Patient Data</Label>
                  <p className="text-sm text-muted-foreground">Include patient statistics and demographics</p>
                </div>
                <Switch
                  checked={reportSettings.includePatientData}
                  onCheckedChange={(checked) => handleSettingChange("includePatientData", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Include Financial Data</Label>
                  <p className="text-sm text-muted-foreground">Include revenue and billing information</p>
                </div>
                <Switch
                  checked={reportSettings.includeFinancialData}
                  onCheckedChange={(checked) => handleSettingChange("includeFinancialData", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Include System Metrics</Label>
                  <p className="text-sm text-muted-foreground">Include system performance and usage data</p>
                </div>
                <Switch
                  checked={reportSettings.includeSystemMetrics}
                  onCheckedChange={(checked) => handleSettingChange("includeSystemMetrics", checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataRetention">Data Retention (days)</Label>
              <Input
                id="dataRetention"
                type="number"
                value={reportSettings.dataRetention}
                onChange={(e) => handleSettingChange("dataRetention", e.target.value)}
                min="30"
                max="2555"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exportFormat">Export Format</Label>
              <Select
                value={reportSettings.exportFormat}
                onValueChange={(value) => handleSettingChange("exportFormat", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Available Reports
          </CardTitle>
          <CardDescription>Manage and generate individual reports</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {availableReports.map((report) => (
            <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">{report.name}</div>
                  <div className="text-sm text-muted-foreground">{report.description}</div>
                  <div className="text-xs text-muted-foreground">Last generated: {report.lastGenerated}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={report.status === "active" ? "default" : "secondary"}>{report.status}</Badge>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => generateReport(report.id)}>
                    <Download className="h-4 w-4 mr-1" />
                    Generate
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Save Report Settings</Button>
      </div>
    </div>
  )
}
