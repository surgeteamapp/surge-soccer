// Shared glassmorphism styles for the purple/black theme
// Use these inline styles until CSS classes are properly configured

export const glassStyles = {
  // Basic glass effect
  glass: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  } as React.CSSProperties,

  // Stronger glass effect
  glassStrong: {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  } as React.CSSProperties,

  // Purple-tinted glass card with glow - enhanced
  glassCard: {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(138, 43, 226, 0.12) 50%, rgba(255, 255, 255, 0.06) 100%)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 60px rgba(138, 43, 226, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
  } as React.CSSProperties,

  // Purple glow effect
  glowPurple: {
    boxShadow: '0 0 25px rgba(138, 43, 226, 0.5), 0 0 50px rgba(138, 43, 226, 0.3), inset 0 0 30px rgba(138, 43, 226, 0.1)',
  } as React.CSSProperties,

  // Sidebar style - enhanced
  sidebar: {
    background: 'linear-gradient(180deg, rgba(10, 0, 20, 0.98) 0%, rgba(26, 10, 46, 0.95) 100%)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRight: '1px solid rgba(138, 43, 226, 0.3)',
    boxShadow: '4px 0 30px rgba(0, 0, 0, 0.5)',
  } as React.CSSProperties,

  // Active nav link - enhanced
  navActive: {
    background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.4) 0%, rgba(88, 28, 135, 0.3) 100%)',
    border: '1px solid rgba(168, 85, 247, 0.5)',
    boxShadow: '0 0 20px rgba(138, 43, 226, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  } as React.CSSProperties,

  // Inactive nav link hover
  navInactive: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid transparent',
  } as React.CSSProperties,

  // Header bar style
  headerBar: {
    background: 'linear-gradient(90deg, rgba(10, 0, 20, 0.95) 0%, rgba(26, 10, 46, 0.9) 100%)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(138, 43, 226, 0.2)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
  } as React.CSSProperties,
};

// Dark background with purple gradient - enhanced
export const pageBackground = {
  background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)',
} as React.CSSProperties;

// Dashboard lightning animation keyframes - lightweight version
export const dashboardAnimations = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  @keyframes subtleLightning1 {
    0%, 100% { opacity: 0; }
    15% { opacity: 0; }
    16% { opacity: 0.8; }
    18% { opacity: 0.2; }
    19% { opacity: 0.6; }
    20% { opacity: 0; }
    60% { opacity: 0; }
    61% { opacity: 0.7; }
    63% { opacity: 0.15; }
    64% { opacity: 0.5; }
    65% { opacity: 0; }
  }
  @keyframes subtleLightning2 {
    0%, 100% { opacity: 0; }
    25% { opacity: 0; }
    26% { opacity: 0.7; }
    28% { opacity: 0.15; }
    29% { opacity: 0.55; }
    30% { opacity: 0; }
    75% { opacity: 0; }
    76% { opacity: 0.6; }
    78% { opacity: 0.2; }
    79% { opacity: 0.5; }
    80% { opacity: 0; }
  }
  @keyframes subtleLightning3 {
    0%, 100% { opacity: 0; }
    10% { opacity: 0; }
    11% { opacity: 0.65; }
    13% { opacity: 0.15; }
    14% { opacity: 0.5; }
    15% { opacity: 0; }
    50% { opacity: 0; }
    51% { opacity: 0.55; }
    53% { opacity: 0.1; }
    54% { opacity: 0.4; }
    55% { opacity: 0; }
  }
  @keyframes glowPulse {
    0%, 100% { opacity: 0.12; }
    50% { opacity: 0.2; }
  }
  @keyframes skyFlashSubtle {
    0%, 100% { opacity: 0; }
    20% { opacity: 0; }
    21% { opacity: 0.2; }
    23% { opacity: 0.08; }
    24% { opacity: 0.15; }
    25% { opacity: 0; }
    70% { opacity: 0; }
    71% { opacity: 0.18; }
    73% { opacity: 0.06; }
    74% { opacity: 0.12; }
    75% { opacity: 0; }
  }
`;
