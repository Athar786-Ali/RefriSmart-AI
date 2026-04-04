const { Client } = require('pg');
const { randomUUID } = require('crypto');

const client = new Client({
  connectionString: "postgresql://neondb_owner:npg_xR54TAZLEMGv@ep-spring-mode-a1a655k6-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
});

const videos = [
  "https://assets.mixkit.co/videos/preview/mixkit-technician-repairing-an-air-conditioner-4251-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-man-repairing-an-air-conditioner-43535-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-industrial-washing-machine-working-11105-large.mp4"
];

async function run() {
  await client.connect();
  for (let url of videos) {
    const id = randomUUID();
    await client.query(
      'INSERT INTO "Gallery" ("id", "imageUrl", "mediaType", "caption") VALUES ($1, $2, $3, $4)',
      [id, url, "video", "JustDial Video Showcase - On-site Professional Field Report"]
    );
    console.log("Inserted video");
  }
  await client.end();
}

run().catch(console.error);
