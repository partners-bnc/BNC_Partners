import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';
import { bandsFromThirds, maxBands } from './computeBands';
import { getSignedConversationUrl } from './elevenLabsConfig';

export function useElevenLabsOrbSource({ onConnect, onDisconnect, onError } = {}) {
  const conversation = useConversation({ onConnect, onDisconnect, onError });
  const {
    status,
    isSpeaking,
    isListening,
    startSession,
    endSession
  } = conversation;
  const statusRef = useRef(status);
  const conversationRef = useRef(conversation);

  useEffect(() => {
    statusRef.current = status;
    conversationRef.current = conversation;
  }, [conversation, status]);

  const source = useMemo(() => ({
    isActive: () => statusRef.current === 'connected',
    getTargetBands: () => {
      if (statusRef.current !== 'connected') return null;

      try {
        const current = conversationRef.current;
        const input = current.getInputByteFrequencyData();
        const output = current.getOutputByteFrequencyData();
        return maxBands(
          input?.length ? bandsFromThirds(input) : { bass: 0, mid: 0, treble: 0, level: 0 },
          output?.length ? bandsFromThirds(output) : { bass: 0, mid: 0, treble: 0, level: 0 }
        );
      } catch {
        return null;
      }
    }
  }), []);

  const start = useCallback(async (signal) => {
    const signedUrl = await getSignedConversationUrl(signal);
    if (!signal?.aborted) startSession({ signedUrl });
  }, [startSession]);

  const end = useCallback(() => endSession(), [endSession]);

  return {
    status,
    isSpeaking,
    isListening,
    start,
    end,
    source
  };
}
