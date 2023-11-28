// routes/index.js
import express from 'express';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse.js';
import logToFile from '../logger/log_to_file.js';
import sendToWhisperServer from '../utils/sendToWhisperServer.js';
const router = express.Router();

router.post('/incoming_call', (req, res) => {
    logToFile('Received an incoming call.');

    const twiml = new VoiceResponse();
    twiml.say('Hello your voice will be recorded. Hello, Izzy Mansurov.');
    try {
        console.log('Starting stream');
        logToFile('Starting stream');
        twiml.start().stream({
            name: 'stream',
            url: process.env.WEBSOCKET_ADDRESS,
            throwOnError: true,
            wsClientOptions: {
                rejectUnauthorized: false
            }
        });
        twiml.pause({ length: 10 });
    } catch (error) {
        console.error('Error starting stream:', error);
        logToFile('Error starting stream: ' + error);
    }

    res.type('text/xml');
    res.send(twiml.toString());
});
router.post('/handle_recording', async (req, res) => {
    const recordingUrl = req.body.RecordingUrl;

    try {
        const inferenceData = await sendToWhisperServer(recordingUrl);

            const twiml = new VoiceResponse();
            if (inferenceData.text) {
                twiml.say("Thank you, successfully sent to Whisper");
            } else {
                twiml.say('There was an error processing your message.');
            }

        res.type('text/xml');
        res.send(twiml.toString());
    } catch (error) {
        console.error('Error handling recording:', error);
        
        const twiml = new VoiceResponse();
        twiml.say('An error occurred while processing your message.');
        res.type('text/xml');
        res.send(twiml.toString());
    }
});

export default router;