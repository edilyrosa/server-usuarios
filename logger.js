// logger.js
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Guarda logs en archivo
    new winston.transports.File({ filename: "logs-seguridad.log" }),
    // También muestra logs en consola (opcional)
    new winston.transports.Console()
  ],
});

export default logger;
