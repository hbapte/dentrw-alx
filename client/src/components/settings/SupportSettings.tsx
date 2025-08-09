"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import {
  HelpCircle,
  MessageSquare,
  Phone,
  Mail,
  ExternalLink,
  Book,
  Video,
  FileText,
  Bug,
  Lightbulb,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"

export const SupportSettings = () => {
  const [supportTicket, setSupportTicket] = useState({
    subject: "",
    message: "",
    priority: "medium",
  })

  // Mock support data
  const supportChannels = [
    {
      type: "Phone",
      icon: Phone,
      contact: "+250 788 123 456",
      hours: "Mon-Fri: 8AM-6PM",
      description: "Call for urgent dental emergencies",
    },
    {
      type: "Email",
      icon: Mail,
      contact: "support@dentrw.com",
      hours: "Response within 24 hours",
      description: "General inquiries and support",
    },
    {
      type: "Live Chat",
      icon: MessageSquare,
      contact: "Available in app",
      hours: "Mon-Fri: 9AM-5PM",
      description: "Quick questions and assistance",
    },
  ]

  const faqItems = [
    {
      question: "How do I book an appointment?",
      answer: "You can book appointments through the app or by calling our clinic directly.",
      category: "Appointments",
    },
    {
      question: "What should I bring to my first visit?",
      answer: "Please bring your ID, insurance card, and any previous dental records.",
      category: "First Visit",
    },
    {
      question: "How do I update my insurance information?",
      answer: "Go to Profile > Patient Profile > Insurance tab to update your information.",
      category: "Insurance",
    },
    {
      question: "Can I reschedule my appointment?",
      answer: "Yes, you can reschedule up to 24 hours before your appointment time.",
      category: "Appointments",
    },
  ]

  const recentTickets = [
    {
      id: "T-001",
      subject: "Unable to upload documents",
      status: "resolved",
      created: "2 days ago",
      priority: "medium",
    },
    {
      id: "T-002",
      subject: "Appointment reminder not working",
      status: "in_progress",
      created: "1 week ago",
      priority: "low",
    },
  ]

  const handleSubmitTicket = () => {
    if (!supportTicket.subject || !supportTicket.message) {
      toast.error("Please fill in all required fields")
      return
    }

    toast.success("Support ticket submitted successfully!")
    setSupportTicket({ subject: "", message: "", priority: "medium" })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-orange-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-red-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "default"
      case "in_progress":
        return "secondary"
      default:
        return "destructive"
    }
  }

  return (
    <div className="space-y-6">
      {/* Contact Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Contact Support
          </CardTitle>
          <CardDescription>Get help from our DentRw support team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {supportChannels.map((channel, index) => {
              const Icon = channel.icon
              return (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">{channel.type}</h3>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{channel.contact}</p>
                    <p className="text-xs text-muted-foreground">{channel.hours}</p>
                    <p className="text-xs text-muted-foreground">{channel.description}</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Contact
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Submit Support Ticket */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Submit Support Ticket
          </CardTitle>
          <CardDescription>Describe your issue and we'll help you resolve it</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject *</label>
            <Input
              value={supportTicket.subject}
              onChange={(e) => setSupportTicket({ ...supportTicket, subject: e.target.value })}
              placeholder="Brief description of your issue"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <div className="flex gap-2">
              {["low", "medium", "high"].map((priority) => (
                <Button
                  key={priority}
                  variant={supportTicket.priority === priority ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSupportTicket({ ...supportTicket, priority })}
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Message *</label>
            <Textarea
              value={supportTicket.message}
              onChange={(e) => setSupportTicket({ ...supportTicket, message: e.target.value })}
              placeholder="Please describe your issue in detail..."
              className="min-h-[120px]"
            />
          </div>

          <Button onClick={handleSubmitTicket} className="w-full">
            Submit Ticket
          </Button>
        </CardContent>
      </Card>

      {/* Recent Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Your Support Tickets</CardTitle>
          <CardDescription>Track the status of your recent support requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(ticket.status)}
                  <div>
                    <p className="font-medium">{ticket.subject}</p>
                    <p className="text-sm text-muted-foreground">
                      {ticket.id} • Created {ticket.created}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(ticket.status) as any}>{ticket.status.replace("_", " ")}</Badge>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Find quick answers to common questions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                  <h3 className="font-medium">{item.question}</h3>
                </div>
                <p className="text-sm text-muted-foreground pl-2 border-l-2 border-muted">{item.answer}</p>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <Button variant="outline" className="w-full bg-transparent">
            <ExternalLink className="h-4 w-4 mr-2" />
            View All FAQs
          </Button>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Help Resources
          </CardTitle>
          <CardDescription>Additional resources to help you use DentRw</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Video Tutorials</h3>
              </div>
              <p className="text-sm text-muted-foreground">Step-by-step video guides for using DentRw</p>
              <Button variant="outline" size="sm">
                Watch Tutorials
              </Button>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Book className="h-5 w-5 text-primary" />
                <h3 className="font-medium">User Guide</h3>
              </div>
              <p className="text-sm text-muted-foreground">Comprehensive documentation and guides</p>
              <Button variant="outline" size="sm">
                Read Guide
              </Button>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Bug className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Report Bug</h3>
              </div>
              <p className="text-sm text-muted-foreground">Found a bug? Let us know so we can fix it</p>
              <Button variant="outline" size="sm">
                Report Issue
              </Button>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Feature Request</h3>
              </div>
              <p className="text-sm text-muted-foreground">Suggest new features or improvements</p>
              <Button variant="outline" size="sm">
                Suggest Feature
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Information */}
      <Card>
        <CardHeader>
          <CardTitle>App Information</CardTitle>
          <CardDescription>Current version and system information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">App Version</span>
              <span className="text-sm font-medium">2.1.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Last Updated</span>
              <span className="text-sm font-medium">December 15, 2024</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Build Number</span>
              <span className="text-sm font-medium">2024.12.001</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Environment</span>
              <Badge variant="default">Production</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
