import { put } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const busboy = require('busboy');
  const bb = busboy({ headers: req.headers });

  let uploadPromise;
  const queryId = uuidv4(); // Generate a new query ID

  bb.on('file', (name, file, info) => {
    const { filename, mimeType } = info;
    const blobName = `query-${queryId}-${filename}`;
    uploadPromise = put(blobName, file, { access: 'public', contentType: mimeType });
  });

  bb.on('finish', async () => {
    try {
      const result = await uploadPromise;
      res.status(200).json({
        success: true,
        queryId,
        audioUrl: result.url,
        blobPath: result.pathname,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Upload failed' });
    }
  });

  req.pipe(bb);
}