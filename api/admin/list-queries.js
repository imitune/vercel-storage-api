import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed');

  try {
    const keys = await kv.keys('feedback:*');
    const queryIds = new Set(keys.map(key => key.split(':')[1])); // Extract queryId
    res.status(200).json({ queryIds: Array.from(queryIds) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list query IDs' });
  }
}
