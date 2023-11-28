// server.js
import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes/index.js';
import logToFile from './logger/log_to_file.js';
import initializeWebSocketServer from './websocket/websocketServer.js'; // Import WebSocket initialization

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', routes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    logToFile(`Server running on port ${PORT}`);
    console.log(`Server running on port ${PORT}`);
});

// Initialize WebSocket Server
initializeWebSocketServer();
