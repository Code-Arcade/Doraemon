import React from 'react';

export default function CustomAlert({ 
  active, 
  title, 
  message, 
  isConfirm = false, 
  confirmText = "Yes, Nobita! 👍", 
  cancelText = "No, Cancel ❌", 
  onConfirm, 
  onClose,
  icon = "🐱🔔" 
}) {
  if (!active) return null;

  return (
    <div 
      className="modal-overlay active" 
      role="dialog" 
      aria-modal="true"
      style={{ zIndex: 9999 }} // Make sure it sits on top of everything
      onClick={(e) => {
        if (e.target.classList.contains('modal-overlay')) onClose();
      }}
    >
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '400px', 
          padding: '32px 24px', 
          textAlign: 'center', 
          border: '4px solid var(--dora-blue)', 
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 50px rgba(11, 118, 243, 0.25)',
          position: 'relative',
          background: 'var(--white)'
        }}
      >
        {/* Red collar ribbon border detail */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          height: '10px',
          background: 'var(--dora-red)',
          borderRadius: '16px 16px 0 0'
        }}></div>

        {/* 22nd Century Bell detail hanging in the middle */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '28px',
          height: '28px',
          background: 'var(--dora-yellow)',
          border: '2px solid var(--text-dark)',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 4px 10px rgba(255, 211, 29, 0.4)'
        }}>
          <div style={{
            width: '6px',
            height: '6px',
            background: 'var(--text-dark)',
            borderRadius: '50%',
            marginTop: '8px'
          }}></div>
        </div>

        {/* Cute Warning Character Emotion */}
        <div style={{ 
          fontSize: '3.5rem', 
          marginTop: '16px', 
          marginBottom: '16px',
          animation: 'bounceAlert 1.5s infinite alternate'
        }}>
          {icon}
        </div>

        <h3 style={{ 
          fontSize: '1.4rem', 
          color: 'var(--dora-blue)', 
          fontFamily: 'var(--font-logo)',
          marginBottom: '12px' 
        }}>
          {title || "Pocket Sweets Alert"}
        </h3>
        
        <p style={{ 
          fontSize: '0.95rem', 
          color: 'var(--text-light)', 
          lineHeight: '1.5',
          marginBottom: '24px',
          padding: '0 8px'
        }}>
          {message}
        </p>

        {isConfirm ? (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn btn-secondary" 
              style={{ flex: 1, justifyContent: 'center', padding: '12px', fontSize: '0.9rem' }}
              onClick={onClose}
            >
              {cancelText}
            </button>
            <button 
              className="btn btn-primary" 
              style={{ 
                flex: 1.2, 
                justifyContent: 'center', 
                background: 'var(--dora-blue)', 
                color: '#fff',
                fontWeight: '700',
                padding: '12px',
                fontSize: '0.9rem'
              }}
              onClick={() => {
                if (onConfirm) onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </button>
          </div>
        ) : (
          <button 
            className="btn btn-primary" 
            style={{ 
              width: '100%', 
              justifyContent: 'center', 
              background: 'var(--dora-blue)', 
              color: '#fff',
              fontWeight: '700',
              padding: '12px',
              fontSize: '0.95rem'
            }}
            onClick={onClose}
          >
            Okay, Nobita! <i className="fa-solid fa-thumbs-up" style={{ marginLeft: '6px' }}></i>
          </button>
        )}

        {/* Dynamic Keyframes injected locally */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes bounceAlert {
            from { transform: translateY(0) scale(1); }
            to { transform: translateY(-6px) scale(1.05); }
          }
        `}} />
      </div>
    </div>
  );
}
