import { env } from "./env";
import { getModuleLogger } from "./logging";
import fs from "fs";
import path from "path";
import { v4 as uuidV4 } from "uuid";

const fileModuleLogger = getModuleLogger(__filename);

const localUploadDir = env.projectPath("_uploads");

fileModuleLogger.info(`Upload directory set to ${localUploadDir}`);

if (!fs.existsSync(localUploadDir)) {
  fileModuleLogger.info(
    `Upload directory ${localUploadDir} not found yet. Creating new.`
  );
  fs.mkdirSync(localUploadDir);
}

export async function multerFileToStaticUrl(
  multerFile?: Express.Multer.File
): Promise<string | undefined> {
  if (!multerFile) {
    return undefined;
  }
  const fileName = uuidV4() + path.extname(multerFile.originalname);
  const filePath = path.join(localUploadDir, fileName);
  const fileWriteStream = fs.createWriteStream(filePath);
  if (multerFile.stream) {
    multerFile.stream.pipe(fileWriteStream);
  } else {
    fileWriteStream.write(multerFile.buffer);
  }
  return env.resolveAPIPath(`_uploads/${fileName}`);
}

export async function multipleMulterFilesToStaticUrls(
  multerFiles: Express.Multer.File[]
): Promise<string[]> {
  const files = await Promise.all(multerFiles.map(multerFileToStaticUrl));
  return files as string[];
}

export function multerFileHaveMatchingMimeType(
  multerFile: Express.Multer.File,
  mimeTypePattern: string
) {
  return multerFile.mimetype.match(mimeTypePattern);
}
