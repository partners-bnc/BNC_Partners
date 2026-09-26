const SIGNED_URL_ENDPOINT = '/api/elevenlabs-signed-url';

export function getVoiceAgentId() {
  return import.meta.env.VITE_ELEVENLABS_AGENT_ID;
}

export async function getSignedConversationUrl(signal) {
  const response = await fetch(SIGNED_URL_ENDPOINT, { method: 'POST', signal });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error || 'Could not connect to the voice assistant. Please try again.');
  }

  const result = await response.json();
  if (!result.signed_url) {
    throw new Error('The voice assistant did not return a secure session URL.');
  }
  return result.signed_url;
}
