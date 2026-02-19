"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle, AlertCircle, Bell, Info, Pin } from "lucide-react";
import type { Announcement } from "@/hooks/useAnnouncements";

interface CreateAnnouncementModalProps {
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    content: string;
    priority: Announcement['priority'];
    isPinned: boolean;
  }) => void;
}

const PRIORITIES: { value: Announcement['priority']; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'URGENT', label: 'Urgent', icon: <AlertTriangle className="h-4 w-4" />, color: '#f87171' },
  { value: 'HIGH', label: 'High', icon: <AlertCircle className="h-4 w-4" />, color: '#fbbf24' },
  { value: 'NORMAL', label: 'Normal', icon: <Bell className="h-4 w-4" />, color: '#a855f7' },
  { value: 'LOW', label: 'Low', icon: <Info className="h-4 w-4" />, color: '#9ca3af' },
];

export function CreateAnnouncementModal({ onClose, onSubmit }: CreateAnnouncementModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<Announcement['priority']>('NORMAL');
  const [isPinned, setIsPinned] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const newErrors: { title?: string; content?: string } = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!content.trim()) newErrors.content = "Content is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({ title: title.trim(), content: content.trim(), priority, isPinned });
  };

  const selectedPriority = PRIORITIES.find(p => p.value === priority)!;

  if (!mounted) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="scrollbar-purple"
        style={{
          background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.98) 0%, rgba(26, 10, 46, 0.95) 50%, rgba(15, 5, 25, 0.98) 100%)',
          border: '1px solid rgba(138, 43, 226, 0.4)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(138, 43, 226, 0.2)',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflow: 'hidden auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px',
          borderBottom: '1px solid rgba(138, 43, 226, 0.2)',
        }}>
          <h2 style={{
            color: '#fff',
            fontSize: '1.25rem',
            fontWeight: '700',
            margin: 0,
            textShadow: '0 0 15px rgba(138, 43, 226, 0.5)',
          }}>
            Create Announcement
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#9ca3af',
              padding: '6px',
              borderRadius: '8px',
            }}
            className="hover:bg-purple-500/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {/* Title */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              color: '#c4b5fd',
              fontSize: '0.8rem',
              fontWeight: '500',
              marginBottom: '6px',
            }}>
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: undefined });
              }}
              placeholder="Announcement title"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'rgba(138, 43, 226, 0.1)',
                border: errors.title 
                  ? '1px solid rgba(239, 68, 68, 0.5)' 
                  : '1px solid rgba(138, 43, 226, 0.3)',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {errors.title && (
              <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '4px' }}>
                {errors.title}
              </p>
            )}
          </div>

          {/* Content */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              color: '#c4b5fd',
              fontSize: '0.8rem',
              fontWeight: '500',
              marginBottom: '6px',
            }}>
              Content *
            </label>
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (errors.content) setErrors({ ...errors, content: undefined });
              }}
              placeholder="Write your announcement here..."
              rows={5}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'rgba(138, 43, 226, 0.1)',
                border: errors.content 
                  ? '1px solid rgba(239, 68, 68, 0.5)' 
                  : '1px solid rgba(138, 43, 226, 0.3)',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
                resize: 'vertical',
                minHeight: '120px',
                boxSizing: 'border-box',
              }}
            />
            {errors.content && (
              <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '4px' }}>
                {errors.content}
              </p>
            )}
          </div>

          {/* Priority */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              color: '#c4b5fd',
              fontSize: '0.8rem',
              fontWeight: '500',
              marginBottom: '6px',
            }}>
              Priority
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className="hover:scale-105 active:scale-95"
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: priority === p.value 
                      ? `rgba(${p.value === 'URGENT' ? '239, 68, 68' : p.value === 'HIGH' ? '251, 191, 36' : p.value === 'NORMAL' ? '168, 85, 247' : '107, 114, 128'}, 0.2)` 
                      : 'rgba(138, 43, 226, 0.1)',
                    border: priority === p.value 
                      ? `1px solid ${p.color}` 
                      : '1px solid rgba(138, 43, 226, 0.3)',
                    color: priority === p.value ? p.color : '#9ca3af',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                  }}
                >
                  {p.icon}
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pin option */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: '#a855f7',
                  cursor: 'pointer',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Pin className="h-4 w-4 text-amber-400" />
                <span style={{ color: '#d1d5db', fontSize: '0.9rem' }}>
                  Pin this announcement
                </span>
              </div>
            </label>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '0.75rem', 
              marginTop: '4px',
              marginLeft: '28px',
            }}>
              Pinned announcements stay at the top of the list
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                background: 'rgba(107, 114, 128, 0.2)',
                border: '1px solid rgba(107, 114, 128, 0.3)',
                color: '#9ca3af',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
              }}
              className="hover:bg-gray-500/30"
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.5) 0%, rgba(168, 85, 247, 0.6) 100%)',
                border: '1px solid rgba(168, 85, 247, 0.5)',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
              className="hover:bg-purple-500/60"
            >
              Post Announcement
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
