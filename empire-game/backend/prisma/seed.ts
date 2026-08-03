import { seedNpcVillages } from "../src/modules/world/service";
import { prisma } from "../src/lib/prisma";

async function main() {
  const created = await seedNpcVillages();
  console.log(`Dünya haritasına ${created} NPC köyü/kampı eklendi.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
