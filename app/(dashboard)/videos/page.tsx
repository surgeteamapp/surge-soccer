"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Loader2, 
  Search, 
  Video, 
  Film,
  PlayCircle,
  Eye,
  Clock,
  ExternalLink,
  Youtube,
  Trash2,
  Edit3,
  ChevronDown,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useVideos } from "@/hooks/useVideos";

export default function VideosPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { videos, isLoading, error, fetchVideos } = useVideos();
  
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "game" | "training" | "analysis">("all");
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoCategory, setVideoCategory] = useState<"game" | "training" | "analysis">("game");
  const [isSyncingUrl, setIsSyncingUrl] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState<string>("");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [editDropdownOpen, setEditDropdownOpen] = useState(false);
  
  // Check if user can upload (coach/admin)
  const userRole = (session?.user as any)?.role;
  const canUpload = userRole === 'COACH' || userRole === 'ADMIN';
  const canDelete = userRole === 'COACH' || userRole === 'ADMIN' || userRole === 'TEAM_MANAGER';

  // Handle video deletion
  const handleDeleteVideo = async (e: React.MouseEvent, videoId: string, videoTitle: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm(`Are you sure you want to delete "${videoTitle}"?`)) {
      return;
    }
    
    setDeletingId(videoId);
    try {
      const response = await fetch(`/api/videos/${videoId}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete video');
      }
      // Refresh the video list
      fetchVideos(activeTab, searchTerm);
    } catch (err) {
      alert('Failed to delete video. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // Refetch when tab changes (only when user changes tab, not on initial render)
  const handleTabChange = (tab: "all" | "game" | "training" | "analysis") => {
    setActiveTab(tab);
    fetchVideos(tab, searchTerm);
  };

  // Sync videos from YouTube channel
  const handleSyncYouTube = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const response = await fetch('/api/videos/sync-youtube', { method: 'POST' });
      const data = await response.json();
      
      if (!response.ok) {
        setSyncMessage(data.error || 'Sync failed');
      } else {
        setSyncMessage(`Synced! ${data.created} new, ${data.updated} updated`);
        // Refresh the video list
        fetchVideos(activeTab, searchTerm);
      }
    } catch (err) {
      setSyncMessage('Failed to sync videos');
    } finally {
      setIsSyncing(false);
      // Clear message after 5 seconds
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  // Sync single video by URL
  const handleSyncByUrl = async () => {
    if (!videoUrl.trim()) {
      setSyncMessage('Please enter a YouTube URL');
      return;
    }
    
    setIsSyncingUrl(true);
    setSyncMessage(null);
    try {
      const response = await fetch('/api/videos/sync-youtube-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: videoUrl.trim(), category: videoCategory }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        setSyncMessage(data.error || 'Failed to sync video');
      } else {
        setSyncMessage(data.created ? `Added: ${data.video.title}` : 'Video already synced');
        setVideoUrl("");
        setShowUrlInput(false);
        fetchVideos(activeTab, searchTerm);
      }
    } catch (err) {
      setSyncMessage('Failed to sync video');
    } finally {
      setIsSyncingUrl(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  // Handle category update
  const handleUpdateCategory = async (videoId: string, newCategory: string) => {
    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCategory }),
      });
      if (!response.ok) throw new Error('Failed to update');
      setEditingVideoId(null);
      fetchVideos(activeTab, searchTerm);
      setSyncMessage('Category updated!');
      setTimeout(() => setSyncMessage(null), 3000);
    } catch (err) {
      alert('Failed to update category');
    }
  };

  // Card style matching Stats/Schedule pages
  const cardStyle: React.CSSProperties = { 
    background: "linear-gradient(135deg, rgba(10, 0, 20, 0.95) 0%, rgba(26, 10, 46, 0.9) 50%, rgba(15, 5, 25, 0.95) 100%)", 
    backdropFilter: "blur(20px)", 
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(138, 43, 226, 0.3)", 
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(138, 43, 226, 0.1)",
    borderRadius: "16px" 
  };

  // Filter videos based on search (tab filtering done on server)
  const filteredVideos = videos.filter(video => {
    if (!searchTerm) return true;
    const matchesSearch = video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          video.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Helper to get video thumbnail
  const getVideoThumbnail = (video: any) => {
    if (video.thumbnail) return video.thumbnail;
    if (video.youtubeId) return `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
    return null;
  };

  // Helper to format duration
  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const tabs = [
    { id: "all", label: "All Videos" },
    { id: "game", label: "Game Footage" },
    { id: "training", label: "Training" },
    { id: "analysis", label: "Analysis" },
  ];

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#a855f7" }} />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div style={{ 
        ...cardStyle, 
        padding: "24px", 
        marginBottom: "24px",
        position: "relative",
        zIndex: categoryDropdownOpen ? 50 : 1,
      }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ 
            fontSize: "2rem", 
            fontWeight: 700, 
            color: "white", 
            textShadow: "0 0 20px rgba(138, 43, 226, 0.5)", 
            margin: 0 
          }}>
            Videos
          </h1>
          
          {canUpload && (
            <div style={{ display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap", justifyContent: "center" }}>
              <button
                onClick={handleSyncYouTube}
                disabled={isSyncing}
                onMouseEnter={() => setHoveredButton("sync")}
                onMouseLeave={() => setHoveredButton(null)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 18px",
                  borderRadius: "12px",
                  background: hoveredButton === "sync"
                    ? "linear-gradient(135deg, rgba(239, 68, 68, 0.6) 0%, rgba(220, 38, 38, 0.7) 100%)"
                    : "rgba(239, 68, 68, 0.35)",
                  border: "1px solid rgba(239, 68, 68, 0.5)",
                  color: "#fff",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  cursor: isSyncing ? "not-allowed" : "pointer",
                  opacity: isSyncing ? 0.7 : 1,
                  transform: hoveredButton === "sync" && !isSyncing ? "translateY(-2px)" : "none",
                  boxShadow: hoveredButton === "sync"
                    ? "0 6px 20px rgba(239, 68, 68, 0.4), 0 0 15px rgba(248, 113, 113, 0.3)"
                    : "0 2px 8px rgba(0, 0, 0, 0.2)",
                  transition: "all 0.2s ease"
                }}
              >
                {isSyncing ? (
                  <Loader2 style={{ height: "18px", width: "18px", animation: "spin 1s linear infinite" }} />
                ) : (
                  <Youtube style={{ height: "18px", width: "18px" }} />
                )}
                <span>{isSyncing ? "Syncing..." : "Sync from YouTube"}</span>
              </button>
            </div>
          )}
          
          {/* URL Input */}
          {showUrlInput && (
            <div style={{
              marginTop: "16px",
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
            }}>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Paste YouTube URL here..."
                style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: "rgba(0, 0, 0, 0.4)",
                  border: "1px solid rgba(138, 43, 226, 0.4)",
                  color: "#fff",
                  fontSize: "0.9rem",
                  width: "280px",
                  outline: "none",
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSyncByUrl()}
              />
              {/* Custom Dropdown */}
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "linear-gradient(135deg, rgba(20, 5, 35, 0.95) 0%, rgba(45, 20, 70, 0.9) 100%)";
                    e.currentTarget.style.borderColor = "rgba(168, 85, 247, 0.7)";
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(138, 43, 226, 0.4), 0 0 25px rgba(138, 43, 226, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "linear-gradient(135deg, rgba(10, 0, 20, 0.95) 0%, rgba(26, 10, 46, 0.9) 100%)";
                    e.currentTarget.style.borderColor = "rgba(138, 43, 226, 0.5)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3), 0 0 20px rgba(138, 43, 226, 0.1)";
                  }}
                  style={{
                    padding: "12px 16px",
                    paddingRight: "40px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, rgba(10, 0, 20, 0.95) 0%, rgba(26, 10, 46, 0.9) 100%)",
                    border: "1px solid rgba(138, 43, 226, 0.5)",
                    color: "#fff",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3), 0 0 20px rgba(138, 43, 226, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    minWidth: "150px",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span>
                    {videoCategory === "game" ? "Game Footage" : 
                     videoCategory === "training" ? "Training" : "Analysis"}
                  </span>
                  <ChevronDown 
                    style={{ 
                      position: "absolute",
                      right: "12px",
                      height: "16px", 
                      width: "16px", 
                      color: "#a855f7",
                      transform: categoryDropdownOpen ? "rotate(180deg)" : "none",
                      transition: "transform 0.2s",
                    }} 
                  />
                </button>
                <div style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    marginTop: "4px",
                    background: "linear-gradient(135deg, rgba(20, 5, 40, 0.98) 0%, rgba(45, 27, 78, 0.98) 100%)",
                    border: "1px solid rgba(138, 43, 226, 0.5)",
                    borderRadius: "12px",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5), 0 0 30px rgba(138, 43, 226, 0.2)",
                    zIndex: 100,
                    overflow: "hidden",
                    opacity: categoryDropdownOpen ? 1 : 0,
                    transform: categoryDropdownOpen ? "translateY(0) scale(1)" : "translateY(-10px) scale(0.95)",
                    pointerEvents: categoryDropdownOpen ? "auto" : "none",
                    transition: "all 0.2s ease",
                  }}>
                    {[
                      { value: "game", label: "Game Footage" },
                      { value: "training", label: "Training" },
                      { value: "analysis", label: "Analysis" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setVideoCategory(option.value as "game" | "training" | "analysis");
                          setCategoryDropdownOpen(false);
                        }}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          background: videoCategory === option.value 
                            ? "rgba(138, 43, 226, 0.4)" 
                            : "transparent",
                          border: "none",
                          color: "#fff",
                          fontSize: "0.9rem",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          if (videoCategory !== option.value) {
                            e.currentTarget.style.background = "rgba(138, 43, 226, 0.25)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (videoCategory !== option.value) {
                            e.currentTarget.style.background = "transparent";
                          }
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
              </div>
              <button
                onClick={handleSyncByUrl}
                disabled={isSyncingUrl}
                onMouseEnter={(e) => {
                  if (!isSyncingUrl) {
                    e.currentTarget.style.background = "linear-gradient(135deg, rgba(168, 85, 247, 0.6) 0%, rgba(138, 43, 226, 0.7) 100%)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(138, 43, 226, 0.4), 0 0 15px rgba(168, 85, 247, 0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(138, 43, 226, 0.35)";
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.2)";
                }}
                style={{
                  padding: "12px 20px",
                  borderRadius: "12px",
                  background: "rgba(138, 43, 226, 0.35)",
                  border: "1px solid rgba(138, 43, 226, 0.5)",
                  color: "#fff",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  cursor: isSyncingUrl ? "not-allowed" : "pointer",
                  opacity: isSyncingUrl ? 0.7 : 1,
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                }}
              >
                {isSyncingUrl ? "Adding..." : "Add Video"}
              </button>
            </div>
          )}
          
          {syncMessage && (
            <div style={{
              marginTop: "12px",
              padding: "10px 16px",
              borderRadius: "8px",
              background: (syncMessage.includes("Synced") || syncMessage.includes("Added") || syncMessage.includes("updated")) ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
              border: (syncMessage.includes("Synced") || syncMessage.includes("Added") || syncMessage.includes("updated")) ? "1px solid rgba(34, 197, 94, 0.4)" : "1px solid rgba(239, 68, 68, 0.4)",
              color: (syncMessage.includes("Synced") || syncMessage.includes("Added") || syncMessage.includes("updated")) ? "#86efac" : "#fca5a5",
              fontSize: "0.85rem",
              textAlign: "center",
            }}>
              {syncMessage}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ ...cardStyle, padding: "8px", display: "flex", gap: "8px", marginBottom: "24px" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as any)}
            onMouseEnter={() => setHoveredButton(tab.id)}
            onMouseLeave={() => setHoveredButton(null)}
            style={{
              flex: 1,
              padding: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s",
              background: activeTab === tab.id
                ? "linear-gradient(135deg, rgba(138, 43, 226, 0.4) 0%, rgba(168, 85, 247, 0.3) 100%)"
                : hoveredButton === tab.id
                  ? "rgba(138, 43, 226, 0.15)"
                  : "transparent",
              color: activeTab === tab.id ? "#e9d5ff" : hoveredButton === tab.id ? "#c4b5fd" : "#9ca3af",
              boxShadow: activeTab === tab.id ? "0 0 15px rgba(138, 43, 226, 0.3)" : "none",
              fontWeight: "500",
              fontSize: "0.875rem"
            }}
          >
            {tab.id === "all" && <Film style={{ height: "16px", width: "16px" }} />}
            {tab.id === "game" && <PlayCircle style={{ height: "16px", width: "16px" }} />}
            {tab.id === "training" && <Video style={{ height: "16px", width: "16px" }} />}
            {tab.id === "analysis" && <Search style={{ height: "16px", width: "16px" }} />}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>


      {/* Videos Grid / Empty State */}
      {filteredVideos.length === 0 ? (
        <div style={{ ...cardStyle, padding: "48px", textAlign: "center" }}>
          {/* Search inside empty state */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 16px",
            borderRadius: "12px",
            background: "rgba(138, 43, 226, 0.1)",
            border: "1px solid rgba(138, 43, 226, 0.2)",
            marginBottom: "32px",
            maxWidth: "400px",
            margin: "0 auto 32px",
          }}>
            <Search style={{ height: "18px", width: "18px", color: "#a855f7" }} />
            <input
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#fff",
                fontSize: "0.9rem",
              }}
            />
          </div>
          
          <div style={{
            width: "80px",
            height: "80px",
            borderRadius: "20px",
            background: "rgba(168, 85, 247, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}>
            <Video style={{ height: "40px", width: "40px", color: "#a855f7" }} />
          </div>
          <h3 style={{ color: "#fff", fontSize: "1.3rem", fontWeight: "600", margin: "0 0 8px 0" }}>
            No Videos Yet
          </h3>
          <p style={{ color: "#9ca3af", fontSize: "0.95rem", maxWidth: "400px", margin: "0 auto 24px" }}>
            Sync videos from your YouTube channel to get started with video review.
          </p>
          {canUpload && (
            <button
              onClick={handleSyncYouTube}
              disabled={isSyncing}
              onMouseEnter={() => setHoveredButton("add")}
              onMouseLeave={() => setHoveredButton(null)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 24px",
                borderRadius: "12px",
                background: hoveredButton === "add"
                  ? "linear-gradient(135deg, rgba(239, 68, 68, 0.6) 0%, rgba(220, 38, 38, 0.7) 100%)"
                  : "rgba(239, 68, 68, 0.35)",
                border: "1px solid rgba(239, 68, 68, 0.5)",
                color: "#fff",
                fontWeight: "600",
                fontSize: "0.95rem",
                cursor: isSyncing ? "not-allowed" : "pointer",
                opacity: isSyncing ? 0.7 : 1,
                transform: hoveredButton === "add" && !isSyncing ? "translateY(-2px)" : "none",
                boxShadow: hoveredButton === "add" ? "0 6px 20px rgba(239, 68, 68, 0.4)" : "none",
                transition: "all 0.2s ease"
              }}
            >
              {isSyncing ? (
                <Loader2 style={{ height: "18px", width: "18px", animation: "spin 1s linear infinite" }} />
              ) : (
                <Youtube style={{ height: "18px", width: "18px" }} />
              )}
              {isSyncing ? "Syncing..." : "Sync from YouTube"}
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Search when videos exist */}
          <div style={{ ...cardStyle, padding: "16px", marginBottom: "24px" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              borderRadius: "12px",
              background: "rgba(138, 43, 226, 0.1)",
              border: "1px solid rgba(138, 43, 226, 0.2)",
            }}>
              <Search style={{ height: "18px", width: "18px", color: "#a855f7" }} />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#fff",
                  fontSize: "0.9rem",
                }}
              />
            </div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}>
            {filteredVideos.map((video) => {
              const thumbnail = getVideoThumbnail(video);
              const duration = formatDuration(video.duration);
              const uploaderName = video.uploader 
                ? `${video.uploader.firstName} ${video.uploader.lastName}`
                : 'Unknown';
              
              return (
                <Link
                  key={video.id}
                  href={`/videos/${video.id}`}
                  style={{ textDecoration: "none" }}
                  onMouseEnter={() => setHoveredCard(video.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div
                    style={{
                      ...cardStyle,
                      padding: "0",
                      overflow: "hidden",
                      cursor: "pointer",
                      transform: hoveredCard === video.id ? "translateY(-4px)" : "none",
                      boxShadow: hoveredCard === video.id 
                        ? "0 12px 40px rgba(0, 0, 0, 0.6), 0 0 50px rgba(138, 43, 226, 0.2)"
                        : cardStyle.boxShadow,
                      transition: "all 0.2s ease",
                    }}
                  >
                    {/* Thumbnail */}
                    <div style={{
                      height: "180px",
                      background: thumbnail 
                        ? `url(${thumbnail}) center/cover`
                        : "linear-gradient(135deg, rgba(138, 43, 226, 0.3) 0%, rgba(75, 0, 130, 0.2) 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}>
                      {!thumbnail && (
                        <PlayCircle style={{ height: "48px", width: "48px", color: "#a855f7" }} />
                      )}
                      {thumbnail && (
                        <div style={{
                          position: "absolute",
                          inset: 0,
                          background: hoveredCard === video.id 
                            ? "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)"
                            : "transparent",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "12px",
                          transition: "all 0.3s ease",
                        }}>
                          {/* Play Button */}
                          <div style={{
                            width: "50px",
                            height: "50px",
                            borderRadius: "12px",
                            background: hoveredCard === video.id 
                              ? "linear-gradient(135deg, rgba(138, 43, 226, 0.95) 0%, rgba(168, 85, 247, 0.9) 100%)"
                              : "rgba(0, 0, 0, 0.6)",
                            backdropFilter: "blur(8px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: hoveredCard === video.id 
                              ? "0 4px 20px rgba(138, 43, 226, 0.5), 0 0 30px rgba(168, 85, 247, 0.3)"
                              : "0 2px 10px rgba(0, 0, 0, 0.3)",
                            transform: hoveredCard === video.id ? "scale(1.1)" : "scale(1)",
                            transition: "all 0.3s ease",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                          }}>
                            <div style={{
                              width: 0,
                              height: 0,
                              borderLeft: "14px solid #fff",
                              borderTop: "9px solid transparent",
                              borderBottom: "9px solid transparent",
                              marginLeft: "3px",
                            }} />
                          </div>
                          {/* Film Study Button */}
                          {hoveredCard === video.id && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                router.push(`/videos/${video.id}/study`);
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "8px 14px",
                                borderRadius: "8px",
                                background: "linear-gradient(135deg, rgba(168, 85, 247, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%)",
                                border: "1px solid rgba(168, 85, 247, 0.5)",
                                color: "#fff",
                                fontSize: "0.8rem",
                                fontWeight: "600",
                                cursor: "pointer",
                                boxShadow: "0 4px 15px rgba(168, 85, 247, 0.4)",
                                transform: "translateY(0)",
                                transition: "all 0.2s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 6px 20px rgba(168, 85, 247, 0.5)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 4px 15px rgba(168, 85, 247, 0.4)";
                              }}
                            >
                              <BookOpen style={{ height: "14px", width: "14px" }} />
                              Film Study
                            </button>
                          )}
                        </div>
                      )}
                      {/* Duration badge */}
                      {duration && (
                        <div style={{
                          position: "absolute",
                          bottom: "8px",
                          right: "8px",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          background: "rgba(0, 0, 0, 0.8)",
                          color: "#fff",
                          fontSize: "0.75rem",
                          fontWeight: "500",
                        }}>
                          {duration}
                        </div>
                      )}
                      {/* Video type badge */}
                      {video.externalUrl && (
                        <div style={{
                          position: "absolute",
                          top: "8px",
                          left: "8px",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          background: "rgba(34, 197, 94, 0.9)",
                          color: "#fff",
                          fontSize: "0.7rem",
                          fontWeight: "500",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}>
                          <ExternalLink style={{ height: "12px", width: "12px" }} />
                          External
                        </div>
                      )}
                      {video.fileUrl && (
                        <div style={{
                          position: "absolute",
                          top: "8px",
                          left: "8px",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          background: "rgba(59, 130, 246, 0.9)",
                          color: "#fff",
                          fontSize: "0.7rem",
                          fontWeight: "500",
                        }}>
                          Uploaded
                        </div>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div style={{ padding: "16px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                        <h3 style={{ 
                          color: "#fff", 
                          fontSize: "1rem", 
                          fontWeight: "600", 
                          margin: "0 0 8px 0",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          flex: 1,
                        }}>
                          {video.title}
                        </h3>
                        {canDelete && (
                          <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                            {/* Edit category button */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setEditingVideoId(editingVideoId === video.id ? null : video.id);
                                setEditCategory(video.category || 'game');
                              }}
                              style={{
                                padding: "6px",
                                borderRadius: "6px",
                                background: editingVideoId === video.id ? "rgba(138, 43, 226, 0.3)" : "rgba(138, 43, 226, 0.1)",
                                border: "1px solid rgba(138, 43, 226, 0.3)",
                                color: "#a855f7",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(138, 43, 226, 0.3)"}
                              onMouseLeave={(e) => {
                                if (editingVideoId !== video.id) {
                                  e.currentTarget.style.background = "rgba(138, 43, 226, 0.1)";
                                }
                              }}
                              title="Edit category"
                            >
                              <Edit3 style={{ height: "14px", width: "14px" }} />
                            </button>
                                                      </div>
                        )}
                      </div>
                      
                      {/* Category edit dropdown */}
                      {editingVideoId === video.id && (
                        <div 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                            marginBottom: "8px",
                            padding: "8px",
                            background: "rgba(0, 0, 0, 0.3)",
                            borderRadius: "8px",
                          }}
                        >
                          {/* Custom Dropdown for Edit */}
                          <div style={{ position: "relative", flex: 1 }}>
                            <button
                              type="button"
                              onClick={() => setEditDropdownOpen(!editDropdownOpen)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "linear-gradient(135deg, rgba(20, 5, 35, 0.95) 0%, rgba(45, 20, 70, 0.9) 100%)";
                                e.currentTarget.style.borderColor = "rgba(168, 85, 247, 0.7)";
                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(138, 43, 226, 0.3)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "linear-gradient(135deg, rgba(10, 0, 20, 0.95) 0%, rgba(26, 10, 46, 0.9) 100%)";
                                e.currentTarget.style.borderColor = "rgba(138, 43, 226, 0.5)";
                                e.currentTarget.style.boxShadow = "none";
                              }}
                              style={{
                                width: "100%",
                                padding: "8px 12px",
                                paddingRight: "32px",
                                borderRadius: "8px",
                                background: "linear-gradient(135deg, rgba(10, 0, 20, 0.95) 0%, rgba(26, 10, 46, 0.9) 100%)",
                                border: "1px solid rgba(138, 43, 226, 0.5)",
                                color: "#fff",
                                fontSize: "0.8rem",
                                cursor: "pointer",
                                textAlign: "left",
                                display: "flex",
                                alignItems: "center",
                                transition: "all 0.2s ease",
                              }}
                            >
                              <span>
                                {editCategory === "game" ? "Game Footage" : 
                                 editCategory === "training" ? "Training" : "Analysis"}
                              </span>
                              <ChevronDown 
                                style={{ 
                                  position: "absolute",
                                  right: "10px",
                                  height: "14px", 
                                  width: "14px", 
                                  color: "#a855f7",
                                  transform: editDropdownOpen ? "rotate(180deg)" : "none",
                                  transition: "transform 0.2s",
                                }} 
                              />
                            </button>
                            <div style={{
                                position: "absolute",
                                bottom: "100%",
                                left: 0,
                                right: 0,
                                marginBottom: "4px",
                                background: "linear-gradient(135deg, rgba(20, 5, 40, 0.98) 0%, rgba(45, 27, 78, 0.98) 100%)",
                                border: "1px solid rgba(138, 43, 226, 0.5)",
                                borderRadius: "8px",
                                boxShadow: "0 -8px 24px rgba(0, 0, 0, 0.5), 0 0 30px rgba(138, 43, 226, 0.2)",
                                zIndex: 100,
                                overflow: "hidden",
                                opacity: editDropdownOpen ? 1 : 0,
                                transform: editDropdownOpen ? "translateY(0) scale(1)" : "translateY(10px) scale(0.95)",
                                pointerEvents: editDropdownOpen ? "auto" : "none",
                                transition: "all 0.2s ease",
                              }}>
                                {[
                                  { value: "game", label: "Game Footage" },
                                  { value: "training", label: "Training" },
                                  { value: "analysis", label: "Analysis" },
                                ].map((option) => (
                                  <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                      setEditCategory(option.value);
                                      setEditDropdownOpen(false);
                                    }}
                                    style={{
                                      width: "100%",
                                      padding: "10px 12px",
                                      background: editCategory === option.value 
                                        ? "rgba(138, 43, 226, 0.4)" 
                                        : "transparent",
                                      border: "none",
                                      color: "#fff",
                                      fontSize: "0.8rem",
                                      cursor: "pointer",
                                      textAlign: "left",
                                      transition: "background 0.15s",
                                    }}
                                    onMouseEnter={(e) => {
                                      if (editCategory !== option.value) {
                                        e.currentTarget.style.background = "rgba(138, 43, 226, 0.25)";
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (editCategory !== option.value) {
                                        e.currentTarget.style.background = "transparent";
                                      }
                                    }}
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                          </div>
                          <button
                            onClick={() => {
                              handleUpdateCategory(video.id, editCategory);
                              setEditDropdownOpen(false);
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "linear-gradient(135deg, rgba(168, 85, 247, 0.5) 0%, rgba(138, 43, 226, 0.6) 100%)";
                              e.currentTarget.style.transform = "translateY(-1px)";
                              e.currentTarget.style.boxShadow = "0 4px 12px rgba(138, 43, 226, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "rgba(138, 43, 226, 0.35)";
                              e.currentTarget.style.transform = "none";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                            style={{
                              padding: "8px 14px",
                              borderRadius: "8px",
                              background: "rgba(138, 43, 226, 0.35)",
                              border: "1px solid rgba(138, 43, 226, 0.5)",
                              color: "#fff",
                              fontSize: "0.75rem",
                              fontWeight: "500",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                          >
                            Save
                          </button>
                        </div>
                      )}
                      
                      <p style={{ 
                        color: "#9ca3af", 
                        fontSize: "0.85rem", 
                        margin: "0 0 12px 0",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        lineHeight: "1.4",
                        height: "2.8em",
                      }}>
                        {video.description || "No description"}
                      </p>
                      <div style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "space-between",
                        color: "#6b7280",
                        fontSize: "0.75rem",
                      }}>
                        <span>{uploaderName}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <Eye style={{ height: "12px", width: "12px" }} />
                            {video.viewCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
