import axios from 'axios';

export default async function handler(req: any, res: any) {
  const { path } = req.query;
  const targetUrl = `https://78c3-2804-30c-a04-5a00-95e5-5fe2-6164-7990.ngrok-free.app/api/${Array.isArray(path) ? path.join('/') : path}`;
  
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
        // Forçar o host correto para o ngrok e injetar o bypass
        host: '78c3-2804-30c-a04-5a00-95e5-5fe2-6164-7990.ngrok-free.app',
        'ngrok-skip-browser-warning': 'true',
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
