import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, address, amount, screenshotUrl } = body;

    const smtpEmail = process.env.SMTP_EMAIL;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const organizerEmail = process.env.ORGANIZER_EMAIL;

    if (!smtpEmail || !smtpPassword || !organizerEmail) {
      console.warn("SMTP credentials missing, skipping email notification.");
      return NextResponse.json({ success: true, message: "Mock success (missing credentials)" });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpEmail,
        pass: smtpPassword,
      },
    });

    const mailOptions = {
      from: smtpEmail,
      to: organizerEmail,
      subject: `🚨 नवीन देणगी (New Donation): ${name} - ₹${amount}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #c25927; text-align: center;">नवीन देणगी प्राप्त झाली!</h2>
          <p style="text-align: center; color: #6b7280;">(New Donation Received)</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #4b5563;"><strong>देणगीदार (Name):</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; text-align: right;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #4b5563;"><strong>रक्कम (Amount):</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; text-align: right; font-weight: bold; color: #c25927;">₹${amount}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #4b5563;"><strong>मोबाईल (Mobile):</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; text-align: right;">${phone}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #4b5563;"><strong>पत्ता (Address):</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; text-align: right;">${address}</td>
            </tr>
          </table>

          <div style="margin-top: 30px; text-align: center;">
            <a href="${screenshotUrl}" style="background-color: #152f4e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              View Payment Screenshot
            </a>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Donation email sent successfully to", organizerEmail);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("API Route Error (Email):", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
