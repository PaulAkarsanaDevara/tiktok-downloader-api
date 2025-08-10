import app from "./app";

const PORT = process.env.APP_PORT as string;

const startServer = async () => {
  app.listen(PORT, () => { console.log(`Server running at http:localhost:${PORT}`) });
};

startServer();