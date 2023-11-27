// utils/nextJsApiHandler.js
import fs from 'fs';
import path from 'path';

// This will place the log file in the project root. Adjust as needed.
const logFilePath = path.resolve('server.log');

function logToFile(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${message}\n`;
    fs.appendFileSync(logFilePath, logMessage);
}

export default logToFile;
