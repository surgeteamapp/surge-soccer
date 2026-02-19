"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  BarChart2, Users, Trophy, Plus, Edit3, Trash2, Save, X, 
  ChevronDown, ChevronLeft, ChevronRight, Calendar, Loader2, UserCog, Pencil, ChevronUp
} from 'lucide-react';
import { safeLocalStorage, STORAGE_KEYS } from '@/lib/localStorage';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useStats, GamePlayerStats, AVAILABLE_SEASONS } from "@/hooks/useStats";

interface PlayerGameInput {
  playerId: string;
  playerName: string;
  minutesPlayed: string;
  goals: string;
  assists: string;
  saves: string;
}

export default function StatsPage() {
  const { currentSeason, setCurrentSeason, getCurrentSeasonTeamStats, getCurrentSeasonPlayerStats, getCurrentSeasonGames, addGameRecord, updateGameRecord, deleteGameRecord, canEditStats, isLoading } = useStats();

  const [activeTab, setActiveTab] = useState("overview");
  const [showSeasonDropdown, setShowSeasonDropdown] = useState(false);
  const [showAddGame, setShowAddGame] = useState(false);
  const [editingGame, setEditingGame] = useState<string | null>(null);
  const [editGameForm, setEditGameForm] = useState<{
    date: string;
    opponent: string;
    homeAway: "HOME" | "AWAY";
    ourScore: string;
    theirScore: string;
    possession: string;
    shots: string;
    shotsOnTarget: string;
    corners: string;
    fouls: string;
    yellowCards: string;
    redCards: string;
  } | null>(null);
  const [showPlayerStats, setShowPlayerStats] = useState(false);
  const [showTeamStats, setShowTeamStats] = useState(false);
  const [showEditTeamStats, setShowEditTeamStats] = useState(false);
  const [showEditPlayerStats, setShowEditPlayerStats] = useState(false);
  const [editPlayerGameStats, setEditPlayerGameStats] = useState<PlayerGameInput[]>([]);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);
  const [datePickerMonth, setDatePickerMonth] = useState(() => {
    const d = new Date();
    return { month: d.getMonth(), year: d.getFullYear() };
  });
  const [editDatePickerMonth, setEditDatePickerMonth] = useState(() => {
    const d = new Date();
    return { month: d.getMonth(), year: d.getFullYear() };
  });
  
  const [newGameForm, setNewGameForm] = useState({
    date: new Date().toISOString().split("T")[0],
    opponent: "",
    homeAway: "HOME" as "HOME" | "AWAY",
    ourScore: "",
    theirScore: "",
    possession: "50",
    shots: "",
    shotsOnTarget: "",
    corners: "",
    fouls: "",
    yellowCards: "",
    redCards: "",
  });

  const teamStats = getCurrentSeasonTeamStats();
  const playerStats = getCurrentSeasonPlayerStats();
  const games = getCurrentSeasonGames();
  const canEdit = canEditStats();
  const goalDiff = teamStats.goalsScored - teamStats.goalsConceded;
  const topScorers = [...playerStats].sort((a, b) => b.goals - a.goals).slice(0, 5);
  
  // Get MVP from localStorage
  const [seasonMvp, setSeasonMvp] = useState("");
  const [showMvpDropdown, setShowMvpDropdown] = useState(false);
  
  // Load MVP from localStorage on mount
  useEffect(() => {
    const saved = safeLocalStorage.getItem(`${STORAGE_KEYS.MVP_PREFIX}${currentSeason}`);
    console.log('Loading MVP from localStorage:', saved);
    setSeasonMvp(saved || "");
  }, [currentSeason]);

  const [playerGameStats, setPlayerGameStats] = useState<PlayerGameInput[]>([]);
  const [lastPlayerStatsKey, setLastPlayerStatsKey] = useState<string>("");

  // Update playerGameStats when playerStats loads or season changes
  // Use a stable key based on player IDs to prevent infinite loops
  const playerStatsKey = playerStats.map(p => p.playerId).sort().join(',') + '-' + currentSeason;
  useEffect(() => {
    if (playerStats.length > 0 && playerStatsKey !== lastPlayerStatsKey) {
      setLastPlayerStatsKey(playerStatsKey);
      setPlayerGameStats(playerStats.map(p => ({
        playerId: p.playerId, playerName: p.playerName, minutesPlayed: "", goals: "", assists: "", saves: "",
      })));
    }
  }, [playerStatsKey, lastPlayerStatsKey, playerStats]);

  const updatePlayerGameStat = (playerId: string, field: keyof PlayerGameInput, value: string) => {
    const sanitized = value.replace(/[^0-9]/g, '');
    setPlayerGameStats(prev => prev.map(p => p.playerId === playerId ? { ...p, [field]: sanitized } : p));
  };

  const handleAddGame = () => {
    const ourScoreNum = parseInt(newGameForm.ourScore) || 0;
    const theirScoreNum = parseInt(newGameForm.theirScore) || 0;
    const result = ourScoreNum > theirScoreNum ? "W" : ourScoreNum < theirScoreNum ? "L" : "D";
    const pStats: GamePlayerStats[] = playerGameStats.filter(p => parseInt(p.minutesPlayed) > 0).map(p => ({
      playerId: p.playerId, playerName: p.playerName, minutesPlayed: parseInt(p.minutesPlayed) || 0, goals: parseInt(p.goals) || 0, assists: parseInt(p.assists) || 0, saves: parseInt(p.saves) || 0,
    }));
    addGameRecord({ season: currentSeason, date: newGameForm.date, opponent: newGameForm.opponent, homeAway: newGameForm.homeAway, ourScore: ourScoreNum, theirScore: theirScoreNum, result: result as "W" | "L" | "D", possession: parseInt(newGameForm.possession) || 50, shots: parseInt(newGameForm.shots) || 0, shotsOnTarget: parseInt(newGameForm.shotsOnTarget) || 0, corners: parseInt(newGameForm.corners) || 0, fouls: parseInt(newGameForm.fouls) || 0, yellowCards: parseInt(newGameForm.yellowCards) || 0, redCards: parseInt(newGameForm.redCards) || 0, playerStats: pStats.length > 0 ? pStats : undefined });
    setNewGameForm({ date: new Date().toISOString().split("T")[0], opponent: "", homeAway: "HOME", ourScore: "", theirScore: "", possession: "50", shots: "", shotsOnTarget: "", corners: "", fouls: "", yellowCards: "", redCards: "" });
    setPlayerGameStats(playerStats.filter(p => p.season === currentSeason).map(p => ({ playerId: p.playerId, playerName: p.playerName, minutesPlayed: "", goals: "", assists: "", saves: "" })));
    setShowPlayerStats(false);
    setShowAddGame(false);
  };

  const startEditGame = (game: typeof games[0]) => {
    setEditingGame(game.id);
    setEditGameForm({
      date: game.date,
      opponent: game.opponent,
      homeAway: game.homeAway,
      ourScore: String(game.ourScore),
      theirScore: String(game.theirScore),
      possession: String(game.possession || 50),
      shots: String(game.shots || 0),
      shotsOnTarget: String(game.shotsOnTarget || 0),
      corners: String(game.corners || 0),
      fouls: String(game.fouls || 0),
      yellowCards: String(game.yellowCards || 0),
      redCards: String(game.redCards || 0),
    });
    // Load existing player stats for this game or initialize from current players
    if (game.playerStats && game.playerStats.length > 0) {
      setEditPlayerGameStats(game.playerStats.map(ps => ({
        playerId: ps.playerId,
        playerName: ps.playerName,
        minutesPlayed: String(ps.minutesPlayed),
        goals: String(ps.goals),
        assists: String(ps.assists),
        saves: String(ps.saves),
      })));
    } else {
      setEditPlayerGameStats(playerStats.map(p => ({
        playerId: p.playerId,
        playerName: p.playerName,
        minutesPlayed: "",
        goals: "",
        assists: "",
        saves: "",
      })));
    }
    setShowEditTeamStats(false);
    setShowEditPlayerStats(false);
  };

  const updateEditPlayerGameStat = (playerId: string, field: keyof PlayerGameInput, value: string) => {
    const sanitized = value.replace(/[^0-9]/g, '');
    setEditPlayerGameStats(prev => prev.map(p => p.playerId === playerId ? { ...p, [field]: sanitized } : p));
  };

  const handleSaveEditGame = () => {
    if (!editingGame || !editGameForm) return;
    const ourScoreNum = parseInt(editGameForm.ourScore) || 0;
    const theirScoreNum = parseInt(editGameForm.theirScore) || 0;
    const result = ourScoreNum > theirScoreNum ? "W" : ourScoreNum < theirScoreNum ? "L" : "D";
    
    // Convert player stats to the correct format
    const pStats: GamePlayerStats[] = editPlayerGameStats.filter(p => parseInt(p.minutesPlayed) > 0).map(p => ({
      playerId: p.playerId,
      playerName: p.playerName,
      minutesPlayed: parseInt(p.minutesPlayed) || 0,
      goals: parseInt(p.goals) || 0,
      assists: parseInt(p.assists) || 0,
      saves: parseInt(p.saves) || 0,
    }));
    
    updateGameRecord(editingGame, {
      date: editGameForm.date,
      opponent: editGameForm.opponent,
      homeAway: editGameForm.homeAway,
      ourScore: ourScoreNum,
      theirScore: theirScoreNum,
      result: result as "W" | "L" | "D",
      possession: parseInt(editGameForm.possession) || 50,
      shots: parseInt(editGameForm.shots) || 0,
      shotsOnTarget: parseInt(editGameForm.shotsOnTarget) || 0,
      corners: parseInt(editGameForm.corners) || 0,
      fouls: parseInt(editGameForm.fouls) || 0,
      yellowCards: parseInt(editGameForm.yellowCards) || 0,
      redCards: parseInt(editGameForm.redCards) || 0,
      playerStats: pStats.length > 0 ? pStats : undefined,
    });
    setEditingGame(null);
    setEditGameForm(null);
    setEditPlayerGameStats([]);
    setShowEditTeamStats(false);
    setShowEditPlayerStats(false);
  };

  const cardStyle: React.CSSProperties = { 
    background: "linear-gradient(135deg, rgba(10, 0, 20, 0.95) 0%, rgba(26, 10, 46, 0.9) 50%, rgba(15, 5, 25, 0.95) 100%)", 
    backdropFilter: "blur(20px)", 
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(138, 43, 226, 0.3)", 
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(138, 43, 226, 0.1)",
    borderRadius: "16px" 
  };
  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: "8px", background: "rgba(138, 43, 226, 0.1)", border: "1px solid rgba(138, 43, 226, 0.3)", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { display: "block", color: "#c4b5fd", fontSize: "0.8rem", marginBottom: "4px", fontWeight: 500 };

  // Date picker helpers
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();
  
  const generateCalendarDays = () => {
    const { month, year } = datePickerMonth;
    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const generateEditCalendarDays = () => {
    const { month, year } = editDatePickerMonth;
    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const selectDate = (day: number) => {
    const { month, year } = datePickerMonth;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setNewGameForm({ ...newGameForm, date: dateStr });
    setShowDatePicker(false);
  };

  const selectEditDate = (day: number) => {
    const { month, year } = editDatePickerMonth;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (editGameForm) {
      setEditGameForm({ 
        ...editGameForm, 
        date: dateStr,
        opponent: editGameForm.opponent || "",
        homeAway: editGameForm.homeAway || "HOME",
        ourScore: editGameForm.ourScore || "",
        theirScore: editGameForm.theirScore || "",
        possession: editGameForm.possession || "50",
        shots: editGameForm.shots || "",
        shotsOnTarget: editGameForm.shotsOnTarget || "",
        corners: editGameForm.corners || "",
        fouls: editGameForm.fouls || "",
        yellowCards: editGameForm.yellowCards || "",
        redCards: editGameForm.redCards || ""
      });
    }
    setShowEditDatePicker(false);
  };

  const navigateEditMonth = (direction: number) => {
    setEditDatePickerMonth(prev => {
      const newMonth = prev.month + direction;
      const newYear = newMonth < 0 ? prev.year - 1 : newMonth > 11 ? prev.year + 1 : prev.year;
      return {
        month: newMonth < 0 ? 11 : newMonth > 11 ? 0 : newMonth,
        year: newYear
      };
    });
  };

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const navigateMonth = (direction: number) => {
    setDatePickerMonth(prev => {
      let newMonth = prev.month + direction;
      let newYear = prev.year;
      if (newMonth < 0) { newMonth = 11; newYear--; }
      if (newMonth > 11) { newMonth = 0; newYear++; }
      return { month: newMonth, year: newYear };
    });
  };

  if (isLoading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}><Loader2 className="h-8 w-8 animate-spin" style={{ color: "#a855f7" }} /></div>;

  return (
    <>
      <style>{`
        /* Custom date input styling */
        input[type="date"] {
          color-scheme: dark;
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.7) sepia(1) saturate(3) hue-rotate(220deg);
          cursor: pointer;
          opacity: 0.8;
          transition: opacity 0.2s ease;
        }
        input[type="date"]::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
        }
        input[type="date"]::-webkit-datetime-edit {
          color: #fff;
        }
        input[type="date"]::-webkit-datetime-edit-fields-wrapper {
          color: #fff;
        }
        
        /* Hide default number input spinners */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
        
        /* Focus states for inputs */
        input:focus {
          outline: none;
          border-color: rgba(168, 85, 247, 0.6) !important;
          box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.2);
        }
        
        /* Custom scrollbar for modal */
        .stats-modal::-webkit-scrollbar {
          width: 8px;
        }
        .stats-modal::-webkit-scrollbar-track {
          background: rgba(138, 43, 226, 0.1);
          border-radius: 4px;
        }
        .stats-modal::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.5);
          border-radius: 4px;
        }
        .stats-modal::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.7);
        }
      `}</style>
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div style={{ ...cardStyle, padding: "24px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <Link 
            href="/settings/players" 
            onMouseEnter={() => setHoveredButton("manage")}
            onMouseLeave={() => setHoveredButton(null)}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px", 
              padding: "12px 18px", 
              borderRadius: "12px", 
              background: hoveredButton === "manage" 
                ? "linear-gradient(135deg, rgba(168, 85, 247, 0.6) 0%, rgba(138, 43, 226, 0.7) 100%)" 
                : "rgba(138, 43, 226, 0.35)", 
              border: "1px solid rgba(138, 43, 226, 0.5)", 
              color: "#fff", 
              textDecoration: "none", 
              fontSize: "0.9rem", 
              fontWeight: "500",
              transform: hoveredButton === "manage" ? "translateY(-2px)" : "none",
              boxShadow: hoveredButton === "manage" 
                ? "0 6px 20px rgba(138, 43, 226, 0.4), 0 0 15px rgba(168, 85, 247, 0.3)" 
                : "0 2px 8px rgba(0, 0, 0, 0.2)",
              transition: "all 0.2s ease"
            }}
          >
            <UserCog style={{ 
              height: "18px", 
              width: "18px",
              transform: hoveredButton === "manage" ? "rotate(15deg)" : "none",
              transition: "transform 0.2s ease"
            }} />
            <span>Manage Players</span>
          </Link>
          <div style={{ textAlign: "center", flex: 1 }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", textShadow: "0 0 20px rgba(138, 43, 226, 0.5)", margin: 0 }}>Statistics & Analytics</h1>
            <p style={{ color: "#9ca3af", fontSize: "0.875rem", margin: "8px 0 0 0" }}>Track team performance, player stats, and game analytics</p>
          </div>
          <div style={{ position: "relative" }}>
            <button 
              onClick={() => setShowSeasonDropdown(!showSeasonDropdown)} 
              onMouseEnter={() => setHoveredButton("season")}
              onMouseLeave={() => setHoveredButton(null)}
              style={{ 
                background: hoveredButton === "season" ? "linear-gradient(135deg, rgba(168, 85, 247, 0.5) 0%, rgba(138, 43, 226, 0.6) 100%)" : "linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(138, 43, 226, 0.4) 100%)", 
                border: "1px solid rgba(168, 85, 247, 0.5)", borderRadius: "12px", padding: "12px 20px", 
                display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: "#fff",
                transform: hoveredButton === "season" ? "translateY(-2px)" : "none",
                boxShadow: hoveredButton === "season" ? "0 4px 12px rgba(138, 43, 226, 0.3)" : "none",
                transition: "all 0.2s ease"
              }}>
              <Trophy style={{ height: "20px", width: "20px", color: "#fbbf24" }} />
              <span style={{ fontWeight: 600 }}>{currentSeason}</span>
              <ChevronDown style={{ height: "16px", width: "16px", color: "#c4b5fd" }} />
            </button>
            {showSeasonDropdown && (
              <div style={{ position: "absolute", top: "100%", right: 0, minWidth: "150px", marginTop: "8px", background: "rgba(20, 10, 40, 0.98)", border: "1px solid rgba(138, 43, 226, 0.4)", borderRadius: "10px", overflow: "hidden", zIndex: 50 }}>
                {AVAILABLE_SEASONS.map(season => (
                  <button 
                    key={season} 
                    onClick={() => { setCurrentSeason(season); setShowSeasonDropdown(false); }} 
                    onMouseEnter={() => setHoveredButton(`season-${season}`)}
                    onMouseLeave={() => setHoveredButton(null)}
                    style={{ 
                      width: "100%", padding: "12px 16px", border: "none", textAlign: "left", cursor: "pointer",
                      background: season === currentSeason 
                        ? "rgba(168, 85, 247, 0.2)" 
                        : hoveredButton === `season-${season}` 
                          ? "rgba(138, 43, 226, 0.15)" 
                          : "transparent",
                      color: season === currentSeason || hoveredButton === `season-${season}` ? "#c4b5fd" : "#9ca3af", 
                      fontWeight: season === currentSeason ? 600 : 400,
                      transition: "all 0.15s ease"
                    }}
                  >
                    {season}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", marginTop: "20px", justifyContent: "center" }}>
          {[{ id: "overview", label: "Overview", icon: BarChart2 }, { id: "players", label: "Players", icon: Users }, { id: "games", label: "Games", icon: Trophy }].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              onMouseEnter={() => setHoveredButton(`tab-${tab.id}`)}
              onMouseLeave={() => setHoveredButton(null)}
              style={{ 
                display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "10px", border: "none", cursor: "pointer", 
                background: activeTab === tab.id 
                  ? "linear-gradient(135deg, rgba(168, 85, 247, 0.5) 0%, rgba(138, 43, 226, 0.6) 100%)" 
                  : hoveredButton === `tab-${tab.id}` 
                    ? "rgba(138, 43, 226, 0.25)" 
                    : "rgba(138, 43, 226, 0.1)", 
                color: activeTab === tab.id || hoveredButton === `tab-${tab.id}` ? "#fff" : "#c4b5fd", 
                fontWeight: activeTab === tab.id ? 600 : 500, 
                fontSize: "0.9rem",
                transform: hoveredButton === `tab-${tab.id}` && activeTab !== tab.id ? "translateY(-1px)" : "none",
                transition: "all 0.2s ease"
              }}
            >
              <tab.icon style={{ height: "16px", width: "16px" }} />{tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
            <div style={{ ...cardStyle, padding: "20px" }}><p style={{ color: "#9ca3af", fontSize: "0.85rem", margin: 0 }}>Win Rate</p><p style={{ color: "#fff", fontSize: "2rem", fontWeight: 700, margin: "8px 0 0 0" }}>{teamStats.winRate}%</p></div>
            <div style={{ ...cardStyle, padding: "20px" }}><p style={{ color: "#9ca3af", fontSize: "0.85rem", margin: 0 }}>Games Played</p><p style={{ color: "#fff", fontSize: "2rem", fontWeight: 700, margin: "8px 0 0 0" }}>{teamStats.gamesPlayed}</p></div>
            <div style={{ ...cardStyle, padding: "20px" }}><p style={{ color: "#9ca3af", fontSize: "0.85rem", margin: 0 }}>Clean Sheets</p><p style={{ color: "#fff", fontSize: "2rem", fontWeight: 700, margin: "8px 0 0 0" }}>{teamStats.cleanSheets}</p></div>
            <div style={{ ...cardStyle, padding: "20px" }}><p style={{ color: "#9ca3af", fontSize: "0.85rem", margin: 0 }}>Goal Diff</p><p style={{ color: "#fff", fontSize: "2rem", fontWeight: 700, margin: "8px 0 0 0" }}>{goalDiff >= 0 ? "+" : ""}{goalDiff}</p></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div style={{ ...cardStyle, padding: "24px" }}>
              <h3 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 600, margin: "0 0 16px 0" }}>Season Record</h3>
              <div style={{ display: "flex", height: "32px", borderRadius: "8px", overflow: "hidden" }}>
                <div style={{ width: `${(teamStats.wins / teamStats.gamesPlayed) * 100}%`, background: "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fff", fontSize: "0.75rem", fontWeight: 600 }}>{teamStats.wins}W</span></div>
                <div style={{ width: `${(teamStats.draws / teamStats.gamesPlayed) * 100}%`, background: "linear-gradient(90deg, #f59e0b 0%, #d97706 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fff", fontSize: "0.75rem", fontWeight: 600 }}>{teamStats.draws}D</span></div>
                <div style={{ width: `${(teamStats.losses / teamStats.gamesPlayed) * 100}%`, background: "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fff", fontSize: "0.75rem", fontWeight: 600 }}>{teamStats.losses}L</span></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px" }}>
                <div style={{ background: "rgba(138, 43, 226, 0.1)", borderRadius: "10px", padding: "12px" }}><p style={{ color: "#9ca3af", fontSize: "0.7rem", margin: 0 }}>Goals Scored</p><p style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 600, margin: 0 }}>{teamStats.goalsScored}</p></div>
                <div style={{ background: "rgba(138, 43, 226, 0.1)", borderRadius: "10px", padding: "12px" }}><p style={{ color: "#9ca3af", fontSize: "0.7rem", margin: 0 }}>Goals Against</p><p style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 600, margin: 0 }}>{teamStats.goalsConceded}</p></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
                <div style={{ background: "rgba(138, 43, 226, 0.1)", borderRadius: "10px", padding: "12px" }}><p style={{ color: "#9ca3af", fontSize: "0.7rem", margin: 0 }}>Season Assists</p><p style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 600, margin: 0 }}>{playerStats.reduce((sum, p) => sum + p.assists, 0)}</p></div>
                <div style={{ background: "rgba(138, 43, 226, 0.1)", borderRadius: "10px", padding: "12px" }}><p style={{ color: "#9ca3af", fontSize: "0.7rem", margin: 0 }}>Season Saves</p><p style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 600, margin: 0 }}>{playerStats.reduce((sum, p) => sum + p.saves, 0)}</p></div>
              </div>
              <div style={{ background: "rgba(138, 43, 226, 0.1)", borderRadius: "10px", padding: "12px", marginTop: "12px" }}>
                <p style={{ color: "#9ca3af", fontSize: "0.7rem", margin: 0 }}>Season MVP</p>
                {canEdit ? (
                  <div style={{ position: "relative", marginTop: "4px" }}>
                    <button
                      type="button"
                      onClick={() => setShowMvpDropdown(!showMvpDropdown)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        background: "rgba(138, 43, 226, 0.15)",
                        border: "1px solid rgba(138, 43, 226, 0.3)",
                        color: "#fff",
                        fontSize: "0.9rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        textAlign: "left",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <span>
                        {seasonMvp ? playerStats.find(p => p.playerId === seasonMvp)?.playerName || "Selected" : "Select MVP..."}
                      </span>
                      <ChevronDown style={{ height: "16px", width: "16px", color: "#9ca3af" }} />
                    </button>
                    {showMvpDropdown && (
                      <div style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        marginTop: "8px",
                        background: "rgba(20, 10, 40, 0.98)",
                        border: "1px solid rgba(138, 43, 226, 0.3)",
                        borderRadius: "12px",
                        padding: "8px",
                        zIndex: 50,
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
                        maxHeight: "200px",
                        overflow: "auto"
                      }}>
                        <button
                          type="button"
                          onClick={() => {
                            setSeasonMvp("");
                            safeLocalStorage.setItem(`${STORAGE_KEYS.MVP_PREFIX}${currentSeason}`, "");
                            setShowMvpDropdown(false);
                          }}
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: "6px",
                            background: "transparent",
                            border: "none",
                            color: "#6b7280",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            textAlign: "left",
                            fontStyle: "italic"
                          }}
                        >
                          Clear selection
                        </button>
                        {playerStats.map(player => (
                          <button
                            key={player.playerId}
                            type="button"
                            onClick={() => {
                              setSeasonMvp(player.playerId);
                              safeLocalStorage.setItem(`${STORAGE_KEYS.MVP_PREFIX}${currentSeason}`, player.playerId);
                              setShowMvpDropdown(false);
                            }}
                            style={{
                              width: "100%",
                              padding: "10px 12px",
                              borderRadius: "6px",
                              background: seasonMvp === player.playerId ? "rgba(168, 85, 247, 0.2)" : "transparent",
                              border: seasonMvp === player.playerId ? "1px solid rgba(168, 85, 247, 0.4)" : "none",
                              color: seasonMvp === player.playerId ? "#c4b5fd" : "#e5e7eb",
                              cursor: "pointer",
                              fontSize: "0.85rem",
                              textAlign: "left",
                              transition: "all 0.15s ease"
                            }}
                          >
                            {player.playerName}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 600, margin: "4px 0 0 0" }}>
                    {seasonMvp ? playerStats.find(p => p.playerId === seasonMvp)?.playerName || "Selected" : "Not selected"}
                  </p>
                )}
              </div>
            </div>
            <div style={{ ...cardStyle, padding: "24px" }}>
              <h3 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 600, margin: "0 0 16px 0" }}>Season Possession</h3>
              {(() => {
                const games = getCurrentSeasonGames();
                const avgPossession = games.length > 0 
                  ? Math.round(games.reduce((sum, g) => sum + (g.possession || 50), 0) / games.length)
                  : 50;
                const possessionData = [
                  { name: "Surge", value: avgPossession, color: "#a855f7" },
                  { name: "Opponents", value: 100 - avgPossession, color: "#4b5563" }
                ];
                return (
                  <>
                    <div style={{ height: "180px", width: "100%" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={possessionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {possessionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ background: "rgba(20, 10, 40, 0.95)", border: "1px solid rgba(138, 43, 226, 0.4)", borderRadius: "8px" }}
                            itemStyle={{ color: "#fff" }}
                            formatter={(value: number) => [`${value}%`, ""]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginTop: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#a855f7" }} />
                        <span style={{ color: "#c4b5fd", fontSize: "0.85rem" }}>Surge: {avgPossession}%</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#4b5563" }} />
                        <span style={{ color: "#9ca3af", fontSize: "0.85rem" }}>Opponents: {100 - avgPossession}%</span>
                      </div>
                    </div>
                    <p style={{ color: "#6b7280", fontSize: "0.75rem", textAlign: "center", marginTop: "12px", margin: "12px 0 0 0" }}>
                      Based on {games.length} game{games.length !== 1 ? "s" : ""} this season
                    </p>
                  </>
                );
              })()}
            </div>
          </div>
        </>
      )}

      {/* Players Tab */}
      {activeTab === "players" && (
        <div style={{ ...cardStyle, padding: "24px" }}>
          <h3 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 600, margin: "0 0 20px 0" }}>Player Statistics - {currentSeason}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", gap: "12px", padding: "12px 16px", background: "rgba(138, 43, 226, 0.1)", borderRadius: "10px", marginBottom: "8px" }}>
            <span style={{ color: "#9ca3af", fontSize: "0.8rem", fontWeight: 600 }}>Player</span>
            <span style={{ color: "#9ca3af", fontSize: "0.8rem", fontWeight: 600, textAlign: "center" }}>GP</span>
            <span style={{ color: "#9ca3af", fontSize: "0.8rem", fontWeight: 600, textAlign: "center" }}>Goals</span>
            <span style={{ color: "#9ca3af", fontSize: "0.8rem", fontWeight: 600, textAlign: "center" }}>Assists</span>
            <span style={{ color: "#9ca3af", fontSize: "0.8rem", fontWeight: 600, textAlign: "center" }}>Minutes</span>
            <span style={{ color: "#9ca3af", fontSize: "0.8rem", fontWeight: 600, textAlign: "center" }}>Rating</span>
          </div>
          {playerStats.map(player => (
            <div key={player.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", gap: "12px", padding: "12px 16px", borderRadius: "10px", marginBottom: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, rgba(138, 43, 226, 0.4) 0%, rgba(168, 85, 247, 0.5) 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#e9d5ff", fontSize: "0.75rem", fontWeight: 600 }}>#{player.jerseyNumber}</div>
                <span style={{ color: "#fff", fontSize: "0.9rem" }}>{player.playerName}</span>
              </div>
              <span style={{ color: "#c4b5fd", textAlign: "center", alignSelf: "center" }}>{player.gamesPlayed}</span>
              <span style={{ color: "#c4b5fd", textAlign: "center", alignSelf: "center" }}>{player.goals}</span>
              <span style={{ color: "#c4b5fd", textAlign: "center", alignSelf: "center" }}>{player.assists}</span>
              <span style={{ color: "#c4b5fd", textAlign: "center", alignSelf: "center" }}>{player.minutesPlayed}</span>
              <span style={{ color: player.rating >= 8 ? "#22c55e" : "#f59e0b", fontWeight: 600, textAlign: "center", alignSelf: "center" }}>{player.rating.toFixed(1)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Games Tab */}
      {activeTab === "games" && (
        <div style={{ ...cardStyle, padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <h3 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 600, margin: 0 }}>Game Results - {currentSeason}</h3>
            {canEdit && (
              <button 
                onClick={() => setShowAddGame(true)} 
                onMouseEnter={() => setHoveredButton("addGame")}
                onMouseLeave={() => setHoveredButton(null)}
                style={{ 
                  display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "10px", 
                  background: hoveredButton === "addGame" 
                    ? "linear-gradient(135deg, rgba(168, 85, 247, 0.6) 0%, rgba(138, 43, 226, 0.7) 100%)" 
                    : "linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(138, 43, 226, 0.5) 100%)", 
                  border: "1px solid rgba(168, 85, 247, 0.5)", color: "#fff", cursor: "pointer", fontWeight: 500,
                  transform: hoveredButton === "addGame" ? "translateY(-2px)" : "none",
                  boxShadow: hoveredButton === "addGame" ? "0 4px 12px rgba(138, 43, 226, 0.3)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                <Plus style={{ height: "16px", width: "16px" }} /> Add Game
              </button>
            )}
          </div>
          {games.map(game => (
            <div key={game.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: "10px", background: "rgba(138, 43, 226, 0.05)", border: "1px solid rgba(138, 43, 226, 0.15)", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: game.result === "W" ? "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)" : game.result === "L" ? "linear-gradient(135deg, #1f1f1f 0%, #000000 100%)" : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.9rem", border: game.result === "L" ? "1px solid rgba(255,255,255,0.2)" : "none" }}>{game.result}</div>
                <div><p style={{ color: "#fff", margin: 0, fontSize: "0.95rem", fontWeight: 500 }}>vs {game.opponent} {game.homeAway === "HOME" ? "(H)" : "(A)"}</p><p style={{ color: "#9ca3af", fontSize: "0.8rem", margin: 0 }}>{new Date(game.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p></div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ background: "rgba(138, 43, 226, 0.2)", padding: "8px 16px", borderRadius: "8px" }}><span style={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem" }}>{game.ourScore} - {game.theirScore}</span></div>
                {canEdit && (
                  <>
                    <button onClick={() => startEditGame(game)} style={{ padding: "8px", background: "rgba(138, 43, 226, 0.2)", border: "1px solid rgba(138, 43, 226, 0.4)", borderRadius: "6px", color: "#c4b5fd", cursor: "pointer" }}><Pencil style={{ height: "16px", width: "16px" }} /></button>
                    <button onClick={() => deleteGameRecord(game.id)} style={{ padding: "8px", background: "rgba(239, 68, 68, 0.2)", border: "1px solid rgba(239, 68, 68, 0.4)", borderRadius: "6px", color: "#fca5a5", cursor: "pointer" }}><Trash2 style={{ height: "16px", width: "16px" }} /></button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Game Modal */}
      {showAddGame && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.8)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
          <div className="stats-modal" style={{ ...cardStyle, padding: "0", width: "100%", maxWidth: "600px", maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(138, 43, 226, 0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ padding: "10px", borderRadius: "10px", background: "rgba(138, 43, 226, 0.2)" }}>
                  <Trophy style={{ height: "20px", width: "20px", color: "#a855f7" }} />
                </div>
                <div>
                  <h2 style={{ color: "#fff", margin: 0, fontSize: "1.1rem", fontWeight: 600 }}>Add Game Result</h2>
                  <p style={{ color: "#9ca3af", margin: 0, fontSize: "0.8rem" }}>{currentSeason}</p>
                </div>
              </div>
              <button onClick={() => setShowAddGame(false)} style={{ background: "rgba(138, 43, 226, 0.1)", border: "1px solid rgba(138, 43, 226, 0.2)", borderRadius: "8px", color: "#9ca3af", cursor: "pointer", padding: "8px", display: "flex" }}><X style={{ height: "18px", width: "18px" }} /></button>
            </div>
            
            {/* Content */}
            <div style={{ padding: "24px", overflow: "auto", flex: 1 }}>
              {/* Match Info */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                <div style={{ position: "relative" }}>
                  <label style={{ ...labelStyle, marginBottom: "8px" }}>Date</label>
                  <button type="button" onClick={() => setShowDatePicker(!showDatePicker)} style={{ ...inputStyle, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                    <span>{formatDisplayDate(newGameForm.date)}</span>
                    <Calendar style={{ height: "16px", width: "16px", color: "#9ca3af" }} />
                  </button>
                  {showDatePicker && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "8px", background: "rgba(20, 10, 40, 0.98)", border: "1px solid rgba(138, 43, 226, 0.3)", borderRadius: "12px", padding: "16px", zIndex: 60, boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                        <button type="button" onClick={() => navigateMonth(-1)} style={{ background: "rgba(138, 43, 226, 0.15)", border: "none", borderRadius: "6px", padding: "6px", cursor: "pointer", color: "#c4b5fd", display: "flex" }}><ChevronLeft style={{ height: "16px", width: "16px" }} /></button>
                        <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem" }}>{monthNames[datePickerMonth.month]} {datePickerMonth.year}</span>
                        <button type="button" onClick={() => navigateMonth(1)} style={{ background: "rgba(138, 43, 226, 0.15)", border: "none", borderRadius: "6px", padding: "6px", cursor: "pointer", color: "#c4b5fd", display: "flex" }}><ChevronRight style={{ height: "16px", width: "16px" }} /></button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", marginBottom: "8px" }}>
                        {dayNames.map(day => (<div key={day} style={{ textAlign: "center", color: "#6b7280", fontSize: "0.7rem", fontWeight: 500, padding: "4px" }}>{day}</div>))}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
                        {generateCalendarDays().map((day, idx) => {
                          const isSelected = day && newGameForm.date === `${datePickerMonth.year}-${String(datePickerMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const isToday = day && new Date().toISOString().split('T')[0] === `${datePickerMonth.year}-${String(datePickerMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          return (<button key={idx} type="button" onClick={() => day && selectDate(day)} disabled={!day} style={{ padding: "8px 4px", borderRadius: "6px", border: isToday && !isSelected ? "1px solid rgba(138, 43, 226, 0.5)" : "none", background: isSelected ? "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)" : "transparent", color: isSelected ? "#fff" : day ? "#c4b5fd" : "transparent", cursor: day ? "pointer" : "default", fontSize: "0.85rem", fontWeight: isSelected ? 600 : 400 }}>{day || ""}</button>);
                        })}
                      </div>
                      <button type="button" onClick={() => { const today = new Date(); setDatePickerMonth({ month: today.getMonth(), year: today.getFullYear() }); selectDate(today.getDate()); }} style={{ width: "100%", marginTop: "12px", padding: "8px", borderRadius: "6px", background: "rgba(138, 43, 226, 0.1)", border: "none", color: "#a855f7", cursor: "pointer", fontSize: "0.8rem", fontWeight: 500 }}>Today</button>
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ ...labelStyle, marginBottom: "8px" }}>Opponent</label>
                  <input type="text" placeholder="Team name" value={newGameForm.opponent} onChange={e => setNewGameForm({ ...newGameForm, opponent: e.target.value })} style={inputStyle} />
                </div>
              </div>

              {/* Location Toggle */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ ...labelStyle, marginBottom: "8px" }}>Location</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <button type="button" onClick={() => setNewGameForm({ ...newGameForm, homeAway: "HOME" })} style={{ padding: "12px", borderRadius: "8px", background: newGameForm.homeAway === "HOME" ? "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)" : "rgba(138, 43, 226, 0.1)", border: "none", color: newGameForm.homeAway === "HOME" ? "#fff" : "#9ca3af", cursor: "pointer", fontWeight: 500, fontSize: "0.9rem" }}>Home</button>
                  <button type="button" onClick={() => setNewGameForm({ ...newGameForm, homeAway: "AWAY" })} style={{ padding: "12px", borderRadius: "8px", background: newGameForm.homeAway === "AWAY" ? "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)" : "rgba(138, 43, 226, 0.1)", border: "none", color: newGameForm.homeAway === "AWAY" ? "#fff" : "#9ca3af", cursor: "pointer", fontWeight: 500, fontSize: "0.9rem" }}>Away</button>
                </div>
              </div>

              {/* Score */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ ...labelStyle, marginBottom: "8px" }}>Final Score</label>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", justifyContent: "center", background: "rgba(138, 43, 226, 0.05)", borderRadius: "12px", padding: "20px" }}>
                  <div style={{ textAlign: "center" }}>
                    <input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0" value={newGameForm.ourScore} onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); setNewGameForm({ ...newGameForm, ourScore: val }); }} style={{ width: "70px", padding: "12px", borderRadius: "10px", background: "rgba(138, 43, 226, 0.15)", border: "1px solid rgba(138, 43, 226, 0.3)", color: "#fff", fontSize: "1.75rem", fontWeight: 700, textAlign: "center" }} />
                    <p style={{ color: "#a855f7", fontSize: "0.75rem", margin: "8px 0 0 0", fontWeight: 500 }}>Surge</p>
                  </div>
                  <span style={{ color: "#4b5563", fontSize: "1.5rem", fontWeight: 300 }}>vs</span>
                  <div style={{ textAlign: "center" }}>
                    <input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0" value={newGameForm.theirScore} onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); setNewGameForm({ ...newGameForm, theirScore: val }); }} style={{ width: "70px", padding: "12px", borderRadius: "10px", background: "rgba(138, 43, 226, 0.15)", border: "1px solid rgba(138, 43, 226, 0.3)", color: "#fff", fontSize: "1.75rem", fontWeight: 700, textAlign: "center" }} />
                    <p style={{ color: "#6b7280", fontSize: "0.75rem", margin: "8px 0 0 0", fontWeight: 500 }}>Opponent</p>
                  </div>
                </div>
              </div>

              {/* Team Stats Accordion */}
              <div style={{ background: "rgba(138, 43, 226, 0.05)", borderRadius: "10px", marginBottom: "12px", overflow: "hidden" }}>
                <button type="button" onClick={() => setShowTeamStats(!showTeamStats)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "transparent", border: "none", cursor: "pointer", padding: "14px 16px" }}>
                  <span style={{ color: "#c4b5fd", fontSize: "0.9rem", fontWeight: 500 }}>Team Statistics</span>
                  {showTeamStats ? <ChevronUp style={{ height: "16px", width: "16px", color: "#9ca3af" }} /> : <ChevronDown style={{ height: "16px", width: "16px", color: "#9ca3af" }} />}
                </button>
                {showTeamStats && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", padding: "0 16px 16px" }}>
                    <div><label style={{ ...labelStyle, fontSize: "0.7rem" }}>Possession %</label><input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="50" value={newGameForm.possession} onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); setNewGameForm({ ...newGameForm, possession: val }); }} style={{ ...inputStyle, padding: "8px", fontSize: "0.85rem" }} /></div>
                    <div><label style={{ ...labelStyle, fontSize: "0.7rem" }}>Shots</label><input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0" value={newGameForm.shots} onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); setNewGameForm({ ...newGameForm, shots: val }); }} style={{ ...inputStyle, padding: "8px", fontSize: "0.85rem" }} /></div>
                    <div><label style={{ ...labelStyle, fontSize: "0.7rem" }}>On Target</label><input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0" value={newGameForm.shotsOnTarget} onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); setNewGameForm({ ...newGameForm, shotsOnTarget: val }); }} style={{ ...inputStyle, padding: "8px", fontSize: "0.85rem" }} /></div>
                    <div><label style={{ ...labelStyle, fontSize: "0.7rem" }}>Corners</label><input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0" value={newGameForm.corners} onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); setNewGameForm({ ...newGameForm, corners: val }); }} style={{ ...inputStyle, padding: "8px", fontSize: "0.85rem" }} /></div>
                    <div><label style={{ ...labelStyle, fontSize: "0.7rem" }}>Fouls</label><input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0" value={newGameForm.fouls} onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); setNewGameForm({ ...newGameForm, fouls: val }); }} style={{ ...inputStyle, padding: "8px", fontSize: "0.85rem" }} /></div>
                    <div><label style={{ ...labelStyle, fontSize: "0.7rem" }}>Yellow Cards</label><input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0" value={newGameForm.yellowCards} onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); setNewGameForm({ ...newGameForm, yellowCards: val }); }} style={{ ...inputStyle, padding: "8px", fontSize: "0.85rem" }} /></div>
                    <div><label style={{ ...labelStyle, fontSize: "0.7rem" }}>Red Cards</label><input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0" value={newGameForm.redCards} onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); setNewGameForm({ ...newGameForm, redCards: val }); }} style={{ ...inputStyle, padding: "8px", fontSize: "0.85rem" }} /></div>
                  </div>
                )}
              </div>

              {/* Player Stats Accordion */}
              <div style={{ background: "rgba(138, 43, 226, 0.05)", borderRadius: "10px", overflow: "hidden" }}>
                <button type="button" onClick={() => setShowPlayerStats(!showPlayerStats)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "transparent", border: "none", cursor: "pointer", padding: "14px 16px" }}>
                  <span style={{ color: "#c4b5fd", fontSize: "0.9rem", fontWeight: 500 }}>Individual Player Stats</span>
                  {showPlayerStats ? <ChevronUp style={{ height: "16px", width: "16px", color: "#9ca3af" }} /> : <ChevronDown style={{ height: "16px", width: "16px", color: "#9ca3af" }} />}
                </button>
                {showPlayerStats && (
                  <div style={{ padding: "0 16px 16px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: "8px", padding: "8px 0", borderBottom: "1px solid rgba(138, 43, 226, 0.15)", marginBottom: "8px" }}>
                      <span style={{ color: "#6b7280", fontSize: "0.75rem", fontWeight: 500 }}>Player</span>
                      <span style={{ color: "#6b7280", fontSize: "0.75rem", fontWeight: 500, textAlign: "center" }}>Min</span>
                      <span style={{ color: "#6b7280", fontSize: "0.75rem", fontWeight: 500, textAlign: "center" }}>Goals</span>
                      <span style={{ color: "#6b7280", fontSize: "0.75rem", fontWeight: 500, textAlign: "center" }}>Assists</span>
                      <span style={{ color: "#6b7280", fontSize: "0.75rem", fontWeight: 500, textAlign: "center" }}>Saves</span>
                    </div>
                    {playerGameStats.map(player => (
                      <div key={player.playerId} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: "8px", alignItems: "center", padding: "6px 0" }}>
                        <span style={{ color: "#e5e7eb", fontSize: "0.85rem" }}>{player.playerName}</span>
                        <input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0" value={player.minutesPlayed} onChange={e => updatePlayerGameStat(player.playerId, "minutesPlayed", e.target.value)} style={{ padding: "6px", borderRadius: "6px", background: "rgba(138, 43, 226, 0.1)", border: "none", color: "#fff", fontSize: "0.85rem", textAlign: "center", width: "100%", boxSizing: "border-box" }} />
                        <input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0" value={player.goals} onChange={e => updatePlayerGameStat(player.playerId, "goals", e.target.value)} style={{ padding: "6px", borderRadius: "6px", background: "rgba(138, 43, 226, 0.1)", border: "none", color: "#fff", fontSize: "0.85rem", textAlign: "center", width: "100%", boxSizing: "border-box" }} />
                        <input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0" value={player.assists} onChange={e => updatePlayerGameStat(player.playerId, "assists", e.target.value)} style={{ padding: "6px", borderRadius: "6px", background: "rgba(138, 43, 226, 0.1)", border: "none", color: "#fff", fontSize: "0.85rem", textAlign: "center", width: "100%", boxSizing: "border-box" }} />
                        <input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0" value={player.saves} onChange={e => updatePlayerGameStat(player.playerId, "saves", e.target.value)} style={{ padding: "6px", borderRadius: "6px", background: "rgba(138, 43, 226, 0.1)", border: "none", color: "#fff", fontSize: "0.85rem", textAlign: "center", width: "100%", boxSizing: "border-box" }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(138, 43, 226, 0.2)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <button onClick={() => setShowAddGame(false)} style={{ padding: "12px", borderRadius: "10px", background: "transparent", border: "1px solid rgba(138, 43, 226, 0.3)", color: "#9ca3af", cursor: "pointer", fontSize: "0.9rem", fontWeight: 500 }}>Cancel</button>
              <button onClick={handleAddGame} disabled={!newGameForm.opponent} style={{ padding: "12px", borderRadius: "10px", background: newGameForm.opponent ? "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)" : "rgba(138, 43, 226, 0.1)", border: "none", color: newGameForm.opponent ? "#fff" : "#6b7280", cursor: newGameForm.opponent ? "pointer" : "not-allowed", fontWeight: 600, fontSize: "0.9rem" }}>Add Game</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Game Modal */}
      {editingGame && editGameForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px", overflow: "auto" }}>
          <div className="stats-modal" style={{ background: "linear-gradient(135deg, rgba(10, 0, 20, 0.98) 0%, rgba(26, 10, 46, 0.98) 50%, rgba(15, 5, 25, 0.98) 100%)", border: "1px solid rgba(138, 43, 226, 0.4)", borderRadius: "20px", padding: "28px", width: "100%", maxWidth: "750px", maxHeight: "90vh", overflow: "auto", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 60px rgba(138, 43, 226, 0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid rgba(138, 43, 226, 0.2)" }}>
              <h3 style={{ color: "#fff", margin: 0, fontSize: "1.3rem", fontWeight: 600 }}>Edit Game</h3>
              <button onClick={() => { setEditingGame(null); setEditGameForm(null); setEditPlayerGameStats([]); }} style={{ background: "rgba(138, 43, 226, 0.2)", border: "1px solid rgba(138, 43, 226, 0.3)", borderRadius: "8px", padding: "8px", cursor: "pointer", color: "#c4b5fd", display: "flex", alignItems: "center", justifyContent: "center" }}><X style={{ height: "18px", width: "18px" }} /></button>
            </div>

            <div style={{ marginBottom: "16px", position: "relative" }}>
              <label style={labelStyle}>Date</label>
              <button type="button" onClick={() => setShowEditDatePicker(!showEditDatePicker)} style={{ ...inputStyle, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                <span>{formatDisplayDate(editGameForm.date)}</span>
                <Calendar style={{ height: "16px", width: "16px", color: "#9ca3af" }} />
              </button>
              {showEditDatePicker && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "8px", background: "rgba(20, 10, 40, 0.98)", border: "1px solid rgba(138, 43, 226, 0.3)", borderRadius: "12px", padding: "16px", zIndex: 60, boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                    <button type="button" onClick={() => navigateEditMonth(-1)} style={{ background: "rgba(138, 43, 226, 0.15)", border: "none", borderRadius: "6px", padding: "6px", cursor: "pointer", color: "#c4b5fd", display: "flex" }}><ChevronLeft style={{ height: "16px", width: "16px" }} /></button>
                    <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem" }}>{monthNames[editDatePickerMonth.month]} {editDatePickerMonth.year}</span>
                    <button type="button" onClick={() => navigateEditMonth(1)} style={{ background: "rgba(138, 43, 226, 0.15)", border: "none", borderRadius: "6px", padding: "6px", cursor: "pointer", color: "#c4b5fd", display: "flex" }}><ChevronRight style={{ height: "16px", width: "16px" }} /></button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", marginBottom: "8px" }}>
                    {dayNames.map(day => (<div key={day} style={{ textAlign: "center", color: "#6b7280", fontSize: "0.7rem", fontWeight: 500, padding: "4px" }}>{day}</div>))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
                    {generateEditCalendarDays().map((day, idx) => {
                      const isSelected = day && editGameForm.date === `${editDatePickerMonth.year}-${String(editDatePickerMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const isToday = day && new Date().toISOString().split('T')[0] === `${editDatePickerMonth.year}-${String(editDatePickerMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      return (<button key={idx} type="button" onClick={() => day && selectEditDate(day)} disabled={!day} style={{ padding: "8px 4px", borderRadius: "6px", border: isToday && !isSelected ? "1px solid rgba(138, 43, 226, 0.5)" : "none", background: isSelected ? "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)" : "transparent", color: isSelected ? "#fff" : day ? "#c4b5fd" : "transparent", cursor: day ? "pointer" : "default", fontSize: "0.85rem", fontWeight: isSelected ? 600 : 400 }}>{day || ""}</button>);
                    })}
                  </div>
                  <button type="button" onClick={() => { const today = new Date(); setEditDatePickerMonth({ month: today.getMonth(), year: today.getFullYear() }); selectEditDate(today.getDate()); }} style={{ width: "100%", marginTop: "12px", padding: "8px", borderRadius: "6px", background: "rgba(138, 43, 226, 0.1)", border: "none", color: "#a855f7", cursor: "pointer", fontSize: "0.8rem", fontWeight: 500 }}>Today</button>
                </div>
              )}
            </div>

            <div style={{ marginBottom: "16px" }}><label style={labelStyle}>Opponent</label><input type="text" placeholder="Team name" value={editGameForm.opponent} onChange={e => setEditGameForm({ ...editGameForm, opponent: e.target.value })} style={inputStyle} /></div>

            <div style={{ marginBottom: "16px" }}><label style={labelStyle}>Location</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <button type="button" onClick={() => setEditGameForm({ ...editGameForm, homeAway: "HOME" })} style={{ padding: "12px", borderRadius: "10px", background: editGameForm.homeAway === "HOME" ? "linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(138, 43, 226, 0.5) 100%)" : "rgba(138, 43, 226, 0.1)", border: editGameForm.homeAway === "HOME" ? "2px solid rgba(168, 85, 247, 0.6)" : "1px solid rgba(138, 43, 226, 0.3)", color: editGameForm.homeAway === "HOME" ? "#fff" : "#c4b5fd", cursor: "pointer", fontWeight: editGameForm.homeAway === "HOME" ? 600 : 500 }}>Home</button>
                <button type="button" onClick={() => setEditGameForm({ ...editGameForm, homeAway: "AWAY" })} style={{ padding: "12px", borderRadius: "10px", background: editGameForm.homeAway === "AWAY" ? "linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(138, 43, 226, 0.5) 100%)" : "rgba(138, 43, 226, 0.1)", border: editGameForm.homeAway === "AWAY" ? "2px solid rgba(168, 85, 247, 0.6)" : "1px solid rgba(138, 43, 226, 0.3)", color: editGameForm.homeAway === "AWAY" ? "#fff" : "#c4b5fd", cursor: "pointer", fontWeight: editGameForm.homeAway === "AWAY" ? 600 : 500 }}>Away</button>
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}><label style={labelStyle}>Final Score</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 50px 1fr", gap: "12px", alignItems: "center" }}>
                <div style={{ background: "rgba(138, 43, 226, 0.08)", borderRadius: "12px", padding: "12px" }}>
                  <input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0" value={editGameForm.ourScore} onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); setEditGameForm({ ...editGameForm, ourScore: val }); }} style={{ ...inputStyle, textAlign: "center", fontSize: "1.5rem", fontWeight: 700, background: "rgba(138, 43, 226, 0.15)", border: "1px solid rgba(168, 85, 247, 0.4)" }} />
                  <p style={{ color: "#a855f7", fontSize: "0.8rem", textAlign: "center", margin: "8px 0 0 0", fontWeight: 500 }}>Our Score</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#7c3aed", fontSize: "2rem", fontWeight: 700 }}>—</span></div>
                <div style={{ background: "rgba(138, 43, 226, 0.08)", borderRadius: "12px", padding: "12px" }}>
                  <input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0" value={editGameForm.theirScore} onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); setEditGameForm({ ...editGameForm, theirScore: val }); }} style={{ ...inputStyle, textAlign: "center", fontSize: "1.5rem", fontWeight: 700, background: "rgba(138, 43, 226, 0.15)", border: "1px solid rgba(168, 85, 247, 0.4)" }} />
                  <p style={{ color: "#a855f7", fontSize: "0.8rem", textAlign: "center", margin: "8px 0 0 0", fontWeight: 500 }}>Their Score</p>
                </div>
              </div>
            </div>

            {/* Team Statistics Section */}
            <div style={{ background: "linear-gradient(135deg, rgba(138, 43, 226, 0.1) 0%, rgba(88, 28, 135, 0.15) 100%)", borderRadius: "14px", padding: "18px", marginBottom: "16px", border: "1px solid rgba(138, 43, 226, 0.2)" }}>
              <button type="button" onClick={() => setShowEditTeamStats(!showEditTeamStats)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
                <h4 style={{ color: "#e9d5ff", margin: 0, fontSize: "0.95rem", fontWeight: 600 }}>Team Statistics</h4>
                <div style={{ background: "rgba(138, 43, 226, 0.2)", borderRadius: "6px", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {showEditTeamStats ? <ChevronUp style={{ height: "16px", width: "16px", color: "#c4b5fd" }} /> : <ChevronDown style={{ height: "16px", width: "16px", color: "#c4b5fd" }} />}
                </div>
              </button>
              {showEditTeamStats && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginTop: "12px" }}>
                  <div><label style={{ ...labelStyle, fontSize: "0.75rem" }}>Possession %</label><input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="50" value={editGameForm.possession} onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); setEditGameForm({ ...editGameForm, possession: val }); }} style={{ ...inputStyle, padding: "8px" }} /></div>
                  <div><label style={{ ...labelStyle, fontSize: "0.75rem" }}>Shots</label><input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0" value={editGameForm.shots} onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); setEditGameForm({ ...editGameForm, shots: val }); }} style={{ ...inputStyle, padding: "8px" }} /></div>
                  <div><label style={{ ...labelStyle, fontSize: "0.75rem" }}>On Target</label><input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0" value={editGameForm.shotsOnTarget} onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); setEditGameForm({ ...editGameForm, shotsOnTarget: val }); }} style={{ ...inputStyle, padding: "8px" }} /></div>
                  <div><label style={{ ...labelStyle, fontSize: "0.75rem" }}>Corners</label><input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0" value={editGameForm.corners} onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); setEditGameForm({ ...editGameForm, corners: val }); }} style={{ ...inputStyle, padding: "8px" }} /></div>
                  <div><label style={{ ...labelStyle, fontSize: "0.75rem" }}>Fouls</label><input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0" value={editGameForm.fouls} onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); setEditGameForm({ ...editGameForm, fouls: val }); }} style={{ ...inputStyle, padding: "8px" }} /></div>
                  <div><label style={{ ...labelStyle, fontSize: "0.75rem" }}>Yellow Cards</label><input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0" value={editGameForm.yellowCards} onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); setEditGameForm({ ...editGameForm, yellowCards: val }); }} style={{ ...inputStyle, padding: "8px" }} /></div>
                  <div><label style={{ ...labelStyle, fontSize: "0.75rem" }}>Red Cards</label><input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0" value={editGameForm.redCards} onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); setEditGameForm({ ...editGameForm, redCards: val }); }} style={{ ...inputStyle, padding: "8px" }} /></div>
                </div>
              )}
            </div>

            {/* Individual Player Stats Section */}
            <div style={{ background: "linear-gradient(135deg, rgba(138, 43, 226, 0.1) 0%, rgba(88, 28, 135, 0.15) 100%)", borderRadius: "14px", padding: "18px", marginBottom: "24px", border: "1px solid rgba(138, 43, 226, 0.2)" }}>
              <button type="button" onClick={() => setShowEditPlayerStats(!showEditPlayerStats)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
                <h4 style={{ color: "#e9d5ff", margin: 0, fontSize: "0.95rem", fontWeight: 600 }}>Individual Player Stats</h4>
                <div style={{ background: "rgba(138, 43, 226, 0.2)", borderRadius: "6px", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {showEditPlayerStats ? <ChevronUp style={{ height: "16px", width: "16px", color: "#c4b5fd" }} /> : <ChevronDown style={{ height: "16px", width: "16px", color: "#c4b5fd" }} />}
                </div>
              </button>
              {showEditPlayerStats && (
                <div style={{ marginTop: "16px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 80px 70px 70px 70px", gap: "12px", padding: "8px 0", borderBottom: "1px solid rgba(138, 43, 226, 0.2)", marginBottom: "8px" }}>
                    <span style={{ color: "#9ca3af", fontSize: "0.8rem", fontWeight: 500 }}>Player</span>
                    <span style={{ color: "#9ca3af", fontSize: "0.8rem", fontWeight: 500, textAlign: "center" }}>Minutes</span>
                    <span style={{ color: "#9ca3af", fontSize: "0.8rem", fontWeight: 500, textAlign: "center" }}>Goals</span>
                    <span style={{ color: "#9ca3af", fontSize: "0.8rem", fontWeight: 500, textAlign: "center" }}>Assists</span>
                    <span style={{ color: "#9ca3af", fontSize: "0.8rem", fontWeight: 500, textAlign: "center" }}>Saves</span>
                  </div>
                  {editPlayerGameStats.map(player => (
                    <div key={player.playerId} style={{ display: "grid", gridTemplateColumns: "2fr 80px 70px 70px 70px", gap: "12px", alignItems: "center", padding: "8px 0" }}>
                      <span style={{ color: "#fff", fontSize: "0.9rem" }}>{player.playerName}</span>
                      <input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0" value={player.minutesPlayed} onChange={e => updateEditPlayerGameStat(player.playerId, "minutesPlayed", e.target.value)} style={{ padding: "8px", borderRadius: "6px", background: "rgba(138, 43, 226, 0.15)", border: "1px solid rgba(138, 43, 226, 0.3)", color: "#fff", fontSize: "0.9rem", textAlign: "center", width: "100%", boxSizing: "border-box" }} />
                      <input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0" value={player.goals} onChange={e => updateEditPlayerGameStat(player.playerId, "goals", e.target.value)} style={{ padding: "8px", borderRadius: "6px", background: "rgba(138, 43, 226, 0.15)", border: "1px solid rgba(138, 43, 226, 0.3)", color: "#fff", fontSize: "0.9rem", textAlign: "center", width: "100%", boxSizing: "border-box" }} />
                      <input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0" value={player.assists} onChange={e => updateEditPlayerGameStat(player.playerId, "assists", e.target.value)} style={{ padding: "8px", borderRadius: "6px", background: "rgba(138, 43, 226, 0.15)", border: "1px solid rgba(138, 43, 226, 0.3)", color: "#fff", fontSize: "0.9rem", textAlign: "center", width: "100%", boxSizing: "border-box" }} />
                      <input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0" value={player.saves} onChange={e => updateEditPlayerGameStat(player.playerId, "saves", e.target.value)} style={{ padding: "8px", borderRadius: "6px", background: "rgba(138, 43, 226, 0.15)", border: "1px solid rgba(138, 43, 226, 0.3)", color: "#fff", fontSize: "0.9rem", textAlign: "center", width: "100%", boxSizing: "border-box" }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <button onClick={() => { setEditingGame(null); setEditGameForm(null); setEditPlayerGameStats([]); }} style={{ padding: "14px", borderRadius: "12px", background: "rgba(138, 43, 226, 0.1)", border: "1px solid rgba(138, 43, 226, 0.3)", color: "#c4b5fd", cursor: "pointer", fontSize: "0.95rem", fontWeight: 500 }}>Cancel</button>
              <button onClick={handleSaveEditGame} disabled={!editGameForm.opponent} style={{ padding: "14px", borderRadius: "12px", background: editGameForm.opponent ? "linear-gradient(135deg, rgba(168, 85, 247, 0.5) 0%, rgba(138, 43, 226, 0.6) 100%)" : "rgba(138, 43, 226, 0.15)", border: editGameForm.opponent ? "1px solid rgba(168, 85, 247, 0.6)" : "1px solid rgba(138, 43, 226, 0.2)", color: editGameForm.opponent ? "#fff" : "#6b7280", cursor: editGameForm.opponent ? "pointer" : "not-allowed", fontWeight: 600, fontSize: "0.95rem", boxShadow: editGameForm.opponent ? "0 4px 15px rgba(138, 43, 226, 0.3)" : "none" }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
