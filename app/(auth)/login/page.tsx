"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [buttonHover, setButtonHover] = useState(false);
  const [buttonActive, setButtonActive] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt started for:', email);
    setIsLoading(true);
    setError("");

    try {
      console.log('Calling signIn...');
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      console.log('SignIn result:', result);

      if (result?.error) {
        console.log('SignIn error:', result.error);
        setError("Invalid email or password");
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        console.log('Login successful, redirecting...');
        router.push("/dashboard");
        router.refresh();
      } else {
        console.log('Login failed - no error but not ok');
        setError("Login failed. Please try again.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login exception:', error);
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 18px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    color: 'white',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box' as const,
  };

  return (
    <div 
      style={{ 
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)',
        minHeight: '100vh',
        width: '100%',
        maxWidth: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      {/* Animated background */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {/* Purple glow orbs */}
        <div 
          style={{
            position: 'absolute',
            top: '25%',
            left: '25%',
            width: '384px',
            height: '384px',
            background: 'rgba(147, 51, 234, 0.2)',
            borderRadius: '50%',
            filter: 'blur(60px)',
            animation: 'pulse 2s ease-in-out infinite'
          }}
        />
        <div 
          style={{
            position: 'absolute',
            bottom: '25%',
            right: '25%',
            width: '384px',
            height: '384px',
            background: 'rgba(88, 28, 135, 0.2)',
            borderRadius: '50%',
            filter: 'blur(60px)',
            animation: 'pulse 2s ease-in-out infinite',
            animationDelay: '1s'
          }}
        />
        
        {/* Lightning Bolt 1 */}
        <svg 
          style={{ position: 'absolute', top: '0', left: '10%', width: '300px', height: '100%', opacity: 0, animation: 'realisticLightning1 8s ease-in-out infinite' }}
          viewBox="0 0 300 800"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="lightning-blur1" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="2" result="blur1" />
              <feGaussianBlur stdDeviation="8" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path 
            d="M150 0 L155 60 L170 65 L145 130 L165 140 L140 220 L160 235 L130 320 L155 340 L125 420 L150 445 L115 540 L145 570 L100 680 L135 720 L90 800" 
            stroke="url(#bolt-gradient1)" 
            strokeWidth="3"
            fill="none"
            filter="url(#lightning-blur1)"
            strokeLinecap="round"
          />
          <path 
            d="M145 130 L180 160 L200 180 L230 220" 
            stroke="#c084fc" 
            strokeWidth="2"
            fill="none"
            filter="url(#lightning-blur1)"
            strokeLinecap="round"
          />
          <linearGradient id="bolt-gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f5d0fe" />
            <stop offset="30%" stopColor="#e879f9" />
            <stop offset="60%" stopColor="#c026d3" />
            <stop offset="100%" stopColor="#86198f" />
          </linearGradient>
        </svg>

        {/* Lightning Bolt 2 */}
        <svg 
          style={{ position: 'absolute', top: '0', right: '15%', width: '250px', height: '100%', opacity: 0, animation: 'realisticLightning2 10s ease-in-out infinite', animationDelay: '3s' }}
          viewBox="0 0 250 800"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="lightning-blur2" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="2" result="blur1" />
              <feGaussianBlur stdDeviation="6" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path 
            d="M125 0 L130 80 L110 90 L140 180 L115 200 L150 300 L120 330 L155 430 L125 470 L160 580 L130 620 L165 720 L140 800" 
            stroke="url(#bolt-gradient2)" 
            strokeWidth="2.5"
            fill="none"
            filter="url(#lightning-blur2)"
            strokeLinecap="round"
          />
          <linearGradient id="bolt-gradient2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fae8ff" />
            <stop offset="40%" stopColor="#d946ef" />
            <stop offset="70%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </svg>

        {/* Lightning Bolt 3 */}
        <svg 
          style={{ position: 'absolute', top: '0', left: '2%', width: '120px', height: '80%', opacity: 0, animation: 'realisticLightning3 11s ease-in-out infinite', animationDelay: '5s' }}
          viewBox="0 0 120 600"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="lightning-blur3" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="2" result="blur1" />
              <feGaussianBlur stdDeviation="6" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path 
            d="M60 0 L65 50 L50 60 L75 130 L55 150 L80 240 L60 270 L85 360 L65 400 L90 500 L70 600" 
            stroke="url(#bolt-gradient3)" 
            strokeWidth="2"
            fill="none"
            filter="url(#lightning-blur3)"
            strokeLinecap="round"
          />
          <linearGradient id="bolt-gradient3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f5d0fe" />
            <stop offset="50%" stopColor="#d946ef" />
            <stop offset="100%" stopColor="#7e22ce" />
          </linearGradient>
        </svg>

        {/* Lightning Bolt 4 */}
        <svg 
          style={{ position: 'absolute', top: '5%', right: '3%', width: '140px', height: '75%', opacity: 0, animation: 'realisticLightning4 13s ease-in-out infinite', animationDelay: '7s' }}
          viewBox="0 0 140 550"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="lightning-blur4" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="2.5" result="blur1" />
              <feGaussianBlur stdDeviation="8" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path 
            d="M70 0 L75 60 L55 75 L85 150 L60 175 L95 270 L70 300 L100 400 L75 440 L110 550" 
            stroke="url(#bolt-gradient4)" 
            strokeWidth="2.2"
            fill="none"
            filter="url(#lightning-blur4)"
            strokeLinecap="round"
          />
          <linearGradient id="bolt-gradient4" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fae8ff" />
            <stop offset="50%" stopColor="#c026d3" />
            <stop offset="100%" stopColor="#6b21a8" />
          </linearGradient>
        </svg>

        {/* Sky flash overlays */}
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'radial-gradient(ellipse at 20% 0%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)',
          opacity: 0,
          animation: 'skyFlash1 8s ease-in-out infinite'
        }} />
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'radial-gradient(ellipse at 80% 0%, rgba(192, 132, 252, 0.12) 0%, transparent 50%)',
          opacity: 0,
          animation: 'skyFlash2 10s ease-in-out infinite',
          animationDelay: '3s'
        }} />
      </div>

      {/* Main Content */}
      <div 
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '30px 40px 40px 40px',
          margin: '20px',
          maxWidth: '450px',
          width: '90%',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(138, 43, 226, 0.12) 50%, rgba(255, 255, 255, 0.06) 100%)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderRadius: '32px',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 0 80px rgba(138, 43, 226, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            inset 0 -1px 0 rgba(255, 255, 255, 0.05),
            inset 1px 0 0 rgba(255, 255, 255, 0.1),
            inset -1px 0 0 rgba(255, 255, 255, 0.1)
          `
        }}
      >
        {/* Logo */}
        <div 
          style={{ 
            marginBottom: '16px',
            padding: '16px',
            borderRadius: '24px',
            background: 'radial-gradient(circle, rgba(138, 43, 226, 0.12) 0%, transparent 70%)',
          }}
        >
          <Image
            src="/florida-surge-logo.png"
            alt="Florida Surge Logo"
            width={100}
            height={100}
            style={{
              objectFit: 'contain'
            }}
            priority
          />
        </div>
        
        {/* Title */}
        <h1 
          style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '8px',
            textShadow: '0 0 20px rgba(138, 43, 226, 0.8), 0 0 40px rgba(138, 43, 226, 0.5)'
          }}
        >
          Welcome Back
        </h1>

        <p style={{ color: 'rgba(200, 200, 220, 0.7)', marginBottom: '24px', fontSize: '0.9rem' }}>
          Sign in to access your dashboard
        </p>

        {/* Error Message */}
        {error && (
          <div 
            style={{
              width: '100%',
              padding: '12px 16px',
              marginBottom: '16px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              fontSize: '0.9rem'
            }}
          >
            {error}
          </div>
        )}
        
        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{ marginBottom: '16px', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(200, 200, 220, 0.9)', fontSize: '0.9rem', fontWeight: '500' }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={isLoading}
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.border = '1px solid rgba(168, 85, 247, 0.7)';
                e.target.style.boxShadow = '0 0 20px rgba(138, 43, 226, 0.3)';
              }}
              onBlur={(e) => {
                e.target.style.border = '1px solid rgba(168, 85, 247, 0.3)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(200, 200, 220, 0.9)', fontSize: '0.9rem', fontWeight: '500' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.border = '1px solid rgba(168, 85, 247, 0.7)';
                e.target.style.boxShadow = '0 0 20px rgba(138, 43, 226, 0.3)';
              }}
              onBlur={(e) => {
                e.target.style.border = '1px solid rgba(168, 85, 247, 0.3)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            onMouseEnter={() => setButtonHover(true)}
            onMouseLeave={() => { setButtonHover(false); setButtonActive(false); }}
            onMouseDown={() => setButtonActive(true)}
            onMouseUp={() => setButtonActive(false)}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              borderRadius: '16px',
              border: buttonHover ? '2px solid rgba(216, 180, 254, 0.8)' : '2px solid rgba(168, 85, 247, 0.4)',
              color: 'white',
              background: buttonActive 
                ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.9) 0%, rgba(126, 34, 206, 1) 100%)'
                : buttonHover 
                  ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.7) 0%, rgba(138, 43, 226, 0.85) 100%)'
                  : 'linear-gradient(135deg, rgba(138, 43, 226, 0.6) 0%, rgba(88, 28, 135, 0.8) 100%)',
              boxShadow: buttonActive
                ? 'inset 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 40px rgba(138, 43, 226, 0.8)'
                : buttonHover 
                  ? '0 0 50px rgba(138, 43, 226, 0.8), 0 0 100px rgba(138, 43, 226, 0.4)'
                  : '0 0 30px rgba(138, 43, 226, 0.5)',
              transform: buttonActive ? 'scale(0.98)' : buttonHover ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Links */}
        <div style={{ marginTop: '20px', display: 'flex', gap: '24px', fontSize: '0.9rem' }}>
          <Link 
            href="/"
            style={{ color: 'rgba(168, 85, 247, 0.8)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(216, 180, 254, 1)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(168, 85, 247, 0.8)'}
          >
            ← Back
          </Link>
          <Link 
            href="/register"
            style={{ color: 'rgba(168, 85, 247, 0.8)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(216, 180, 254, 1)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(168, 85, 247, 0.8)'}
          >
            Register →
          </Link>
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes realisticLightning1 {
          0%, 100% { opacity: 0; }
          2% { opacity: 0; }
          2.5% { opacity: 1; }
          3% { opacity: 0.2; }
          3.5% { opacity: 0.9; }
          4% { opacity: 0.3; }
          4.5% { opacity: 1; }
          5% { opacity: 0.8; }
          6% { opacity: 0; }
        }
        @keyframes realisticLightning2 {
          0%, 100% { opacity: 0; }
          3% { opacity: 0; }
          3.5% { opacity: 0.9; }
          4% { opacity: 0.1; }
          4.5% { opacity: 1; }
          5% { opacity: 0.4; }
          5.5% { opacity: 0.8; }
          6% { opacity: 0; }
        }
        @keyframes realisticLightning3 {
          0%, 100% { opacity: 0; }
          2.5% { opacity: 0; }
          3% { opacity: 0.85; }
          3.3% { opacity: 0.15; }
          3.7% { opacity: 1; }
          4% { opacity: 0.4; }
          4.5% { opacity: 0.7; }
          5% { opacity: 0; }
        }
        @keyframes realisticLightning4 {
          0%, 100% { opacity: 0; }
          2% { opacity: 0; }
          2.4% { opacity: 0.9; }
          2.7% { opacity: 0.2; }
          3% { opacity: 0.95; }
          3.4% { opacity: 0.35; }
          3.8% { opacity: 0.75; }
          4.2% { opacity: 0; }
        }
        @keyframes skyFlash1 {
          0%, 100% { opacity: 0; }
          2% { opacity: 0; }
          2.5% { opacity: 1; }
          3% { opacity: 0.3; }
          3.5% { opacity: 0.8; }
          5% { opacity: 0; }
        }
        @keyframes skyFlash2 {
          0%, 100% { opacity: 0; }
          3% { opacity: 0; }
          3.5% { opacity: 0.8; }
          4% { opacity: 0.2; }
          4.5% { opacity: 0.6; }
          5.5% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
