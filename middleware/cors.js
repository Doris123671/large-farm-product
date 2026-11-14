function getAllowedOrigins() {
  return new Set((process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean));
}

function cors(req, res, next) {
  const origin = req.get('Origin');
  if (!origin) return next();

  if (!getAllowedOrigins().has(origin)) {
    return res.status(403).json({ error: 'Origin is not allowed.' });
  }

  res.set('Access-Control-Allow-Origin', origin);
  res.set('Access-Control-Allow-Credentials', 'true');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.vary('Origin');

  if (req.method === 'OPTIONS') return res.status(204).end();
  return next();
}

module.exports = cors;