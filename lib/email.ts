import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key_for_build")

// Use "Friendly Name <email>" format as required by Resend
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "noreply@eventlayoutplanner.com"
const FROM = `Event Layout Planner <${FROM_EMAIL}>`

interface ApprovedParams {
  vendorName: string
  vendorEmail: string
  boothName: string
  eventTitle: string
  eventDate: string // pre-formatted, e.g. "March 15, 2026"
  eventVenue: string | null
}

interface RejectedParams {
  vendorName: string
  vendorEmail: string
  boothName: string
  eventTitle: string
}

export async function sendBidApprovedEmail(params: ApprovedParams) {
  const { vendorName, vendorEmail, boothName, eventTitle, eventDate, eventVenue } = params

  const { error } = await resend.emails.send({
    from: FROM,
    to: vendorEmail,
    subject: `Your bid for "${boothName}" has been approved!`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#18181b">
        <h2 style="color:#16a34a;margin-bottom:8px">Bid Approved! 🎉</h2>
        <p>Hi <strong>${vendorName}</strong>,</p>
        <p>Great news — your bid for booth <strong>"${boothName}"</strong> at <strong>${eventTitle}</strong> has been approved.</p>
        <table style="background:#f4f4f5;border-radius:8px;padding:16px;margin:20px 0;width:100%;border-collapse:collapse">
          <tr><td style="padding:4px 0;color:#71717a;font-size:13px">Event</td><td style="padding:4px 0;font-weight:600">${eventTitle}</td></tr>
          <tr><td style="padding:4px 0;color:#71717a;font-size:13px">Booth</td><td style="padding:4px 0;font-weight:600">${boothName}</td></tr>
          <tr><td style="padding:4px 0;color:#71717a;font-size:13px">Date</td><td style="padding:4px 0">${eventDate}</td></tr>
          ${eventVenue ? `<tr><td style="padding:4px 0;color:#71717a;font-size:13px">Venue</td><td style="padding:4px 0">${eventVenue}</td></tr>` : ""}
        </table>
        <p style="color:#52525b">The event organizer will be in touch with you shortly to confirm the details and next steps.</p>
        <p style="color:#52525b">Congratulations and we look forward to seeing you at the event!</p>
        <hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0"/>
        <p style="font-size:12px;color:#a1a1aa">You received this email because you submitted a bid on an event layout planner.</p>
      </div>
    `,
  })

  if (error) {
    throw new Error(`Resend error (approval): ${error.message}`)
  }
}

export async function sendBidRejectedEmail(params: RejectedParams) {
  const { vendorName, vendorEmail, boothName, eventTitle } = params

  const { error } = await resend.emails.send({
    from: FROM,
    to: vendorEmail,
    subject: `Update on your bid for "${boothName}"`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#18181b">
        <h2 style="margin-bottom:8px">Bid Update</h2>
        <p>Hi <strong>${vendorName}</strong>,</p>
        <p>Thank you for your interest in booth <strong>"${boothName}"</strong> at <strong>${eventTitle}</strong>.</p>
        <p style="color:#52525b">Unfortunately, your bid was not selected for this booth. The organizer has chosen another vendor.</p>
        <p style="color:#52525b">We encourage you to keep an eye out for other available booths at upcoming events.</p>
        <hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0"/>
        <p style="font-size:12px;color:#a1a1aa">You received this email because you submitted a bid on an event layout planner.</p>
      </div>
    `,
  })

  if (error) {
    throw new Error(`Resend error (rejection): ${error.message}`)
  }
}
