/**
 * cd scripts
 * tsx --env-file=.env recordings.ts firstname lastname
 */

import { db } from "@repo/db";

const API_BASE_URL = "https://api.daily.co/v1";
const API_KEY = process.env.DAILY_API_KEY;

interface RecordingByAll {
  total_count: number;
  data: {
    id: string;
    room_name: string;
    start_ts: number;
    status: string;
    max_participants: number;
    duration: number;
    share_token: string;
    tracks: string[];
    s3key: string;
    mtgSessionId: string;
    isVttEnabled: boolean;
  }[];
}

async function getRecordings(): Promise<RecordingByAll> {
  const res = await fetch(`${API_BASE_URL}/recordings`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
  });

  if (!res.ok) {
    throw new Error(`non-2xx http status: ${res.status}`);
  }

  return await res.json();
}

interface RecordingById {
  download_link: string;
  expires: number;
  s3_bucket: string;
  s3_region: string;
  s3_key: string;
}

async function getRecordingById({
  recordingId,
}: {
  recordingId: string;
}): Promise<RecordingById> {
  const res = await fetch(
    `${API_BASE_URL}/recordings/${recordingId}/access-link`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
    },
  );

  if (!res.ok) {
    throw new Error(`non-2xx http status: ${res.status}`);
  }

  const recording: RecordingById = await res.json();
  return recording;
}

async function getRecordingByGuestName({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}): Promise<string[]> {
  // assume no 2 guests with same name for now
  const guest = await db.guest.findFirst({
    where: {
      firstName,
      lastName,
    },
  });
  if (!guest) {
    return ["No recording found"];
  }

  const rooms = await db.room.findMany({
    where: {
      guestId: guest.id,
    },
    select: {
      url: true,
    },
  });

  const roomNames = rooms
    .filter((r): r is { url: string } => r !== null)
    .map((r) => {
      const parts = r.url.split("/");
      const name = parts[parts.length - 1];
      return name;
    });
  const allRecordings = await getRecordings();
  const matchingRecordingIds = allRecordings.data.filter((rec) =>
    roomNames.includes(rec.room_name),
  );

  const downloadUrls = matchingRecordingIds.map(async (rec) => {
    const recordingDetails = await getRecordingById({ recordingId: rec.id });
    return recordingDetails.download_link;
  });

  return Promise.all(downloadUrls);
}

function pretty(obj: any) {
  console.log(JSON.stringify(obj, null, 2));
}

function main() {
  const args = process.argv.slice(2);
  if (args.length !== 0 && args.length !== 2) {
    console.error(`Usage:
  
  tsx --env-file=.env ./recordings.ts # OR
  tsx --env-file=.env ./recordings.ts firstName lastName

`);
  }

  if (args.length === 0) {
    getRecordings().then((recs) => pretty(recs));
    return;
  }

  const [firstName, lastName] = [args[0], args[1]];
  getRecordingByGuestName({ firstName, lastName }).then((recs) => pretty(recs));
}

main();
