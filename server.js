const express = require('express');
const app = express();

const grok = require('grok-js').loadDefaultSync();
const fetch = require('node-fetch');

app.use(express.static('public'));
app.use(express.json());

app.post('/grok', (req, res) => {
    const {text, pattern} = req.body;
    const grokPattern = grok.createPattern(pattern);
    try {
        const obj = grokPattern.parseSync(text);
        res.json(obj);
    } catch (e) {
        res.status(500).send(e);
    }
})

app.post('/samples', async (req, res) => {
    const {type, token, region} = req.body;
    const query = {"bool": {"must": [{"match_phrase": {"type": {"query": `${type}`}}}]}};
    try {
        const samples = await fetch(`https://api.logz${region === 'us' ? '' : '-' + region}.io/v1/search`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'X-API-TOKEN': token
            },
            body: JSON.stringify({query, size: 5})
        })
        .then(response => response.json())
        res.json(samples)
    } catch (e) {
        res.status(500).send(e);
    }
})

app.listen(3000, () => {
    console.log('App listening on 3000')
});