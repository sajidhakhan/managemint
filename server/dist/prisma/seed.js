"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mongodb_1 = require("mongodb");
const prisma = new client_1.PrismaClient();
// Function to convert IDs to ObjectId strings
function convertIds(data) {
    const newData = {};
    for (const [key, value] of Object.entries(data)) {
        if (key === 'id' || key.endsWith('Id')) {
            newData[key] = new mongodb_1.ObjectId().toString();
        }
        else if (Array.isArray(value)) {
            newData[key] = value.map(convertIds);
        }
        else if (typeof value === 'object' && value !== null) {
            newData[key] = convertIds(value);
        }
        else {
            newData[key] = value;
        }
    }
    return newData;
}
function deleteAllData(orderedFileNames) {
    return __awaiter(this, void 0, void 0, function* () {
        const modelNames = orderedFileNames.map((fileName) => {
            const modelName = path_1.default.basename(fileName, path_1.default.extname(fileName));
            return modelName.charAt(0).toUpperCase() + modelName.slice(1);
        });
        for (const modelName of modelNames.reverse()) {
            const model = prisma[modelName];
            try {
                yield model.deleteMany({});
                console.log(`Cleared data from ${modelName}`);
            }
            catch (error) {
                console.error(`Error clearing data from ${modelName}:`, error);
            }
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const dataDirectory = path_1.default.join(__dirname, "seedData");
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
        yield deleteAllData(orderedFileNames);
        const idMaps = {};
        for (const fileName of orderedFileNames) {
            const filePath = path_1.default.join(dataDirectory, fileName);
            const jsonData = JSON.parse(fs_1.default.readFileSync(filePath, "utf-8"));
            const modelName = path_1.default.basename(fileName, path_1.default.extname(fileName));
            const model = prisma[modelName];
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
                    yield model.create({ data: convertedData });
                }
                console.log(`Seeded ${modelName} with data from ${fileName}`);
            }
            catch (error) {
                console.error(`Error seeding data for ${modelName}:`, error);
            }
        }
    });
}
main()
    .catch((e) => console.error(e))
    .finally(() => __awaiter(void 0, void 0, void 0, function* () { return yield prisma.$disconnect(); }));
