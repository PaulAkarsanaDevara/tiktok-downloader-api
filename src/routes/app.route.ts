/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Router } from "express";
import { container } from '../containers/container';
import { AppController } from "../modules/app.controller";
import { AppService } from "../modules/app.service";

const appController = container.resolve(AppController);
const appService = container.resolve(AppService);

const router = Router();

router.get('/preview', (req, res) =>  {
   appService.videoRateLimiter,
   appController.preview(req, res)
});
router.post("/download", 
    (req, res) =>   {
      appService.videoRateLimiter,
      appController.download(req, res)
    });

export default router;


