import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from "nodemailer";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, itinerary, moodProfile } = req.body;

  if (!email || !itinerary) {
    return res.status(400).json({ error: "Missing email or itinerary data" });
  }

  try {
    const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

    if (!hasSmtpConfig) {
      return res.json({ success: true, message: "Mock email sent (SMTP not configured)" });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || `"EchoVibe Studio" <noreply@echovibe.studio>`,
      to: email,
      subject: `Il tuo preventivo EchoVibe: ${itinerary.destination}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h1 style="color: #000; text-transform: uppercase;">EchoVibe Studio</h1>
          <p>Ciao,</p>
          <p>Ecco il preventivo dettagliato basato sul tuo profilo emotivo: <strong>${moodProfile.primaryMood}</strong>.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <h2 style="color: #333;">${itinerary.title} - ${itinerary.destination}</h2>
          <p>${itinerary.description}</p>
          <h3>Dettagli:</h3>
          <ul>
            <li><strong>Volo:</strong> ${itinerary.flightDetails}</li>
            <li><strong>Alloggio:</strong> ${itinerary.accommodationDetails}</li>
            <li><strong>Vitto:</strong> ${itinerary.foodDetails}</li>
          </ul>
          <p style="font-size: 20px; font-weight: bold;">Costo: ${itinerary.estimatedCost}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return res.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
