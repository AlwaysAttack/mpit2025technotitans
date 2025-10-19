// server.js
import express from 'express';
import fetch from 'node-fetch';

const app = express();

app.get('/reverse', async (req, res) => {
  const { lat, lon } = req.query;
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=ru`;

  try {
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'MyTaxiApp/1.0 (me@myapp.ru)',
      },
    });
    const data = await resp.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3001, () => console.log('Proxy listening on http://localhost:3001'));
