export const config = { runtime: 'edge' };

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store, max-age=0'
    }
  });
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID || process.env.VITE_ELEVENLABS_AGENT_ID;
  if (!apiKey || !agentId) {
    return jsonResponse({ error: 'Voice chat is not configured on the server.' }, 503);
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`,
      { headers: { 'xi-api-key': apiKey } }
    );

    if (!response.ok) {
      return jsonResponse({ error: 'Could not start a secure voice session.' }, 502);
    }

    const result = await response.json() as { signed_url?: string };
    if (!result.signed_url) {
      return jsonResponse({ error: 'ElevenLabs returned an invalid session response.' }, 502);
    }

    return jsonResponse({ signed_url: result.signed_url });
  } catch {
    return jsonResponse({ error: 'Could not reach the voice service. Please try again.' }, 502);
  }
}
