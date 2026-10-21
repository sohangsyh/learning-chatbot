/* CUHK GamePlay AI proxy for Cloudflare Workers.
 *
 * Forwards the teacher portal's AI requests to Anthropic, OpenAI, Google Gemini or Alibaba Qwen,
 * adding the browser permission (CORS) headers that some providers do not send.
 *
 * Setup (see README, "Proxy server"):
 * 1. Put your GitHub Pages address in ALLOWED_ORIGINS below.
 * 2. Optional: store school API keys as Worker secrets so teachers need no key:
 *    ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY, DASHSCOPE_API_KEY
 * 3. Deploy, then paste the Worker's address into the portal: AI Engine > Advanced > Proxy URL.
 */
const ALLOWED_ORIGINS = ['https://YOUR-GITHUB-NAME.github.io'];

const UPSTREAM = {
  'anthropic': 'https://api.anthropic.com',
  'openai': 'https://api.openai.com/v1',
  'gemini': 'https://generativelanguage.googleapis.com/v1beta',
  'qwen-intl': 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
  'qwen-cn': 'https://dashscope.aliyuncs.com/compatible-mode/v1',
};

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = ALLOWED_ORIGINS.includes(origin);
    const cors = {
      'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type, authorization, x-api-key, anthropic-version, anthropic-dangerous-direct-browser-access, x-goog-api-key',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
    };
    if (request.method === 'OPTIONS') return new Response(null, { status: allowed ? 204 : 403, headers: cors });
    if (!allowed) return new Response('Origin not allowed', { status: 403, headers: cors });

    const url = new URL(request.url);
    const [, prefix, ...rest] = url.pathname.split('/');
    const base = UPSTREAM[prefix];
    if (!base || request.method !== 'POST') return new Response('Not found', { status: 404, headers: cors });

    const headers = new Headers(request.headers);
    ['Origin', 'Referer', 'Cookie', 'anthropic-dangerous-direct-browser-access'].forEach(h => headers.delete(h));
    // Server-held keys: used only when the teacher did not supply one.
    if (prefix === 'anthropic' && !headers.get('x-api-key') && env.ANTHROPIC_API_KEY) headers.set('x-api-key', env.ANTHROPIC_API_KEY);
    if (prefix === 'openai' && !headers.get('authorization') && env.OPENAI_API_KEY) headers.set('authorization', 'Bearer ' + env.OPENAI_API_KEY);
    if (prefix === 'gemini' && !headers.get('x-goog-api-key') && env.GEMINI_API_KEY) headers.set('x-goog-api-key', env.GEMINI_API_KEY);
    if (prefix.startsWith('qwen') && !headers.get('authorization') && env.DASHSCOPE_API_KEY) headers.set('authorization', 'Bearer ' + env.DASHSCOPE_API_KEY);

    const upstream = await fetch(base + '/' + rest.join('/') + url.search, { method: 'POST', headers, body: request.body });
    const response = new Response(upstream.body, upstream);
    Object.entries(cors).forEach(([k, v]) => response.headers.set(k, v));
    return response;
  },
};
