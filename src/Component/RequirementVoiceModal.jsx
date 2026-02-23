import { useEffect, useRef, useState } from 'react';
import { Mic, Send, X, Keyboard, AudioLines } from 'lucide-react';

const RequirementVoiceModal = ({
  isOpen,
  onClose,
  onSend,
  defaultMode = 'voice'
}) => {
  const [mode, setMode] = useState(defaultMode);
  const [requirement, setRequirement] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState('');
  const recognitionRef = useRef(null);
  const speechStopTimerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setRequirement('');
      setInterimText('');
      setMicError('');
      setIsListening(false);
    }
  }, [isOpen, defaultMode]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicError('Voice input is not supported in this browser.');
      return undefined;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
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
      setMicError(event?.error ? `Voice input error: ${event.error}` : 'Voice input error.');
    };
    recognition.onend = () => {
      setIsListening(false);
      setInterimText('');
    };
    recognitionRef.current = recognition;
    return () => {
      if (speechStopTimerRef.current) {
        clearTimeout(speechStopTimerRef.current);
      }
      recognition.stop();
    };
  }, [isOpen]);

  const handleMicToggle = () => {
    if (!recognitionRef.current) {
      setMicError('Voice input is not supported in this browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    setMicError('');
    recognitionRef.current.start();
  };

  const handleSend = () => {
    const text = requirement.trim();
    if (!text) return;
    if (typeof onSend === 'function') {
      onSend(text);
    } else {
      console.log('Requirement sent:', text);
    }
    setRequirement('');
    setInterimText('');
    setIsListening(false);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200/70 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Requirement</div>
            <h2 className="text-xl font-bold text-slate-900">Tell us your requirement</h2>
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center justify-center"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pt-5">
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <button
              onClick={() => setMode('voice')}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                mode === 'voice'
                  ? 'bg-[#2C5AA0] text-white shadow'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              <AudioLines className="h-4 w-4" />
              Voice
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
              Typing
            </button>
          </div>
        </div>

        <div className="px-6 py-6">
          {mode === 'voice' ? (
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-[#f4f8ff] via-white to-[#f9fbff] p-6">
              <div className="flex flex-col items-center text-center">
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
                    aria-label="Toggle voice recording"
                  >
                    <Mic className="h-5 w-5" />
                  </button>
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-900">
                  {isListening ? 'Listening… speak your requirement' : 'Tap to start recording'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Voice is the primary option. We will convert speech to text.
                </p>
              </div>

              <div className="mt-5">
                <label className="text-xs font-semibold text-slate-500">Live transcript</label>
                <textarea
                  value={`${requirement}${interimText ? `${requirement ? ' ' : ''}${interimText}` : ''}`}
                  onChange={(e) => {
                    setRequirement(e.target.value);
                    setInterimText('');
                  }}
                  placeholder="Your requirement will appear here…"
                  className="mt-2 w-full min-h-[120px] rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2C5AA0]/40"
                />
                {micError && (
                  <p className="mt-2 text-xs text-red-500">{micError}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <label className="text-xs font-semibold text-slate-500">Type your requirement</label>
              <textarea
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                placeholder="Share roles, counts, duration, timeline, location…"
                className="mt-2 w-full min-h-[200px] rounded-xl border border-slate-200 p-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2C5AA0]/40"
              />
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="text-xs text-slate-500">
            Tip: Include role, location, duration, and timeline.
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setRequirement('')}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleSend}
              disabled={!requirement.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#2C5AA0] text-white text-sm font-semibold shadow hover:bg-[#1e3f73] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Send
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequirementVoiceModal;
