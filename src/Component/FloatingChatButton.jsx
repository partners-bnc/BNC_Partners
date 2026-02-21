import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const FloatingChatButton = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const position = isRtl
    ? 'fixed bottom-6 left-6 z-50 sm:bottom-6 sm:left-6 bottom-4 left-4'
    : 'fixed bottom-6 right-6 z-50 sm:bottom-6 sm:right-6 bottom-4 right-4';

  return (
    <div className={position}>
      <Link
        to="/start-chatting"
        className="flex flex-col items-center -gap-8 group"
        aria-label="Get AI help"
      >
        <div className="relative z-0">
          <img
            src="https://media.licdn.com/dms/image/v2/D5603AQEra7lryPucqw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1727271678522?e=1772668800&v=beta&t=SFN61g3iPBn9kHkDptoI-S75So0uBpFhC78Mhrezjkw"
            alt="AI assistant"
            className="h-16 w-16 rounded-full object-cover border border-[#2C5AA0] shadow-md"
          />
        </div>
        <div className="relative z-10 flex items-center gap-2 bg-white rounded-full px-3 py-1.5 shadow-lg border border-slate-100 -mt-2">
          <span className="relative flex h-2.5 w-2.5 items-center justify-center">
            <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-[#2C5AA0]/60 animate-ping"></span>
            <span className="h-2.5 w-2.5 rounded-full bg-[#2C5AA0] ring-2 ring-[#2C5AA0]/30"></span>
          </span>
          <span className="font-geist text-xs font-semibold text-slate-700">
            Get AI help
          </span>
        </div>
      </Link>
    </div>
  );
};

export default FloatingChatButton;
