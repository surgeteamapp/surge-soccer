"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, User, Users, Shield, Wrench, ClipboardList } from "lucide-react";

const roleLabels: Record<string, string> = {
  PLAYER: "Player",
  FAMILY: "Family Member",
  COACH: "Coach",
  TEAM_MANAGER: "Team Manager",
  EQUIPMENT_MANAGER: "Equipment Manager"
};

const roleIcons: Record<string, React.ReactNode> = {
  PLAYER: <User size={24} />,
  FAMILY: <Users size={24} />,
  COACH: <Shield size={24} />,
  TEAM_MANAGER: <ClipboardList size={24} />,
  EQUIPMENT_MANAGER: <Wrench size={24} />
};

function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "PLAYER";
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [jerseyNumber, setJerseyNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [buttonHover, setButtonHover] = useState(false);
  const [buttonActive, setButtonActive] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [passwordLongEnough, setPasswordLongEnough] = useState(true);

  useEffect(() => {
    if (confirmPassword) {
      setPasswordsMatch(password === confirmPassword);
    } else {
      setPasswordsMatch(true);
    }
  }, [password, confirmPassword]);

  useEffect(() => {
    if (password) {
      setPasswordLongEnough(password.length >= 8);
    } else {
      setPasswordLongEnough(true);
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    // Validate name fields
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name");
      return;
    }

    // Validate jersey number for players
    if (role === "PLAYER" && !jerseyNumber.trim()) {
      setError("Please enter your jersey number");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          role,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          jerseyNumber: role === "PLAYER" ? jerseyNumber.trim() : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Sign in after successful registration
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Account created but sign in failed. Please try logging in.");
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
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

  const inputErrorStyle = {
    ...inputStyle,
    border: '1px solid rgba(239, 68, 68, 0.6)',
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
        overflowX: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
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
          maxWidth: '480px',
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
            width={90}
            height={90}
            style={{
              objectFit: 'contain'
            }}
            priority
          />
        </div>

        {/* Role Badge */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            marginBottom: '12px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.4) 0%, rgba(88, 28, 135, 0.5) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.5)',
            color: 'white',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}
        >
          {roleIcons[role]}
          {roleLabels[role] || role}
        </div>
        
        {/* Title */}
        <h1 
          style={{
            fontSize: '1.4rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '8px',
            textShadow: '0 0 20px rgba(138, 43, 226, 0.8), 0 0 40px rgba(138, 43, 226, 0.5)'
          }}
        >
          Welcome {roleLabels[role] || role}!
        </h1>

        <p style={{ color: 'rgba(200, 200, 220, 0.7)', marginBottom: '24px', fontSize: '0.9rem' }}>
          Please register for your team
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
        
        {/* Registration Form */}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {/* Name Fields Row */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(200, 200, 220, 0.9)', fontSize: '0.9rem', fontWeight: '500' }}>
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
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
            <div style={{ flex: 1, textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(200, 200, 220, 0.9)', fontSize: '0.9rem', fontWeight: '500' }}>
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
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
          </div>

          {/* Jersey Number & Email Row for Players */}
          {role === "PLAYER" ? (
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '100px', textAlign: 'left', flexShrink: 0 }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(200, 200, 220, 0.9)', fontSize: '0.9rem', fontWeight: '500' }}>
                  Jersey #
                </label>
                <input
                  type="text"
                  value={jerseyNumber}
                  onChange={(e) => setJerseyNumber(e.target.value.replace(/\D/g, '').slice(0, 2))}
                  placeholder="10"
                  required
                  disabled={isLoading}
                  style={{ ...inputStyle, width: '100%' }}
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
              <div style={{ flex: 1, textAlign: 'left' }}>
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
            </div>
          ) : (
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
          )}

          <div style={{ marginBottom: '8px', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(200, 200, 220, 0.9)', fontSize: '0.9rem', fontWeight: '500' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              disabled={isLoading}
              style={!passwordLongEnough && password ? inputErrorStyle : inputStyle}
              onFocus={(e) => {
                if (passwordLongEnough || !password) {
                  e.target.style.border = '1px solid rgba(168, 85, 247, 0.7)';
                  e.target.style.boxShadow = '0 0 20px rgba(138, 43, 226, 0.3)';
                }
              }}
              onBlur={(e) => {
                if (passwordLongEnough || !password) {
                  e.target.style.border = '1px solid rgba(168, 85, 247, 0.3)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            />
          </div>

          {/* Password length indicator */}
          <div style={{ 
            height: '20px', 
            marginBottom: '8px', 
            textAlign: 'left',
            fontSize: '0.8rem'
          }}>
            {password && (
              passwordLongEnough ? (
                <span style={{ color: '#4ade80' }}>✓ Password is {password.length} characters</span>
              ) : (
                <span style={{ color: '#f87171' }}>✗ Password needs {8 - password.length} more character{8 - password.length !== 1 ? 's' : ''}</span>
              )
            )}
          </div>

          <div style={{ marginBottom: '8px', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(200, 200, 220, 0.9)', fontSize: '0.9rem', fontWeight: '500' }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              disabled={isLoading}
              style={!passwordsMatch && confirmPassword ? inputErrorStyle : inputStyle}
              onFocus={(e) => {
                if (passwordsMatch || !confirmPassword) {
                  e.target.style.border = '1px solid rgba(168, 85, 247, 0.7)';
                  e.target.style.boxShadow = '0 0 20px rgba(138, 43, 226, 0.3)';
                }
              }}
              onBlur={(e) => {
                if (passwordsMatch || !confirmPassword) {
                  e.target.style.border = '1px solid rgba(168, 85, 247, 0.3)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            />
          </div>

          {/* Password match indicator */}
          <div style={{ 
            height: '20px', 
            marginBottom: '16px', 
            textAlign: 'left',
            fontSize: '0.8rem'
          }}>
            {confirmPassword && (
              passwordsMatch ? (
                <span style={{ color: '#4ade80' }}>✓ Passwords match</span>
              ) : (
                <span style={{ color: '#f87171' }}>✗ Passwords do not match</span>
              )
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || (!passwordsMatch && !!confirmPassword) || (!passwordLongEnough && !!password)}
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
              cursor: (isLoading || (!passwordsMatch && !!confirmPassword) || (!passwordLongEnough && !!password)) ? 'not-allowed' : 'pointer',
              opacity: (isLoading || (!passwordsMatch && !!confirmPassword) || (!passwordLongEnough && !!password)) ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Links */}
        <div style={{ marginTop: '20px', display: 'flex', gap: '24px', fontSize: '0.9rem' }}>
          <Link 
            href="/register"
            style={{ color: 'rgba(168, 85, 247, 0.8)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(216, 180, 254, 1)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(168, 85, 247, 0.8)'}
          >
            ← Change Role
          </Link>
          <Link 
            href="/login"
            style={{ color: 'rgba(168, 85, 247, 0.8)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(216, 180, 254, 1)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(168, 85, 247, 0.8)'}
          >
            Already have an account?
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


export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupPageContent />
    </Suspense>
  );
}
