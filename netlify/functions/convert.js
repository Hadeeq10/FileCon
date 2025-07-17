const axios = require('axios');

exports.handler = async function (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = JSON.parse(req.body);
    const { fromFormat, toFormat, files } = body;

    if (!fromFormat || !toFormat || !files || files.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const apiKey = process.env.CLOUDMERSIVE_API_KEY;
    const results = [];

    for (const file of files) {
      const { fileData, filename } = file;

      const response = await axios.post(
        `https://api.cloudmersive.com/convert/${fromFormat}/to/${toFormat}`,
        fileData,
        {
          headers: {
            'Content-Type': 'application/octet-stream',
            'Apikey': apiKey,
          },
          responseType: 'arraybuffer',
        }
      );

      results.push({
        filename: filename.replace(`.${fromFormat}`, `.${toFormat}`),
        content: Buffer.from(response.data, 'binary').toString('base64'),
      });
    }

    return res.status(200).json({ results });
  } catch (error) {
    console.error('Conversion error:', error.message);
    return res.status(500).json({ error: 'Failed to convert file(s)' });
  }
};
