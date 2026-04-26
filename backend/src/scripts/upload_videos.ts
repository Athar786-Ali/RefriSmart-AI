// import { PrismaClient } from "../generated/client/client.js";
// import { randomUUID } from "crypto";
// // import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

// const videos = [
//   "https://assets.mixkit.co/videos/preview/mixkit-technician-repairing-an-air-conditioner-4251-large.mp4",
//   "https://assets.mixkit.co/videos/preview/mixkit-man-repairing-an-air-conditioner-43535-large.mp4",
//   "https://assets.mixkit.co/videos/preview/mixkit-industrial-washing-machine-working-11105-large.mp4"
// ];

// async function main() {
//   for (let i = 0; i < videos.length; i++) {
//     const id = randomUUID();
//     await prisma.$executeRawUnsafe(
//       'INSERT INTO "Gallery" ("id", "imageUrl", "mediaType", "caption") VALUES ($1, $2, $3, $4)',
//       id, videos[i], "video", "On-site Field Report - Professional Service Showcase"
//     );
//     console.log(`Uploaded video ${i + 1}`);
//   }
// }

// main()
//   .then(() => process.exit(0))
//   .catch(e => {
//     console.error(e);
//     process.exit(1);
//   });
import { PrismaClient } from "../generated/client/client.js";
import { randomUUID } from "node:crypto";

const prisma = new PrismaClient();

const videos = [
  "https://assets.mixkit.co/videos/preview/mixkit-technician-repairing-an-air-conditioner-4251-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-man-repairing-an-air-conditioner-43535-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-industrial-washing-machine-working-11105-large.mp4"
];

async function main() {
  for (let i = 0; i < videos.length; i++) {
    const id = randomUUID();
    await prisma.$executeRawUnsafe(
      'INSERT INTO "Gallery" ("id", "imageUrl", "mediaType", "caption") VALUES ($1, $2, $3, $4)',
      id, videos[i], "video", "On-site Field Report - Professional Service Showcase"
    );
    console.log(`Uploaded video ${i + 1}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });