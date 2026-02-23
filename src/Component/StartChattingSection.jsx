import { useEffect, useRef, useState } from 'react';
import {
  Send,
  Mic,
  Plus,
  Building2,
  Briefcase,
  FileText,
  Users,
  Sparkles,
  ArrowRight,
  Volume2
} from 'lucide-react';
import RequirementVoiceModal from './RequirementVoiceModal';

const StartChattingSection = ({ embedded = false }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState('');
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);
  const recognitionRef = useRef(null);
  const speechStopTimerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`);
  const hasUserMessage = messages.some((item) => item.type === 'user');
  const [leftWidth, setLeftWidth] = useState(65);
  const isDraggingRef = useRef(false);
  const containerRef = useRef(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const bncServices = [
    {
      title: 'International Partners',
      description: 'Cross-border collaboration and global market expansion.',
      icon: Building2,
      image: '/favicon/001.jpg.jpeg'
    },
    {
      title: 'Sales Partners',
      description: 'Co-sell and grow revenue through partner-led demand.',
      icon: Users,
      image: '/favicon/002.jpg.jpeg'
    },
    {
      title: 'Technology Partners',
      description: 'Integrations and AI-driven solutions for clients.',
      icon: Sparkles,
      image: '/favicon/003.jpg.jpeg'
    },
    {
      title: 'Service Partners',
      description: 'Specialized delivery aligned to core service lines.',
      icon: Briefcase,
      image: '/favicon/004.jpg.jpeg'
    }
  ];

  const insightCards = [
    {
      title: 'Partner Success Kits',
      description: 'Pitch decks, case studies, and co-branded assets.',
    },
    {
      title: 'Enablement Resources',
      description: 'Training, FAQs, and onboarding materials.',
    },
    {
      title: 'Growth Opportunities',
      description: 'Active regions, industries, and demand signals.',
    }
  ];

  const WEBHOOK_URL =
    import.meta.env.VITE_N8N_WEBHOOK_URL ||
    'https://akashkrid91.app.n8n.cloud/webhook/1f7b3262-4441-4c9e-8a30-b77b33499bb7';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicError('Voice input is not supported in this browser.');
      return;
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
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }
      setMessage(transcript.trim());
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
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    return () => {
      if (speechStopTimerRef.current) {
        clearTimeout(speechStopTimerRef.current);
      }
      recognition.stop();
    };
  }, []);

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { type: 'user', text, time: formatTime(new Date()) };
    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      let replyText = '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        replyText =
          data?.message ||
          data?.text ||
          data?.reply ||
          data?.output ||
          '';
      } else {
        replyText = await response.text();
      }

      const botMessage = {
        type: 'bot',
        text: replyText?.trim() || 'Thanks! We received your message. Our team will reply shortly.',
        time: formatTime(new Date())
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errText = error?.message ? `Error: ${error.message}.` : 'Error sending message.';
      setMessages((prev) => [
        ...prev,
        { type: 'bot', text: `${errText} Please check webhook configuration.`, time: formatTime(new Date()) }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    sendMessage(message);
  };

  const handleRequirementSend = (text) => {
    sendMessage(text);
  };

  const handleQuickCardClick = (title, subtitle) => {
    sendMessage(`${title} - ${subtitle}`);
  };

  const sanitizeSpeechText = (text) =>
    text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/\s+/g, ' ').trim();

  const handleSpeak = (text, idx) => {
    if (!text) return;
    if (!window.speechSynthesis) return;
    if (speakingIndex === idx) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(sanitizeSpeechText(text));
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);
    setSpeakingIndex(idx);
    window.speechSynthesis.speak(utterance);
  };

  const formatBotText = (text) => {
    if (!text) return '';
    let formatted = text;
    formatted = formatted.replace(/(^|\s)(\d+)\.\s*/g, '\n$2. ');
    formatted = formatted.replace(/\s-\s/g, '\n- ');
    formatted = formatted.replace(/\s•\s/g, '\n• ');
    formatted = formatted.replace(/\s—\s/g, '\n— ');
    formatted = formatted.replace(/(\*\*[^*]+\*\*)/g, '\n$1');
    formatted = formatted.replace(/(^|\n)\s*(\d+)\.\s*\n+\s*/g, '$1$2. ');
    formatted = formatted.replace(/(\d+\.\s)\n\*\*/g, '$1**');
    formatted = formatted.replace(/\n{2,}/g, '\n');
    return formatted.trim();
  };

  const renderBotText = (text) => {
    const formatted = formatBotText(text);
    const parts = formatted.split('**');
    return (
      <span className="whitespace-pre-line">
        {parts.map((part, idx) =>
          idx % 2 === 1 ? (
            <strong key={`${idx}-${part}`}>{part}</strong>
          ) : (
            <span key={`${idx}-${part}`}>{part}</span>
          )
        )}
      </span>
    );
  };

  const handleMicClick = () => {
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

  const handleMouseDown = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.userSelect = 'none';
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    document.body.style.userSelect = '';
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = (x / rect.width) * 100;
    const clamped = Math.min(75, Math.max(45, percent));
    setLeftWidth(clamped);
  };

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(media.matches);
    update();
    if (media.addEventListener) {
      media.addEventListener('change', update);
    } else {
      media.addListener(update);
    }
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', update);
      } else {
        media.removeListener(update);
      }
    };
  }, []);

  const containerHeightClass = embedded ? 'h-[6400px] lg:h-[635px]' : 'h-[calc(100vh-6rem)]';
  const outerClass = embedded ? 'bg-white pt-0 pb-24 -mt-2' : '';
  const contentWrapperClass = `pt-2 flex flex-col lg:flex-row ${embedded ? 'w-full px-0' : 'flex-1'}`;
  const leftPanelPaddingClass = embedded ? 'pl-4' : '';
  const rightPanelClass = embedded
    ? 'w-full h-full bg-gray-50 overflow-y-auto overflow-x-hidden pt-6 pb-6 pl-6 pr-0 scroll-smooth scrollbar-thin-bnc'
    : 'w-full h-full bg-gray-50 overflow-y-auto overflow-x-hidden p-6 scroll-smooth scrollbar-thin-bnc';
  const rightPanelInnerClass = embedded
    ? 'space-y-6 w-full min-h-full'
    : 'space-y-6 max-w-xl mx-auto min-h-full';

  return (
    <section className={outerClass} style={{ fontFamily: 'Geist, Poppins, sans-serif' }}>
      <div className={contentWrapperClass}>
        <div
          ref={containerRef}
          className={`flex flex-col lg:flex-row w-full ${containerHeightClass}`}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Left Panel - Chat Interface */}
          <div
            className={`w-full h-full flex flex-col bg-white border-r border-gray-200 overflow-hidden ${leftPanelPaddingClass}`}
            style={{ width: isDesktop ? `${leftWidth}%` : '100%' }}
          >
            <div className="flex-1 flex flex-col p-8 bg-white min-h-0">
              {!hasUserMessage && (
                <div className="text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-[#2C5AA0] to-[#1e3f73] flex items-center justify-center shadow-[0_12px_24px_rgba(30,63,115,0.25)] mx-auto ring-1 ring-white/60">
                      <Building2 className="w-10 h-10 text-white" />
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    Ready to partner with BnC Global?
                  </h2>
                  <p className="text-gray-600 text-sm mb-6 max-w-lg leading-relaxed mx-auto">
                    We work globally to help partners onboard, stay compliant, and grow together.
                  </p>

                  <div className="w-full max-w-xl grid grid-cols-2 gap-3 mb-6 mx-auto">
                    {[
                      { title: 'Partner Opportunities', subtitle: 'Learn how to become a partner' },
                      { title: 'Services Details', subtitle: 'Explore our core offerings' },
                      { title: 'Global Services', subtitle: 'Coverage across India & GCC' },
                      { title: 'Contact', subtitle: 'Talk to our team for guidance' }
                    ].map((item) => (
                      <button
                        key={item.title}
                        onClick={() => handleQuickCardClick(item.title, item.subtitle)}
                        className="p-4 bg-white border border-slate-200/70 rounded-2xl text-left transition-all group shadow-[0_10px_24px_rgba(15,23,42,0.10)] hover:-translate-y-1 hover:border-[#2C5AA0]/30 hover:bg-[#f8faff]"
                      >
                        <div className="text-sm font-semibold text-gray-900 group-hover:text-[#2C5AA0]">{item.title}</div>
                        <div className="text-xs text-gray-500 group-hover:text-[#2C5AA0]/80 mt-1">{item.subtitle}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-2 flex-1 min-h-0 overflow-y-auto pr-1 scrollbar-hidden">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`mb-4 flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.type === 'bot' && (
                      <div className="mr-3 mt-1 h-9 w-9 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                        <Building2 className="h-4 w-4 text-[#2C5AA0]" />
                      </div>
                    )}
                    <div className="max-w-[90%] lg:max-w-[75%]">
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm relative ${
                          msg.type === 'user'
                            ? 'bg-[#2C5AA0] text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                        }`}
                      >
                        {msg.type === 'bot' ? renderBotText(msg.text) : msg.text}
                        {msg.type === 'bot' && (
                          <button
                            onClick={() => handleSpeak(msg.text, idx)}
                            className={`absolute top-2 right-2 h-7 w-7 rounded-full flex items-center justify-center transition-colors ${
                              speakingIndex === idx
                                ? 'bg-[#2C5AA0] text-white'
                                : 'bg-white text-[#2C5AA0] hover:bg-[#eaf1ff]'
                            }`}
                            aria-label="Speak message"
                          >
                            <Volume2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      {msg.time && (
                        <div
                          className={`mt-1 text-[10px] text-gray-400 ${
                            msg.type === 'user' ? 'text-right' : 'text-left'
                          }`}
                        >
                          {msg.time}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="mb-4 flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#2C5AA0] animate-bounce [animation-delay:-0.2s]" />
                        <span className="h-2 w-2 rounded-full bg-[#2C5AA0] animate-bounce [animation-delay:-0.1s]" />
                        <span className="h-2 w-2 rounded-full bg-[#2C5AA0] animate-bounce" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="p-4 bg-white">
              <div className="relative max-w-3xl mx-auto group">
                <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-[#e6efff] via-[#f5f7ff] to-[#e9f2ff] opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative rounded-2xl transition-all duration-300 shadow-[0_10px_24px_rgba(15,23,42,0.08)] hover:shadow-[0_16px_30px_rgba(44,90,160,0.18)]">
                  <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask anything..."
                  className="w-full px-14 py-4 bg-white border border-gray-300/70 rounded-2xl outline-none text-gray-900 placeholder-gray-400 focus:border-[#2C5AA0] transition-all"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <button
                  onClick={() => setIsRequirementModalOpen(true)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  aria-label="Open requirement recorder"
                >
                  <Plus className="w-5 h-5 text-gray-500" />
                </button>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                  <button
                    onClick={handleMicClick}
                    className={`relative p-2 rounded-lg transition-colors ${
                      isListening ? 'bg-[#16a34a]/10 text-[#16a34a]' : 'hover:bg-gray-200 text-gray-500'
                    }`}
                    aria-pressed={isListening}
                    aria-label="Voice input"
                  >
                    <Mic className="w-5 h-5" />
                    {isListening && (
                      <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#16a34a] ring-2 ring-white" />
                    )}
                  </button>
                  <button
                    onClick={handleSendMessage}
                    className="p-2.5 bg-[#2C5AA0] hover:bg-[#1e3f73] rounded-lg transition-all"
                  >
                    <Send className="w-5 h-5 text-white" />
                  </button>
                </div>
                </div>
              </div>
              {micError && (
                <p className="text-xs text-red-500 text-center mt-2">
                  {micError}
                </p>
              )}
              <p className="text-xs text-gray-400 text-center mt-3">
               BnC Global Ai can make mistakes. Check important info.
              </p>
            </div>
          </div>

          {/* Resizer - Desktop Only */}
          <div className="hidden lg:flex items-center justify-center">
            <div
              onMouseDown={handleMouseDown}
              className="w-2 h-full cursor-col-resize bg-transparent flex items-center justify-center"
              aria-label="Resize panels"
            >
              <div className="w-0.5 h-20 bg-gray-200 rounded-full" />
            </div>
          </div>

          {/* Right Panel - Scrollable */}
          {isDesktop && (
            <div
              className={rightPanelClass}
              style={{
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
                touchAction: 'pan-y',
                width: `${100 - leftWidth}%`
              }}
            >
              <div className={rightPanelInnerClass}>
              <div className="bg-white rounded-2xl p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] border border-transparent hover:border-[#2C5AA0]/15 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#2C5AA0]" />
                    <h3 className="text-base font-bold text-gray-900">Partnership Categories</h3>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {bncServices.map((service, index) => {
                    const Icon = service.icon;
                    return (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 hover:border-[#2C5AA0] rounded-xl overflow-hidden cursor-pointer transition-all group hover:shadow-md hover:scale-[1.02] duration-200"
                    >
                      <div className="h-24 relative overflow-hidden bg-gray-100">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      </div>
                      <div className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#2C5AA0]/10 text-[#2C5AA0]">
                            <Icon className="w-4 h-4" />
                          </span>
                          <div className="text-sm font-bold text-gray-900 line-clamp-2">{service.title}</div>
                        </div>
                        <div className="text-xs text-gray-600 line-clamp-2">
                          {service.description}
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
              </div>

              <div className="rounded-2xl p-5 shadow-sm border border-[#2C5AA0]/20 bg-[radial-gradient(circle_at_top_left,#ffffff_0%,#e8f1ff_40%,#d6e6ff_72%,#c7dbff_100%)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Get Started with BnC</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Plan your partnership launch with an AI-guided checklist built for global partners.
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white shadow flex items-center justify-center text-[#2C5AA0]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>
                <button className="mt-5 w-full bg-gradient-to-r from-[#2C5AA0] to-[#1e3f73] hover:from-[#1e3f73] hover:to-[#1b3562] text-white text-sm font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 group">
                  Start Partnership Journey
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-gray-900">Partner Enablement</h3>
                  <button className="text-xs font-medium text-[#2C5AA0] hover:text-[#1e3f73] transition-colors">
                    View resources
                  </button>
                </div>
                <div className="space-y-3">
                  {insightCards.map((card, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-3 bg-gradient-to-br from-white to-[#f6f9ff] hover:from-[#eef5ff] hover:to-white rounded-xl cursor-pointer transition-all group border border-[#e6efff] hover:border-[#2C5AA0]/20 hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-white border border-[#dbe7ff] flex items-center justify-center shadow-sm group-hover:shadow-md">
                        <FileText className="w-5 h-5 text-[#2C5AA0]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-[#2C5AA0] transition-colors">
                          {card.title}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <RequirementVoiceModal
        isOpen={isRequirementModalOpen}
        onClose={() => setIsRequirementModalOpen(false)}
        onSend={handleRequirementSend}
      />
    </section>
  );
};

export default StartChattingSection;
