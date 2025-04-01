import nodemailer from "nodemailer";
import { Visit } from "../models/visitModel.js";
import { Property } from "../models/propertyModel.js";

// Book a visit
export const bookVisit = async (req, res) => {
  try {
    const { propertyId, name, email, phone, date, message } = req.body;

    // Validate input
    if (!propertyId || !name || !email || !phone || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    // Save to database
    const visit = new Visit({
      property: propertyId,
      visitorName: name,
      visitorEmail: email,
      visitorPhone: phone,
      visitDate: new Date(date),
      message,
      status: "pending",
    });
    await visit.save();

    // Get property and host details
    const property = await Property.findById(propertyId).populate("host");
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Send email to host
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      service: process.env.SMTP_SERVICE,
      port: parseInt(process.env.SMTP_PORT), // Ensure port is a number
      secure: process.env.SMTP_PORT === "465", // Only set true if using port 465
      auth: {
        user: process.env.SMTP_MAIL, // This should match your Gmail address
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: property.host.email,
      subject: `New Visit Request for ${property.title}`,
      html: `
        <h2>New Visit Request</h2>
        <p><strong>Property:</strong> ${property.title}</p>
        <p><strong>Visitor Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Preferred Date:</strong> ${new Date(
          date
        ).toLocaleDateString()}</p>
        <p><strong>Message:</strong> ${message || "No additional message"}</p>
        <p>Please contact the visitor to confirm the visit schedule.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: "Visit request submitted successfully" });
  } catch (error) {
    console.error("Error booking visit:", error);
    res
      .status(500)
      .json({ message: "Failed to book visit", error: error.message });
  }
};

// Update visit status and send confirmation
const statusTemplates = {
  confirmed: (visit, property, host) => ({
    subject: `✅ Visit Confirmed: ${property.title}`,
    html: `
        <h2>Your Visit Has Been Confirmed</h2>
        <p>Dear ${visit.visitorName},</p>
        <p>Your visit to <strong>${
          property.title
        }</strong> has been confirmed by the host.</p>
        
        <h3>Visit Details</h3>
        <p><strong>Date:</strong> ${visit.visitDate.toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${visit.visitDate.toLocaleTimeString()}</p>
        <p><strong>Address:</strong> ${property.address.street}, ${
      property.address.city
    }</p>
        
        <h3>Host Contact</h3>
        <p><strong>Name:</strong> ${host.name}</p>
        <p><strong>Phone:</strong> ${host.phone}</p>
        <p><strong>Email:</strong> ${host.email}</p>
      `,
  }),
  cancelled: (visit, property, host, notes) => ({
    subject: `❌ Visit Cancelled: ${property.title}`,
    html: `
        <h2>Visit Cancellation Notice</h2>
        <p>Dear ${visit.visitorName},</p>
        <p>Your visit to <strong>${
          property.title
        }</strong> has been cancelled.</p>
        
        ${notes ? `<p><strong>Reason:</strong> ${notes}</p>` : ""}
        
        <p>If you'd like to reschedule, please contact the host directly:</p>
        <p><strong>Host:</strong> ${host.name}</p>
        <p><strong>Phone:</strong> ${host.phone}</p>
        <p><strong>Email:</strong> ${host.email}</p>
      `,
  }),
  completed: (visit, property) => ({
    subject: `🏡 Visit Completed: ${property.title}`,
    html: `
        <h2>Visit Marked as Completed</h2>
        <p>Dear ${visit.visitorName},</p>
        <p>Your visit to <strong>${property.title}</strong> has been marked as completed by the host.</p>
        
        <p>We hope you found the property suitable. If you have any feedback, please reply to this email.</p>
      `,
  }),
};

async function sendStatusEmail(visit, status, notes = "") {
  try {
    const property = await Property.findById(visit.property).populate("host");
    const host = property.host;

    const template = statusTemplates[status](visit, property, host, notes);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      service: process.env.SMTP_SERVICE,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `Property Visits <${process.env.SMTP_MAIL}>`,
      to: visit.visitorEmail,
      subject: template.subject,
      html: template.html,
    });
  } catch (error) {
    console.error("Error sending status email:", error);
    throw error; // Rethrow to be caught by the calling function
  }
}
export const updateVisitStatus = async (req, res) => {
  try {
    const { visitId } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.id;

    const validTransitions = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["completed", "cancelled"],
      cancelled: ["confirmed"],
      completed: [],
    };

    const visit = await Visit.findById(visitId).populate("property");
    if (!visit) {
      return res.status(404).json({
        error: "Visit not found",
        message: "The requested visit does not exist",
      });
    }

    // Authorization check
    const property = await Property.findById(visit.property._id);
    if (property.host.toString() !== userId) {
      return res.status(403).json({
        error: "Unauthorized",
        message: "Only the property host can update visit status",
      });
    }

    // Validate status transition
    if (!validTransitions[visit.status].includes(status)) {
      return res.status(400).json({
        error: "Invalid status transition",
        message: `Cannot change from ${visit.status} to ${status}`,
      });
    }

    // Update visit
    visit.status = status;
    visit.statusHistory.push({
      status,
      changedBy: userId,
      notes,
      changedAt: new Date(),
    });

    await visit.save();

    // Send email notification if status is confirmed, cancelled, or completed
    if (["confirmed", "cancelled", "completed"].includes(status)) {
      try {
        await sendStatusEmail(visit, status, notes);
      } catch (emailError) {
        console.error("Failed to send status email:", emailError);
        // Don't fail the whole request if email fails
        // You might want to log this to a monitoring system
      }
    }

    res.status(200).json({
      success: true,
      data: visit,
    });
  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({
      error: "Failed to update status",
      message: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Get visits for host's properties
export const getHostVisits = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all properties owned by this host
    const properties = await Property.find({ host: userId });
    const propertyIds = properties.map((p) => p._id);

    // Find visits for these properties
    const visits = await Visit.find({ property: { $in: propertyIds } })
      .populate("property")
      .sort({ visitDate: 1 });

    res.json(visits);
  } catch (error) {
    console.error("Error fetching host visits:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch visits", error: error.message });
  }
};
