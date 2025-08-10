import fs from "fs";
import logger from "./logger";

export const scheduleFileDelete = (filePath: string, delayMs = 10000) => {
  setTimeout(() => {
    fs.unlink(filePath, (err) => {
      if (err) {
        logger.error(`Failed to delete temp file: ${filePath}`);
      } else {
        logger.info(`Temp file deleted: ${filePath}`);
      }
    });
  }, delayMs);
};
