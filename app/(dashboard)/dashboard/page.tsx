"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  BarChart2,
  Calendar,
  MessageSquare,
  Video,
  ClipboardList,
  Target,
  Trophy,
  Clock,
  CheckCircle2,
  Play,
  Users,
  Shield,
  Eye,
  ChevronDown,
  UserCog,
  Bell,
  FileText,
  Activity,
  BookOpen,
  Settings,
  X,
  Plus,
  Check,
  Dumbbell,
  Package
} from "lucide-react";

// Consistent text styles matching landing page
const textStyles = {
  heading: {
    color: 'white',
    textShadow: '0 0 20px rgba(138, 43, 226, 0.8), 0 0 40px rgba(138, 43, 226, 0.5), 0 0 60px rgba(138, 43, 226, 0.3)'
  },
  subheading: {
    color: 'rgba(216, 180, 254, 1)',
    textShadow: '0 0 10px rgba(138, 43, 226, 0.4)'
  },
  body: {
    color: 'rgba(209, 213, 219, 1)'
  },
  link: {
    color: 'rgba(168, 85, 247, 1)',
    textDecoration: 'none',
    transition: 'all 0.2s ease'
  }
};

// Glass card style matching sidebar design
const cardStyle = {
  background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.95) 0%, rgba(26, 10, 46, 0.9) 50%, rgba(15, 5, 25, 0.95) 100%)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(138, 43, 226, 0.3)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(138, 43, 226, 0.1)',
  borderRadius: '16px',
};

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  recentSignups: number;
  roleCounts: Record<string, number>;
}

interface SystemHealth {
  status: "healthy" | "warning" | "error";
  loading: boolean;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [actualRole, setActualRole] = useState("");
  const [viewAsRole, setViewAsRole] = useState("");
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [switchViewHover, setSwitchViewHover] = useState(false);
  const [switchViewActive, setSwitchViewActive] = useState(false);
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({ status: "healthy", loading: true });

  const isAdmin = actualRole?.toUpperCase() === "ADMIN";
  const availableRoles = ["ADMIN", "COACH", "TEAM_MANAGER", "PLAYER", "EQUIPMENT_MANAGER", "FAMILY"];

  // Fetch admin stats when user is admin
  useEffect(() => {
    const fetchAdminData = async () => {
      if (isAdmin) {
        try {
          // Fetch user stats
          const statsRes = await fetch("/api/admin/stats");
          if (statsRes.ok) {
            const stats = await statsRes.json();
            setAdminStats(stats);
          }
          
          // Fetch system health
          const healthRes = await fetch("/api/admin/diagnostics");
          if (healthRes.ok) {
            const health = await healthRes.json();
            setSystemHealth({ status: health.overallStatus, loading: false });
          }
        } catch (error) {
          console.error("Error fetching admin data:", error);
          setSystemHealth({ status: "error", loading: false });
        }
      }
    };
    
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (session?.user) {
      // Get name from session, or extract from email if not available
      let name = session.user.name || "";
      if (!name && session.user.email) {
        // Extract name from email (before @)
        const emailName = session.user.email.split('@')[0];
        // Capitalize first letter
        name = emailName.charAt(0).toUpperCase() + emailName.slice(1);
      }
      setUserName(name);
      const role = session.user.role || "";
      setActualRole(role);
      setUserRole(role);
      setViewAsRole(role);
    }
  }, [session]);

  const switchViewRole = (newRole: string) => {
    setViewAsRole(newRole);
    setUserRole(newRole);
    setShowRoleSwitcher(false);
  };

