import dotenv from 'dotenv';
import express from 'express';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse.js';
import logToFile from '../logger/log_to_file.js';

dotenv.config();

const router = express.Router();

router.post('/incoming_call', (req, res) => {
    const phoneNumber = req.body.From;
    logToFile('Received an incoming call from: ' + phoneNumber);

    // Server API key check
    const serverApiKey = process.env.SERVER_API_KEY;
    print("server apikey: " + serverApiKey);
    if (!serverApiKey || serverApiKey !== req.body.apiKey) {
        return res.status(401).send('Invalid server API key');
    }

    const twiml = new VoiceResponse();
    twiml.play({
        loop: 1
    },
        "https://www.soundjay.com/buttons/beep-07a.wav"
    );

    // Determine WebSocket server address
    const websocketServer = req.body.websocketAddress || process.env.WEBSOCKET_ADDRESS;
    const websocketApiKey = process.env.WEBSOCKET_API_KEY;
    const websocketUrlWithApiKey = `${websocketServer}?API-KEY=${websocketApiKey}`;
    console.log("type of websocket: " + typeof websocketServer);
    logToFile("WebSocket Server URL: " + websocketServer);
    logToFile("Full WebSocket URL with API Key: " + websocketUrlWithApiKey);
    try {
        console.log('Starting stream');
        logToFile('Starting stream');

        console.log("websocket address: " + websocketServer);
        const connect = twiml.connect();
        const stream = connect.stream({
            url: websocketServer,
        });
        stream.parameter({
            name: 'api_key',
            value: websocketApiKey
        });
        stream.parameter({
            name: 'phone_number',
            value: phoneNumber
        });
        res.type('text/xml');
        res.send(twiml.toString());
    } catch (error) {
        console.error('Error starting stream:', error);
        logToFile('Error starting stream: ' + error);
        res.type('text/xml');
        res.status(500).send('Error starting stream');
    }
});

export default router;