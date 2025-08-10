import { injectable } from "tsyringe";
import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import logger from "../utils/logger";
import axios from "axios";
import path from "path";
import fs from "fs";

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

      const apiUrl = `${process.env.TIKTOK_API_URL}?url=${encodeURIComponent(url)}`;
      const { data } = await axios.get(apiUrl);

      if(data.code != 0) throw new Error("Failed to fetch TikTok video metadata");

      const filename = `tiktok_${Date.now()}.mp4`;

      const payload = {
        videoUrl: data.data.play,
        fileName: filename,
        filePath: path.join(path.resolve(process.env.APP_TEMP_DIR || "./downloads"), filename), 
      }

      const { videoUrl, filePath  } = payload;

      const videoStream = await axios.get(videoUrl, { responseType: "arraybuffer" });

      fs.writeFileSync(filePath, videoStream.data);
      
      logger.info(`Video saved to: ${filePath}`);

      return filePath;
  }

}