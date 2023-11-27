import { WebSocket, WebSocketServer } from "ws";
import fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';
import logToFile from '../logger/log_to_file.js';
import https from 'https';
import { execSync } from 'child_process';
import TwilioMediaStreamSaveAudioFile from 'twilio-media-stream-save-audio-file';
import path from "path";
import { fileURLToPath } from 'url';

// Initializes and starts the WebSocket server
function initializeWebSocketServer() {
    const server = https.createServer({
        cert: fs.readFileSync('/Users/ismatullamansurov/Developer/twillio-server/server.crt'),
        key: fs.readFileSync('/Users/ismatullamansurov/Developer/twillio-server/server.key'),
        passphrase: 'hello',
    });

    const wss = new WebSocketServer({ server });
    const __dirname = path.dirname(fileURLToPath(import.meta.url));

    wss.on('connection', (ws) => {
        console.log("New connection initiated!");

        const mediaStreamSaver = new TwilioMediaStreamSaveAudioFile({
            saveLocation: __dirname,
            saveFilename: "my-twilio-media-stream-output",
            onSaved: () => {
                console.log("File was saved!")
                processAudioData(__dirname + "/my-twilio-media-stream-output.wav");
            },
        });

        ws.on('message', (message) => {
            const msg = JSON.parse(message);
            switch (msg.event) {
                case 'connected':
                    console.log("A new call has connected");
                    break;
                case 'start':
                    console.log("Starting media stream...");
                    mediaStreamSaver.twilioStreamStart();
                    break;
                case 'media':
                    console.log("Receiving audio...");
                    mediaStreamSaver.twilioStreamMedia(msg.media.payload);
                    break;
                case 'stop':
                    console.log("Call has ended");
                    mediaStreamSaver.twilioStreamStop();
                    break;
                default:
                    break;
            }
        });

        // Set a timeout to perform an action after 10 seconds
        setTimeout(() => {
            // Action to perform after 10 seconds, e.g., close the connection
            console.log("5 seconds passed, closing connection");
            processAudioData(__dirname + "/my-twilio-media-stream-output.wav");
            ws.close();
        }, 5000); // 10000 milliseconds = 10 seconds
    });

    server.listen(443);
    console.log('WebSocket server is running on port 443');
    logToFile('WebSocket server is running on port 443');
}


function processAudioData(saved_file_path) {
    // Continue with your process
    sendToTranscriptionServer(saved_file_path);
}

// Sends the audio file to the transcription server
function sendToTranscriptionServer(filePath) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('temperature', '0.2');
    formData.append('response-format', 'json');
    console.log('Sending data to transcription server...' + filePath);
    logToFile('Sending data to transcription server...' + filePath);
    axios.post('http://127.0.0.1:8080/inference', formData, {
        headers: formData.getHeaders(),
    })
    .then((response) => {
        console.log('Transcription server response:', response.data);
        logToFile('Transcription server response: ' + JSON.stringify(response.data));
    })
    .catch((error) => {
        console.error('Error sending data to transcription server:', error);
        logToFile('Error sending data to transcription server: ' + error.message);
    });
}

export default initializeWebSocketServer;
