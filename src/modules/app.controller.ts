/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { inject, injectable } from "tsyringe";
import { AppService } from "./app.service";
import { Request, Response } from "express";
import { scheduleFileDelete } from "../utils/scheduleFileDelete";
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

      res.download(result, (err) => {
        scheduleFileDelete(result)
      })

    } catch (err: any) {
      res.status(500).json({ message: err.message || "Internal Server Error" });
    }

  }

  async preview(req: Request, res: Response) {
    try {
      const { url } = req.query;
      if (!url || typeof url !== "string") {
        return res.status(400).json({ error: "Missing 'url' query parameter" });
      }

      const result = await this.appService.previewVideo(url);
      res.json({status: "OK", data: result });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}