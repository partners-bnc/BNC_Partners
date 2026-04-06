import { useState } from 'react';

export default function ReferralVideoDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Vertical Tab Button on Left */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          left: 0,
          bottom: '2rem',
          zIndex: 9999,
          background: 'linear-gradient(180deg, #2C5AA0, #1e3f73)',
          color: '#fff',
          border: 'none',
          borderRadius: '0 8px 8px 0',
          padding: '8px 7px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 5,
          boxShadow: '4px 0 16px rgba(44,90,160,0.35)',
          fontFamily: "'Poppins',sans-serif",
          fontWeight: 600,
          fontSize: '0.6rem',
          letterSpacing: '0.07em',
          transition: 'opacity 0.2s',
        }}
        title="How Referral Works"
      >
        <span style={{ fontSize: '0.75rem' }}>▶</span>
        <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>How Referral Works</span>
      </button>

      {/* Centered Modal Popup */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 18,
              overflow: 'hidden',
              width: '100%',
              maxWidth: 780,
              boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1rem 1.4rem',
              borderBottom: '1px solid #E2E8F0',
            }}>
              <div>
                <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: '0.95rem', color: '#1E293B' }}>
                  How the Referral Program Works
                </div>
                <div style={{ fontFamily: "'Geist',sans-serif", fontSize: '0.75rem', color: '#64748B', marginTop: 2 }}>
                  Watch to understand how you earn
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: '#EEF2F7', border: 'none', borderRadius: '50%',
                  width: 32, height: 32, cursor: 'pointer', fontSize: '0.95rem',
                  color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            {/* Video */}
            <div style={{ aspectRatio: '16/9', width: '100%' }}>
              <iframe
                width="100%" height="100%"
                src="https://www.youtube.com/embed/UyFc5JkECRg?autoplay=1"
                title="Referral Program Overview"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ display: 'block' }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
