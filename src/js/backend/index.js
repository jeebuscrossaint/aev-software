// Packages
// import path from "path";

// Config
import config from "./src/config.js";
// console.log(config); process.exit(0);

// Custom classes
import AEVBackend from "./src/backend.js";
import Logger from "./src/logger.js";

// Initialize the backend
const logger = new Logger();
const backend = new AEVBackend(config, logger);

// Start the backend
backend.start();
