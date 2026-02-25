import express from "express";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for sending email
  app.post("/api/send-quote", async (req, res) => {
    const { email, itinerary, moodProfile } = req.body;

    if (!email || !itinerary) {
      return res.status(400).json({ error: "Missing email or itinerary data" });
    }

    try {
      // Configure transporter (using environment variables)
      // If no SMTP config is provided, we'll use a mock success for the demo
      // but the code is ready for real integration.
      const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

      if (!hasSmtpConfig) {
        console.log("SMTP not configured. Mocking email send to:", email);
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
            
            <h3>Dettagli del Viaggio:</h3>
            <ul>
              <li><strong>Volo:</strong> ${itinerary.flightDetails || "Incluso nel pacchetto standard"}</li>
              <li><strong>Alloggio:</strong> ${itinerary.accommodationDetails || "Soggiorno in struttura selezionata"}</li>
              <li><strong>Vitto:</strong> ${itinerary.foodDetails || "Trattamento in base alla destinazione"}</li>
            </ul>
            
            <h3>Highlights:</h3>
            <ul>
              ${itinerary.highlights.map((h: string) => `<li>${h}</li>`).join("")}
            </ul>
            
            <p style="font-size: 20px; font-weight: bold; color: #000;">Investimento Totale Stimato: ${itinerary.estimatedCost}</p>
            
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            
            <p style="font-size: 12px; color: #999;">Questo è un preventivo generato automaticamente da EchoVibe AI. I prezzi e la disponibilità possono variare.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true });
    } catch (error) {
      console.error("Email error:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
