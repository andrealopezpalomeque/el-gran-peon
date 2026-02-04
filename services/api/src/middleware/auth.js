export function requireAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'API key requerida.' });
  }

  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'API key inválida.' });
  }

  next();
}
