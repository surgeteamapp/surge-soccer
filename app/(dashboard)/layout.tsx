"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { glassStyles, pageBackground, dashboardAnimations } from "@/lib/styles";
import "@/lib/dataDebug"; // Load debug utilities

// Icons
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  BarChart2,
  Video,
  BookOpen,
  Award,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  PanelLeftClose,
  PanelLeft,
  Users,
  Activity,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // Sidebar collapsed by default
  const [userRole, setUserRole] = useState<string>("");
  const [menuBtnHover, setMenuBtnHover] = useState(false);
  const [menuBtnActive, setMenuBtnActive] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState<string | null>(null);
  const [signOutHover, setSignOutHover] = useState(false);
  const [signOutActive, setSignOutActive] = useState(false);
  const [msgBtnHover, setMsgBtnHover] = useState(false);
  const [msgBtnActive, setMsgBtnActive] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const hasWarnedUnreadRef = useRef(false);

  // Fetch unread chat message count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!session?.user) return;
      try {
        const res = await fetch('/api/chat/rooms');
        if (!res.ok) {
          // Common during logout/login or session initialization
          if (!hasWarnedUnreadRef.current) {
            console.warn('Unread count fetch failed:', res.status);
            hasWarnedUnreadRef.current = true;
          }
          setUnreadCount(0);
          return;
        }

        const rooms = await res.json();
        // Sum up unread counts from all chat rooms
        const totalUnread = Array.isArray(rooms)
          ? rooms.reduce((sum: number, room: any) => sum + (room?.unreadCount || 0), 0)
          : 0;
        setUnreadCount(totalUnread);
      } catch (error) {
        if (!hasWarnedUnreadRef.current) {
          console.warn('Unread count fetch error');
          hasWarnedUnreadRef.current = true;
        }
        setUnreadCount(0);
      }
    };

    // Only poll when authenticated; otherwise ensure badge is cleared.
    if (status !== 'authenticated') {
      setUnreadCount(0);
      hasWarnedUnreadRef.current = false;
      return;
    }

    fetchUnreadCount();
    // Poll every 10 seconds for chat notifications
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [session, status]);

  useEffect(() => {
    if (session?.user?.role) {
      setUserRole(session.user.role);
    }
  }, [session]);

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["ADMIN", "COACH", "TEAM_MANAGER", "EQUIPMENT_MANAGER", "PLAYER", "FAMILY"],
    },
    {
      name: "Schedule",
      href: "/schedule",
      icon: Calendar,
      roles: ["ADMIN", "COACH", "TEAM_MANAGER", "EQUIPMENT_MANAGER", "PLAYER", "FAMILY"],
    },
    {
      name: "Stats",
      href: "/stats",
      icon: BarChart2,
      roles: ["ADMIN", "COACH", "TEAM_MANAGER", "PLAYER", "FAMILY"],
    },
    {
      name: "Videos",
      href: "/videos",
      icon: Video,
      roles: ["ADMIN", "COACH", "TEAM_MANAGER", "PLAYER", "FAMILY"],
    },
    {
      name: "Playbook",
      href: "/playbooks",
      icon: BookOpen,
      roles: ["ADMIN", "COACH", "TEAM_MANAGER", "PLAYER", "FAMILY"],
    },
    {
      name: "Training",
      href: "/training",
      icon: Award,
      roles: ["ADMIN", "COACH", "TEAM_MANAGER", "PLAYER"],
    },
    {
      name: "Equipment",
      href: "/equipment",
      icon: Settings,
      roles: ["ADMIN", "COACH", "TEAM_MANAGER", "EQUIPMENT_MANAGER"],
    },
    {
      name: "Users",
      href: "/users",
      icon: Users,
      roles: ["ADMIN"],
    },
    {
      name: "Diagnostics",
      href: "/diagnostics",
      icon: Activity,
      roles: ["ADMIN"],
    },
  ];

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/login" });
  };

  const isLinkActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  // Get the user's first name
  const firstName = session?.user?.name 
    ? session.user.name.split(' ')[0] 
    : (session?.user?.email ? session.user.email.split('@')[0] : 'User');

  return (
    <div className="h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)' }}>
      {/* TOP HEADER BAR */}
      <header 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '70px',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          background: 'linear-gradient(90deg, rgba(15, 5, 25, 0.98) 0%, rgba(30, 12, 50, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(138, 43, 226, 0.3)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Left - Toggle button (only show when sidebar is collapsed) */}
        {isSidebarCollapsed && (
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(false)}
            onMouseEnter={() => setMenuBtnHover(true)}
            onMouseLeave={() => { setMenuBtnHover(false); setMenuBtnActive(false); }}
            onMouseDown={() => setMenuBtnActive(true)}
            onMouseUp={() => setMenuBtnActive(false)}
            style={{
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              background: menuBtnActive
                ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.6) 0%, rgba(126, 34, 206, 0.7) 100%)'
                : menuBtnHover
                  ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.45) 0%, rgba(138, 43, 226, 0.55) 100%)'
                  : 'linear-gradient(135deg, rgba(138, 43, 226, 0.3) 0%, rgba(88, 28, 135, 0.4) 100%)',
              border: menuBtnHover
                ? '1px solid rgba(216, 180, 254, 0.7)'
                : '1px solid rgba(168, 85, 247, 0.5)',
              boxShadow: menuBtnActive
                ? 'inset 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(138, 43, 226, 0.5)'
                : menuBtnHover
                  ? '0 0 25px rgba(138, 43, 226, 0.5), 0 4px 15px rgba(0, 0, 0, 0.2)'
                  : '0 0 15px rgba(138, 43, 226, 0.3)',
              cursor: 'pointer',
              color: menuBtnHover ? '#e9d5ff' : '#c4b5fd',
              transform: menuBtnActive ? 'scale(0.95)' : menuBtnHover ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            title="Open Menu"
          >
            <Menu size={24} />
          </button>
        )}
        
        {/* Center - Welcome message on dashboard, Team name on other pages */}
        <h1 
          style={{ 
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '1.75rem',
            fontWeight: 'bold',
            color: '#fff',
            textShadow: '0 0 20px rgba(168, 85, 247, 0.8), 0 0 40px rgba(138, 43, 226, 0.5)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          {/* Florida Surge Logo */}
          <Image 
            src="/florida-surge-logo.png" 
            alt="Florida Surge" 
            width={44} 
            height={44} 
            style={{ 
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 8px rgba(138, 43, 226, 0.6))'
            }} 
          />
          <span style={{
            background: 'linear-gradient(135deg, #c084fc 0%, #a855f7 50%, #7c3aed 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: '800',
            letterSpacing: '-0.02em',
            textShadow: 'none',
            filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.6))',
          }}>
            {pathname === '/dashboard' ? `Welcome, ${firstName}!` : 'Florida Surge'}
          </span>
        </h1>
        
        {/* Right - Messages icon */}
        <Link
          href="/communication"
          onMouseEnter={() => setMsgBtnHover(true)}
          onMouseLeave={() => { setMsgBtnHover(false); setMsgBtnActive(false); }}
          onMouseDown={() => setMsgBtnActive(true)}
          onMouseUp={() => setMsgBtnActive(false)}
          style={{
            position: 'relative',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '12px',
            background: msgBtnActive
              ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.6) 0%, rgba(126, 34, 206, 0.7) 100%)'
              : msgBtnHover
                ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.45) 0%, rgba(138, 43, 226, 0.55) 100%)'
                : 'linear-gradient(135deg, rgba(138, 43, 226, 0.3) 0%, rgba(88, 28, 135, 0.4) 100%)',
            border: msgBtnHover
              ? '1px solid rgba(216, 180, 254, 0.7)'
              : '1px solid rgba(168, 85, 247, 0.5)',
            boxShadow: msgBtnActive
              ? 'inset 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(138, 43, 226, 0.5)'
              : msgBtnHover
                ? '0 0 25px rgba(138, 43, 226, 0.5), 0 4px 15px rgba(0, 0, 0, 0.2)'
                : '0 0 15px rgba(138, 43, 226, 0.3)',
            cursor: 'pointer',
            color: msgBtnHover ? '#e9d5ff' : '#c4b5fd',
            transform: msgBtnActive ? 'scale(0.95)' : msgBtnHover ? 'scale(1.05)' : 'scale(1)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            textDecoration: 'none',
          }}
          title="Messages"
        >
          <MessageSquare size={22} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                minWidth: '20px',
                height: '20px',
                padding: '0 6px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)',
                border: '2px solid rgba(15, 5, 25, 0.9)',
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>
      </header>

      {/* Backdrop - click to close sidebar */}
      {!isSidebarCollapsed && (
        <div 
          onClick={() => setIsSidebarCollapsed(true)}
          style={{
            position: 'fixed',
            top: '70px',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            zIndex: 40,
            cursor: 'pointer',
          }}
        />
      )}

      {/* SIDEBAR - slides from left */}
      <aside 
        style={{
          position: 'fixed',
          top: '70px',
          left: isSidebarCollapsed ? '-320px' : '0',
          width: '320px',
          height: 'calc(100vh - 70px)',
          zIndex: 50,
          transition: 'left 0.3s ease-in-out',
          background: 'linear-gradient(180deg, rgba(10, 0, 20, 0.98) 0%, rgba(26, 10, 46, 0.95) 100%)',
          backdropFilter: 'blur(40px)',
          borderRight: '1px solid rgba(138, 43, 226, 0.3)',
          borderTopRightRadius: '24px',
          borderBottomRightRadius: '24px',
          boxShadow: '4px 0 40px rgba(0, 0, 0, 0.5), 0 0 60px rgba(138, 43, 226, 0.15)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navigation.filter(item => !userRole || item.roles.includes(userRole)).map((item) => {
              const isActive = isLinkActive(item.href);
              const isHovered = hoveredNav === item.name;
              const isPressed = activeNav === item.name;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsSidebarCollapsed(true)}
                  onMouseEnter={() => setHoveredNav(item.name)}
                  onMouseLeave={() => { setHoveredNav(null); setActiveNav(null); }}
                  onMouseDown={() => setActiveNav(item.name)}
                  onMouseUp={() => setActiveNav(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: isActive 
                      ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.35) 0%, rgba(138, 43, 226, 0.25) 100%)'
                      : isPressed
                        ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(138, 43, 226, 0.2) 100%)'
                        : isHovered
                          ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(138, 43, 226, 0.15) 100%)'
                          : 'transparent',
                    border: isActive 
                      ? '1px solid rgba(168, 85, 247, 0.5)'
                      : isHovered
                        ? '1px solid rgba(168, 85, 247, 0.4)'
                        : '1px solid transparent',
                    boxShadow: isActive 
                      ? '0 0 20px rgba(138, 43, 226, 0.3)'
                      : isPressed
                        ? 'inset 0 2px 6px rgba(0, 0, 0, 0.2)'
                        : isHovered
                          ? '0 0 15px rgba(138, 43, 226, 0.2)'
                          : 'none',
                    transform: isPressed ? 'scale(0.98)' : isHovered ? 'translateX(6px)' : 'translateX(0)',
                  }}
                >
                  <item.icon
                    size={22}
                    style={{ 
                      marginRight: '16px',
                      color: isActive ? '#c4b5fd' : isHovered ? '#d8b4fe' : '#9ca3af',
                      transition: 'color 0.2s ease',
                    }}
                  />
                  <span 
                    style={{ 
                      fontSize: '1rem',
                      fontWeight: '500',
                      color: isActive ? '#fff' : isHovered ? '#f3e8ff' : '#d1d5db',
                      textShadow: isActive || isHovered ? '0 0 10px rgba(168, 85, 247, 0.6)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Profile Section */}
        {session?.user && (
          <div 
            style={{
              padding: '20px',
              borderTop: '1px solid rgba(138, 43, 226, 0.3)',
              background: 'linear-gradient(180deg, transparent 0%, rgba(138, 43, 226, 0.1) 100%)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div 
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(138, 43, 226, 0.6)',
                }}
              >
                <User size={24} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#fff' }}>
                  {session.user.name || session.user.email}
                </p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#c4b5fd', textTransform: 'capitalize' }}>
                  {userRole?.toLowerCase().replace("_", " ") || 'User'}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                onMouseEnter={() => setSignOutHover(true)}
                onMouseLeave={() => { setSignOutHover(false); setSignOutActive(false); }}
                onMouseDown={() => setSignOutActive(true)}
                onMouseUp={() => setSignOutActive(false)}
                style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '10px',
                  background: signOutActive
                    ? 'rgba(239, 68, 68, 0.4)'
                    : signOutHover
                      ? 'rgba(239, 68, 68, 0.25)'
                      : 'rgba(138, 43, 226, 0.2)',
                  border: signOutHover
                    ? '1px solid rgba(248, 113, 113, 0.6)'
                    : '1px solid rgba(138, 43, 226, 0.3)',
                  boxShadow: signOutActive
                    ? 'inset 0 2px 6px rgba(0, 0, 0, 0.3)'
                    : signOutHover
                      ? '0 0 20px rgba(239, 68, 68, 0.3)'
                      : 'none',
                  cursor: 'pointer',
                  color: signOutHover ? '#fca5a5' : '#c4b5fd',
                  transform: signOutActive ? 'scale(0.95)' : signOutHover ? 'scale(1.08)' : 'scale(1)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main content area */}
      <div style={{ marginTop: '70px', height: 'calc(100vh - 70px)', overflow: 'auto', overflowX: 'hidden' }}>
        {/* Page content */}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none" style={{ ...pageBackground, overflowX: 'hidden' }}>
          {/* Animated background - lightweight CSS-only lightning */}
          <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
            {/* Purple glow orbs - distributed across full height */}
            <div style={{
              position: 'absolute', top: '10%', right: '10%', width: '350px', height: '350px',
              background: 'rgba(147, 51, 234, 0.12)', borderRadius: '50%', filter: 'blur(80px)',
              animation: 'glowPulse 4s ease-in-out infinite'
            }} />
            <div style={{
              position: 'absolute', top: '45%', left: '5%', width: '300px', height: '300px',
              background: 'rgba(88, 28, 135, 0.1)', borderRadius: '50%', filter: 'blur(80px)',
              animation: 'glowPulse 4s ease-in-out infinite', animationDelay: '2s'
            }} />
            <div style={{
              position: 'absolute', bottom: '10%', right: '20%', width: '280px', height: '280px',
              background: 'rgba(138, 43, 226, 0.1)', borderRadius: '50%', filter: 'blur(80px)',
              animation: 'glowPulse 4s ease-in-out infinite', animationDelay: '1s'
            }} />
            
            {/* SVG Lightning bolts - realistic jagged shapes */}
            <svg 
              style={{ 
                position: 'absolute', top: 0, right: '15%', width: '60px', height: '100%',
                opacity: 0, animation: 'subtleLightning1 4s ease-in-out infinite',
                filter: 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.8)) drop-shadow(0 0 30px rgba(147, 51, 234, 0.5))'
              }}
              viewBox="0 0 60 400" 
              preserveAspectRatio="none"
            >
              <path 
                d="M30 0 L35 40 L45 45 L32 90 L48 100 L28 150 L42 160 L25 220 L38 235 L22 300 L35 320 L20 400" 
                stroke="url(#lightning1)" 
                strokeWidth="3" 
                fill="none" 
                strokeLinecap="round"
              />
              <path 
                d="M32 150 L50 180 L45 190" 
                stroke="url(#lightning1)" 
                strokeWidth="2" 
                fill="none" 
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="lightning1" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(192, 132, 252, 0.9)" />
                  <stop offset="40%" stopColor="rgba(168, 85, 247, 0.7)" />
                  <stop offset="70%" stopColor="rgba(138, 43, 226, 0.4)" />
                  <stop offset="100%" stopColor="rgba(88, 28, 135, 0)" />
                </linearGradient>
              </defs>
            </svg>
            <svg 
              style={{ 
                position: 'absolute', top: '5%', left: '12%', width: '50px', height: '85%',
                opacity: 0, animation: 'subtleLightning2 5s ease-in-out infinite', animationDelay: '1.5s',
                filter: 'drop-shadow(0 0 12px rgba(192, 132, 252, 0.7)) drop-shadow(0 0 25px rgba(168, 85, 247, 0.4))'
              }}
              viewBox="0 0 50 340" 
              preserveAspectRatio="none"
            >
              <path 
                d="M25 0 L20 35 L30 50 L18 100 L35 120 L22 180 L38 200 L15 260 L28 290 L18 340" 
                stroke="url(#lightning2)" 
                strokeWidth="2.5" 
                fill="none" 
                strokeLinecap="round"
              />
              <path 
                d="M22 180 L8 210 L12 225" 
                stroke="url(#lightning2)" 
                strokeWidth="2" 
                fill="none" 
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="lightning2" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(216, 180, 254, 0.85)" />
                  <stop offset="35%" stopColor="rgba(168, 85, 247, 0.6)" />
                  <stop offset="65%" stopColor="rgba(147, 51, 234, 0.35)" />
                  <stop offset="100%" stopColor="rgba(88, 28, 135, 0)" />
                </linearGradient>
              </defs>
            </svg>
            <svg 
              style={{ 
                position: 'absolute', top: '10%', right: '40%', width: '55px', height: '75%',
                opacity: 0, animation: 'subtleLightning3 6s ease-in-out infinite', animationDelay: '3s',
                filter: 'drop-shadow(0 0 10px rgba(147, 51, 234, 0.7)) drop-shadow(0 0 22px rgba(138, 43, 226, 0.4))'
              }}
              viewBox="0 0 55 300" 
              preserveAspectRatio="none"
            >
              <path 
                d="M28 0 L32 30 L22 55 L38 80 L20 130 L35 155 L18 200 L30 230 L22 300" 
                stroke="url(#lightning3)" 
                strokeWidth="2" 
                fill="none" 
                strokeLinecap="round"
              />
              <path 
                d="M20 130 L5 150 L10 165" 
                stroke="url(#lightning3)" 
                strokeWidth="1.5" 
                fill="none" 
                strokeLinecap="round"
              />
              <path 
                d="M35 155 L50 175 L45 185" 
                stroke="url(#lightning3)" 
                strokeWidth="1.5" 
                fill="none" 
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="lightning3" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(168, 85, 247, 0.8)" />
                  <stop offset="40%" stopColor="rgba(147, 51, 234, 0.55)" />
                  <stop offset="70%" stopColor="rgba(138, 43, 226, 0.3)" />
                  <stop offset="100%" stopColor="rgba(88, 28, 135, 0)" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Sky flash overlay - covers full page */}
            <div style={{ 
              position: 'absolute', inset: 0, 
              background: 'radial-gradient(ellipse at 50% 30%, rgba(168, 85, 247, 0.08) 0%, transparent 60%)',
              opacity: 0, animation: 'skyFlashSubtle 5s ease-in-out infinite'
            }} />
          </div>

          <div style={{ padding: '24px', minHeight: '100%', position: 'relative', zIndex: 10, width: '100%' }}>
            <div style={{ maxWidth: '1280px', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Inject animations */}
      <style jsx global>{dashboardAnimations}</style>
    </div>
  );
}
