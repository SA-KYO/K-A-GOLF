const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (error) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const publicId = payload.publicId;
  const resourceType = payload.resourceType === 'video' ? 'video' : 'image';

  if (!publicId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'publicId is required' }) };
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Cloudinary env missing' }) };
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHash('sha1')
    .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
    .digest('hex');

  const params = new URLSearchParams();
  params.append('public_id', publicId);
  params.append('timestamp', timestamp.toString());
  params.append('api_key', apiKey);
  params.append('signature', signature);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`, {
      method: 'POST',
      body: params,
    });

    const data = await response.json();

    if (!response.ok) {
      return { statusCode: 500, body: JSON.stringify({ error: data }) };
    }

    if (data.result === 'ok' || data.result === 'not found') {
      return { statusCode: 200, body: JSON.stringify({ result: 'ok' }) };
    }

    return { statusCode: 500, body: JSON.stringify({ error: data }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Cloudinary request failed' }) };
  }
};
