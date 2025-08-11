import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const TEMP_DIR = path.resolve(__dirname, '../../', process.env.APP_TEMP_DIR || 'downloads'); // DIREKTORI TEMP FILE
const MAX_AGE_MINUTES = 10; // SET MENJADI 10 MENIT

export const startCleanTempJob = () => {
  cron.schedule('*/5 * * * *', () => {
    logger.info('[CRON] Menjalankan pembersihan file temp...');
    fs.readdir(TEMP_DIR, (err, files) => {
      if (err) return logger.error(`[CRON] Gagal membaca folder temp: ${err.message}`);

      const now = Date.now();

      files.forEach((file) => {
        const filePath = path.join(TEMP_DIR, file);
        fs.stat(filePath, (err, stats) => {
          if (err) return logger.error(`[CRON] Gagal membaca file: ${file} - ${err.message}`);

          const fileAgeMinutes = (now - stats.mtimeMs) / 60000;
          if (fileAgeMinutes > MAX_AGE_MINUTES) {
            fs.unlink(filePath, (err) => {
              if (err) {
                logger.error(`[CRON] Gagal menghapus file: ${filePath} - ${err.message}`);
              } else {
                logger.info(`[CRON] File dihapus: ${filePath}`);
              }
            });
          }
        });
      });
    });
  });
};
