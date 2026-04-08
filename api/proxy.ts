import axios from 'axios';

export default async function handler(req: any, res: any) {
  const { path } = req.query;
  const targetUrl = `https://cool-jars-burn.loca.lt/api/${Array.isArray(path) ? path.join('/') : path}`;
  
  // Repassar query parameters se houver (exceto o próprio path usado pela rota do Vercel)
  const queryParams = { ...req.query };
  delete queryParams.path;
  const queryString = new URLSearchParams(queryParams as any).toString();
  const finalUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl;

  try {
    const response = await axios({
      method: req.method,
      url: finalUrl,
      data: req.body,
      headers: {
        ...req.headers,
        // Forçar o host correto para o LocalTunnel e injetar o bypass
        host: 'cool-jars-burn.loca.lt',
        'bypass-tunnel-reminder': 'true',
      },
      // Não lançar erro para status codes fora de 2xx (repassar o que o backend enviar)
      validateStatus: () => true,
    });

    // Definir cabeçalhos necessários
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, bypass-tunnel-reminder');

    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('Proxy Error:', error.message);
    res.status(500).json({ 
      error: 'SimJuris Gateway Error', 
      details: error.message,
      target: finalUrl 
    });
  }
}
