// netlify/functions/convert.js
/*const https = require('https');
const FormData = require('form-data');

const CLOUDMERSIVE_API_KEY = process.env.CLOUDMERSIVE_API_KEY;
const CLOUDMERSIVE_BASE_URL = 'https://api.cloudmersive.com';

// Cloudmersive API endpoints for different conversion types
const CONVERSION_ENDPOINTS = {
  // Document conversions
  'docx-to-pdf': '/convert/docx/to/pdf',
  'pdf-to-docx': '/convert/pdf/to/docx',
  'pdf-to-txt': '/convert/pdf/to/txt',
  'docx-to-txt': '/convert/docx/to/txt',
  'txt-to-pdf': '/convert/txt/to/pdf',
  'html-to-pdf': '/convert/html/to/pdf',
  'rtf-to-pdf': '/convert/rtf/to/pdf',
  
  // Image conversions
  'jpg-to-png': '/image/convert/jpg/to/png',
  'png-to-jpg': '/image/convert/png/to/jpg',
  'gif-to-png': '/image/convert/gif/to/png',
  'bmp-to-png': '/image/convert/bmp/to/png',
  'tiff-to-png': '/image/convert/tiff/to/png',
  'webp-to-png': '/image/convert/webp/to/png',
  'png-to-webp': '/image/convert/png/to/webp',
  'jpg-to-webp': '/image/convert/jpg/to/webp',
  
  // Video conversions (basic support)
  'mp4-to-avi': '/video/convert/mp4/to/avi',
  'avi-to-mp4': '/video/convert/avi/to/mp4',
  'mov-to-mp4': '/video/convert/mov/to/mp4',
  'mkv-to-mp4': '/video/convert/mkv/to/mp4',
  'webm-to-mp4': '/video/convert/webm/to/mp4',
  
  // Audio conversions
  'mp3-to-wav': '/audio/convert/mp3/to/wav',
  'wav-to-mp3': '/audio/convert/wav/to/mp3',
  'flac-to-mp3': '/audio/convert/flac/to/mp3',
  'aac-to-mp3': '/audio/convert/aac/to/mp3',
  'ogg-to-mp3': '/audio/convert/ogg/to/mp3'
};

// Helper function to make API calls to Cloudmersive
function makeCloudmersiveRequest(endpoint, fileBuffer, filename) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('inputFile', fileBuffer, filename);
    
    const options = {
      hostname: 'api.cloudmersive.com',
      path: endpoint,
      method: 'POST',
      headers: {
        'Apikey': CLOUDMERSIVE_API_KEY,
        ...form.getHeaders()
      }
    };

    const req = https.request(options, (res) => {
      let data = Buffer.alloc(0);
      
      res.on('data', (chunk) => {
        data = Buffer.concat([data, chunk]);
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({
            success: true,
            data: data,
            contentType: res.headers['content-type'] || 'application/octet-stream'
          });
        } else {
          reject(new Error(`API Error: ${res.statusCode} - ${data.toString()}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    form.pipe(req);
  });
}

// Helper function to get conversion endpoint
function getConversionEndpoint(fromFormat, toFormat) {
  const key = `${fromFormat.toLowerCase()}-to-${toFormat.toLowerCase()}`;
  return CONVERSION_ENDPOINTS[key];
}

// Helper function to get output filename
function getOutputFilename(originalFilename, toFormat) {
  const nameWithoutExt = originalFilename.replace(/\.[^/.]+$/, '');
  return `${nameWithoutExt}.${toFormat}`;
}

// Helper function to get content type based on format
function getContentType(format) {
  const contentTypes = {
    'pdf': 'application/pdf',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt': 'text/plain',
    'html': 'text/html',
    'rtf': 'application/rtf',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'tiff': 'image/tiff',
    'webp': 'image/webp',
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'mkv': 'video/x-matroska',
    'webm': 'video/webm',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'flac': 'audio/flac',
    'aac': 'audio/aac',
    'ogg': 'audio/ogg'
  };
  return contentTypes[format.toLowerCase()] || 'application/octet-stream';
}

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Check if API key is configured
    if (!CLOUDMERSIVE_API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'API key not configured' 
        })
      };
    }

    // Parse the request body
    const body = JSON.parse(event.body);
    const { fromFormat, toFormat, filename } = body;

    // Validate required fields
    if (!fromFormat || !toFormat || !filename) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: fromFormat, toFormat, filename' 
        })
      };
    }

    // Check if conversion is supported
    const endpoint = getConversionEndpoint(fromFormat, toFormat);
    if (!endpoint) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: `Conversion from ${fromFormat} to ${toFormat} is not supported` 
        })
      };
    }

    // Get file data from base64
    if (!body.fileData) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'No file data provided' 
        })
      };
    }

    const fileBuffer = Buffer.from(body.fileData, 'base64');

    // Make the conversion request
    const result = await makeCloudmersiveRequest(endpoint, fileBuffer, filename);

    if (result.success) {
      const outputFilename = getOutputFilename(filename, toFormat);
      const outputBase64 = result.data.toString('base64');
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: outputBase64,
          filename: outputFilename,
          contentType: getContentType(toFormat)
        })
      };
    } else {
      throw new Error('Conversion failed');
    }

  } catch (error) {
    console.error('Conversion error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      })
    };
  }
};*/

const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    const { fileData, fromFormat, toFormat, filename } = JSON.parse(event.body);

    if (!fileData || !fromFormat || !toFormat || !filename) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: 'Missing required fields' })
      };
    }

    const apiKey = process.env.CLOUDMERSIVE_API_KEY;
    const endpoint = `https://api.cloudmersive.com/convert/${fromFormat}/to/${toFormat}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Apikey': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ FileBytes: fileData })
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({
          success: false,
          error: `Cloudmersive error: ${response.status} ${errText}`
        })
      };
    }

    const buffer = await response.buffer();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        data: buffer.toString('base64'),
        contentType: 'application/octet-stream',
        filename: filename
      })
    };
  } catch (err) {
    console.error('Conversion error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error'
      })
    };
  }
};

