import { resend } from "~/lib/email/resend";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { guestName } = await req.json();
    const data = { success: true };

    console.log(`Sent notification email to ${guestName}`);

    // const { data, error } = await resend.emails.send({
    //   from: "Acme <onboarding@resend.dev>",
    //   to: "Scott Susanto <scottsus@usc.edu>",
    //   subject: "Deep Clone: new user 🚀",
    //   text: `${guestName} just tried out Deep Clone!`,
    // });
    // if (error) {
    //   return NextResponse.json(error, { status: 400 });
    // }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("/api/notifications/email hit, error", err);
    return NextResponse.json({}, { status: 500 });
  }
}
