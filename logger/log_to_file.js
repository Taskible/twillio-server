import fs from 'fs';
import path from 'path';

const logFilePath = path.resolve('server.log');

function logToFile(message) {
    console.log(message);
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${message}\n`;

    if (fs.existsSync(logFilePath)) {
        const dateHeader = `--- Log for ${new Date().toLocaleDateString()} ---\n`;
        fs.appendFileSync(logFilePath, dateHeader + logMessage);
    } else {
        fs.appendFileSync(logFilePath, logMessage);
    }
}

export default logToFile;
