import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { queryId, freesoundId, feedback } = req.body;

      if (!queryId || !freesoundId || !['like', 'dislike'].includes(feedback)) {
        return res.status(400).json({ error: 'Invalid input' });
      }

      const key = `feedback:${queryId}:${freesoundId}`;
      const value = {
        query_id: queryId,
        freesound_id: freesoundId,
        feedback,
        timestamp: Date.now(),
      };

      await kv.set(key, value);
      res.status(200).json({ success: true, key });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to store feedback' });
    }
  }

  else if (req.method === 'GET') {
    try {
      const { queryId } = req.query;

      if (!queryId) {
        return res.status(400).json({ error: 'Missing queryId in query string' });
      }

      // Fetch all keys matching this queryId
      const pattern = `feedback:${queryId}:*`;
      const keys = await kv.keys(pattern);

      // Fetch values for all keys
      const values = await Promise.all(keys.map(key => kv.get(key)));

      res.status(200).json({ queryId, feedback: values });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch feedback' });
    }
  }

  else {
    res.status(405).end('Method Not Allowed');
  }
}
