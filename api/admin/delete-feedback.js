import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).end('Method Not Allowed');

  try {
    const { queryId, freesoundId } = req.query;

    if (!queryId) return res.status(400).json({ error: 'Missing queryId' });

    const pattern = freesoundId
      ? `feedback:${queryId}:${freesoundId}`
      : `feedback:${queryId}:*`;

    const keys = await kv.keys(pattern);

    await Promise.all(keys.map(key => kv.del(key)));

    res.status(200).json({ success: true, deleted: keys });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
}
