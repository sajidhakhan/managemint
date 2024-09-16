import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { ObjectId } from "mongodb";

const prisma = new PrismaClient();

// Function to convert IDs to ObjectId strings
function convertIds(data: any): any {
  const newData: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (key === 'id' || key.endsWith('Id')) {
      newData[key] = new ObjectId().toString();
    } else if (Array.isArray(value)) {
      newData[key] = value.map(convertIds);
    } else if (typeof value === 'object' && value !== null) {
      newData[key] = convertIds(value);
    } else {
      newData[key] = value;
    }
  }
  return newData;
}

async function deleteAllData(orderedFileNames: string[]) {
  const modelNames = orderedFileNames.map((fileName) => {
    const modelName = path.basename(fileName, path.extname(fileName));
    return modelName.charAt(0).toUpperCase() + modelName.slice(1);
  });

  for (const modelName of modelNames.reverse()) {
    const model: any = prisma[modelName as keyof typeof prisma];
    try {
      await model.deleteMany({});
      console.log(`Cleared data from ${modelName}`);
    } catch (error) {
      console.error(`Error clearing data from ${modelName}:`, error);
    }
  }
}

async function main() {
  const dataDirectory = path.join(__dirname, "seedData");

  const orderedFileNames = [
    "team.json",
    "project.json",
    "projectTeam.json",
    "user.json",
    "task.json",
    "attachment.json",
    "comment.json",
    "taskAssignment.json",
  ];

  await deleteAllData(orderedFileNames);

  const idMaps: { [key: string]: { [key: string]: string } } = {};

  for (const fileName of orderedFileNames) {
    const filePath = path.join(dataDirectory, fileName);
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const modelName = path.basename(fileName, path.extname(fileName));
    const model: any = prisma[modelName as keyof typeof prisma];

    idMaps[modelName] = {};

    try {
      for (const data of jsonData) {
        const oldId = data.id;
        const convertedData = convertIds(data);

        // Store the mapping between old and new IDs
        idMaps[modelName][oldId] = convertedData.id;

        // Replace references to other models with the new ObjectId strings
        for (const key in convertedData) {
          if (key.endsWith('Id') && key !== 'id') {
            const referencedModel = key.slice(0, -2);
            if (idMaps[referencedModel] && idMaps[referencedModel][convertedData[key]]) {
              convertedData[key] = idMaps[referencedModel][convertedData[key]];
            }
          }
        }

        await model.create({ data: convertedData });
      }
      console.log(`Seeded ${modelName} with data from ${fileName}`);
    } catch (error) {
      console.error(`Error seeding data for ${modelName}:`, error);
    }
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
