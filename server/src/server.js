import http from "node:http";
import { app } from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

// An explicit http.Server (instead of app.listen) so Socket.io can attach to it in the messaging module.
const server = http.createServer(app);

connectDB()
  .then(() => server.listen(env.port, () => console.log(`API ready on http://localhost:${env.port}/api`)))
  .catch((err) => {
    console.error("Failed to start:", err.message);
    process.exit(1);
  });

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
