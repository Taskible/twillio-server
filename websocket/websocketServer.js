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
import dotenv from 'dotenv';

// Initializes and starts the WebSocket server
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initializes and starts the WebSocket server
function initializeWebSocketServer() {
    const server = https.createServer();
    const wss = new WebSocketServer({ server });


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

                    // Start the 5-second timer when media stream starts
                    setTimeout(() => {
                        console.log("5 seconds passed, processing audio data");
                        processAudioData(__dirname + "/my-twilio-media-stream-output.wav");
                        ws.send(JSON.stringify({ event: 'modeSwitched', data: 'Your custom data here' }));
                        ws.close(); // Close the connection after processing
                    }, 5000); // 5000 milliseconds = 5 seconds

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


async function processAudioData(savedFilePath) {
    try {
        const transcriptionResponse = await sendToTranscriptionServer(savedFilePath);
        console.log('Transcription Response:', transcriptionResponse);

        // Parse the JSON response string into an object
        const transcriptionResponseObj = JSON.parse(transcriptionResponse);
        const transcribedText = transcriptionResponseObj.text;
        console.log('Transcribed Text:', transcribedText);

        const sendClickTime = new Date().getTime();

        // Call Next.js API with the transcribed text
        const chatGPTResponse = await callNextJSChatGPT(transcribedText, sendClickTime);
        console.log('ChatGPT Response:', chatGPTResponse);
    } catch (error) {
        console.error('Error in processing audio data:', error);
    }
}


// Sends the audio file to the transcription server
async function sendToTranscriptionServer(filePath) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('temperature', '0.2');
    formData.append('response-format', 'json');
    console.log('Sending data to transcription server...' + filePath);
    logToFile('Sending data to transcription server...' + filePath);
    dotenv.config();
    try {
        const response = await axios.post(process.env.WHISPER_SERVER_ADDRESS, formData, {
            headers: formData.getHeaders(),
        });
        return JSON.stringify(response.data); // Return the response as a string
    } catch (error) {
        console.error('Error sending data to transcription server:', error);
        logToFile('Error sending data to transcription server: ' + error.message);
        return `Error: ${error.message}`; // Return error message as a string
    }
}


async function callNextJSChatGPT(inputString, sendClickTime) {
    try {
        const response = await axios.post('http://192.168.0.133:3232/api/chatGPT', {
            input: inputString,
            sendClickTime: sendClickTime
        });

        console.log('Response from Next.js API:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error calling Next.js API:', error);
    }
}

export default initializeWebSocketServer;
