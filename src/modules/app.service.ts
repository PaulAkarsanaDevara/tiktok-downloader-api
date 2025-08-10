import { injectable } from "tsyringe";
import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import logger from "../utils/logger";
import axios from "axios";
import path from "path";
import fs from "fs";
import redis from "../config/redis";

@injectable()
export class AppService {
  async videoRateLimiter(): Promise<RateLimitRequestHandler> {
    return rateLimit({
        windowMs: 1 * 60 * 1000, // 1 menit
        max: 5, // max 5 request per IP per menit
        message: { message: "Terlalu banyak request, coba lagi nanti." },
        standardHeaders: true,
        legacyHeaders: false,
    })
  }

  async isValidUrl(url: string) : Promise<boolean> {
    try {
      const parseUrl = new URL(url);
      return parseUrl.hostname.includes("tiktok.com") ||
            parseUrl.hostname.includes("vm.tiktok.com");
    } catch {
      return false;
    }
  }

  async downloadVideo(url: string): Promise<string> {
      logger.info(`Downloading TikTok video from: ${url}`);

      // Cek cache Redis
      const cachedFileName = await redis.get(`tiktok:${url}`);
      if (cachedFileName) {
        const cachedFilePath = path.join(path.resolve(process.env.APP_TEMP_DIR || "./downloads"), cachedFileName);
        if (fs.existsSync(cachedFilePath)) {
          logger.info(`Cache hit: ${url}`);
          return cachedFilePath;
        } else {
          logger.warn(`Cache entry exists but file missing, removing Redis key`);
          await redis.del(`tiktok:${url}`);
        }
      } else {
          // Redis cache expired → cek file lokal
            const filePrefix = "tiktok_";
            const existingFile = fs
              .readdirSync(path.resolve(process.env.APP_TEMP_DIR || "./downloads"))
              .find(file => file.startsWith(filePrefix) && file.endsWith(".mp4"));

            if (existingFile) {
              const existingPath = path.join(path.resolve(process.env.APP_TEMP_DIR || "./downloads"), existingFile);
              logger.info(`Cache expired but file still exists: Restoring cache for ${url}`);
              await redis.set(`tiktok:${url}`, existingFile, "EX", 3600);
              return existingPath;
        }
      }

      const apiUrl = `${process.env.TIKTOK_API_URL}?url=${encodeURIComponent(url)}`;
      const { data } = await axios.get(apiUrl);

      if(data.code != 0) throw new Error("Failed to fetch TikTok video metadata");

      const filename = `tiktok_${Date.now()}.mp4`;

      const payload = {
        videoUrl: data.data.play,
        fileName: filename,
        filePath: path.join(path.resolve(process.env.APP_TEMP_DIR || "./downloads"), filename), 
      }

      const { videoUrl, fileName, filePath  } = payload;

      const videoStream = await axios.get(videoUrl, { responseType: "arraybuffer" });

      fs.writeFileSync(filePath, videoStream.data);
      
      logger.info(`Video saved to: ${filePath}`);

      await redis.set(`tiktok:${url}`, fileName, "EX", 3600);

      return filePath;
  }

}