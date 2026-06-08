import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type = 'booking', customer_email, customer_name, date, address, booking_id } = body;

    console.log('📧 Attempting to send email via Resend:', { type, customer_email, customer_name, date, address, booking_id, hasKey: !!process.env.RESEND_API_KEY });

    if (!process.env.RESEND_API_KEY) {
      console.log('📧 RESEND_API_KEY not set — email would have been sent');
      return Response.json({ success: true, note: 'RESEND_API_KEY not set — only logged' });
    }

    const to = customer_email || 'ascwindowcleaning@gmail.com';
    let subject = '';
    let html = '';

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const postJobLink = customer_email 
      ? `${siteUrl}/booking/post-job?email=${encodeURIComponent(customer_email)}${booking_id ? `&booking_id=${booking_id}` : ''}` 
      : '#';

    if (type === 'en_route') {
      subject = `Your ${process.env.NEXT_PUBLIC_COMPANY_NAME || "Ladderless"} technician is on the way to ${address || 'your job'}`;
      html = `
        <p>Hi ${customer_name || 'there'},</p>
        <p>Your technician has started driving to your window cleaning job.</p>
        <p><strong>Address:</strong> ${address || 'N/A'}</p>
        <p>They'll be there soon. If you have the app, you'll get live updates on each window.</p>
        <p style="font-size: 12px; color: #666;">
          Want text updates and more features? <a href="${siteUrl}">Download the app</a> or reply to this email to enable text notifications.
        </p>
      `;
    } else if (type === 'complete') {
      subject = `Your ${process.env.NEXT_PUBLIC_COMPANY_NAME || "Ladderless"} window cleaning is complete — please tip & review`;
      html = `
        <p>Hi ${customer_name || 'there'},</p>
        <p>Your Premium Exterior Window Cleaning with Free Screen Cleaning at ${address || 'your address'} is complete.</p>
        <p><a href="${postJobLink}" style="color: #0f766e; font-weight: 600;">Click here to add a tip, leave a review, and schedule your next cleaning (1 month / 6 months / 1 year options)</a></p>
        <p style="font-size: 12px; color: #666;">
          100% Satisfaction Guaranteed. No charges until you confirm.
        </p>
        <p style="font-size: 12px; color: #666;">
          Enable tons of features (live updates on every window, etc.) by downloading the app: <a href="${siteUrl}">Download now</a>
        </p>
      `;
    } else {
      // default booking confirmation (owner)
      subject = `New Booking: ${customer_name} on ${date}`;
      html = `
        <p>New booking received.</p>
        <p><strong>Customer:</strong> ${customer_name}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Address:</strong> ${address}</p>
        <p>Please see your admin calendar for details.</p>
      `;
    }

    const { data, error } = await resend.emails.send({
      from: 'Ladderless Windows <onboarding@resend.dev>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('📧 Resend send error:', error);
      return Response.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log('📧 Email send attempt completed for type:', type);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return Response.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
