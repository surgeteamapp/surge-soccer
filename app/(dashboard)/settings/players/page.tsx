"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { safeLocalStorage, STORAGE_KEYS } from '@/lib/localStorage';
import Link from "next/link";
import { 
  Users, ArrowLeft, Search, Plus, Edit3, Trash2, Save, X, 
  UserPlus, Link as LinkIcon, Unlink, Shield, Target, Clock,
  ChevronDown, Loader2, Check, AlertCircle, Calendar
} from "lucide-react";

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  jerseyNumber: number;
  position: string;
  email?: string;
  linkedUserId?: string;
  linkedUserName?: string;
  status: 'active' | 'inactive' | 'injured';
  dateOfBirth?: string;
  joinedDate: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function PlayerSettingsPage() {
  console.log('PlayerSettingsPage: Component rendering...');
  
  const { data: session } = useSession();
  console.log('PlayerSettingsPage: Session:', session);
  
  const [isLoading, setIsLoading] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState<string | null>(null);
  const [linkSearchQuery, setLinkSearchQuery] = useState("");
  const [positionDropdownOpen, setPositionDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [editPositionDropdownOpen, setEditPositionDropdownOpen] = useState(false);
  const [editStatusDropdownOpen, setEditStatusDropdownOpen] = useState(false);

  const [newPlayer, setNewPlayer] = useState({
    firstName: "",
    lastName: "",
    jerseyNumber: "",
    position: "Forward",
    email: "",
    status: "active" as const,
    dateOfBirth: "",
  });

  const [editForm, setEditForm] = useState<Partial<Player>>({});
  const hasLoadedInitialRef = useRef(false);

  const userRole = (session?.user as any)?.role;
  const canEdit = userRole === 'COACH' || userRole === 'ADMIN' || userRole === 'TEAM_MANAGER';
  
  console.log('PlayerSettingsPage: UserRole:', userRole, 'CanEdit:', canEdit);

  // Load players from localStorage and fetch users from API on mount
  useEffect(() => {
    console.log('PlayerSettingsPage: useEffect started');
    const loadData = async () => {
      console.log('PlayerSettingsPage: loadData started');
      setIsLoading(true);
      try {
        const savedPlayers = safeLocalStorage.getItem(STORAGE_KEYS.PLAYERS);
        console.log('Loading players from localStorage:', savedPlayers);
        if (savedPlayers) {
          try {
            const parsed = JSON.parse(savedPlayers);
            console.log('Parsed players:', parsed);
            setPlayers(parsed);
          } catch (parseError) {
            console.warn('Failed to parse saved players:', parseError);
            safeLocalStorage.removeItem(STORAGE_KEYS.PLAYERS);
          }
        }
        
        // Fetch registered users from API
        try {
          const res = await fetch('/api/admin/users');
          if (res.ok) {
            const data = await res.json();
            console.log('API response:', data); // Debug log
            if (data.users && Array.isArray(data.users)) {
              const mappedUsers = data.users.map((u: any) => ({
                id: u.id,
                name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Unknown',
                email: u.email || '',
                role: u.role || 'PLAYER'
              }));
              console.log('Mapped users:', mappedUsers); // Debug log
              setAvailableUsers(mappedUsers);
            }
          } else {
            console.log('API failed, status:', res.status); // Debug log
            throw new Error(`API failed with status ${res.status}`);
          }
        } catch (apiError) {
          console.warn('API error, falling back to localStorage:', apiError);
          // Fallback to localStorage if API fails
          const savedUsers = safeLocalStorage.getItem(STORAGE_KEYS.AVAILABLE_USERS);
          if (savedUsers) {
            try {
              setAvailableUsers(JSON.parse(savedUsers));
            } catch (parseError) {
              console.warn('Failed to parse saved available users:', parseError);
              safeLocalStorage.removeItem(STORAGE_KEYS.AVAILABLE_USERS);
            }
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to localStorage
        const savedUsers = safeLocalStorage.getItem(STORAGE_KEYS.AVAILABLE_USERS);
        if (savedUsers) {
          try {
            setAvailableUsers(JSON.parse(savedUsers));
          } catch (parseError) {
            console.warn('Failed to parse saved available users:', parseError);
            safeLocalStorage.removeItem(STORAGE_KEYS.AVAILABLE_USERS);
          }
        }
      }
      console.log('PlayerSettingsPage: loadData completed successfully');
      setIsLoading(false);
      hasLoadedInitialRef.current = true;
    };
    console.log('PlayerSettingsPage: Calling loadData');
    loadData();
  }, []);

  // Save players to localStorage whenever they change (only after initial load)
  useEffect(() => {
    if (!hasLoadedInitialRef.current) return;
    
    console.log('Persisting players to localStorage:', players);
    
    // Prevent race condition: don't overwrite existing data with empty array
    if (players.length === 0) {
      const existingData = safeLocalStorage.getItem(STORAGE_KEYS.PLAYERS);
      if (existingData) {
        try {
          const parsed = JSON.parse(existingData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log('Skipping save - would overwrite non-empty players with empty array');
            return; // Don't overwrite non-empty data with empty array
          }
        } catch (e) {
          // If parsing fails, allow the save
        }
      }
    }
    
    safeLocalStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
    console.log('Players saved to localStorage');
  }, [players]);

  // Save available users to localStorage whenever they change (only after initial load)
  useEffect(() => {
    if (!hasLoadedInitialRef.current) return;
    
    console.log('Persisting available users to localStorage:', availableUsers);
    safeLocalStorage.setItem(STORAGE_KEYS.AVAILABLE_USERS, JSON.stringify(availableUsers));
    console.log('Available users saved to localStorage');
  }, [availableUsers]);

  const filteredPlayers = players.filter(p => {
    try {
      const fullName = `${p.firstName || ''} ${p.lastName || ''}`.trim();
      const jerseyNum = p.jerseyNumber?.toString() || '';
      const position = p.position || '';
      
      return fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
             jerseyNum.includes(searchQuery) ||
             position.toLowerCase().includes(searchQuery.toLowerCase());
    } catch (error) {
      console.warn('Error filtering player:', p, error);
      return false;
    }
  });

  const filteredUsers = availableUsers.filter(u => {
    const matchesSearch = (u.name?.toLowerCase() || '').includes(linkSearchQuery.toLowerCase()) ||
                          (u.email?.toLowerCase() || '').includes(linkSearchQuery.toLowerCase());
    console.log('User:', u.name, 'Search:', linkSearchQuery, 'Matches:', matchesSearch); // Debug log
    return matchesSearch;
  });

  const handleAddPlayer = () => {
    const player: Player = {
      id: `p-${Date.now()}`,
      firstName: newPlayer.firstName,
      lastName: newPlayer.lastName,
      jerseyNumber: parseInt(newPlayer.jerseyNumber) || 0,
      position: newPlayer.position,
      email: newPlayer.email,
      status: newPlayer.status,
      dateOfBirth: newPlayer.dateOfBirth,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setPlayers(prev => [...prev, player]);
    setNewPlayer({ firstName: "", lastName: "", jerseyNumber: "", position: "Forward", email: "", status: "active", dateOfBirth: "" });
    setShowAddPlayer(false);
  };

  const handleUpdatePlayer = (playerId: string) => {
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, ...editForm } : p));
    setEditingPlayer(null);
    setEditForm({});
  };

  const handleDeletePlayer = (playerId: string) => {
    if (confirm('Are you sure you want to remove this player?')) {
      setPlayers(prev => prev.filter(p => p.id !== playerId));
    }
  };

  const handleLinkUser = (playerId: string, user: User) => {
    setPlayers(prev => prev.map(p => 
      p.id === playerId ? { ...p, linkedUserId: user.id, linkedUserName: user.name, email: user.email } : p
    ));
    setAvailableUsers(prev => prev.filter(u => u.id !== user.id));
    setShowLinkModal(null);
    setLinkSearchQuery("");
  };

  const handleUnlinkUser = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (player?.linkedUserId && player?.linkedUserName) {
      setAvailableUsers(prev => [...prev, { id: player.linkedUserId!, name: player.linkedUserName!, email: player.email || '', role: 'PLAYER' }]);
      setPlayers(prev => prev.map(p => 
        p.id === playerId ? { ...p, linkedUserId: undefined, linkedUserName: undefined } : p
      ));
    }
  };

  const startEdit = (player: Player) => {
    setEditForm({ ...player });
    setEditingPlayer(player.id);
  };

  const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
  const statuses = [
    { value: 'active', label: 'Active', color: '#22c55e' },
    { value: 'inactive', label: 'Inactive', color: '#6b7280' },
    { value: 'injured', label: 'Injured', color: '#ef4444' },
  ];

  const cardStyle: React.CSSProperties = { 
    background: "linear-gradient(135deg, rgba(10, 0, 20, 0.95) 0%, rgba(26, 10, 46, 0.9) 50%, rgba(15, 5, 25, 0.95) 100%)", 
    backdropFilter: "blur(20px)", 
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(138, 43, 226, 0.3)", 
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(138, 43, 226, 0.1)",
    borderRadius: "16px" 
  };
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'rgba(138, 43, 226, 0.1)', border: '1px solid rgba(138, 43, 226, 0.3)', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' as const };
  const labelStyle = { display: 'block', color: '#c4b5fd', fontSize: '0.8rem', marginBottom: '4px', fontWeight: '500' as const };

  if (isLoading) {
    console.log('PlayerSettingsPage: Showing loading state');
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#a855f7' }} />
      </div>
    );
  }

  if (!canEdit) {
    console.log('PlayerSettingsPage: Showing access denied state');
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
          <AlertCircle size={48} style={{ color: '#ef4444', margin: '0 auto 16px' }} />
          <h2 style={{ color: '#fff', margin: '0 0 8px 0' }}>Access Denied</h2>
          <p style={{ color: '#9ca3af', margin: 0 }}>Only coaches, admins, and team managers can manage players.</p>
          <Link href="/stats" style={{ display: 'inline-block', marginTop: '20px', padding: '12px 24px', background: 'rgba(138, 43, 226, 0.3)', border: '1px solid rgba(138, 43, 226, 0.5)', borderRadius: '10px', color: '#fff', textDecoration: 'none' }}>Back to Stats</Link>
        </div>
      </div>
    );
  }

  console.log('PlayerSettingsPage: Rendering main content');

  try {
  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ ...cardStyle, padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <Link href="/stats" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(138, 43, 226, 0.2)', border: '1px solid rgba(138, 43, 226, 0.3)', color: '#c4b5fd', textDecoration: 'none' }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#c4b5fd', margin: 0 }}>Player Management</h1>
            <p style={{ color: '#9ca3af', margin: '4px 0 0 0', fontSize: '0.9rem' }}>Manage team roster and link player accounts</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ ...inputStyle, paddingLeft: '40px' }}
            />
          </div>
          <button onClick={() => setShowAddPlayer(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(168, 85, 247, 0.5) 100%)', border: '1px solid rgba(139, 92, 246, 0.5)', color: '#fff', cursor: 'pointer', fontWeight: '500' }}>
            <UserPlus size={18} /> Add Player
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ ...cardStyle, padding: '16px' }}>
          <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0 }}>Active Players</p>
          <p style={{ color: '#22c55e', fontSize: '1.75rem', fontWeight: '700', margin: '4px 0 0 0' }}>{players.filter(p => p.status === 'active').length}</p>
        </div>
        <div style={{ ...cardStyle, padding: '16px' }}>
          <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0 }}>Linked Accounts</p>
          <p style={{ color: '#3b82f6', fontSize: '1.75rem', fontWeight: '700', margin: '4px 0 0 0' }}>{players.filter(p => p.linkedUserId).length}</p>
        </div>
        <div style={{ ...cardStyle, padding: '16px' }}>
          <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0 }}>Injured</p>
          <p style={{ color: '#ef4444', fontSize: '1.75rem', fontWeight: '700', margin: '4px 0 0 0' }}>{players.filter(p => p.status === 'injured').length}</p>
        </div>
        <div style={{ ...cardStyle, padding: '16px' }}>
          <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0 }}>Total Roster</p>
          <p style={{ color: '#a855f7', fontSize: '1.75rem', fontWeight: '700', margin: '4px 0 0 0' }}>{players.length}</p>
        </div>
      </div>

      {/* Players List */}
      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        {/* Table Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '60px 2fr 1fr 1fr 1fr 1fr 140px', gap: '12px', padding: '14px 20px', background: 'rgba(138, 43, 226, 0.15)', borderBottom: '1px solid rgba(138, 43, 226, 0.2)' }}>
          <span style={{ color: '#9ca3af', fontSize: '0.8rem', fontWeight: '600' }}>#</span>
          <span style={{ color: '#9ca3af', fontSize: '0.8rem', fontWeight: '600' }}>Name</span>
          <span style={{ color: '#9ca3af', fontSize: '0.8rem', fontWeight: '600' }}>Position</span>
          <span style={{ color: '#9ca3af', fontSize: '0.8rem', fontWeight: '600' }}>Status</span>
          <span style={{ color: '#9ca3af', fontSize: '0.8rem', fontWeight: '600' }}>Account</span>
          <span style={{ color: '#9ca3af', fontSize: '0.8rem', fontWeight: '600' }}>Joined</span>
          <span style={{ color: '#9ca3af', fontSize: '0.8rem', fontWeight: '600', textAlign: 'center' }}>Actions</span>
        </div>

        {/* Player Rows */}
        {filteredPlayers.map((player) => (
          <div key={player.id}>
            {editingPlayer === player.id ? (
              // Edit Mode
              <div style={{ display: 'grid', gridTemplateColumns: '60px 2fr 1fr 1fr 1fr 1fr 140px', gap: '12px', padding: '12px 20px', background: 'rgba(168, 85, 247, 0.1)', alignItems: 'center' }}>
                <input type="number" value={editForm.jerseyNumber || 0} onChange={(e) => setEditForm({ ...editForm, jerseyNumber: parseInt(e.target.value) || 0 })} style={{ ...inputStyle, padding: '8px', textAlign: 'center' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" value={editForm.firstName || ''} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} placeholder="First" style={{ ...inputStyle, padding: '8px', flex: 1 }} />
                  <input type="text" value={editForm.lastName || ''} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} placeholder="Last" style={{ ...inputStyle, padding: '8px', flex: 1 }} />
                </div>
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => { setEditPositionDropdownOpen(!editPositionDropdownOpen); setEditStatusDropdownOpen(false); }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: editPositionDropdownOpen ? 'rgba(138, 43, 226, 0.25)' : 'linear-gradient(135deg, rgba(138, 43, 226, 0.15) 0%, rgba(88, 28, 135, 0.2) 100%)',
                      border: editPositionDropdownOpen ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid rgba(138, 43, 226, 0.4)',
                      color: '#fff',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{editForm.position || 'Forward'}</span>
                    <ChevronDown size={14} style={{ color: '#c4b5fd', transform: editPositionDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                  </button>
                  {editPositionDropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '4px',
                      background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.98) 0%, rgba(26, 10, 46, 0.98) 100%)',
                      border: '1px solid rgba(138, 43, 226, 0.4)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      zIndex: 20,
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                    }}>
                      {positions.map(pos => (
                        <button
                          key={pos}
                          type="button"
                          onClick={() => { setEditForm({ ...editForm, position: pos }); setEditPositionDropdownOpen(false); }}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            background: editForm.position === pos ? 'rgba(138, 43, 226, 0.3)' : 'transparent',
                            border: 'none',
                            color: editForm.position === pos ? '#c4b5fd' : '#fff',
                            fontSize: '0.85rem',
                            textAlign: 'left',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(138, 43, 226, 0.2)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = editForm.position === pos ? 'rgba(138, 43, 226, 0.3)' : 'transparent'}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => { setEditStatusDropdownOpen(!editStatusDropdownOpen); setEditPositionDropdownOpen(false); }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: editStatusDropdownOpen ? 'rgba(138, 43, 226, 0.25)' : 'linear-gradient(135deg, rgba(138, 43, 226, 0.15) 0%, rgba(88, 28, 135, 0.2) 100%)',
                      border: editStatusDropdownOpen ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid rgba(138, 43, 226, 0.4)',
                      color: '#fff',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statuses.find(s => s.value === (editForm.status || 'active'))?.color }}></span>
                      {statuses.find(s => s.value === (editForm.status || 'active'))?.label}
                    </span>
                    <ChevronDown size={14} style={{ color: '#c4b5fd', transform: editStatusDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                  </button>
                  {editStatusDropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '4px',
                      background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.98) 0%, rgba(26, 10, 46, 0.98) 100%)',
                      border: '1px solid rgba(138, 43, 226, 0.4)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      zIndex: 20,
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                    }}>
                      {statuses.map(s => (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => { setEditForm({ ...editForm, status: s.value as any }); setEditStatusDropdownOpen(false); }}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            background: editForm.status === s.value ? 'rgba(138, 43, 226, 0.3)' : 'transparent',
                            border: 'none',
                            color: '#fff',
                            fontSize: '0.85rem',
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(138, 43, 226, 0.2)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = editForm.status === s.value ? 'rgba(138, 43, 226, 0.3)' : 'transparent'}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.color }}></span>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{player.linkedUserName || '-'}</span>
                <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{player.joinedDate}</span>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                  <button onClick={() => handleUpdatePlayer(player.id)} style={{ padding: '6px 10px', background: 'rgba(34, 197, 94, 0.3)', border: '1px solid rgba(34, 197, 94, 0.5)', borderRadius: '6px', color: '#86efac', cursor: 'pointer' }}><Save size={14} /></button>
                  <button onClick={() => { setEditingPlayer(null); setEditForm({}); }} style={{ padding: '6px 10px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '6px', color: '#fca5a5', cursor: 'pointer' }}><X size={14} /></button>
                </div>
              </div>
            ) : (
              // View Mode
              <div style={{ display: 'grid', gridTemplateColumns: '60px 2fr 1fr 1fr 1fr 1fr 140px', gap: '12px', padding: '14px 20px', borderBottom: '1px solid rgba(138, 43, 226, 0.1)', alignItems: 'center' }}>
                <span style={{ color: '#c4b5fd', fontWeight: '600', fontSize: '1rem' }}>#{player.jerseyNumber}</span>
                <div>
                  <p style={{ color: '#fff', margin: 0, fontWeight: '500' }}>{player.firstName} {player.lastName}</p>
                  {player.email && <p style={{ color: '#9ca3af', margin: '2px 0 0 0', fontSize: '0.75rem' }}>{player.email}</p>}
                </div>
                <span style={{ color: '#c4b5fd', fontSize: '0.9rem' }}>{player.position}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', background: `${statuses.find(s => s.value === player.status)?.color}20`, color: statuses.find(s => s.value === player.status)?.color, fontSize: '0.8rem', width: 'fit-content' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statuses.find(s => s.value === player.status)?.color }}></span>
                  {statuses.find(s => s.value === player.status)?.label}
                </span>
                <div>
                  {player.linkedUserId ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#22c55e', fontSize: '0.85rem' }}>
                      <Check size={14} /> Linked
                    </span>
                  ) : (
                    <button onClick={() => setShowLinkModal(player.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#93c5fd', cursor: 'pointer', fontSize: '0.8rem' }}>
                      <LinkIcon size={12} /> Link
                    </button>
                  )}
                </div>
                <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{new Date(player.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                  <button onClick={() => startEdit(player)} style={{ padding: '6px 10px', background: 'rgba(168, 85, 247, 0.2)', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '6px', color: '#c4b5fd', cursor: 'pointer' }}><Edit3 size={14} /></button>
                  {player.linkedUserId && (
                    <button onClick={() => handleUnlinkUser(player.id)} title="Unlink account" style={{ padding: '6px 10px', background: 'rgba(251, 191, 36, 0.2)', border: '1px solid rgba(251, 191, 36, 0.4)', borderRadius: '6px', color: '#fbbf24', cursor: 'pointer' }}><Unlink size={14} /></button>
                  )}
                  <button onClick={() => handleDeletePlayer(player.id)} style={{ padding: '6px 10px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '6px', color: '#fca5a5', cursor: 'pointer' }}><Trash2 size={14} /></button>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredPlayers.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Users size={48} style={{ color: '#6b7280', margin: '0 auto 12px' }} />
            <p style={{ color: '#9ca3af', margin: 0 }}>No players found</p>
          </div>
        )}
      </div>

      {/* Add Player Modal */}
      {showAddPlayer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ ...cardStyle, padding: '24px', width: '100%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#fff', margin: 0 }}>Add New Player</h2>
              <button onClick={() => setShowAddPlayer(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>First Name</label>
                <input type="text" value={newPlayer.firstName} onChange={(e) => setNewPlayer({ ...newPlayer, firstName: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input type="text" value={newPlayer.lastName} onChange={(e) => setNewPlayer({ ...newPlayer, lastName: e.target.value })} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Jersey Number</label>
                <input 
                  type="text" 
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={newPlayer.jerseyNumber} 
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 99)) {
                      setNewPlayer({ ...newPlayer, jerseyNumber: val });
                    }
                  }} 
                  placeholder="0-99"
                  style={inputStyle} 
                />
              </div>
              <div style={{ position: 'relative' }}>
                <label style={labelStyle}>Position</label>
                <button
                  type="button"
                  onClick={() => { setPositionDropdownOpen(!positionDropdownOpen); setStatusDropdownOpen(false); setDateDropdownOpen(false); }}
                  style={{
                    ...inputStyle,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: positionDropdownOpen ? 'rgba(138, 43, 226, 0.2)' : 'rgba(138, 43, 226, 0.1)',
                  }}
                >
                  <span>{newPlayer.position}</span>
                  <ChevronDown size={16} style={{ color: '#c4b5fd', transition: 'transform 0.2s', transform: positionDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>
                {positionDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.98) 0%, rgba(26, 10, 46, 0.98) 100%)',
                    border: '1px solid rgba(138, 43, 226, 0.4)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    zIndex: 10,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                  }}>
                    {positions.map(pos => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => { setNewPlayer({ ...newPlayer, position: pos }); setPositionDropdownOpen(false); }}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: newPlayer.position === pos ? 'rgba(138, 43, 226, 0.3)' : 'transparent',
                          border: 'none',
                          color: newPlayer.position === pos ? '#c4b5fd' : '#fff',
                          fontSize: '0.9rem',
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(138, 43, 226, 0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = newPlayer.position === pos ? 'rgba(138, 43, 226, 0.3)' : 'transparent'}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Email (optional)</label>
              <input type="email" value={newPlayer.email} onChange={(e) => setNewPlayer({ ...newPlayer, email: e.target.value })} placeholder="player@email.com" style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={{ position: 'relative' }}>
                <label style={labelStyle}>Date of Birth (optional)</label>
                <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#c4b5fd', marginTop: '10px', zIndex: 1 }} />
                <input 
                  type="text" 
                  value={newPlayer.dateOfBirth} 
                  onChange={(e) => setNewPlayer({ ...newPlayer, dateOfBirth: e.target.value })} 
                  placeholder="MM/DD/YYYY"
                  style={{ 
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.15) 0%, rgba(88, 28, 135, 0.2) 100%)',
                    border: '1px solid rgba(138, 43, 226, 0.4)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                  }} 
                />
              </div>
              <div style={{ position: 'relative' }}>
                <label style={labelStyle}>Status</label>
                <button
                  type="button"
                  onClick={() => { setStatusDropdownOpen(!statusDropdownOpen); setPositionDropdownOpen(false); setDateDropdownOpen(false); }}
                  style={{
                    ...inputStyle,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: statusDropdownOpen ? 'rgba(138, 43, 226, 0.2)' : 'rgba(138, 43, 226, 0.1)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: statuses.find(s => s.value === newPlayer.status)?.color }}></span>
                    {statuses.find(s => s.value === newPlayer.status)?.label}
                  </span>
                  <ChevronDown size={16} style={{ color: '#c4b5fd', transition: 'transform 0.2s', transform: statusDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>
                {statusDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.98) 0%, rgba(26, 10, 46, 0.98) 100%)',
                    border: '1px solid rgba(138, 43, 226, 0.4)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    zIndex: 10,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                  }}>
                    {statuses.map(s => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => { setNewPlayer({ ...newPlayer, status: s.value as any }); setStatusDropdownOpen(false); }}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: newPlayer.status === s.value ? 'rgba(138, 43, 226, 0.3)' : 'transparent',
                          border: 'none',
                          color: '#fff',
                          fontSize: '0.9rem',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(138, 43, 226, 0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = newPlayer.status === s.value ? 'rgba(138, 43, 226, 0.3)' : 'transparent'}
                      >
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }}></span>
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button onClick={() => setShowAddPlayer(false)} style={{ padding: '12px', borderRadius: '10px', background: 'rgba(138, 43, 226, 0.1)', border: '1px solid rgba(138, 43, 226, 0.3)', color: '#c4b5fd', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleAddPlayer} disabled={!newPlayer.firstName || !newPlayer.lastName} style={{ padding: '12px', borderRadius: '10px', background: newPlayer.firstName && newPlayer.lastName ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.5) 0%, rgba(168, 85, 247, 0.6) 100%)' : 'rgba(138, 43, 226, 0.2)', border: '1px solid rgba(139, 92, 246, 0.5)', color: newPlayer.firstName && newPlayer.lastName ? '#fff' : '#6b7280', cursor: newPlayer.firstName && newPlayer.lastName ? 'pointer' : 'not-allowed', fontWeight: '600' }}>Add Player</button>
            </div>
          </div>
        </div>
      )}

      {/* Link Account Modal */}
      {showLinkModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ ...cardStyle, padding: '24px', width: '100%', maxWidth: '450px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#93c5fd', margin: 0, fontSize: '1.1rem' }}>Link User Account</h2>
              <button onClick={() => { setShowLinkModal(null); setLinkSearchQuery(""); }} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: '0 0 16px 0' }}>
              Link <strong style={{ color: '#fff' }}>{players.find(p => p.id === showLinkModal)?.firstName} {players.find(p => p.id === showLinkModal)?.lastName}</strong> to a user account:
            </p>

            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input type="text" placeholder="Search users..." value={linkSearchQuery} onChange={(e) => setLinkSearchQuery(e.target.value)} style={{ ...inputStyle, paddingLeft: '36px' }} />
            </div>

            <div style={{ maxHeight: '250px', overflow: 'auto' }}>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <button key={user.id} onClick={() => handleLinkUser(showLinkModal, user)} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '8px', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#93c5fd', fontWeight: '600' }}>{user.name.charAt(0)}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#fff', margin: 0, fontSize: '0.9rem' }}>{user.name}</p>
                      <p style={{ color: '#9ca3af', margin: '2px 0 0 0', fontSize: '0.75rem' }}>{user.email}</p>
                    </div>
                    <LinkIcon size={16} style={{ color: '#93c5fd' }} />
                  </button>
                ))
              ) : (
                <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>No available users to link</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
  } catch (error) {
    console.error('Error rendering PlayerSettingsPage:', error);
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <AlertCircle size={48} style={{ color: '#ef4444', margin: '0 auto 16px' }} />
        <h2 style={{ color: '#fff', margin: '0 0 8px 0' }}>Page Error</h2>
        <p style={{ color: '#9ca3af', margin: '0 0 16px 0' }}>There was an error loading the players page.</p>
        <Link href="/stats" style={{ display: 'inline-block', padding: '12px 24px', background: 'rgba(138, 43, 226, 0.3)', border: '1px solid rgba(138, 43, 226, 0.5)', borderRadius: '10px', color: '#fff', textDecoration: 'none' }}>Back to Stats</Link>
      </div>
    );
  }
}
