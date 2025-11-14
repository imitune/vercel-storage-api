import { put } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false, // Required for busboy to handle multipart
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const busboy = require('busboy');
  const bb = busboy({ 
    headers: req.headers,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB max file size
      files: 1, // Only allow 1 file
    }
  });

  let uploadPromise;
  let uploadError = null;
  const queryId = uuidv4(); // Generate a new query ID

  bb.on('file', (name, file, info) => {
    const { filename, mimeType } = info;
    
    // SECURITY: Validate audio MIME type
    const validMimeTypes = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg'];
    if (!validMimeTypes.includes(mimeType)) {
      uploadError = `Unsupported audio format: ${mimeType}. Supported: webm, wav, mp3, ogg.`;
      file.resume(); // Drain the stream
      return;
    }

    console.log(`[Upload] File: ${filename}, type: ${mimeType}, queryId: ${queryId}`);
    
    const blobName = `query-${queryId}-${filename}`;
    uploadPromise = put(blobName, file, { access: 'public', contentType: mimeType });
  });

  bb.on('limit', () => {
    uploadError = 'File too large. Maximum size is 10MB.';
  });

  bb.on('finish', async () => {
    try {
      // Check if there was an error during file processing
      if (uploadError) {
        return res.status(400).json({ error: uploadError });
      }

      // Check if a file was actually uploaded
      if (!uploadPromise) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const result = await uploadPromise;
      res.status(200).json({
        success: true,
        queryId,
        audioUrl: result.url,
        blobPath: result.pathname,
      });
    } catch (err) {
      console.error('[Upload Error]', err);
      res.status(500).json({ error: 'Upload failed', details: err.message });
    }
  });

  bb.on('error', (err) => {
    console.error('[Busboy Error]', err);
    res.status(500).json({ error: 'File processing failed', details: err.message });
  });

  req.pipe(bb);
}