"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function LandingPage() {
  const [signInHover, setSignInHover] = useState(false);
  const [signInActive, setSignInActive] = useState(false);
  const [roleHover, setRoleHover] = useState(false);
  const [roleActive, setRoleActive] = useState(false);

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
        
        {/* Realistic Lightning Bolt 1 - Left side */}
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
          {/* Main bolt */}
          <path 
            d="M150 0 L155 60 L170 65 L145 130 L165 140 L140 220 L160 235 L130 320 L155 340 L125 420 L150 445 L115 540 L145 570 L100 680 L135 720 L90 800" 
            stroke="url(#bolt-gradient1)" 
            strokeWidth="3"
            fill="none"
            filter="url(#lightning-blur1)"
            strokeLinecap="round"
          />
          {/* Branch 1 */}
          <path 
            d="M145 130 L180 160 L200 180 L230 220" 
            stroke="#c084fc" 
            strokeWidth="2"
            fill="none"
            filter="url(#lightning-blur1)"
            strokeLinecap="round"
          />
          {/* Branch 2 */}
          <path 
            d="M130 320 L95 360 L70 420" 
            stroke="#a855f7" 
            strokeWidth="1.5"
            fill="none"
            filter="url(#lightning-blur1)"
            strokeLinecap="round"
          />
          {/* Branch 3 */}
          <path 
            d="M115 540 L80 580 L50 650 L30 700" 
            stroke="#9333ea" 
            strokeWidth="1.5"
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

        {/* Realistic Lightning Bolt 2 - Right side */}
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
          <path 
            d="M140 180 L175 220 L210 280" 
            stroke="#d8b4fe" 
            strokeWidth="1.5"
            fill="none"
            filter="url(#lightning-blur2)"
            strokeLinecap="round"
          />
          <path 
            d="M155 430 L190 480 L220 560" 
            stroke="#c084fc" 
            strokeWidth="1.5"
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

        {/* Lightning Bolt 3 - Center-left, shorter */}
        <svg 
          style={{ position: 'absolute', top: '10%', left: '30%', width: '180px', height: '60%', opacity: 0, animation: 'realisticLightning3 12s ease-in-out infinite', animationDelay: '5s' }}
          viewBox="0 0 180 500"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="lightning-blur3" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="3" result="blur1" />
              <feGaussianBlur stdDeviation="10" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path 
            d="M90 0 L95 50 L80 60 L105 120 L85 140 L115 220 L90 250 L120 340 L95 380 L130 480 L100 500" 
            stroke="url(#bolt-gradient3)" 
            strokeWidth="2"
            fill="none"
            filter="url(#lightning-blur3)"
            strokeLinecap="round"
          />
          <path 
            d="M105 120 L135 150 L160 200" 
            stroke="#e879f9" 
            strokeWidth="1.2"
            fill="none"
            filter="url(#lightning-blur3)"
            strokeLinecap="round"
          />
          <linearGradient id="bolt-gradient3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f0abfc" />
            <stop offset="50%" stopColor="#c026d3" />
            <stop offset="100%" stopColor="#7e22ce" />
          </linearGradient>
        </svg>

        {/* Lightning Bolt 4 - Right side, different pattern */}
        <svg 
          style={{ position: 'absolute', top: '5%', right: '35%', width: '150px', height: '70%', opacity: 0, animation: 'realisticLightning4 9s ease-in-out infinite', animationDelay: '7s' }}
          viewBox="0 0 150 600"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="lightning-blur4" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="2" result="blur1" />
              <feGaussianBlur stdDeviation="7" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path 
            d="M75 0 L80 70 L60 85 L95 170 L70 195 L105 290 L80 320 L110 420 L85 460 L120 560 L90 600" 
            stroke="url(#bolt-gradient4)" 
            strokeWidth="2"
            fill="none"
            filter="url(#lightning-blur4)"
            strokeLinecap="round"
          />
          <path 
            d="M70 195 L40 240 L20 300" 
            stroke="#d8b4fe" 
            strokeWidth="1.2"
            fill="none"
            filter="url(#lightning-blur4)"
            strokeLinecap="round"
          />
          <linearGradient id="bolt-gradient4" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e9d5ff" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6b21a8" />
          </linearGradient>
        </svg>

        {/* Lightning Bolt 5 - Far left */}
        <svg 
          style={{ position: 'absolute', top: '0', left: '2%', width: '120px', height: '80%', opacity: 0, animation: 'realisticLightning5 11s ease-in-out infinite', animationDelay: '2s' }}
          viewBox="0 0 120 600"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="lightning-blur5" x="-100%" y="-100%" width="300%" height="300%">
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
            stroke="url(#bolt-gradient5)" 
            strokeWidth="2"
            fill="none"
            filter="url(#lightning-blur5)"
            strokeLinecap="round"
          />
          <path 
            d="M75 130 L100 170 L115 220" 
            stroke="#c084fc" 
            strokeWidth="1.2"
            fill="none"
            filter="url(#lightning-blur5)"
            strokeLinecap="round"
          />
          <linearGradient id="bolt-gradient5" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f5d0fe" />
            <stop offset="50%" stopColor="#d946ef" />
            <stop offset="100%" stopColor="#7e22ce" />
          </linearGradient>
        </svg>

        {/* Lightning Bolt 6 - Far right */}
        <svg 
          style={{ position: 'absolute', top: '5%', right: '3%', width: '140px', height: '75%', opacity: 0, animation: 'realisticLightning6 13s ease-in-out infinite', animationDelay: '4.5s' }}
          viewBox="0 0 140 550"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="lightning-blur6" x="-100%" y="-100%" width="300%" height="300%">
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
            stroke="url(#bolt-gradient6)" 
            strokeWidth="2.2"
            fill="none"
            filter="url(#lightning-blur6)"
            strokeLinecap="round"
          />
          <path 
            d="M60 175 L30 220 L10 280" 
            stroke="#e879f9" 
            strokeWidth="1.3"
            fill="none"
            filter="url(#lightning-blur6)"
            strokeLinecap="round"
          />
          <path 
            d="M100 400 L120 450 L135 520" 
            stroke="#a855f7" 
            strokeWidth="1"
            fill="none"
            filter="url(#lightning-blur6)"
            strokeLinecap="round"
          />
          <linearGradient id="bolt-gradient6" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fae8ff" />
            <stop offset="50%" stopColor="#c026d3" />
            <stop offset="100%" stopColor="#6b21a8" />
          </linearGradient>
        </svg>

        {/* Lightning Bolt 7 - Center */}
        <svg 
          style={{ position: 'absolute', top: '0', left: '48%', width: '100px', height: '55%', opacity: 0, animation: 'realisticLightning7 14s ease-in-out infinite', animationDelay: '6.5s' }}
          viewBox="0 0 100 400"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="lightning-blur7" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="2" result="blur1" />
              <feGaussianBlur stdDeviation="5" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path 
            d="M50 0 L55 40 L40 50 L60 110 L45 130 L70 200 L50 230 L75 310 L55 350 L80 400" 
            stroke="url(#bolt-gradient7)" 
            strokeWidth="1.8"
            fill="none"
            filter="url(#lightning-blur7)"
            strokeLinecap="round"
          />
          <path 
            d="M60 110 L80 140 L95 180" 
            stroke="#d8b4fe" 
            strokeWidth="1"
            fill="none"
            filter="url(#lightning-blur7)"
            strokeLinecap="round"
          />
          <linearGradient id="bolt-gradient7" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e9d5ff" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </svg>

        {/* Lightning Bolt 8 - Left-center background */}
        <svg 
          style={{ position: 'absolute', top: '15%', left: '20%', width: '90px', height: '50%', opacity: 0, animation: 'realisticLightning8 15s ease-in-out infinite', animationDelay: '9s' }}
          viewBox="0 0 90 350"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="lightning-blur8" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="3" result="blur1" />
              <feGaussianBlur stdDeviation="9" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path 
            d="M45 0 L50 35 L35 45 L55 100 L40 120 L65 190 L45 220 L70 290 L50 350" 
            stroke="url(#bolt-gradient8)" 
            strokeWidth="1.5"
            fill="none"
            filter="url(#lightning-blur8)"
            strokeLinecap="round"
          />
          <linearGradient id="bolt-gradient8" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f0abfc" />
            <stop offset="50%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#581c87" />
          </linearGradient>
        </svg>

        {/* Sky flash overlay for lightning effect */}
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
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'radial-gradient(ellipse at 50% 0%, rgba(147, 51, 234, 0.1) 0%, transparent 40%)',
          opacity: 0,
          animation: 'skyFlash3 14s ease-in-out infinite',
          animationDelay: '6.5s'
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
          padding: '30px 60px 50px 60px',
          margin: '20px',
          maxWidth: '900px',
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
            marginBottom: '24px',
            padding: '16px',
            borderRadius: '24px',
            background: 'radial-gradient(circle, rgba(138, 43, 226, 0.12) 0%, transparent 70%)',
          }}
        >
          <Image
            src="/florida-surge-logo.png"
            alt="Florida Surge Logo"
            width={140}
            height={140}
            style={{
              objectFit: 'contain'
            }}
            priority
          />
        </div>
        
        {/* Welcome Text */}
        <h1 
          style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: 'white',
            lineHeight: '1.5',
            marginBottom: '24px',
            textAlign: 'center',
            textShadow: '0 0 20px rgba(138, 43, 226, 0.8), 0 0 40px rgba(138, 43, 226, 0.5), 0 0 60px rgba(138, 43, 226, 0.3)'
          }}
        >
          Welcome to Surge's team management app,<br />please sign in or register
        </h1>
        
        {/* Buttons Container */}
        <div 
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '32px'
          }}
        >
          <Link 
            href="/login"
            onMouseEnter={() => setSignInHover(true)}
            onMouseLeave={() => { setSignInHover(false); setSignInActive(false); }}
            onMouseDown={() => setSignInActive(true)}
            onMouseUp={() => setSignInActive(false)}
            style={{
              padding: '32px 0',
              width: '220px',
              fontSize: '1.75rem',
              fontWeight: 'bold',
              borderRadius: '24px',
              color: 'white',
              textAlign: 'center',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: signInActive 
                ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.9) 0%, rgba(126, 34, 206, 1) 100%)'
                : signInHover 
                  ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.7) 0%, rgba(138, 43, 226, 0.85) 100%)'
                  : 'linear-gradient(135deg, rgba(138, 43, 226, 0.6) 0%, rgba(88, 28, 135, 0.8) 100%)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: signInHover 
                ? '2px solid rgba(216, 180, 254, 0.8)' 
                : '2px solid rgba(168, 85, 247, 0.4)',
              boxShadow: signInActive
                ? 'inset 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 40px rgba(138, 43, 226, 0.8)'
                : signInHover 
                  ? '0 0 50px rgba(138, 43, 226, 0.8), 0 0 100px rgba(138, 43, 226, 0.4), inset 0 0 40px rgba(255, 255, 255, 0.15), 0 8px 32px rgba(0, 0, 0, 0.3)'
                  : '0 0 30px rgba(138, 43, 226, 0.5), inset 0 0 30px rgba(255, 255, 255, 0.1), 0 4px 24px rgba(0, 0, 0, 0.2)',
              transform: signInActive 
                ? 'scale(0.97)' 
                : signInHover 
                  ? 'scale(1.05) translateY(-4px)' 
                  : 'scale(1)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <span style={{ 
              position: 'relative', 
              zIndex: 2,
              textShadow: signInHover ? '0 0 20px rgba(255, 255, 255, 0.5)' : 'none'
            }}>
              Sign In
            </span>
          </Link>
          
          {/* Divider */}
          <span 
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'rgba(168, 85, 247, 0.7)',
              textShadow: '0 0 10px rgba(138, 43, 226, 0.5)'
            }}
          >
            or
          </span>
          
          <Link 
            href="/register"
            onMouseEnter={() => setRoleHover(true)}
            onMouseLeave={() => { setRoleHover(false); setRoleActive(false); }}
            onMouseDown={() => setRoleActive(true)}
            onMouseUp={() => setRoleActive(false)}
            style={{
              padding: '32px 0',
              width: '220px',
              fontSize: '1.75rem',
              fontWeight: 'bold',
              borderRadius: '24px',
              color: 'white',
              textAlign: 'center',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: roleActive 
                ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(138, 43, 226, 0.5) 100%)'
                : roleHover 
                  ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(168, 85, 247, 0.35) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(138, 43, 226, 0.15) 100%)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: roleHover 
                ? '2px solid rgba(216, 180, 254, 0.6)' 
                : '2px solid rgba(168, 85, 247, 0.3)',
              boxShadow: roleActive
                ? 'inset 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 30px rgba(138, 43, 226, 0.5)'
                : roleHover 
                  ? '0 0 40px rgba(138, 43, 226, 0.5), 0 0 80px rgba(138, 43, 226, 0.3), inset 0 0 40px rgba(255, 255, 255, 0.1), 0 8px 32px rgba(0, 0, 0, 0.3)'
                  : '0 0 20px rgba(138, 43, 226, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.05), 0 4px 24px rgba(0, 0, 0, 0.2)',
              transform: roleActive 
                ? 'scale(0.97)' 
                : roleHover 
                  ? 'scale(1.05) translateY(-4px)' 
                  : 'scale(1)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <span style={{ 
              position: 'relative', 
              zIndex: 2,
              textShadow: roleHover ? '0 0 20px rgba(255, 255, 255, 0.5)' : 'none'
            }}>
              Register
            </span>
          </Link>
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
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
          2% { opacity: 0; }
          2.3% { opacity: 0.8; }
          2.6% { opacity: 0.2; }
          3% { opacity: 1; }
          3.5% { opacity: 0.5; }
          4% { opacity: 0; }
        }
        @keyframes realisticLightning4 {
          0%, 100% { opacity: 0; }
          4% { opacity: 0; }
          4.3% { opacity: 0.7; }
          4.6% { opacity: 0.15; }
          5% { opacity: 0.9; }
          5.3% { opacity: 0.3; }
          5.8% { opacity: 0.6; }
          6.2% { opacity: 0; }
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
        @keyframes realisticLightning5 {
          0%, 100% { opacity: 0; }
          2.5% { opacity: 0; }
          3% { opacity: 0.85; }
          3.3% { opacity: 0.15; }
          3.7% { opacity: 1; }
          4% { opacity: 0.4; }
          4.5% { opacity: 0.7; }
          5% { opacity: 0; }
        }
        @keyframes realisticLightning6 {
          0%, 100% { opacity: 0; }
          2% { opacity: 0; }
          2.4% { opacity: 0.9; }
          2.7% { opacity: 0.2; }
          3% { opacity: 0.95; }
          3.4% { opacity: 0.35; }
          3.8% { opacity: 0.75; }
          4.2% { opacity: 0; }
        }
        @keyframes realisticLightning7 {
          0%, 100% { opacity: 0; }
          1.5% { opacity: 0; }
          1.8% { opacity: 0.8; }
          2% { opacity: 0.1; }
          2.3% { opacity: 0.9; }
          2.6% { opacity: 0.5; }
          3% { opacity: 0; }
        }
        @keyframes realisticLightning8 {
          0%, 100% { opacity: 0; }
          1.8% { opacity: 0; }
          2% { opacity: 0.7; }
          2.2% { opacity: 0.15; }
          2.5% { opacity: 0.85; }
          2.8% { opacity: 0.3; }
          3.2% { opacity: 0.6; }
          3.5% { opacity: 0; }
        }
        @keyframes skyFlash3 {
          0%, 100% { opacity: 0; }
          1.5% { opacity: 0; }
          1.8% { opacity: 0.7; }
          2% { opacity: 0.2; }
          2.3% { opacity: 0.5; }
          2.8% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
