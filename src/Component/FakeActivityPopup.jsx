import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Star, Zap } from 'lucide-react';

// A pleasant, soft notification "pop" sound (base64 mp3)
const popSoundBase64 = "data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq"; // Note: we'll use a reliable external URL instead for better quality if base64 is too large. Let's use an external reliable URL.

const FAKE_MESSAGES = [
  { text: "Anshu Prasad just joined as a new Partner.", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
  { text: "Rohan is now ready to collaborate with BnC LEG.", icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
  { text: "Kavya registered as a Technology Partner.", icon: Zap, color: "text-blue-500", bg: "bg-blue-50" },
  { text: "Amit successfully signed the Partnership Agreement.", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
  { text: "Priya joined our ecosystem of experts to collaborate.", icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
];

const FakeActivityPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentMsg, setCurrentMsg] = useState(FAKE_MESSAGES[0]);
  const [isDismissed, setIsDismissed] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Only run if user is logged in
    const partnerUser = localStorage.getItem('partnerUser');
    if (!partnerUser) return;

    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audioRef.current.volume = 0.4;

    let timeoutId;

    const showRandomPopup = () => {
      if (isDismissed) return;
      
      const randomMsg = FAKE_MESSAGES[Math.floor(Math.random() * FAKE_MESSAGES.length)];
      setCurrentMsg(randomMsg);
      setIsVisible(true);
      
      // Play sound
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.log('Audio play blocked:', e));
      }

      // Hide after 6 seconds
      timeoutId = setTimeout(() => {
        setIsVisible(false);
        // Show another one after 45-90 seconds
        const nextDelay = Math.floor(Math.random() * 45000) + 45000;
        timeoutId = setTimeout(() => {
          showRandomPopup();
        }, nextDelay);
      }, 6000);
    };

    const startCycle = () => {
      // First popup after 30 seconds
      timeoutId = setTimeout(() => {
        showRandomPopup();
      }, 30000);
    };

    startCycle();

    return () => {
      setIsVisible(false);
      clearTimeout(timeoutId);
    };
  }, [isDismissed]);

  const handleClose = () => {
    setIsVisible(false);
    setIsDismissed(true); // Stop further popups if the user explicitly closes it
  };

  return (
    <AnimatePresence>
      {isVisible && !isDismissed && (
        <motion.div
          initial={{ opacity: 0, x: -50, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -50, y: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed bottom-6 left-6 z-50 pointer-events-auto"
        >
          <div className="bg-white/95 backdrop-blur-md border border-slate-200/60 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)] rounded-2xl p-4 pr-10 max-w-[320px] flex items-start gap-3 relative group overflow-hidden">
            <div className={`shrink-0 p-2 rounded-full ${currentMsg.bg}`}>
              <currentMsg.icon className={`w-5 h-5 ${currentMsg.color}`} />
            </div>
            <div className="pt-0.5">
              <p className="text-sm font-semibold text-slate-800 leading-snug">
                {currentMsg.text}
              </p>
              <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider">
                Just now
              </p>
            </div>
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-1 rounded-full transition-colors cursor-pointer"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            
            {/* Loading progress bar indicator at bottom */}
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 6, ease: "linear" }}
              className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-[#DC2626] to-[#0F2A4A]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FakeActivityPopup;
