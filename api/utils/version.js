// Set VERCEL_GIT_COMMIT_SHA automatically in Vercel → Settings → Git
export default function handler(req, res) {
    res.status(200).json({
      version: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
      deployedAt: new Date().toISOString()
    });
  }
  