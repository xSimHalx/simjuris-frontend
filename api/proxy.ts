export default async function handler(req: any, res: any) {
  const { path } = req.query;
  const targetUrl = `https://78c3-2804-30c-a04-5a00-95e5-5fe2-6164-7990.ngrok-free.app/api/${Array.isArray(path) ? path.join('/') : path}`;
  
  const queryParams = { ...req.query };
  delete queryParams.path;
  const queryString = new URLSearchParams(queryParams as any).toString();
  const finalUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl;

  // Filtrar cabeçalhos para evitar conflitos (manter apenas o essencial)
  const safeHeaders: Record<string, string> = {
    'content-type': req.headers['content-type'] || 'application/json',
    'accept': req.headers['accept'] || '*/*',
    'ngrok-skip-browser-warning': 'true',
  };

  if (req.headers['authorization']) {
    safeHeaders['authorization'] = req.headers['authorization'];
  }

  try {
    const response = await fetch(finalUrl, {
      method: req.method,
      headers: safeHeaders,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json().catch(() => null);

    // Repassar o status e o corpo da resposta
    res.status(response.status).json(data || { status: 'success' });
  } catch (error: any) {
    console.error('Safe Proxy Error:', error.message);
    res.status(502).json({ 
      error: 'SimJuris Gateway Timeout/Error', 
      details: error.message,
      target: finalUrl 
    });
  }
}
