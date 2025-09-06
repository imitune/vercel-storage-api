import { list } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed');

  try {
    const blobs = await list(); // defaults to latest 100
    res.status(200).json({ blobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list blobs' });
  }
}
