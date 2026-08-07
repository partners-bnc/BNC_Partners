import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaBriefcase, FaUserTie } from 'react-icons/fa';

const RoleSelectionModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is already logged in (partner or admin)
    const partnerUser = localStorage.getItem('partnerUser');
    const adminUser = localStorage.getItem('adminUser');
    if (partnerUser || adminUser) {
      return;
    }

    // Show popup after 3 seconds (3000ms)
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleSignUp = (role) => {
    setIsVisible(false);
    if (role === 'provider') {
      navigate('/?open=partner');
    } else {
      navigate('/?open=expert');
    }
  };

  const handleLogIn = (role) => {
    setIsVisible(false);
    navigate(`/login?role=${role}`);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-5xl bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-10 md:p-14 shadow-2xl border border-white/40 flex flex-col items-center animate-scale-up">
        
        {/* Subtle Liquid Gradient Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[2.5rem] -z-10">
          <div className="absolute -top-20 -left-20 w-[55%] h-[55%] bg-[#DC2626]/8 rounded-full blur-[90px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute -bottom-20 -right-20 w-[55%] h-[55%] bg-[#0f294a]/8 rounded-full blur-[90px] animate-pulse" style={{ animationDuration: '10s' }} />
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-50 cursor-pointer"
          aria-label="Close modal"
        >
          <FaTimes className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-2xl mb-10">
          <h2 className="font-poppins text-3xl sm:text-4xl font-normal text-slate-800 tracking-tight leading-tight">
            Welcome to <span className="text-[#DC2626] font-medium">BnC</span> LEG
          </h2>
          <p className="font-geist text-base sm:text-lg text-slate-500 mt-4 leading-relaxed">
            To personalize your experience, please select how you intend to use the platform today.
          </p>
        </div>

        {/* Two Options Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
          
          {/* Card 1: Service Provider */}
          <div className="border border-white/30 bg-white/15 backdrop-blur-xl rounded-[2.5rem] p-10 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
            
            {/* Subtle Card-Specific Liquid Gradient */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-gradient-to-tr from-[#0f294a] to-blue-500 rounded-full opacity-20 filter blur-[40px] animate-pulse" style={{ animationDuration: '6s' }} />
              <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-gradient-to-tr from-indigo-900 to-purple-600 rounded-full opacity-10 filter blur-[45px] animate-pulse" style={{ animationDuration: '8s' }} />
            </div>

            {/* Minimal Icon Wrapper */}
            <div className="w-14 h-14 bg-white/40 border border-white/50 rounded-2xl flex items-center justify-center mb-6">
              <FaBriefcase className="w-6 h-6 text-slate-500" />
            </div>

            <h3 className="font-poppins text-2xl font-bold text-slate-900 mb-4">
              Claim a Project Mandate
            </h3>
            
            <p className="font-geist text-base text-slate-500 leading-relaxed mb-8 flex-grow">
              I represent a consulting firm or agency and I am looking for verified corporate mandates to work on.
            </p>

            <div className="w-full space-y-3 mt-auto">
              <button
                onClick={() => handleSignUp('provider')}
                className="w-full bg-[#0f294a] hover:bg-slate-900 text-white py-4 rounded-xl font-poppins font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm hover:shadow-md"
              >
                Sign Up &rarr;
              </button>
              
              <button
                onClick={() => handleLogIn('provider')}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-4 rounded-xl font-poppins font-semibold text-sm transition-all cursor-pointer"
              >
                Log In
              </button>
            </div>

          </div>

          {/* Card 2: Service Consumer */}
          <div className="border border-white/30 bg-white/15 backdrop-blur-xl rounded-[2.5rem] p-10 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
            
            {/* Subtle Card-Specific Liquid Gradient */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-gradient-to-tr from-[#DC2626] to-pink-500 rounded-full opacity-20 filter blur-[40px] animate-pulse" style={{ animationDuration: '6s' }} />
              <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-gradient-to-tr from-red-700 to-amber-500 rounded-full opacity-10 filter blur-[45px] animate-pulse" style={{ animationDuration: '8s' }} />
            </div>

            {/* Minimal Icon Wrapper */}
            <div className="w-14 h-14 bg-white/40 border border-white/50 rounded-2xl flex items-center justify-center mb-6">
              <FaUserTie className="w-6 h-6 text-slate-500" />
            </div>

            <h3 className="font-poppins text-2xl font-bold text-slate-900 mb-4">
              Source an Expert Partner
            </h3>
            
            <p className="font-geist text-base text-slate-500 leading-relaxed mb-8 flex-grow">
              I represent a corporation and need to find the right external experts or partners for my specific client needs.
            </p>

            <div className="w-full space-y-3 mt-auto">
              <button
                onClick={() => handleSignUp('consumer')}
                className="w-full bg-[#0f294a] hover:bg-slate-900 text-white py-4 rounded-xl font-poppins font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm hover:shadow-md"
              >
                Sign Up &rarr;
              </button>
              
              <button
                onClick={() => handleLogIn('consumer')}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-4 rounded-xl font-poppins font-semibold text-sm transition-all cursor-pointer"
              >
                Log In
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default RoleSelectionModal;
