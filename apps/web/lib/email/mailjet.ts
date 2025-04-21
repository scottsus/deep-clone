import { Client } from "node-mailjet";

const apiKey = process.env.MAILJET_API_KEY;
const apiSecret = process.env.MAILJET_API_SECRET;
if (!apiKey || !apiSecret) {
  throw new Error("missing MAILJET_API_KEY or MAILJET_API_SECRET");
}

const mailjet = new Client({ apiKey, apiSecret });

export async function sendEmail({
  guestName,
  roomUrl,
}: {
  guestName: string;
  roomUrl: string;
}) {
  const roomId = roomUrl.split("/").pop();

  const result = await mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: "susantoscott@gmail.com",
          Name: "Scott Susanto",
        },
        To: [
          {
            Email: "scottsus@usc.edu",
            Name: "Scott Susanto",
          },
        ],
        Subject: `🎙️ ${guestName} just tried out Deep Clone!`,
        HTMLPart: `${guestName} just tried out Deep Clone. See <a>https://dashboard.daily.co/recordings</a> with Room [${roomId}]`,
      },
    ],
  });

  return result.body;
}
