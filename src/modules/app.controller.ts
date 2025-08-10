import { inject, injectable } from "tsyringe";
import { AppService } from "./app.service";
import { Request, Response } from "express";

@injectable()
export class AppController {
  constructor(@inject("AppService") private appService: AppService) {}

  async download(req: Request, res: Response) {
    try {
      const { url } = req.body;

      if(!url) throw new Error("URL is required");

      const validUrl = await this.appService.isValidUrl(url);
      if(!validUrl) throw new Error("Invalid Tiktok URL!");

      const result = await this.appService.downloadVideo(url);

      res.download(result)

    } catch (err: any) {
      res.status(500).json({ message: err.message || "Internal Server Error" });
    }

  }
}