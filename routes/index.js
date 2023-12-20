// routes/index.js
import dotenv from 'dotenv';
import express from 'express';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse.js';
import logToFile from '../logger/log_to_file.js';
import authenticateWithApiKey from "../utils/authenticateWithApiKey.js";

dotenv.config();

const router = express.Router();

router.post('/incoming_call', (req, res) => {
    logToFile('Received an incoming call from: ' + req.body.From);

    const twiml = new VoiceResponse();
    twiml.say('Hello, thank you for calling Utah Junk Movers. We are utilizing an AI chatbot to help us schedule the calls. ');
    twiml.play({
            loop: 1
        },
        "https://www.soundjay.com/buttons/beep-07a.wav"
    );


    const websocketServer = process.env.WEBSOCKET_ADDRESS
    const apiKey = process.env.API_KEY
    console.log("type of websocket: " + typeof websocketServer);
    // Authenticate before setting up the WebSocket connection
    authenticateWithApiKey(websocketServer, apiKey, (error) => {
        if (error) {
            console.error('Error authenticating:', error.message);
            logToFile('Error authenticating: ' + error.message);
            res.type('text/xml');
            res.status(401).send('Authentication failed'); // Or another appropriate response
            return;
        }

        try {
            console.log('Starting stream');
            logToFile('Starting stream');

            console.log("websocket address: " + websocketServer);
            const connect = twiml.connect();
            connect.stream({
                url: websocketServer,
            });
            twiml.pause({length: 20});

            res.type('text/xml');
            res.send(twiml.toString());
        } catch (error) {
            console.error('Error starting stream:', error);
            logToFile('Error starting stream: ' + error);
            res.type('text/xml');
            res.status(500).send('Error starting stream');
        }
    });
});

export default router;