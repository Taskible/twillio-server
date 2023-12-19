import axios from 'axios';

const authenticateWithApiKey = (url, apiKey, callback) => {
    axios.post(url, {
        headers: {
            'API-KEY': apiKey
        }
    })
        .then(response => {
            if (response.status === 200) {
                callback(null);
            } else {
                callback(new Error(`Authentication failed with status code: ${response.status}`));
            }
        })
        .catch(error => {
            callback(error);
        });
};

export default authenticateWithApiKey;