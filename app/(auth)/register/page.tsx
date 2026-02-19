"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { User, Users, Shield, Wrench, ClipboardList } from "lucide-react";

export default function SelectRolePage() {
  const [playerHover, setPlayerHover] = useState(false);
  const [playerActive, setPlayerActive] = useState(false);
  const [familyHover, setFamilyHover] = useState(false);
  const [familyActive, setFamilyActive] = useState(false);
  const [coachHover, setCoachHover] = useState(false);
  const [coachActive, setCoachActive] = useState(false);
  const [equipmentHover, setEquipmentHover] = useState(false);
  const [equipmentActive, setEquipmentActive] = useState(false);
  const [teamManagerHover, setTeamManagerHover] = useState(false);
  const [teamManagerActive, setTeamManagerActive] = useState(false);

  const roleButtonStyle = (hover: boolean, active: boolean) => ({
    padding: '20px 24px',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box' as const,
    fontSize: '1.15rem',
    fontWeight: 'bold' as const,
    borderRadius: '16px',
    color: 'white',
    textAlign: 'center' as const,
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    background: active 
      ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.9) 0%, rgba(126, 34, 206, 1) 100%)'
      : hover 
        ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.7) 0%, rgba(138, 43, 226, 0.85) 100%)'
        : 'linear-gradient(135deg, rgba(138, 43, 226, 0.5) 0%, rgba(88, 28, 135, 0.7) 100%)',
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    border: hover 
      ? '2px solid rgba(216, 180, 254, 0.8)' 
      : '2px solid rgba(168, 85, 247, 0.4)',
    boxShadow: active
      ? 'inset 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 40px rgba(138, 43, 226, 0.8)'
      : hover 
        ? '0 0 50px rgba(138, 43, 226, 0.8), 0 0 100px rgba(138, 43, 226, 0.4), inset 0 0 40px rgba(255, 255, 255, 0.15), 0 8px 32px rgba(0, 0, 0, 0.3)'
        : '0 0 30px rgba(138, 43, 226, 0.5), inset 0 0 30px rgba(255, 255, 255, 0.1), 0 4px 24px rgba(0, 0, 0, 0.2)',
    transform: active 
      ? 'scale(0.97)' 
      : hover 
        ? 'scale(1.02) translateY(-2px)' 
        : 'scale(1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
  });

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
          <path 
            d="M130 320 L95 360 L70 420" 
            stroke="#a855f7" 
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
          <linearGradient id="bolt-gradient2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fae8ff" />
            <stop offset="40%" stopColor="#d946ef" />
            <stop offset="70%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </svg>

        {/* Lightning Bolt 3 - Far left */}
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

        {/* Lightning Bolt 4 - Far right */}
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
          maxWidth: '500px',
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
            marginBottom: '24px',
            padding: '16px',
            borderRadius: '24px',
            background: 'radial-gradient(circle, rgba(138, 43, 226, 0.12) 0%, transparent 70%)',
          }}
        >
          <Image
            src="/florida-surge-logo.png"
            alt="Florida Surge Logo"
            width={120}
            height={120}
            style={{
              objectFit: 'contain'
            }}
            priority
          />
        </div>
        
        {/* Title */}
        <h1 
          style={{
            fontSize: '1.6rem',
            fontWeight: 'bold',
            color: 'white',
            lineHeight: '1.5',
            marginBottom: '8px',
            textAlign: 'center',
            textShadow: '0 0 20px rgba(138, 43, 226, 0.8), 0 0 40px rgba(138, 43, 226, 0.5), 0 0 60px rgba(138, 43, 226, 0.3)'
          }}
        >
          Select Your Role
        </h1>

        <p style={{ color: 'rgba(200, 200, 220, 0.8)', marginBottom: '32px', fontSize: '1rem' }}>
          Choose how you'll be using the app
        </p>
        
        {/* Role Buttons */}
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            width: '100%'
          }}
        >
          <Link 
            href="/signup?role=PLAYER"
            onMouseEnter={() => setPlayerHover(true)}
            onMouseLeave={() => { setPlayerHover(false); setPlayerActive(false); }}
            onMouseDown={() => setPlayerActive(true)}
            onMouseUp={() => setPlayerActive(false)}
            style={roleButtonStyle(playerHover, playerActive)}
          >
            <User size={24} />
            Player
          </Link>

          <Link 
            href="/signup?role=FAMILY"
            onMouseEnter={() => setFamilyHover(true)}
            onMouseLeave={() => { setFamilyHover(false); setFamilyActive(false); }}
            onMouseDown={() => setFamilyActive(true)}
            onMouseUp={() => setFamilyActive(false)}
            style={roleButtonStyle(familyHover, familyActive)}
          >
            <Users size={24} />
            Family Member
          </Link>

          <Link 
            href="/signup?role=COACH"
            onMouseEnter={() => setCoachHover(true)}
            onMouseLeave={() => { setCoachHover(false); setCoachActive(false); }}
            onMouseDown={() => setCoachActive(true)}
            onMouseUp={() => setCoachActive(false)}
            style={roleButtonStyle(coachHover, coachActive)}
          >
            <Shield size={24} />
            Coach
          </Link>

          <Link 
            href="/signup?role=TEAM_MANAGER"
            onMouseEnter={() => setTeamManagerHover(true)}
            onMouseLeave={() => { setTeamManagerHover(false); setTeamManagerActive(false); }}
            onMouseDown={() => setTeamManagerActive(true)}
            onMouseUp={() => setTeamManagerActive(false)}
            style={roleButtonStyle(teamManagerHover, teamManagerActive)}
          >
            <ClipboardList size={24} />
            Team Manager
          </Link>

          <Link 
            href="/signup?role=EQUIPMENT_MANAGER"
            onMouseEnter={() => setEquipmentHover(true)}
            onMouseLeave={() => { setEquipmentHover(false); setEquipmentActive(false); }}
            onMouseDown={() => setEquipmentActive(true)}
            onMouseUp={() => setEquipmentActive(false)}
            style={roleButtonStyle(equipmentHover, equipmentActive)}
          >
            <Wrench size={24} />
            Equipment Manager
          </Link>
        </div>

        {/* Back Link */}
        <Link 
          href="/"
          style={{
            marginTop: '24px',
            color: 'rgba(168, 85, 247, 0.8)',
            textDecoration: 'none',
            fontSize: '0.95rem',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(216, 180, 254, 1)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(168, 85, 247, 0.8)'}
        >
          ← Back to Sign In
        </Link>
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
