/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs"
import path from "path"
import { format } from "date-fns"
import { formatCurrency, calculateTax, calculateTotalWithTax } from "./paymentUtils"
import { uploadToCloudinary } from "../../../services/cloudinaryService"
import { logger } from "../../../utils/logger"

/**
 * Generate an invoice for a payment
 */
export const generateInvoice = async (payment: any, outputFormat = "pdf"): Promise<string> => {
  try {
    // Extract payment details
    const { _id, invoiceNumber, patient, appointment, amount, currency, status, paymentMethod, createdAt } = payment

    // Get patient and doctor details
    const patientName = patient.user?.names || "Patient"
    const patientEmail = patient.user?.email || ""
    const doctorName = appointment.doctor.user?.names || "Doctor"
    const appointmentDate = format(new Date(appointment.date), "MMMM dd, yyyy")
    const appointmentTime = `${appointment.startTime} - ${appointment.endTime}`
    const appointmentType = appointment.type

    // Calculate tax and total
    const taxRate = 0.18 // 18% VAT
    const taxAmount = calculateTax(amount, taxRate)
    const totalAmount = calculateTotalWithTax(amount, taxRate)

    // Format currency values
    const formattedAmount = formatCurrency(amount, currency)
    const formattedTax = formatCurrency(taxAmount, currency)
    const formattedTotal = formatCurrency(totalAmount, currency)

    // Generate invoice content based on format
    let invoiceContent: string | Buffer
    let contentType: string
    let fileExtension: string

    if (outputFormat === "json") {
      // JSON format
      invoiceContent = JSON.stringify(
        {
          invoiceNumber,
          paymentId: _id,
          date: format(new Date(createdAt), "MMMM dd, yyyy"),
          patient: {
            name: patientName,
            email: patientEmail,
          },
          doctor: {
            name: doctorName,
          },
          appointment: {
            date: appointmentDate,
            time: appointmentTime,
            type: appointmentType,
          },
          payment: {
            amount: formattedAmount,
            tax: formattedTax,
            total: formattedTotal,
            method: paymentMethod,
            status,
          },
        },
        null,
        2,
      )
      contentType = "application/json"
      fileExtension = "json"
    } else {
      // Default to HTML format (which can be converted to PDF)
      invoiceContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice #${invoiceNumber}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    .invoice-header {
      text-align: center;
      margin-bottom: 30px;
    }
    .invoice-header h1 {
      color: #2a5caa;
      margin-bottom: 5px;
    }
    .invoice-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .invoice-info-block {
      max-width: 45%;
    }
    .invoice-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    .invoice-table th, .invoice-table td {
      padding: 10px;
      border-bottom: 1px solid #ddd;
      text-align: left;
    }
    .invoice-table th {
      background-color: #f5f5f5;
    }
    .invoice-total {
      text-align: right;
    }
    .invoice-total table {
      width: 300px;
      margin-left: auto;
    }
    .invoice-total table td {
      padding: 5px;
    }
    .invoice-total table tr.total td {
      font-weight: bold;
      border-top: 2px solid #333;
    }
    .invoice-footer {
      margin-top: 50px;
      text-align: center;
      font-size: 12px;
      color: #777;
    }
    .payment-status {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 3px;
      font-weight: bold;
      text-transform: uppercase;
      font-size: 12px;
    }
    .status-completed {
      background-color: #d4edda;
      color: #155724;
    }
    .status-pending {
      background-color: #fff3cd;
      color: #856404;
    }
    .status-failed {
      background-color: #f8d7da;
      color: #721c24;
    }
    .status-refunded {
      background-color: #d1ecf1;
      color: #0c5460;
    }
  </style>
</head>
<body>
  <div class="invoice-header">
    <h1>DentRW Clinic</h1>
    <p>KG 123 St, Kigali, Rwanda</p>
    <p>Tel: +250 788 123 456 | Email: info@dentrw.com</p>
    <h2>INVOICE #${invoiceNumber}</h2>
  </div>
  
  <div class="invoice-info">
    <div class="invoice-info-block">
      <h3>Bill To:</h3>
      <p><strong>${patientName}</strong><br>
      Email: ${patientEmail}</p>
    </div>
    <div class="invoice-info-block">
      <h3>Invoice Details:</h3>
      <p>
        <strong>Date:</strong> ${format(new Date(createdAt), "MMMM dd, yyyy")}<br>
        <strong>Payment Method:</strong> ${paymentMethod}<br>
        <strong>Status:</strong> <span class="payment-status status-${status.toLowerCase()}">${status}</span>
      </p>
    </div>
  </div>
  
  <table class="invoice-table">
    <thead>
      <tr>
        <th>Description</th>
        <th>Date</th>
        <th>Doctor</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${appointmentType} Appointment</td>
        <td>${appointmentDate} at ${appointmentTime}</td>
        <td>${doctorName}</td>
        <td>${formattedAmount}</td>
      </tr>
    </tbody>
  </table>
  
  <div class="invoice-total">
    <table>
      <tr>
        <td>Subtotal:</td>
        <td>${formattedAmount}</td>
      </tr>
      <tr>
        <td>VAT (18%):</td>
        <td>${formattedTax}</td>
      </tr>
      <tr class="total">
        <td>Total:</td>
        <td>${formattedTotal}</td>
      </tr>
    </table>
  </div>
  
  <div class="invoice-footer">
    <p>Thank you for choosing DentRW Clinic for your dental care needs.</p>
    <p>This invoice was generated automatically and is valid without a signature.</p>
  </div>
</body>
</html>
      `
      contentType = "text/html"
      fileExtension = "html"

      // For PDF, we would convert HTML to PDF here
      // This would typically use a library like puppeteer or html-pdf
      // For simplicity, we're just returning HTML in this example
      if (outputFormat === "pdf") {
        // In a real implementation, convert HTML to PDF here
        fileExtension = "pdf"
        contentType = "application/pdf"
        // For now, we'll just use HTML
      }
    }

    // Create temporary file
    const tempDir = path.join(__dirname, "../../../temp")
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    const fileName = `invoice_${invoiceNumber}.${fileExtension}`
    const filePath = path.join(tempDir, fileName)

    fs.writeFileSync(filePath, invoiceContent)

    // Upload to Cloudinary
    const uploadPath = `invoices/${format(new Date(), "yyyy/MM")}`
    const uploadResult = await uploadToCloudinary(filePath, uploadPath, "raw")

    // Clean up temporary file
    fs.unlinkSync(filePath)

    logger.info(`Invoice generated and uploaded to Cloudinary: ${uploadResult.publicId}`)

    return uploadResult.url
  } catch (error) {
    logger.error("Error generating invoice:", error)
    throw new Error("Failed to generate invoice")
  }
}

/**
 * Generate a receipt for a payment
 */
export const generateReceipt = async (payment: any, outputFormat = "pdf"): Promise<string> => {
  try {
    // Extract payment details
    const { _id, invoiceNumber, patient, appointment, amount, currency, paymentMethod, transactionId, createdAt } =
      payment

    // Get patient and doctor details
    const patientName = patient.user?.names || "Patient"
    const doctorName = appointment.doctor.user?.names || "Doctor"
    const appointmentDate = format(new Date(appointment.date), "MMMM dd, yyyy")
    const appointmentType = appointment.type

    // Format currency values
    const formattedAmount = formatCurrency(amount, currency)
    const receiptDate = format(new Date(createdAt), "MMMM dd, yyyy HH:mm:ss")

    // Generate receipt content based on format
    let receiptContent: string | Buffer
    let contentType: string
    let fileExtension: string

    if (outputFormat === "json") {
      // JSON format
      receiptContent = JSON.stringify(
        {
          receiptNumber: `REC-${invoiceNumber}`,
          paymentId: _id,
          transactionId,
          date: receiptDate,
          patient: {
            name: patientName,
          },
          doctor: {
            name: doctorName,
          },
          appointment: {
            date: appointmentDate,
            type: appointmentType,
          },
          payment: {
            amount: formattedAmount,
            method: paymentMethod,
          },
        },
        null,
        2,
      )
      contentType = "application/json"
      fileExtension = "json"
    } else {
      // Default to HTML format (which can be converted to PDF)
      receiptContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt #REC-${invoiceNumber}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    .receipt {
      max-width: 400px;
      margin: 0 auto;
      border: 1px solid #ddd;
      padding: 20px;
    }
    .receipt-header {
      text-align: center;
      margin-bottom: 20px;
    }
    .receipt-header h1 {
      color: #2a5caa;
      margin-bottom: 5px;
      font-size: 24px;
    }
    .receipt-header h2 {
      font-size: 18px;
      margin-top: 5px;
    }
    .receipt-details {
      margin-bottom: 20px;
    }
    .receipt-details p {
      margin: 5px 0;
    }
    .receipt-amount {
      font-size: 24px;
      text-align: center;
      margin: 20px 0;
      font-weight: bold;
    }
    .receipt-footer {
      margin-top: 30px;
      text-align: center;
      font-size: 12px;
      color: #777;
    }
    .divider {
      border-top: 1px dashed #ddd;
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="receipt-header">
      <h1>DentRW Clinic</h1>
      <p>KG 123 St, Kigali, Rwanda</p>
      <h2>PAYMENT RECEIPT</h2>
      <p>#REC-${invoiceNumber}</p>
    </div>
    
    <div class="divider"></div>
    
    <div class="receipt-details">
      <p><strong>Date:</strong> ${receiptDate}</p>
      <p><strong>Patient:</strong> ${patientName}</p>
      <p><strong>Service:</strong> ${appointmentType} Appointment</p>
      <p><strong>Doctor:</strong> ${doctorName}</p>
      <p><strong>Payment Method:</strong> ${paymentMethod}</p>
      ${transactionId ? `<p><strong>Transaction ID:</strong> ${transactionId}</p>` : ""}
    </div>
    
    <div class="divider"></div>
    
    <div class="receipt-amount">
      ${formattedAmount}
    </div>
    
    <div class="divider"></div>
    
    <div class="receipt-footer">
      <p>Thank you for your payment!</p>
      <p>This receipt was generated automatically and is valid without a signature.</p>
    </div>
  </div>
</body>
</html>
      `
      contentType = "text/html"
      fileExtension = "html"

      // For PDF, we would convert HTML to PDF here
      if (outputFormat === "pdf") {
        // In a real implementation, convert HTML to PDF here
        fileExtension = "pdf"
        contentType = "application/pdf"
        // For now, we'll just use HTML
      }
    }

    // Create temporary file
    const tempDir = path.join(__dirname, "../../../temp")
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    const fileName = `receipt_${invoiceNumber}.${fileExtension}`
    const filePath = path.join(tempDir, fileName)

    fs.writeFileSync(filePath, receiptContent)

    // Upload to Cloudinary
    const uploadPath = `receipts/${format(new Date(), "yyyy/MM")}`
    const uploadResult = await uploadToCloudinary(filePath, uploadPath, "raw")

    // Clean up temporary file
    fs.unlinkSync(filePath)

    logger.info(`Receipt generated and uploaded to Cloudinary: ${uploadResult.publicId}`)

    return uploadResult.url
  } catch (error) {
    logger.error("Error generating receipt:", error)
    throw new Error("Failed to generate receipt")
  }
}
