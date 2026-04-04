const { Client } = require('pg');
const { randomUUID } = require('crypto');

const client = new Client({
  connectionString: "postgresql://neondb_owner:npg_xR54TAZLEMGv@ep-spring-mode-a1a655k6-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
});

const jdVideos = [
  "https://stream.jdmagicbox.com/hls/gallery-si764yd6jh-9999px641_x641_190522080859_e5v9-664f509c84f8e9d357f9517c343dd1ee.m3u8",
  "https://stream.jdmagicbox.com/hls/gallery-dv869ee231-9999px641_x641_190522080859_e5v9-47f85b0a79b681ae830827eb49f17dd7.m3u8",
  "https://stream.jdmagicbox.com/hls/gallery-b2qu8573bb-9999px641_x641_190522080859_e5v9-0473dde1e0325c469c83cec2a4bcf446.m3u8"
];

async function run() {
  await client.connect();
  for (let url of jdVideos) {
    const id = randomUUID();
    await client.query(
      'INSERT INTO "Gallery" ("id", "imageUrl", "mediaType", "caption") VALUES ($1, $2, $3, $4)',
      [id, url, "video", "JustDial Verified Field Video"]
    );
    console.log("Inserted JD video", url);
  }
  await client.end();
}

run().catch(console.error);
