import express from "express";

const initServer = async ({ server, port, log }) => {
  const app = express();
  app.get("/", (req, res) => {
    res.send("🔥🔥🔥🔥The API is up and running!🔥🔥🔥🔥");
  });
  app.listen(port, () => {
    log.info(`🚀🚀🚀 App running on %s`, server);
  });
};

export default initServer;
