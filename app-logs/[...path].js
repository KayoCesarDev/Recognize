const UPSTREAM_BASE_URL = 'https://reconhece-local-top.base44.app';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'content-length',
  'host',
  'transfer-encoding',
]);

function buildHeaders(headers) {
  const nextHeaders = new Headers();

  for (const [key, value] of headers.entries()) {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      nextHeaders.set(key, value);
    }
  }

  return nextHeaders;
}

async function proxyRequest(request) {
  const incomingUrl = new URL(request.url);
  const upstreamPath = incomingUrl.pathname.replace(/^\/app-logs\/?/, '');
  const upstreamUrl = new URL(`/app-logs/${upstreamPath}`, UPSTREAM_BASE_URL);
  upstreamUrl.search = incomingUrl.search;

  const init = {
    method: request.method,
    headers: buildHeaders(request.headers),
    redirect: 'manual',
  };

  if (!['GET', 'HEAD'].includes(request.method)) {
    init.body = request.body;
    init.duplex = 'half';
  }

  const response = await fetch(upstreamUrl, init);
  const responseHeaders = new Headers(response.headers);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export default {
  fetch: proxyRequest,
};
