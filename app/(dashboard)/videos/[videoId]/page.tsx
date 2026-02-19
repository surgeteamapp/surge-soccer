"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  Loader2, 
  ArrowLeft, 
  Clock, 
  Calendar,
  User,
  Eye,
  Youtube,
  ExternalLink,
  Film,
  Tag,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

interface Video {
  id: string;
  title: string;
  description?: string;
  youtubeId?: string;
  externalUrl?: string;
  fileUrl?: string;
  thumbnail?: string;
  duration?: number;
  category?: string;
  viewCount: number;
  createdAt: string;
  uploader?: {
    firstName: string;
    lastName: string;
  };
}

export default function VideoDetailPage() {
  const { videoId } = useParams() as { videoId: string };
  const { data: session } = useSession();
  const hasFetched = useRef(false);
  
  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  
  // Card style matching app design
  const cardStyle: React.CSSProperties = { 
    background: "linear-gradient(135deg, rgba(10, 0, 20, 0.95) 0%, rgba(26, 10, 46, 0.9) 50%, rgba(15, 5, 25, 0.95) 100%)", 
    backdropFilter: "blur(20px)", 
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(138, 43, 226, 0.3)", 
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(138, 43, 226, 0.1)",
    borderRadius: "16px" 
  };

  // Format duration
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return "Unknown";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Format date
  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Fetch video data
  useEffect(() => {
    async function fetchVideo() {
      if (hasFetched.current) return;
      hasFetched.current = true;
      
      try {
        const response = await fetch(`/api/videos/${videoId}`);
        if (!response.ok) {
          throw new Error('Video not found');
        }
        const data = await response.json();
        setVideo(data);
      } catch (err) {
        setError('Failed to load video');
      } finally {
        setIsLoading(false);
      }
    }
    
    if (videoId) {
      fetchVideo();
    }
  }, [videoId]);
  
  // Loading state
  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Loader2 style={{ width: "48px", height: "48px", color: "#a855f7", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }
  
  // Error or not found state
  if (error || !video) {
    return (
      <div style={{ ...cardStyle, padding: "48px", textAlign: "center", maxWidth: "500px", margin: "0 auto" }}>
        <Film style={{ width: "64px", height: "64px", color: "#6b7280", margin: "0 auto 16px" }} />
        <h2 style={{ color: "#f87171", fontSize: "1.25rem", fontWeight: "600", marginBottom: "8px" }}>
          Video Not Found
        </h2>
        <p style={{ color: "#9ca3af", marginBottom: "24px" }}>
          The video you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Link 
          href="/videos"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(138, 43, 226, 0.5) 100%)",
            border: "1px solid rgba(168, 85, 247, 0.5)",
            color: "#fff",
            textDecoration: "none",
            fontWeight: "500",
          }}
        >
          <ArrowLeft style={{ width: "18px", height: "18px" }} />
          Back to Videos
        </Link>
      </div>
    );
  }
  
  // Get video type badge
  const getVideoTypeBadge = () => {
    if (video.youtubeId) {
      return { icon: Youtube, label: "YouTube", color: "#ef4444" };
    } else if (video.externalUrl) {
      return { icon: ExternalLink, label: "External", color: "#22c55e" };
    } else if (video.fileUrl) {
      return { icon: Film, label: "Uploaded", color: "#3b82f6" };
    }
    return null;
  };

  const badge = getVideoTypeBadge();
  
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header with Back and Film Study buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <Link 
          href="/videos"
          onMouseEnter={() => setHoveredButton("back")}
          onMouseLeave={() => setHoveredButton(null)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            borderRadius: "10px",
            background: hoveredButton === "back" ? "rgba(138, 43, 226, 0.2)" : "transparent",
            border: "1px solid rgba(138, 43, 226, 0.3)",
            color: "#c4b5fd",
            textDecoration: "none",
            fontSize: "0.9rem",
            transition: "all 0.2s",
          }}
        >
          <ArrowLeft style={{ width: "18px", height: "18px" }} />
          Back to Videos
        </Link>
        
        <Link 
          href={`/videos/${videoId}/study`}
          onMouseEnter={() => setHoveredButton("study")}
          onMouseLeave={() => setHoveredButton(null)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 20px",
            borderRadius: "10px",
            background: hoveredButton === "study" 
              ? "linear-gradient(135deg, rgba(168, 85, 247, 0.8) 0%, rgba(139, 92, 246, 0.9) 100%)"
              : "linear-gradient(135deg, rgba(168, 85, 247, 0.6) 0%, rgba(139, 92, 246, 0.7) 100%)",
            border: "1px solid rgba(168, 85, 247, 0.5)",
            color: "#fff",
            textDecoration: "none",
            fontSize: "0.95rem",
            fontWeight: "600",
            boxShadow: hoveredButton === "study" 
              ? "0 6px 20px rgba(168, 85, 247, 0.4)"
              : "0 2px 10px rgba(168, 85, 247, 0.2)",
            transform: hoveredButton === "study" ? "translateY(-2px)" : "none",
            transition: "all 0.2s",
          }}
        >
          <BookOpen style={{ width: "18px", height: "18px" }} />
          Start Film Study
        </Link>
      </div>

      {/* Video Player Card */}
      <div style={{ ...cardStyle, padding: "0", overflow: "hidden", marginBottom: "24px" }}>
        {/* YouTube Embed */}
        {video.youtubeId && (
          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
            <iframe
              src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0&modestbranding=1`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: "none",
              }}
            />
          </div>
        )}

        {/* External Video */}
        {video.externalUrl && !video.youtubeId && (
          <div style={{ 
            position: "relative", 
            paddingBottom: "56.25%", 
            height: 0,
            background: "linear-gradient(135deg, #1a0a2e 0%, #0f051a 100%)",
          }}>
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}>
              <ExternalLink style={{ width: "64px", height: "64px", color: "#22c55e", margin: "0 auto 16px" }} />
              <p style={{ color: "#c4b5fd", marginBottom: "16px" }}>External video link</p>
              <a
                href={video.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 24px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, rgba(34, 197, 94, 0.4) 0%, rgba(22, 163, 74, 0.5) 100%)",
                  border: "1px solid rgba(34, 197, 94, 0.5)",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: "500",
                }}
              >
                <ExternalLink style={{ width: "18px", height: "18px" }} />
                Open Video
              </a>
            </div>
          </div>
        )}

        {/* Uploaded Video */}
        {video.fileUrl && !video.youtubeId && !video.externalUrl && (
          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
            <video
              src={video.fileUrl}
              controls
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "#000",
              }}
            />
          </div>
        )}
      </div>

      {/* Video Info Card */}
      <div style={{ ...cardStyle, padding: "24px" }}>
        {/* Title and Badge */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "16px" }}>
          <h1 style={{ 
            color: "#fff", 
            fontSize: "1.5rem", 
            fontWeight: "700",
            margin: 0,
            textShadow: "0 0 20px rgba(138, 43, 226, 0.3)",
          }}>
            {video.title}
          </h1>
          
          {badge && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "8px",
              background: `${badge.color}20`,
              border: `1px solid ${badge.color}50`,
              color: badge.color,
              fontSize: "0.8rem",
              fontWeight: "500",
              flexShrink: 0,
            }}>
              <badge.icon style={{ width: "14px", height: "14px" }} />
              {badge.label}
            </div>
          )}
        </div>

        {/* Meta info */}
        <div style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          gap: "20px", 
          marginBottom: "20px",
          paddingBottom: "20px",
          borderBottom: "1px solid rgba(138, 43, 226, 0.2)",
        }}>
          {video.uploader && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#9ca3af" }}>
              <User style={{ width: "16px", height: "16px", color: "#a855f7" }} />
              <span>{video.uploader.firstName} {video.uploader.lastName}</span>
            </div>
          )}
          
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#9ca3af" }}>
            <Calendar style={{ width: "16px", height: "16px", color: "#a855f7" }} />
            <span>{formatDate(video.createdAt)}</span>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#9ca3af" }}>
            <Clock style={{ width: "16px", height: "16px", color: "#a855f7" }} />
            <span>{formatDuration(video.duration)}</span>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#9ca3af" }}>
            <Eye style={{ width: "16px", height: "16px", color: "#a855f7" }} />
            <span>{video.viewCount} views</span>
          </div>

          {video.category && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#9ca3af" }}>
              <Tag style={{ width: "16px", height: "16px", color: "#a855f7" }} />
              <span style={{ textTransform: "capitalize" }}>{video.category}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {video.description && (
          <div>
            <h3 style={{ color: "#e9d5ff", fontSize: "1rem", fontWeight: "600", marginBottom: "8px" }}>
              Description
            </h3>
            <p style={{ color: "#9ca3af", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
              {video.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
