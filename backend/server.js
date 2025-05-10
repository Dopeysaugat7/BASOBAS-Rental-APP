import { app } from "./app.js";
import { createServer } from "http";
import { initializeSocket } from "./socket.js";

//create a server and initialize socket
const server = createServer(app);
initializeSocket(server);

//health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

//start the server
server.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
});
