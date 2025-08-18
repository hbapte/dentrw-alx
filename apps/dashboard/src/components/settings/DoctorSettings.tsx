"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Switch } from "../ui/switch"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Separator } from "../ui/separator"
import { Badge } from "../ui/badge"
import {
  Stethoscope,
  Calendar,
  Users,
  Bell,
  DollarSign,
  Shield,
  Activity,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import { toast } from "sonner"

export const DoctorSettings = () => {
  // Practice Management Settings
  const [autoConfirmAppointments, setAutoConfirmAppointments] = useState(false)
  const [allowOnlineBooking, setAllowOnlineBooking] = useState(true)
  const [requireDepositForBooking, setRequireDepositForBooking] = useState(false)
  const [emergencyAvailability, setEmergencyAvailability] = useState(false)
  const [telemedicineEnabled, setTelemedicineEnabled] = useState(false)

  // Notification Settings
  const [appointmentReminders, setAppointmentReminders] = useState(true)
  const [newPatientAlerts, setNewPatientAlerts] = useState(true)
  const [cancellationAlerts, setCancellationAlerts] = useState(true)
  const [workloadAlerts, setWorkloadAlerts] = useState(true)
  const [reviewNotifications, setReviewNotifications] = useState(true)

  // Communication Settings
  const [patientCommunication, setPatientCommunication] = useState("both")
  const [appointmentConfirmation, setAppointmentConfirmation] = useState("automatic")
  const [followUpReminders, setFollowUpReminders] = useState(true)

  // Scheduling Settings
  const [defaultAppointmentDuration, setDefaultAppointmentDuration] = useState(30)
  const [bufferTimeBetweenAppointments, setBufferTimeBetweenAppointments] = useState(15)
  const [maxDailyAppointments, setMaxDailyAppointments] = useState(20)
  const [bookingAdvanceLimit, setBookingAdvanceLimit] = useState(30)
  const [cancellationDeadline, setCancellationDeadline] = useState(24)

  // Financial Settings
  const [acceptInsurance, setAcceptInsurance] = useState(true)
  const [requirePaymentUpfront, setRequirePaymentUpfront] = useState(false)
  const [offerPaymentPlans, setOfferPaymentPlans] = useState(true)

  const handleSaveSettings = () => {
    toast.success("Doctor settings saved successfully")
  }

  return (
    <div className="space-y-6">
      {/* Practice Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Practice Management
          </CardTitle>
          <CardDescription>Configure how your dental practice operates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Auto-confirm Appointments</p>
              <p className="text-sm text-muted-foreground">Automatically confirm new appointment requests</p>
            </div>
            <Switch checked={autoConfirmAppointments} onCheckedChange={setAutoConfirmAppointments} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Allow Online Booking</p>
              <p className="text-sm text-muted-foreground">Let patients book appointments through the app</p>
            </div>
            <Switch checked={allowOnlineBooking} onCheckedChange={setAllowOnlineBooking} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Require Deposit for Booking</p>
              <p className="text-sm text-muted-foreground">Require patients to pay a deposit when booking</p>
            </div>
            <Switch checked={requireDepositForBooking} onCheckedChange={setRequireDepositForBooking} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Emergency Availability</p>
              <p className="text-sm text-muted-foreground">Available for emergency cases outside regular hours</p>
            </div>
            <Switch checked={emergencyAvailability} onCheckedChange={setEmergencyAvailability} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Telemedicine Consultations</p>
              <p className="text-sm text-muted-foreground">Offer virtual consultations for initial assessments</p>
            </div>
            <Switch checked={telemedicineEnabled} onCheckedChange={setTelemedicineEnabled} />
          </div>
        </CardContent>
      </Card>

      {/* Scheduling Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Scheduling Settings
          </CardTitle>
          <CardDescription>Configure appointment scheduling preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Default Appointment Duration (minutes)</p>
              <Select
                value={defaultAppointmentDuration.toString()}
                onValueChange={(value) => setDefaultAppointmentDuration(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Buffer Time Between Appointments (minutes)</p>
              <Select
                value={bufferTimeBetweenAppointments.toString()}
                onValueChange={(value) => setBufferTimeBetweenAppointments(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No buffer</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Maximum Daily Appointments</p>
              <Input
                type="number"
                value={maxDailyAppointments}
                onChange={(e) => setMaxDailyAppointments(Number(e.target.value))}
                min="1"
                max="50"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Booking Advance Limit (days)</p>
              <Input
                type="number"
                value={bookingAdvanceLimit}
                onChange={(e) => setBookingAdvanceLimit(Number(e.target.value))}
                min="1"
                max="365"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Cancellation Deadline (hours)</p>
              <Select
                value={cancellationDeadline.toString()}
                onValueChange={(value) => setCancellationDeadline(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 hours</SelectItem>
                  <SelectItem value="4">4 hours</SelectItem>
                  <SelectItem value="12">12 hours</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="48">48 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Communication Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Patient Communication
          </CardTitle>
          <CardDescription>Configure how you communicate with patients</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Preferred Communication Method</p>
            <Select value={patientCommunication} onValueChange={setPatientCommunication}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email Only</SelectItem>
                <SelectItem value="sms">SMS Only</SelectItem>
                <SelectItem value="both">Both Email & SMS</SelectItem>
                <SelectItem value="phone">Phone Calls</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium">Appointment Confirmation</p>
            <Select value={appointmentConfirmation} onValueChange={setAppointmentConfirmation}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="automatic">Automatic Confirmation</SelectItem>
                <SelectItem value="manual">Manual Review Required</SelectItem>
                <SelectItem value="conditional">Conditional (based on patient history)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Follow-up Reminders</p>
              <p className="text-sm text-muted-foreground">Send reminders for follow-up appointments</p>
            </div>
            <Switch checked={followUpReminders} onCheckedChange={setFollowUpReminders} />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Professional Notifications
          </CardTitle>
          <CardDescription>Control what notifications you receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Appointment Reminders</p>
                <p className="text-sm text-muted-foreground">Get notified about upcoming appointments</p>
              </div>
            </div>
            <Switch checked={appointmentReminders} onCheckedChange={setAppointmentReminders} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">New Patient Alerts</p>
                <p className="text-sm text-muted-foreground">Notifications when new patients register</p>
              </div>
            </div>
            <Switch checked={newPatientAlerts} onCheckedChange={setNewPatientAlerts} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Cancellation Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified when patients cancel appointments</p>
              </div>
            </div>
            <Switch checked={cancellationAlerts} onCheckedChange={setCancellationAlerts} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Workload Alerts</p>
                <p className="text-sm text-muted-foreground">Notifications when your schedule is getting full</p>
              </div>
            </div>
            <Switch checked={workloadAlerts} onCheckedChange={setWorkloadAlerts} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Patient Reviews</p>
                <p className="text-sm text-muted-foreground">Get notified about new patient reviews</p>
              </div>
            </div>
            <Switch checked={reviewNotifications} onCheckedChange={setReviewNotifications} />
          </div>
        </CardContent>
      </Card>

      {/* Financial Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Settings
          </CardTitle>
          <CardDescription>Configure payment and billing preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Accept Insurance</p>
              <p className="text-sm text-muted-foreground">Accept patients with dental insurance</p>
            </div>
            <Switch checked={acceptInsurance} onCheckedChange={setAcceptInsurance} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Require Payment Upfront</p>
              <p className="text-sm text-muted-foreground">Require full payment before treatment</p>
            </div>
            <Switch checked={requirePaymentUpfront} onCheckedChange={setRequirePaymentUpfront} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Offer Payment Plans</p>
              <p className="text-sm text-muted-foreground">Allow patients to pay in installments</p>
            </div>
            <Switch checked={offerPaymentPlans} onCheckedChange={setOfferPaymentPlans} />
          </div>
        </CardContent>
      </Card>

      {/* Professional Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Professional Status
          </CardTitle>
          <CardDescription>Your current professional standing and verification status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">License Status</span>
              <Badge variant="default">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Profile Verification</span>
              <Badge variant="default">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Rwanda Medical Council</span>
              <Badge variant="default">
                <CheckCircle className="h-3 w-3 mr-1" />
                Registered
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Practice Status</span>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Last Updated</span>
              <span className="text-sm font-medium">December 15, 2024</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Practice Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Practice Statistics
          </CardTitle>
          <CardDescription>Overview of your practice performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">156</div>
              <div className="text-sm text-muted-foreground">Total Patients</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">89</div>
              <div className="text-sm text-muted-foreground">This Month</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">4.8</div>
              <div className="text-sm text-muted-foreground">Avg Rating</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">98%</div>
              <div className="text-sm text-muted-foreground">Satisfaction</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Settings */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings}>Save Doctor Settings</Button>
      </div>
    </div>
  )
}
