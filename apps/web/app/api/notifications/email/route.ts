import { sendEmail } from "~/lib/email/mailjet";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { guestName, roomUrl } = await req.json();
    console.log(`Sending notification email to ${guestName}`);

    const data = await sendEmail({ guestName, roomUrl });
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("/api/notifications/email hit, error", err);
    return NextResponse.json({}, { status: 500 });
  }
}
