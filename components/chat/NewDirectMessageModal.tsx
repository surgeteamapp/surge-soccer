"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Search, User, MessageSquare, Loader2, Users } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
}

interface NewDirectMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChat: (userId: string, userName: string) => void;
  onCreateGroupChat?: (userIds: string[], groupName: string) => void;
}

export function NewDirectMessageModal({ 
  isOpen, 
  onClose, 
  onCreateChat,
  onCreateGroupChat 
}: NewDirectMessageModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const [isCloseHovered, setIsCloseHovered] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [groupModeHover, setGroupModeHover] = useState(false);
  const [createGroupHover, setCreateGroupHover] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  // Fetch users from API when modal opens
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      setLoadError(null);
      
      try {
        const response = await fetch('/api/chat/users');
        
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const data = await response.json();
        setTeamMembers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setLoadError('Failed to load users');
      } finally {
        setIsLoadingUsers(false);
      }
    };
    
    fetchUsers();
  }, [isOpen]);
  
  // Filter members based on search
  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);
  
  if (!isOpen || !mounted) return null;
  
  const handleSelectUser = (member: TeamMember) => {
    if (isGroupMode) {
      setSelectedUsers(prev => 
        prev.includes(member.id) 
          ? prev.filter(id => id !== member.id)
          : [...prev, member.id]
      );
    } else {
      onCreateChat(member.id, member.name);
      onClose();
      setSearchQuery("");
    }
  };

  const handleCreateGroup = () => {
    if (selectedUsers.length >= 2 && groupName.trim() && onCreateGroupChat) {
      onCreateGroupChat(selectedUsers, groupName.trim());
      onClose();
      setSelectedUsers([]);
      setGroupName("");
      setIsGroupMode(false);
    }
  };

  const toggleGroupMode = () => {
    setIsGroupMode(!isGroupMode);
    setSelectedUsers([]);
    setGroupName("");
  };
  
  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "ADMIN":
        return { background: "rgba(239, 68, 68, 0.2)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.3)" };
      case "COACH":
        return { background: "rgba(234, 179, 8, 0.2)", color: "#facc15", border: "1px solid rgba(234, 179, 8, 0.3)" };
      default:
        return { background: "rgba(138, 43, 226, 0.2)", color: "#c4b5fd", border: "1px solid rgba(138, 43, 226, 0.3)" };
    }
  };
  
  return createPortal(
    <div 
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(8px)",
        }}
      />
      
      {/* Modal */}
      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: "420px",
        maxHeight: "80vh",
        background: "linear-gradient(135deg, rgba(10, 0, 20, 0.98) 0%, rgba(26, 10, 46, 0.95) 100%)",
        border: "1px solid rgba(138, 43, 226, 0.4)",
        borderRadius: "16px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(138, 43, 226, 0.2)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px",
          borderBottom: "1px solid rgba(138, 43, 226, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, rgba(138, 43, 226, 0.3) 0%, rgba(168, 85, 247, 0.4) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <MessageSquare style={{ height: "20px", width: "20px", color: "#c084fc" }} />
            </div>
            <div>
              <h2 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "600", margin: 0 }}>
                New Message
              </h2>
              <p style={{ color: "#9ca3af", fontSize: "0.8rem", margin: "2px 0 0 0" }}>
                {isGroupMode ? "Select members for group" : "Start a conversation"}
              </p>
            </div>
          </div>
          
          {/* Group Mode Toggle */}
          <button
            onClick={toggleGroupMode}
            onMouseEnter={() => setGroupModeHover(true)}
            onMouseLeave={() => setGroupModeHover(false)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              background: isGroupMode 
                ? "linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(138, 43, 226, 0.5) 100%)"
                : groupModeHover 
                  ? "rgba(138, 43, 226, 0.3)" 
                  : "rgba(138, 43, 226, 0.15)",
              border: isGroupMode 
                ? "1px solid rgba(168, 85, 247, 0.6)" 
                : "1px solid rgba(138, 43, 226, 0.3)",
              cursor: "pointer",
              color: isGroupMode ? "#e9d5ff" : groupModeHover ? "#c4b5fd" : "#9ca3af",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.8rem",
              fontWeight: "500",
              transition: "all 0.2s",
              marginRight: "8px",
            }}
          >
            <Users style={{ height: "14px", width: "14px" }} />
            Group
          </button>
          
          <button
            onClick={onClose}
            onMouseEnter={() => setIsCloseHovered(true)}
            onMouseLeave={() => setIsCloseHovered(false)}
            style={{
              padding: "8px",
              borderRadius: "8px",
              background: isCloseHovered ? "rgba(107, 114, 128, 0.4)" : "rgba(107, 114, 128, 0.2)",
              border: "none",
              cursor: "pointer",
              color: isCloseHovered ? "#fff" : "#9ca3af",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
          >
            <X style={{ height: "18px", width: "18px" }} />
          </button>
        </div>
        
        {/* Search */}
        <div style={{ padding: "16px" }}>
          <div style={{ position: "relative" }}>
            <Search style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              height: "16px",
              width: "16px",
              color: "#9ca3af",
            }} />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              style={{
                width: "100%",
                padding: "12px 12px 12px 40px",
                borderRadius: "10px",
                background: "rgba(138, 43, 226, 0.1)",
                border: "1px solid rgba(138, 43, 226, 0.3)",
                color: "#fff",
                fontSize: "0.9rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>
        
        {/* Members list */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 16px 16px",
        }}>
          {isLoadingUsers ? (
            <div style={{
              textAlign: "center",
              padding: "32px 16px",
              color: "#c4b5fd",
            }}>
              <Loader2 style={{ height: "32px", width: "32px", marginBottom: "8px", animation: "spin 1s linear infinite" }} />
              <p style={{ margin: 0 }}>Loading users...</p>
            </div>
          ) : loadError ? (
            <div style={{
              textAlign: "center",
              padding: "32px 16px",
              color: "#f87171",
            }}>
              <User style={{ height: "32px", width: "32px", marginBottom: "8px", opacity: 0.5 }} />
              <p style={{ margin: 0 }}>{loadError}</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "32px 16px",
              color: "#9ca3af",
            }}>
              <User style={{ height: "32px", width: "32px", marginBottom: "8px", opacity: 0.5 }} />
              <p style={{ margin: 0 }}>No members found</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {filteredMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleSelectUser(member)}
                  onMouseEnter={() => setHoveredUser(member.id)}
                  onMouseLeave={() => setHoveredUser(null)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px",
                    borderRadius: "10px",
                    background: hoveredUser === member.id
                      ? "linear-gradient(135deg, rgba(138, 43, 226, 0.2) 0%, rgba(168, 85, 247, 0.25) 100%)"
                      : "rgba(138, 43, 226, 0.05)",
                    border: hoveredUser === member.id
                      ? "1px solid rgba(168, 85, 247, 0.4)"
                      : "1px solid transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                    transform: hoveredUser === member.id ? "translateX(4px)" : "none",
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, rgba(138, 43, 226, 0.3) 0%, rgba(168, 85, 247, 0.4) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#c084fc",
                    fontWeight: "600",
                    fontSize: "0.9rem",
                  }}>
                    {member.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  
                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <p style={{ color: "#fff", fontWeight: "500", margin: 0, fontSize: "0.95rem" }}>
                      {member.name}
                    </p>
                    <span style={{
                      ...getRoleBadgeStyle(member.role),
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "0.7rem",
                      fontWeight: "600",
                      display: "inline-block",
                      marginTop: "4px",
                    }}>
                      {member.role.replace(/_/g, " ")}
                    </span>
                  </div>
                  
                  {/* Selection indicator */}
                  {isGroupMode && selectedUsers.includes(member.id) ? (
                    <div style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <span style={{ color: "#fff", fontSize: "12px" }}>✓</span>
                    </div>
                  ) : hoveredUser === member.id && !isGroupMode ? (
                    <MessageSquare style={{ height: "16px", width: "16px", color: "#a855f7" }} />
                  ) : null}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Group Name Input & Create Button */}
        {isGroupMode && selectedUsers.length >= 2 && (
          <div style={{
            padding: "16px",
            borderTop: "1px solid rgba(138, 43, 226, 0.2)",
            display: "flex",
            gap: "12px",
          }}>
            <input
              type="text"
              placeholder="Group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "10px",
                background: "rgba(138, 43, 226, 0.1)",
                border: "1px solid rgba(138, 43, 226, 0.3)",
                color: "#fff",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
            <button
              onClick={handleCreateGroup}
              onMouseEnter={() => setCreateGroupHover(true)}
              onMouseLeave={() => setCreateGroupHover(false)}
              disabled={!groupName.trim()}
              style={{
                padding: "12px 20px",
                borderRadius: "10px",
                background: groupName.trim()
                  ? createGroupHover
                    ? "linear-gradient(135deg, rgba(168, 85, 247, 0.7) 0%, rgba(138, 43, 226, 0.8) 100%)"
                    : "linear-gradient(135deg, rgba(168, 85, 247, 0.5) 0%, rgba(138, 43, 226, 0.6) 100%)"
                  : "rgba(107, 114, 128, 0.3)",
                border: "none",
                color: groupName.trim() ? "#fff" : "#6b7280",
                fontWeight: "600",
                cursor: groupName.trim() ? "pointer" : "not-allowed",
                transition: "all 0.2s",
              }}
            >
              Create
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
