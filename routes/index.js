// routes/index.js
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse.js';
import logToFile from '../logger/log_to_file.js';

const router = express.Router();

router.post('/incoming_call', (req, res) => {
    logToFile('Received an incoming call from: ' + req.body.From);

    const twiml = new VoiceResponse();
    twiml.say('Hello your voice will be recorded. Hello, Izzy Mansurov.');
    const websocketServer = process.env.WEBSOCKET_ADDRESS
    console.log("type of websocket: " + typeof websocketServer);
    try {
        console.log('Starting stream');
        logToFile('Starting stream');

        console.log("websocket address: " + websocketServer)
        twiml.connect().stream({
            name: 'incomingCall',
            url: websocketServer,
        });
        twiml.pause({ length: 20 });
    } catch (error) {
        console.error('Error starting stream:', error);
        logToFile('Error starting stream: ' + error);
    }

    res.type('text/xml');
    res.send(twiml.toString());
});

export default router;