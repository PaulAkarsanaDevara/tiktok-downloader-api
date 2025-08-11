import app from "./app";
import logger from "./utils/logger";
import { startCleanTempJob } from "./jobs/cleanTempFiles";

const PORT = process.env.APP_PORT as string;

const startServer = async () => {
  app.listen(PORT, () => { 
    logger.info(`Server running on port ${PORT}`)
    startCleanTempJob();
  });
};

startServer();