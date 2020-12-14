require('dotenv').config();
const express = require('express');
const axios = require('axios').default;

const app = express();
const PORT = process.env.PORT || 3001;

const cachedData = {};

app.use(express.json());

app.all('/*', (req, res) => {
    const { originalUrl, method, body } = req;

    const recipient = originalUrl.split('/')[1];
    const recipientUrl = process.env[recipient];
    const requestUrl = `${recipientUrl}${originalUrl}`;

    if (recipientUrl) {
        const isCachedUrl =
            method === 'GET' && originalUrl.endsWith(process.env.cached_url);

        const config = {
            method,
            url: requestUrl,
            ...(Object.keys(req.body || {}).length > 0 && { data: body }),
        };

        if (
            isCachedUrl &&
            cachedData[requestUrl] &&
            cachedData[requestUrl].expiredAt > Date.now()
        ) {
            res.json(cachedData[requestUrl].value);
            return;
        }

        axios(config)
            .then((resp) => {
                if (isCachedUrl) {
                    cachedData[requestUrl] = {
                        value: resp.data,
                        expiredAt: Date.now() + 2 * 60 * 1000, // wait for 2 minutes,
                    };
                }

                res.json(resp.data);
            })
            .catch((err) => {
                console.error('⚠️ Error', err);

                if (err.response) {
                    const { status, data } = err.response;

                    res.status(status).json(data);
                } else {
                    res.status(500).json({ error: err.message });
                }
            });
    } else {
        res.status(502).json({ error: '⚠️ Cannot process the request' });
    }
});

app.listen(PORT);
