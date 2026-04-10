export default async function handler(req: any, res: any) {
  const { path } = req.query;
  
  // URL da sua VPS na Hostinger
  const vpsIp = '82.112.245.75';
  const targetUrl = `http://${vpsIp}:3333/api/${Array.isArray(path) ? path.join('/') : path}`;
  
  const queryParams = { ...req.query };
  delete queryParams.path;
  const queryString = new URLSearchParams(queryParams as any).toString();
  const finalUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl;

  // Filtrar cabeçalhos essenciais para produção
  const safeHeaders: Record<string, string> = {
    'content-type': req.headers['content-type'] || 'application/json',
    'accept': req.headers['accept'] || '*/*',
  };

  if (req.headers['authorization']) {
    safeHeaders['authorization'] = req.headers['authorization'];
  }

  try {
    const body = req.method !== 'GET' && req.method !== 'HEAD' 
      ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body))
      : undefined;

    const response = await fetch(finalUrl, {
      method: req.method,
      headers: safeHeaders,
      body,
    });

    const data = await response.json().catch(() => null);

    // Repassar o status e o corpo da resposta da VPS
    res.status(response.status).json(data || { status: 'success' });
  } catch (error: any) {
    console.error('VPS Proxy Error:', error.message);
    res.status(502).json({ 
      error: 'SimJuris VPS Gateway Error', 
      details: error.message,
      target: finalUrl 
    });
  }
}
