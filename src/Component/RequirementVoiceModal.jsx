import { useEffect, useRef, useState } from 'react';
import { Mic, Send, X, Keyboard, AudioLines } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const RequirementVoiceModal = ({
  isOpen,
  onClose,
  onSend,
  defaultMode = 'voice'
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const textAlign = isRtl ? 'text-right' : 'text-left';
  const rowDirection = isRtl ? 'flex-row-reverse' : 'flex-row';
  const [mode, setMode] = useState(defaultMode);
  const [requirement, setRequirement] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [micError, setMicError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [recordedAudioFile, setRecordedAudioFile] = useState(null);
  const recognitionRef = useRef(null);
  const speechStopTimerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const getSubmitErrorMessage = (error) => {
    if (!error) return 'Failed to submit requirement.';
    if (typeof error === 'string') return error;
    if (error instanceof Error && error.message) return error.message;
    if (typeof error === 'object') {
      if (typeof error.message === 'string' && error.message.trim()) return error.message;
      if (typeof error.error_description === 'string' && error.error_description.trim()) return error.error_description;
      if (typeof error.details === 'string' && error.details.trim()) return error.details;
      if (typeof error.hint === 'string' && error.hint.trim()) return error.hint;
      try {
        return JSON.stringify(error);
      } catch (jsonError) {
        return 'Failed to submit requirement.';
      }
    }
    return 'Failed to submit requirement.';
  };

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setRequirement('');
      setInterimText('');
      setMicError('');
      setSubmitError('');
      setIsListening(false);
      setIsSending(false);
      setRecordedAudioFile(null);
    }
  }, [isOpen, defaultMode]);

  const stopAudioStream = () => {
    if (!mediaStreamRef.current) return;
    mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  };

  const stopAudioRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
      return;
    }
    stopAudioStream();
  };

  const startAudioRecording = async () => {
    if (!navigator?.mediaDevices?.getUserMedia || typeof window.MediaRecorder === 'undefined') {
      setMicError(t('requirementVoiceModal.errors.notSupported'));
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      const preferredTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4'
      ];
      const mimeType = preferredTypes.find((type) => window.MediaRecorder.isTypeSupported(type)) || '';
      const recorder = mimeType
        ? new window.MediaRecorder(stream, { mimeType })
        : new window.MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const chunks = audioChunksRef.current;
        if (!chunks.length) {
          stopAudioStream();
          return;
        }
        const blobType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(chunks, { type: blobType });
        const extension = blobType.includes('ogg') ? 'ogg' : blobType.includes('mp4') ? 'm4a' : 'webm';
        const file = new File([blob], `voice-requirement-${Date.now()}.${extension}`, { type: blobType });
        setRecordedAudioFile(file);
        stopAudioStream();
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      return true;
    } catch (error) {
      stopAudioStream();
      setMicError(t('requirementVoiceModal.errors.notSupported'));
      return false;
    }
  };

  useEffect(() => {
    if (!isOpen) return undefined;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicError(t('requirementVoiceModal.errors.notSupported'));
      return undefined;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = isRtl ? 'ar-SA' : 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onstart = () => {
      setMicError('');
      setIsListening(true);
    };
    recognition.onresult = (event) => {
      let interim = '';
      let finalChunk = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0]?.transcript || '';
        if (result.isFinal) {
          finalChunk += text;
        } else {
          interim += text;
        }
      }
      if (finalChunk.trim()) {
        setRequirement((prev) => {
          const spacer = prev.trim().length ? ' ' : '';
          return `${prev}${spacer}${finalChunk.trim()}`;
        });
      }
      setInterimText(interim.trim());
      if (speechStopTimerRef.current) {
        clearTimeout(speechStopTimerRef.current);
      }
      speechStopTimerRef.current = setTimeout(() => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      }, 5000);
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      setMicError(event?.error
        ? t('requirementVoiceModal.errors.genericWithCode', { code: event.error })
        : t('requirementVoiceModal.errors.generic'));
    };
    recognition.onend = () => {
      setIsListening(false);
      setInterimText('');
      stopAudioRecording();
    };
    recognitionRef.current = recognition;
    return () => {
      if (speechStopTimerRef.current) {
        clearTimeout(speechStopTimerRef.current);
      }
      recognition.stop();
      stopAudioRecording();
      stopAudioStream();
    };
  }, [isOpen, isRtl, t]);

  const handleMicToggle = async () => {
    if (!recognitionRef.current) {
      setMicError(t('requirementVoiceModal.errors.notSupported'));
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      stopAudioRecording();
      setIsListening(false);
      return;
    }
    setMicError('');
    const started = await startAudioRecording();
    if (!started) return;
    recognitionRef.current.start();
  };

  const handleSend = async () => {
    const text = requirement.trim();
    if (!text || isSending) return;
    setSubmitError('');
    setIsSending(true);
    try {
      if (typeof onSend === 'function') {
        await onSend({
          text,
          audioFile: recordedAudioFile || null
        });
      } else {
        console.log('Requirement sent:', text);
      }
      setRequirement('');
      setInterimText('');
      setIsListening(false);
      setRecordedAudioFile(null);
      onClose?.();
    } catch (error) {
      setSubmitError(getSubmitErrorMessage(error));
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200/70 overflow-hidden">
        <div className={`flex items-center justify-between px-6 py-4 border-b border-slate-100 ${rowDirection}`}>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
              {t('requirementVoiceModal.title')}
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {t('requirementVoiceModal.subtitle')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center justify-center"
            aria-label={t('requirementVoiceModal.close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pt-5">
          <div className={`flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 ${rowDirection}`}>
            <button
              onClick={() => setMode('voice')}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                mode === 'voice'
                  ? 'bg-[#2C5AA0] text-white shadow'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              <AudioLines className="h-4 w-4" />
              {t('requirementVoiceModal.voice')}
            </button>
            <button
              onClick={() => setMode('typing')}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                mode === 'typing'
                  ? 'bg-[#2C5AA0] text-white shadow'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              <Keyboard className="h-4 w-4" />
              {t('requirementVoiceModal.typing')}
            </button>
          </div>
        </div>

        <div className="px-6 py-6">
          {mode === 'voice' ? (
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-[#f4f8ff] via-white to-[#f9fbff] p-6">
              <div className={`flex flex-col items-center ${textAlign}`}>
                <div className={`relative h-24 w-24 rounded-full flex items-center justify-center ${
                  isListening ? 'bg-[#2C5AA0]/10' : 'bg-slate-100'
                }`}>
                  {isListening && (
                    <>
                      <span className="absolute h-full w-full rounded-full bg-[#2C5AA0]/20 animate-ping" />
                      <span className="absolute h-16 w-16 rounded-full bg-[#2C5AA0]/20 animate-pulse" />
                    </>
                  )}
                  <button
                    onClick={handleMicToggle}
                    className={`relative z-10 h-12 w-12 rounded-full flex items-center justify-center transition-all ${
                      isListening
                        ? 'bg-[#2C5AA0] text-white shadow-lg'
                        : 'bg-white text-[#2C5AA0] border border-slate-200 shadow'
                    }`}
                    aria-pressed={isListening}
                    aria-label={t('requirementVoiceModal.toggleRecording')}
                  >
                    <Mic className="h-5 w-5" />
                  </button>
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-900">
                  {isListening
                    ? t('requirementVoiceModal.listening')
                    : t('requirementVoiceModal.tapToStart')}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {t('requirementVoiceModal.voiceHelper')}
                </p>
              </div>

              <div className="mt-5">
                <label className="text-xs font-semibold text-slate-500">
                  {t('requirementVoiceModal.liveTranscript')}
                </label>
                <textarea
                  value={`${requirement}${interimText ? `${requirement ? ' ' : ''}${interimText}` : ''}`}
                  onChange={(e) => {
                    setRequirement(e.target.value);
                    setInterimText('');
                  }}
                  placeholder={t('requirementVoiceModal.transcriptPlaceholder')}
                  className={`mt-2 w-full min-h-[120px] rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2C5AA0]/40 ${textAlign}`}
                />
                {micError && (
                  <p className={`mt-2 text-xs text-red-500 ${textAlign}`}>{micError}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <label className="text-xs font-semibold text-slate-500">
                {t('requirementVoiceModal.typeLabel')}
              </label>
              <textarea
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                placeholder={t('requirementVoiceModal.typePlaceholder')}
                className={`mt-2 w-full min-h-[200px] rounded-xl border border-slate-200 p-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2C5AA0]/40 ${textAlign}`}
              />
            </div>
          )}
        </div>

        <div className={`px-6 pb-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between ${rowDirection}`}>
          <div className={`text-xs text-slate-500 ${textAlign}`}>
            {t('requirementVoiceModal.tip')}
          </div>
          <div className={`flex gap-2 ${rowDirection}`}>
            <button
              onClick={() => {
                setRequirement('');
                setInterimText('');
                setRecordedAudioFile(null);
              }}
              disabled={isSending}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              {t('requirementVoiceModal.clear')}
            </button>
            <button
              onClick={handleSend}
              disabled={!requirement.trim() || isSending}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#2C5AA0] text-white text-sm font-semibold shadow hover:bg-[#1e3f73] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSending ? 'Sending...' : t('requirementVoiceModal.send')}
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
        {submitError && (
          <div className={`px-6 pb-6 text-xs text-red-500 ${textAlign}`}>
            {submitError}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequirementVoiceModal;
