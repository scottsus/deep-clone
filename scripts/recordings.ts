/**
 * cd scripts
 * tsx --env-file=.env recordings.ts
 */

const API_BASE_URL = "https://api.daily.co/v1";
const API_KEY = process.env.DAILY_API_KEY;

interface Recordings {
  total_count: number;
  data: any[];
}

async function getRecordings(): Promise<Recordings[]> {
  const res = await fetch(`${API_BASE_URL}/recordings`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
  });

  if (!res.ok) {
    throw new Error(`non-2xx http status: ${res.status}`);
  }

  const json = await res.json();
  const limit = -5;
  return { ...json, data: json.data.slice(limit) };
}

interface Recording {
  download_link: string;
  expires: number;
  s3_bucket: string;
  s3_region: string;
  s3_key: string;
}

async function getRecording({
  recordingId,
}: {
  recordingId: string;
}): Promise<Recording> {
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

  const recording: Recording = await res.json();
  return recording;
}

function main() {
  const args = process.argv.slice(2);
  const recordingId = args.length >= 1 ? args[0] : "";

  if (!recordingId) {
    getRecordings().then((recs) => console.log(JSON.stringify(recs, null, 2)));
    return;
  }
  getRecording({ recordingId }).then((rec) =>
    console.log(`Link: ${rec.download_link}`),
  );
}

main();
