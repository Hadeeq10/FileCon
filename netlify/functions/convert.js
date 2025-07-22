// netlify/functions/convert.js
const axios = require('axios');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { fromFormat, toFormat, files } = body;

    if (!fromFormat || !toFormat || !files || files.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const apiKey = process.env.CLOUDMERSIVE_API_KEY;
    const results = [];

    for (const file of files) {
      const { fileData, filename } = file;

      // Decode base64 fileData to binary buffer
      const binaryData = Buffer.from(fileData, 'base64');

      const response = await axios.post(
        `https://api.cloudmersive.com/convert/${fromFormat}/to/${toFormat}`,
        binaryData,
        {
          headers: {
            'Content-Type': 'application/octet-stream',
            'Apikey': apiKey
          },
          responseType: 'arraybuffer'
        }
      );

      results.push({
        filename: filename.replace(new RegExp(`\\.${fromFormat}$`, 'i'), `.${toFormat}`),
        content: Buffer.from(response.data, 'binary').toString('base64')
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ results })
    };
  } catch (error) {
    console.error('Conversion error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to convert file(s)' })
    };
  }
};
