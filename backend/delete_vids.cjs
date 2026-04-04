const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://neondb_owner:npg_xR54TAZLEMGv@ep-spring-mode-a1a655k6-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
});

async function run() {
  await client.connect();
  const res = await client.query(`DELETE FROM "Gallery" WHERE "imageUrl" LIKE '%mixkit%';`);
  console.log(`Deleted ${res.rowCount} broken videos.`);
  await client.end();
}

run().catch(console.error);