  // Player Dashboard - Compact Design
  const PlayerDashboard = () => {
    const playerStats = { goals: 12, assists: 8, gamesPlayed: 15, passAccuracy: 87, shotAccuracy: 68 };
    const assignments = [
      { id: 1, title: "Watch defensive positioning video", type: "video", dueDate: "Dec 3", completed: false },
      { id: 2, title: "Complete 50 juggling reps", type: "training", dueDate: "Dec 2", completed: false },
      { id: 3, title: "Review play #7 in playbook", type: "playbook", dueDate: "Dec 4", completed: true },
    ];
    const recentFootage = { title: "vs. Thunder FC - Highlights", date: "Nov 28", duration: "8:32" };

    return (
      <div className="grid grid-cols-12 gap-4">
        {/* Stats Row - Full Width, Compact */}
        <div className="col-span-12" style={{ ...cardStyle, padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 className="h-5 w-5 text-purple-400" />
              <span style={{ color: '#fff', fontWeight: '600' }}>My Stats</span>
            </div>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy className="h-5 w-5 text-yellow-400" />
                <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.25rem' }}>{playerStats.goals}</span>
                <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Goals</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target className="h-5 w-5 text-green-400" />
                <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.25rem' }}>{playerStats.assists}</span>
                <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Assists</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield className="h-5 w-5 text-blue-400" />
                <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.25rem' }}>{playerStats.gamesPlayed}</span>
                <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Games</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(138, 43, 226, 0.2)', borderRadius: '8px' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Pass</span>
                <span style={{ color: '#c4b5fd', fontWeight: '600' }}>{playerStats.passAccuracy}%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(138, 43, 226, 0.2)', borderRadius: '8px' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Shot</span>
                <span style={{ color: '#c4b5fd', fontWeight: '600' }}>{playerStats.shotAccuracy}%</span>
              </div>
            </div>
            <Link href="/stats" style={{ color: '#c4b5fd', textDecoration: 'none', fontSize: '0.875rem' }}>Full Stats →</Link>
          </div>
        </div>

        {/* Game Footage - Left */}
        <div style={{ ...cardStyle, padding: '16px' }} className="md:col-span-5 col-span-12">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Video className="h-5 w-5" style={{ color: '#a855f7' }} />
              <span style={{ color: '#fff', fontWeight: '600' }}>Recent Footage</span>
            </div>
            <Link href="/videos" style={{ color: '#c4b5fd', textDecoration: 'none', fontSize: '0.75rem', padding: '4px 10px', background: 'rgba(138, 43, 226, 0.2)', borderRadius: '6px', border: '1px solid rgba(138, 43, 226, 0.3)' }}>View All</Link>
          </div>
          <div style={{ background: 'linear-gradient(180deg, rgba(26, 10, 46, 0.8) 0%, rgba(10, 0, 20, 0.9) 100%)', borderRadius: '12px', border: '1px solid rgba(138, 43, 226, 0.3)', overflow: 'hidden' }} className="group cursor-pointer">
            <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(138, 43, 226, 0.2) 0%, transparent 60%)' }} />
              <div className="group-hover:scale-110 transition-transform" style={{ width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.9) 0%, rgba(138, 43, 226, 1) 100%)', boxShadow: '0 0 30px rgba(138, 43, 226, 0.6)' }}>
                <Play className="h-6 w-6 text-white ml-0.5" />
              </div>
            </div>
            <div style={{ padding: '12px', borderTop: '1px solid rgba(138, 43, 226, 0.2)', background: 'rgba(138, 43, 226, 0.05)' }}>
              <div style={{ color: '#fff', fontWeight: '500', fontSize: '0.875rem' }}>{recentFootage.title}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.75rem', color: '#9ca3af' }}>
                <span>{recentFootage.date}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#c4b5fd' }}><Clock className="h-3 w-3" />{recentFootage.duration}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Assignments - Right */}
        <div className="md:col-span-7 col-span-12" style={{ ...cardStyle, padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClipboardList className="h-5 w-5" style={{ color: '#a855f7' }} />
              <span style={{ color: '#fff', fontWeight: '600' }}>Assignments</span>
            </div>
            <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', background: 'rgba(168, 85, 247, 0.3)', color: '#d8b4fe' }}>{assignments.filter(a => !a.completed).length} pending</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {assignments.map((a) => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '10px', background: a.completed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(138, 43, 226, 0.1)', border: a.completed ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(138, 43, 226, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '6px', borderRadius: '6px', background: a.completed ? 'rgba(34, 197, 94, 0.2)' : 'rgba(138, 43, 226, 0.2)' }}>
                    {a.type === 'video' && <Video className="h-4 w-4" style={{ color: a.completed ? '#4ade80' : '#a855f7' }} />}
                    {a.type === 'training' && <Target className="h-4 w-4" style={{ color: a.completed ? '#4ade80' : '#a855f7' }} />}
                    {a.type === 'playbook' && <ClipboardList className="h-4 w-4" style={{ color: a.completed ? '#4ade80' : '#a855f7' }} />}
                  </div>
                  <div>
                    <div style={{ color: a.completed ? '#86efac' : '#fff', fontSize: '0.875rem', fontWeight: '500', textDecoration: a.completed ? 'line-through' : 'none' }}>{a.title}</div>
                    <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Due: {a.dueDate}</div>
                  </div>
                </div>
                {a.completed ? <CheckCircle2 className="h-5 w-5 text-green-400" /> : <button style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600', color: '#fff', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.7) 0%, rgba(138, 43, 226, 0.9) 100%)', border: 'none', cursor: 'pointer' }}>Start</button>}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events - Bottom Left */}
        <div className="md:col-span-6 col-span-12" style={{ ...cardStyle, padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Calendar className="h-5 w-5" style={{ color: '#a855f7' }} />
            <span style={{ color: '#fff', fontWeight: '600' }}>Upcoming Events</span>
          </div>
          <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(138, 43, 226, 0.1)', border: '1px solid rgba(138, 43, 226, 0.2)', textAlign: 'center' }}>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>No upcoming events</p>
            <Link href="/schedule" style={{ color: '#c4b5fd', textDecoration: 'none', fontSize: '0.75rem', marginTop: '8px', display: 'inline-block' }}>View Calendar →</Link>
          </div>
        </div>

        {/* Announcements - Bottom Right */}
        <div className="md:col-span-6 col-span-12" style={{ ...cardStyle, padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <MessageSquare className="h-5 w-5" style={{ color: '#a855f7' }} />
            <span style={{ color: '#fff', fontWeight: '600' }}>Announcements</span>
          </div>
          <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(138, 43, 226, 0.1)', border: '1px solid rgba(138, 43, 226, 0.2)', textAlign: 'center' }}>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>No recent announcements</p>
            <Link href="/communication" style={{ color: '#c4b5fd', textDecoration: 'none', fontSize: '0.75rem', marginTop: '8px', display: 'inline-block' }}>View All →</Link>
          </div>
        </div>
      </div>
    );
  };

  // Coach Dashboard - Compact
  const CoachDashboard = () => (
    <div className="grid grid-cols-12 gap-4">
      {/* Team Stats Row */}
      <div className="col-span-12" style={{ ...cardStyle, padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users className="h-5 w-5" style={{ color: '#a855f7' }} />
            <span style={{ color: '#fff', fontWeight: '600' }}>Team Overview</span>
          </div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.25rem' }}>18</span>
              <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Players</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '1.25rem' }}>12-3-2</span>
              <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Record</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(234, 179, 8, 0.2)', borderRadius: '8px' }}>
              <Trophy className="h-4 w-4 text-yellow-400" />
              <span style={{ color: '#fbbf24', fontWeight: '600' }}>2nd Place</span>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Progress */}
      <div className="md:col-span-6 col-span-12" style={{ ...cardStyle, padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardList className="h-5 w-5" style={{ color: '#a855f7' }} />
            <span style={{ color: '#fff', fontWeight: '600' }}>Assignments</span>
          </div>
          <span style={{ color: '#c4b5fd', fontWeight: '600' }}>78%</span>
        </div>
        <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(55, 65, 81, 0.5)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '78%', borderRadius: '4px', background: 'linear-gradient(90deg, #a855f7, #ec4899)' }} />
        </div>
        <Link href="/training" style={{ display: 'block', textAlign: 'center', color: '#c4b5fd', textDecoration: 'none', fontSize: '0.75rem', marginTop: '12px' }}>Manage Assignments →</Link>
      </div>

      {/* Recent Videos */}
      <div className="md:col-span-6 col-span-12" style={{ ...cardStyle, padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Video className="h-5 w-5" style={{ color: '#a855f7' }} />
            <span style={{ color: '#fff', fontWeight: '600' }}>Recent Uploads</span>
          </div>
          <Link href="/videos" style={{ color: '#c4b5fd', textDecoration: 'none', fontSize: '0.75rem', padding: '4px 10px', background: 'rgba(138, 43, 226, 0.2)', borderRadius: '6px', border: '1px solid rgba(138, 43, 226, 0.3)' }}>Upload</Link>
        </div>
        <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(138, 43, 226, 0.1)', border: '1px solid rgba(138, 43, 226, 0.2)', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>No recent uploads</p>
        </div>
      </div>

      {/* Events & Announcements */}
      <div className="md:col-span-6 col-span-12" style={{ ...cardStyle, padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Calendar className="h-5 w-5" style={{ color: '#a855f7' }} />
          <span style={{ color: '#fff', fontWeight: '600' }}>Upcoming Events</span>
        </div>
        <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(138, 43, 226, 0.1)', border: '1px solid rgba(138, 43, 226, 0.2)', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>No upcoming events</p>
          <Link href="/schedule" style={{ color: '#c4b5fd', textDecoration: 'none', fontSize: '0.75rem', marginTop: '8px', display: 'inline-block' }}>Schedule Event →</Link>
        </div>
      </div>

      <div className="md:col-span-6 col-span-12" style={{ ...cardStyle, padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <MessageSquare className="h-5 w-5" style={{ color: '#a855f7' }} />
          <span style={{ color: '#fff', fontWeight: '600' }}>Announcements</span>
        </div>
        <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(138, 43, 226, 0.1)', border: '1px solid rgba(138, 43, 226, 0.2)', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>No recent announcements</p>
          <Link href="/communication" style={{ color: '#c4b5fd', textDecoration: 'none', fontSize: '0.75rem', marginTop: '8px', display: 'inline-block' }}>Post Announcement →</Link>
        </div>
      </div>
    </div>
  );

  // All available quick actions
  const ALL_QUICK_ACTIONS = [
    { id: 'users', href: '/users', icon: Users, label: 'Users' },
    { id: 'diagnostics', href: '/diagnostics', icon: Activity, label: 'Diagnostics' },
    { id: 'announce', href: '/communication', icon: Bell, label: 'Announce' },
    { id: 'schedule', href: '/schedule', icon: Calendar, label: 'Schedule' },
    { id: 'stats', href: '/stats', icon: BarChart2, label: 'Stats' },
    { id: 'playbook', href: '/playbook', icon: BookOpen, label: 'Playbook' },
    { id: 'training', href: '/training', icon: Dumbbell, label: 'Training' },
    { id: 'equipment', href: '/equipment', icon: Package, label: 'Equipment' },
    { id: 'videos', href: '/videos', icon: Video, label: 'Videos' },
  ];

  const DEFAULT_QUICK_ACTIONS = ['users', 'diagnostics', 'stats', 'playbook', 'announce', 'schedule'];

  // Admin Dashboard - Restructured Layout
  const AdminDashboard = () => {
    const [selectedPlayer, setSelectedPlayer] = useState<string>("");
    const [players, setPlayers] = useState<Array<{id: string, name: string, email: string}>>([]);
    const [playerStats, setPlayerStats] = useState<{goals: number, assists: number, gamesPlayed: number, passAccuracy: number, shotAccuracy: number} | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [hoveredAction, setHoveredAction] = useState<string | null>(null);
    const [activeAction, setActiveAction] = useState<string | null>(null);
    const [healthBadgeHover, setHealthBadgeHover] = useState(false);
    const [healthBadgeActive, setHealthBadgeActive] = useState(false);
    const [dropdownBtnHover, setDropdownBtnHover] = useState(false);
    const [dropdownBtnActive, setDropdownBtnActive] = useState(false);
    const [announceLinkHover, setAnnounceLinkHover] = useState(false);
    const [scheduleLinkHover, setScheduleLinkHover] = useState(false);
    const [recentAnnouncement, setRecentAnnouncement] = useState<{id: string, title: string, content: string, priority: string, createdAt: string, author: {firstName: string, lastName: string}} | null>(null);
    const [isCustomizing, setIsCustomizing] = useState(false);
    const [selectedQuickActions, setSelectedQuickActions] = useState<string[]>(DEFAULT_QUICK_ACTIONS);
    const [customizeHover, setCustomizeHover] = useState(false);

    // Load saved quick actions from localStorage
    useEffect(() => {
      const saved = localStorage.getItem('quickActions');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSelectedQuickActions(parsed);
          }
        } catch (e) {
          console.error('Failed to parse saved quick actions');
        }
      }
    }, []);

    // Save quick actions to localStorage
    const saveQuickActions = (actions: string[]) => {
      setSelectedQuickActions(actions);
      localStorage.setItem('quickActions', JSON.stringify(actions));
    };

    const toggleQuickAction = (actionId: string) => {
      if (selectedQuickActions.includes(actionId)) {
        if (selectedQuickActions.length > 1) {
          saveQuickActions(selectedQuickActions.filter(id => id !== actionId));
        }
      } else if (selectedQuickActions.length < 6) {
        saveQuickActions([...selectedQuickActions, actionId]);
      }
    };

    const activeQuickActions = ALL_QUICK_ACTIONS.filter(a => selectedQuickActions.includes(a.id));

    // Fetch players list
    useEffect(() => {
      const fetchPlayers = async () => {
        try {
          const res = await fetch("/api/admin/players");
          if (res.ok) {
            const data = await res.json();
            setPlayers(data.players || []);
          }
        } catch (error) {
          console.error("Error fetching players:", error);
        }
      };
      fetchPlayers();
    }, []);

    // Fetch recent announcement
    useEffect(() => {
      const fetchAnnouncement = async () => {
        try {
          const res = await fetch("/api/announcements", {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (res.ok) {
            const data = await res.json();
            console.log("Dashboard announcements data:", data);
            // API returns array directly, not wrapped in { announcements: [...] }
            if (Array.isArray(data) && data.length > 0) {
              const announcement = data[0];
              setRecentAnnouncement({
                id: announcement.id,
                title: announcement.title,
                content: announcement.content,
                priority: announcement.priority,
                createdAt: announcement.createdAt,
                author: {
                  firstName: announcement.author?.name?.split(' ')[0] || 'Unknown',
                  lastName: announcement.author?.name?.split(' ').slice(1).join(' ') || '',
                }
              });
            }
          } else {
            console.error("Failed to fetch announcements:", res.status);
          }
        } catch (error) {
          console.error("Error fetching announcements:", error);
        }
      };
      fetchAnnouncement();
    }, []);

    // Mock player stats when player selected (replace with real API later)
    useEffect(() => {
      if (selectedPlayer) {
        // Mock data - replace with real API call
        setPlayerStats({
          goals: Math.floor(Math.random() * 20),
          assists: Math.floor(Math.random() * 15),
          gamesPlayed: Math.floor(Math.random() * 25) + 5,
          passAccuracy: Math.floor(Math.random() * 30) + 70,
          shotAccuracy: Math.floor(Math.random() * 40) + 50
        });
      } else {
        setPlayerStats(null);
      }
    }, [selectedPlayer]);

    const getHealthColors = () => {
      switch (systemHealth.status) {
        case "healthy":
          return { bg: 'rgba(34, 197, 94, 0.2)', border: 'rgba(34, 197, 94, 0.5)', text: '#4ade80', label: 'System Healthy' };
        case "warning":
          return { bg: 'rgba(234, 179, 8, 0.2)', border: 'rgba(234, 179, 8, 0.5)', text: '#facc15', label: 'Warning' };
        case "error":
          return { bg: 'rgba(239, 68, 68, 0.2)', border: 'rgba(239, 68, 68, 0.5)', text: '#f87171', label: 'System Error' };
        default:
          return { bg: 'rgba(107, 114, 128, 0.2)', border: 'rgba(107, 114, 128, 0.5)', text: '#9ca3af', label: 'Checking...' };
      }
    };
    
    const healthColors = getHealthColors();
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* ROW 1: Quick Actions + System Overview side by side */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {/* Quick Actions */}
          <div style={{ ...cardStyle, padding: '20px', flex: '1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <UserCog className="h-5 w-5" style={{ color: '#a855f7' }} />
              <span style={{ color: '#fff', fontWeight: '600' }}>Quick Actions</span>
              <button
                onClick={() => setIsCustomizing(!isCustomizing)}
                onMouseEnter={() => setCustomizeHover(true)}
                onMouseLeave={() => setCustomizeHover(false)}
                style={{
                  marginLeft: 'auto',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: isCustomizing ? 'rgba(168, 85, 247, 0.3)' : customizeHover ? 'rgba(138, 43, 226, 0.2)' : 'transparent',
                  border: isCustomizing ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid rgba(138, 43, 226, 0.3)',
                  color: isCustomizing ? '#e9d5ff' : customizeHover ? '#c4b5fd' : '#9ca3af',
                  fontSize: '0.7rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s',
                }}
              >
                {isCustomizing ? <Check className="h-3 w-3" /> : <Settings className="h-3 w-3" />}
                {isCustomizing ? 'Done' : 'Customize'}
              </button>
            </div>
            
            {isCustomizing ? (
              /* Customization Mode */
              <div>
                <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '12px' }}>
                  Select up to 6 quick actions ({selectedQuickActions.length}/6)
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {ALL_QUICK_ACTIONS.map((action) => {
                    const isSelected = selectedQuickActions.includes(action.id);
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.id}
                        onClick={() => toggleQuickAction(action.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '10px', borderRadius: '8px',
                          background: isSelected 
                            ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(138, 43, 226, 0.25) 100%)'
                            : 'rgba(138, 43, 226, 0.08)',
                          border: isSelected 
                            ? '1px solid rgba(168, 85, 247, 0.5)' 
                            : '1px solid rgba(138, 43, 226, 0.2)',
                          color: isSelected ? '#e9d5ff' : '#9ca3af',
                          cursor: selectedQuickActions.length >= 6 && !isSelected ? 'not-allowed' : 'pointer',
                          opacity: selectedQuickActions.length >= 6 && !isSelected ? 0.5 : 1,
                          transition: 'all 0.2s',
                        }}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>{action.label}</span>
                        {isSelected && <Check className="h-3 w-3 ml-auto" style={{ color: '#a855f7' }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Normal Mode */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {activeQuickActions.map((action) => {
                  const isHovered = hoveredAction === action.label;
                  const isActive = activeAction === action.label;
                  const Icon = action.icon;
                  return (
                    <Link 
                      key={action.label}
                      href={action.href} 
                      onMouseEnter={() => setHoveredAction(action.label)}
                      onMouseLeave={() => { setHoveredAction(null); setActiveAction(null); }}
                      onMouseDown={() => setActiveAction(action.label)}
                      onMouseUp={() => setActiveAction(null)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '12px 14px', borderRadius: '10px',
                        background: isActive
                          ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.35) 0%, rgba(138, 43, 226, 0.3) 100%)'
                          : isHovered
                            ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(138, 43, 226, 0.2) 100%)'
                            : 'linear-gradient(135deg, rgba(138, 43, 226, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)', 
                        border: isHovered
                          ? '1px solid rgba(168, 85, 247, 0.6)'
                          : '1px solid rgba(138, 43, 226, 0.3)',
                        boxShadow: isActive
                          ? 'inset 0 2px 8px rgba(0, 0, 0, 0.2)'
                          : isHovered
                            ? '0 0 20px rgba(138, 43, 226, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)'
                            : 'none',
                        color: isHovered ? '#e9d5ff' : '#c4b5fd', 
                        textDecoration: 'none',
                        transform: isActive ? 'scale(0.97)' : isHovered ? 'scale(1.03) translateY(-2px)' : 'scale(1)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      <Icon className="h-4 w-4" style={{ color: isHovered ? '#e9d5ff' : '#c4b5fd', transition: 'color 0.2s' }} />
                      <span style={{ fontWeight: '500', fontSize: '0.85rem' }}>{action.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* System Overview */}
          <div style={{ ...cardStyle, padding: '20px', flex: '1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(138, 43, 226, 0.2)' }}>
                <Users className="h-5 w-5" style={{ color: '#a855f7' }} />
              </div>
              <span style={{ color: '#fff', fontWeight: '700', fontSize: '1rem' }}>System Overview</span>
              <Link 
                href="/diagnostics"
                onMouseEnter={() => setHealthBadgeHover(true)}
                onMouseLeave={() => { setHealthBadgeHover(false); setHealthBadgeActive(false); }}
                onMouseDown={() => setHealthBadgeActive(true)}
                onMouseUp={() => setHealthBadgeActive(false)}
                style={{ 
                  marginLeft: 'auto',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  padding: '6px 12px', 
                  background: healthBadgeActive
                    ? healthColors.bg.replace('0.2', '0.4')
                    : healthBadgeHover 
                      ? healthColors.bg.replace('0.2', '0.3')
                      : healthColors.bg, 
                  border: `1px solid ${healthBadgeHover ? healthColors.text : healthColors.border}`,
                  borderRadius: '8px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  boxShadow: healthBadgeHover 
                    ? `0 0 15px ${healthColors.bg}, 0 4px 10px rgba(0, 0, 0, 0.2)`
                    : 'none',
                  transform: healthBadgeActive ? 'scale(0.95)' : healthBadgeHover ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <Activity className="h-3 w-3" style={{ color: healthColors.text }} />
                <span style={{ color: healthColors.text, fontWeight: '600', fontSize: '0.75rem' }}>
                  {systemHealth.loading ? '...' : healthColors.label}
                </span>
              </Link>
            </div>
            
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(138, 43, 226, 0.1)', border: '1px solid rgba(138, 43, 226, 0.2)', textAlign: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.5rem', display: 'block' }}>
                  {adminStats?.totalUsers ?? '—'}
                </span>
                <span style={{ color: '#9ca3af', fontSize: '0.7rem' }}>Total</span>
              </div>
              <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', textAlign: 'center' }}>
                <span style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '1.5rem', display: 'block' }}>
                  {adminStats?.activeUsers ?? '—'}
                </span>
                <span style={{ color: '#9ca3af', fontSize: '0.7rem' }}>Active</span>
              </div>
              <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(192, 132, 252, 0.1)', border: '1px solid rgba(192, 132, 252, 0.2)', textAlign: 'center' }}>
                <span style={{ color: '#c084fc', fontWeight: 'bold', fontSize: '1.5rem', display: 'block' }}>
                  {adminStats?.recentSignups ?? '—'}
                </span>
                <span style={{ color: '#9ca3af', fontSize: '0.7rem' }}>New</span>
              </div>
            </div>

            {/* Role Distribution */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Shield className="h-3 w-3" style={{ color: '#a855f7' }} />
              <span style={{ color: '#9ca3af', fontWeight: '600', fontSize: '0.75rem' }}>By Role</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              {adminStats?.roleCounts ? (
                Object.entries(adminStats.roleCounts).slice(0, 4).map(([role, count]) => (
                  <div key={role} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: 'rgba(138, 43, 226, 0.08)',
                    border: '1px solid rgba(138, 43, 226, 0.15)'
                  }}>
                    <span style={{ color: '#9ca3af', fontSize: '0.7rem', textTransform: 'capitalize' }}>
                      {role.toLowerCase().replace('_', ' ')}
                    </span>
                    <span style={{ color: '#c084fc', fontWeight: 'bold', fontSize: '0.8rem' }}>{count}</span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '8px', textAlign: 'center', color: '#9ca3af', fontSize: '0.75rem' }}>
                  Loading...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ROW 2: Player Stats + Announcements side by side */}
        <div style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 20 }}>
          {/* Player Stats Tracker */}
          <div style={{ ...cardStyle, padding: '16px', flex: '1', position: 'relative', zIndex: 30 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <BarChart2 className="h-4 w-4" style={{ color: '#a855f7' }} />
              <span style={{ color: '#fff', fontWeight: '600', fontSize: '0.9rem' }}>Player Stats</span>
            </div>
            
            {/* Custom Player Selector Dropdown */}
            <div style={{ position: 'relative', marginBottom: '12px', zIndex: 50 }}>
              {/* Dropdown Trigger */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                onMouseEnter={() => setDropdownBtnHover(true)}
                onMouseLeave={() => { setDropdownBtnHover(false); setDropdownBtnActive(false); }}
                onMouseDown={() => setDropdownBtnActive(true)}
                onMouseUp={() => setDropdownBtnActive(false)}
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 14px',
                  borderRadius: '10px',
                  background: dropdownBtnActive
                    ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.35) 0%, rgba(138, 43, 226, 0.3) 100%)'
                    : dropdownBtnHover || dropdownOpen
                      ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(138, 43, 226, 0.2) 100%)'
                      : 'linear-gradient(135deg, rgba(138, 43, 226, 0.2) 0%, rgba(168, 85, 247, 0.15) 100%)',
                  border: dropdownBtnHover || dropdownOpen 
                    ? '1px solid rgba(168, 85, 247, 0.6)' 
                    : '1px solid rgba(138, 43, 226, 0.4)',
                  color: selectedPlayer ? '#e9d5ff' : dropdownBtnHover ? '#c4b5fd' : '#9ca3af',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  outline: 'none',
                  cursor: 'pointer',
                  boxShadow: dropdownBtnActive
                    ? 'inset 0 2px 8px rgba(0, 0, 0, 0.2)'
                    : dropdownBtnHover || dropdownOpen 
                      ? '0 4px 20px rgba(138, 43, 226, 0.3), 0 0 0 2px rgba(168, 85, 247, 0.1)' 
                      : '0 4px 15px rgba(138, 43, 226, 0.15)',
                  transform: dropdownBtnActive ? 'scale(0.99)' : 'scale(1)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {selectedPlayer ? (
                    <>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(138, 43, 226, 0.5) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Users className="h-3 w-3" style={{ color: '#e9d5ff' }} />
                      </div>
                      {players.find(p => p.id === selectedPlayer)?.name || players.find(p => p.id === selectedPlayer)?.email}
                    </>
                  ) : (
                    'Select a player...'
                  )}
                </span>
                <ChevronDown 
                  className="h-4 w-4" 
                  style={{ 
                    color: '#a855f7',
                    transition: 'transform 0.2s ease',
                    transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                  }} 
                />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  right: 0,
                  maxHeight: '200px',
                  overflowY: 'auto',
                  borderRadius: '10px',
                  background: 'linear-gradient(180deg, rgba(20, 10, 40, 0.99) 0%, rgba(30, 15, 50, 0.99) 100%)',
                  border: '1px solid rgba(168, 85, 247, 0.4)',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.7), 0 0 30px rgba(138, 43, 226, 0.3)',
                  zIndex: 9999,
                  backdropFilter: 'blur(20px)'
                }}>
                  {/* Clear selection option */}
                  <button
                    onClick={() => { setSelectedPlayer(''); setDropdownOpen(false); }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: !selectedPlayer ? 'rgba(138, 43, 226, 0.15)' : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid rgba(138, 43, 226, 0.2)',
                      color: '#9ca3af',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(138, 43, 226, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = !selectedPlayer ? 'rgba(138, 43, 226, 0.15)' : 'transparent'}
                  >
                    Select a player...
                  </button>
                  
                  {/* Player options */}
                  {players.map((player, index) => (
                    <button
                      key={player.id}
                      onClick={() => { setSelectedPlayer(player.id); setDropdownOpen(false); }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: selectedPlayer === player.id ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                        border: 'none',
                        borderBottom: index < players.length - 1 ? '1px solid rgba(138, 43, 226, 0.15)' : 'none',
                        color: selectedPlayer === player.id ? '#e9d5ff' : '#c4b5fd',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(168, 85, 247, 0.15)';
                        e.currentTarget.style.color = '#e9d5ff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = selectedPlayer === player.id ? 'rgba(168, 85, 247, 0.2)' : 'transparent';
                        e.currentTarget.style.color = selectedPlayer === player.id ? '#e9d5ff' : '#c4b5fd';
                      }}
                    >
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: selectedPlayer === player.id 
                          ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.5) 0%, rgba(138, 43, 226, 0.6) 100%)'
                          : 'rgba(138, 43, 226, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease'
                      }}>
                        <Users className="h-3.5 w-3.5" style={{ color: selectedPlayer === player.id ? '#e9d5ff' : '#a855f7' }} />
                      </div>
                      <span style={{ fontWeight: selectedPlayer === player.id ? '600' : '500' }}>
                        {player.name || player.email}
                      </span>
                      {selectedPlayer === player.id && (
                        <CheckCircle2 className="h-4 w-4 ml-auto" style={{ color: '#a855f7' }} />
                      )}
                    </button>
                  ))}
                  
                  {players.length === 0 && (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', fontSize: '0.85rem' }}>
                      No players found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Stats Display */}
            {selectedPlayer && playerStats ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.1)', textAlign: 'center' }}>
                  <span style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '1.25rem', display: 'block' }}>{playerStats.goals}</span>
                  <span style={{ color: '#9ca3af', fontSize: '0.65rem' }}>Goals</span>
                </div>
                <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', textAlign: 'center' }}>
                  <span style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '1.25rem', display: 'block' }}>{playerStats.assists}</span>
                  <span style={{ color: '#9ca3af', fontSize: '0.65rem' }}>Assists</span>
                </div>
                <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.1)', textAlign: 'center' }}>
                  <span style={{ color: '#c084fc', fontWeight: 'bold', fontSize: '1.25rem', display: 'block' }}>{playerStats.gamesPlayed}</span>
                  <span style={{ color: '#9ca3af', fontSize: '0.65rem' }}>Games</span>
                </div>
                <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(251, 191, 36, 0.1)', textAlign: 'center' }}>
                  <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '1.25rem', display: 'block' }}>{playerStats.passAccuracy}%</span>
                  <span style={{ color: '#9ca3af', fontSize: '0.65rem' }}>Pass</span>
                </div>
                <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', textAlign: 'center' }}>
                  <span style={{ color: '#f87171', fontWeight: 'bold', fontSize: '1.25rem', display: 'block' }}>{playerStats.shotAccuracy}%</span>
                  <span style={{ color: '#9ca3af', fontSize: '0.65rem' }}>Shot</span>
                </div>
              </div>
            ) : (
              <div style={{ padding: '20px', borderRadius: '8px', background: 'rgba(138, 43, 226, 0.05)', textAlign: 'center' }}>
                <Target className="h-8 w-8 mx-auto mb-2" style={{ color: 'rgba(168, 85, 247, 0.4)' }} />
                <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0 }}>Select a player to view stats</p>
              </div>
            )}
          </div>

          {/* Recent Announcements */}
          <div style={{ ...cardStyle, padding: '16px', flex: '1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <MessageSquare className="h-4 w-4" style={{ color: '#a855f7' }} />
              <span style={{ color: '#fff', fontWeight: '600', fontSize: '0.9rem' }}>Announcements</span>
            </div>
            {recentAnnouncement ? (
              <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(138, 43, 226, 0.08)', border: '1px solid rgba(138, 43, 226, 0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    background: recentAnnouncement.priority === 'URGENT' ? 'rgba(239, 68, 68, 0.2)' 
                      : recentAnnouncement.priority === 'HIGH' ? 'rgba(251, 191, 36, 0.2)'
                      : recentAnnouncement.priority === 'NORMAL' ? 'rgba(168, 85, 247, 0.2)'
                      : 'rgba(107, 114, 128, 0.2)',
                    color: recentAnnouncement.priority === 'URGENT' ? '#f87171'
                      : recentAnnouncement.priority === 'HIGH' ? '#fbbf24'
                      : recentAnnouncement.priority === 'NORMAL' ? '#c084fc'
                      : '#9ca3af',
                  }}>
                    {recentAnnouncement.priority}
                  </span>
                  <span style={{ color: '#6b7280', fontSize: '0.7rem' }}>
                    {new Date(recentAnnouncement.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '600', margin: '0 0 6px 0' }}>
                  {recentAnnouncement.title}
                </h4>
                <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: '0 0 10px 0', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                  {recentAnnouncement.content}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280', fontSize: '0.7rem' }}>
                    By {recentAnnouncement.author?.firstName} {recentAnnouncement.author?.lastName}
                  </span>
                  <Link 
                    href="/communication" 
                    onMouseEnter={() => setAnnounceLinkHover(true)}
                    onMouseLeave={() => setAnnounceLinkHover(false)}
                    style={{ 
                      color: announceLinkHover ? '#e9d5ff' : '#c4b5fd', 
                      textDecoration: 'none', 
                      fontSize: '0.75rem',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: announceLinkHover ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    View All →
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ padding: '20px', borderRadius: '10px', background: 'rgba(138, 43, 226, 0.08)', border: '1px solid rgba(138, 43, 226, 0.15)', textAlign: 'center' }}>
                <MessageSquare className="h-10 w-10 mx-auto mb-3" style={{ color: 'rgba(168, 85, 247, 0.5)' }} />
                <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0 }}>No recent announcements</p>
                <Link 
                  href="/communication" 
                  onMouseEnter={() => setAnnounceLinkHover(true)}
                  onMouseLeave={() => setAnnounceLinkHover(false)}
                  style={{ 
                    color: announceLinkHover ? '#e9d5ff' : '#c4b5fd', 
                    textDecoration: 'none', 
                    fontSize: '0.75rem', 
                    marginTop: '10px', 
                    display: 'inline-block',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: announceLinkHover ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                    border: announceLinkHover ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid transparent',
                    transform: announceLinkHover ? 'translateY(-2px)' : 'translateY(0)',
                    boxShadow: announceLinkHover ? '0 4px 12px rgba(138, 43, 226, 0.3)' : 'none',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  Post Announcement →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ROW 3: Events at bottom */}
        <div style={{ ...cardStyle, padding: '16px', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Calendar className="h-4 w-4" style={{ color: '#a855f7' }} />
            <span style={{ color: '#fff', fontWeight: '600', fontSize: '0.9rem' }}>Upcoming Events</span>
          </div>
          <div style={{ padding: '20px', borderRadius: '10px', background: 'rgba(138, 43, 226, 0.08)', border: '1px solid rgba(138, 43, 226, 0.15)', textAlign: 'center' }}>
            <Calendar className="h-10 w-10 mx-auto mb-3" style={{ color: 'rgba(168, 85, 247, 0.5)' }} />
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0 }}>No upcoming events scheduled</p>
            <Link 
              href="/schedule" 
              onMouseEnter={() => setScheduleLinkHover(true)}
              onMouseLeave={() => setScheduleLinkHover(false)}
              style={{ 
                color: scheduleLinkHover ? '#e9d5ff' : '#c4b5fd', 
                textDecoration: 'none', 
                fontSize: '0.75rem', 
                marginTop: '10px', 
                display: 'inline-block',
                padding: '6px 12px',
                borderRadius: '6px',
                background: scheduleLinkHover ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                border: scheduleLinkHover ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid transparent',
                transform: scheduleLinkHover ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: scheduleLinkHover ? '0 4px 12px rgba(138, 43, 226, 0.3)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Schedule Event →
            </Link>
          </div>
        </div>
      </div>
    );
  };

  // Default Dashboard for other roles
  const DefaultDashboard = () => (
    <div className="grid grid-cols-12 gap-4">
      {/* Events */}
      <div className="md:col-span-6 col-span-12" style={{ ...cardStyle, padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Calendar className="h-5 w-5" style={{ color: '#a855f7' }} />
          <span style={{ color: '#fff', fontWeight: '600' }}>Upcoming Events</span>
        </div>
        <div style={{ padding: '20px', borderRadius: '10px', background: 'rgba(138, 43, 226, 0.1)', border: '1px solid rgba(138, 43, 226, 0.2)', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>No upcoming events</p>
        </div>
      </div>

      {/* Announcements */}
      <div className="md:col-span-6 col-span-12" style={{ ...cardStyle, padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <MessageSquare className="h-5 w-5" style={{ color: '#a855f7' }} />
          <span style={{ color: '#fff', fontWeight: '600' }}>Announcements</span>
        </div>
        <div style={{ padding: '20px', borderRadius: '10px', background: 'rgba(138, 43, 226, 0.1)', border: '1px solid rgba(138, 43, 226, 0.2)', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>No announcements</p>
        </div>
      </div>
    </div>
  );

  // Render role-specific dashboard
  const renderDashboard = () => {
    const normalizedRole = userRole?.toUpperCase();
    switch (normalizedRole) {
      case 'ADMIN':
        return <AdminDashboard />;
      case 'PLAYER':
        return <PlayerDashboard />;
      case 'COACH':
        return <CoachDashboard />;
      case 'EQUIPMENT_MANAGER':
      case 'FAMILY':
        return <DefaultDashboard />;
      default:
        // Show admin dashboard by default if admin, otherwise default
        return actualRole?.toUpperCase() === 'ADMIN' ? <AdminDashboard /> : <DefaultDashboard />;
    }
  };

  // Extract first name from full name
  const firstName = userName ? userName.split(' ')[0] : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflow: 'visible' }}>
      {/* Role Switcher - Always show for testing */}
      {(
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap', padding: '8px 0', overflow: 'visible' }}>
          {viewAsRole && viewAsRole !== actualRole && (
            <span 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: '500',
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(22, 163, 74, 0.4) 100%)',
                border: '1px solid rgba(34, 197, 94, 0.5)',
                color: 'rgba(134, 239, 172, 1)'
              }}
            >
              <Eye className="h-4 w-4" />
              Viewing as: {viewAsRole?.toLowerCase().replace("_", " ")}
            </span>
          )}
          <div style={{ position: 'relative', overflow: 'visible' }}>
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              onMouseEnter={() => setSwitchViewHover(true)}
              onMouseLeave={() => { setSwitchViewHover(false); setSwitchViewActive(false); }}
              onMouseDown={() => setSwitchViewActive(true)}
              onMouseUp={() => setSwitchViewActive(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '12px',
                fontSize: '0.875rem',
                fontWeight: '600',
                background: switchViewActive
                  ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.6) 0%, rgba(126, 34, 206, 0.7) 100%)'
                  : switchViewHover || showRoleSwitcher
                    ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.5) 0%, rgba(138, 43, 226, 0.6) 100%)'
                    : 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(138, 43, 226, 0.5) 100%)',
                border: switchViewHover || showRoleSwitcher
                  ? '1px solid rgba(216, 180, 254, 0.8)'
                  : '1px solid rgba(168, 85, 247, 0.6)',
                color: 'white',
                boxShadow: switchViewActive
                  ? 'inset 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 25px rgba(138, 43, 226, 0.5)'
                  : switchViewHover || showRoleSwitcher
                    ? '0 0 30px rgba(138, 43, 226, 0.5), 0 6px 20px rgba(0, 0, 0, 0.3)'
                    : '0 0 20px rgba(138, 43, 226, 0.3)',
                cursor: 'pointer',
                transform: switchViewActive 
                  ? 'scale(0.97)' 
                  : switchViewHover 
                    ? 'scale(1.03)' 
                    : 'scale(1)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Eye className="h-4 w-4" style={{ filter: switchViewHover ? 'drop-shadow(0 0 4px rgba(255,255,255,0.5))' : 'none' }} />
              Switch View
              <ChevronDown style={{ height: '16px', width: '16px', transition: 'transform 0.2s', transform: showRoleSwitcher ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>
            
            {showRoleSwitcher && (
              <div 
                style={{
                  position: 'absolute',
                  right: 0,
                  marginTop: '8px',
                  width: '200px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  zIndex: 9999,
                  background: 'linear-gradient(180deg, rgba(20, 10, 40, 0.99) 0%, rgba(30, 15, 50, 0.99) 100%)',
                  border: '1px solid rgba(138, 43, 226, 0.5)',
                  boxShadow: '0 15px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(138, 43, 226, 0.3)'
                }}
              >
                {availableRoles.map((role, index) => {
                  const isSelected = viewAsRole === role;
                  const isHovered = hoveredRole === role;
                  return (
                    <button
                      key={role}
                      onClick={() => switchViewRole(role)}
                      onMouseEnter={() => setHoveredRole(role)}
                      onMouseLeave={() => setHoveredRole(null)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: isSelected ? '#a855f7' : isHovered ? '#e9d5ff' : '#d1d5db',
                        background: isSelected 
                          ? 'rgba(138, 43, 226, 0.25)' 
                          : isHovered 
                            ? 'rgba(168, 85, 247, 0.15)' 
                            : 'transparent',
                        borderBottom: index < availableRoles.length - 1 ? '1px solid rgba(138, 43, 226, 0.2)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                        textTransform: 'capitalize',
                        border: 'none',
                        transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                      }}
                    >
                      {role.toLowerCase().replace("_", " ")}
                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4" style={{ color: '#a855f7' }} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Role-specific Dashboard Content */}
      {renderDashboard()}
    </div>
  );
}
