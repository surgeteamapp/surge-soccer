"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, BookOpen, Save, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { Playbook } from '@/hooks/usePlaybooks';

interface EditPlaybookModalProps {
  isOpen: boolean;
  playbook: Playbook | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditPlaybookModal = ({ isOpen, playbook, onClose, onSuccess }: EditPlaybookModalProps) => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form when playbook changes
  useEffect(() => {
    if (playbook) {
      setName(playbook.name);
      setDescription(playbook.description || '');
    }
  }, [playbook]);

  const handleSave = async () => {
    if (!playbook || !name.trim()) {
      setError('Playbook name is required');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/playbooks/${playbook.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save playbook');
      }
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!playbook) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/playbooks/${playbook.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete playbook');
      }
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleClose = () => {
    if (!isSaving && !isDeleting) {
      setError(null);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  if (!isOpen || !playbook) return null;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid rgba(138, 43, 226, 0.3)',
    background: 'rgba(0, 0, 0, 0.3)',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
        }}
      />
      
      {/* Modal */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '480px',
          background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.98) 0%, rgba(26, 10, 46, 0.95) 50%, rgba(15, 5, 25, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(138, 43, 226, 0.4)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 60px rgba(138, 43, 226, 0.2)',
          borderRadius: '20px',
          animation: 'modalIn 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid rgba(138, 43, 226, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BookOpen style={{ color: '#a855f7' }} size={22} />
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#fff' }}>
              Edit Playbook
            </h2>
          </div>
          
          <button
            onClick={handleClose}
            disabled={isSaving || isDeleting}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              background: 'rgba(168, 85, 247, 0.2)',
              color: '#a855f7',
              cursor: (isSaving || isDeleting) ? 'not-allowed' : 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Content */}
        {showDeleteConfirm ? (
          <div style={{ padding: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <AlertTriangle style={{ color: '#f87171' }} size={28} />
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600', margin: '0 0 8px' }}>
                Delete Playbook?
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: 0 }}>
                This will permanently delete "{playbook.name}" and all its plays. This action cannot be undone.
              </p>
            </div>
            
            {error && (
              <div style={{
                padding: '12px 16px',
                marginBottom: '20px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '14px',
              }}>
                {error}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  borderRadius: '10px',
                  border: '1px solid rgba(138, 43, 226, 0.3)',
                  background: 'transparent',
                  color: '#9ca3af',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.6) 0%, rgba(220, 38, 38, 0.7) 100%)',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                }}
              >
                {isDeleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#c4b5fd',
              }}>
                Playbook Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Offensive Strategies 2024"
                style={inputStyle}
                autoFocus
                disabled={isSaving}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#c4b5fd',
              }}>
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this playbook..."
                rows={3}
                disabled={isSaving}
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                  minHeight: '80px',
                }}
              />
            </div>
            
            {error && (
              <div style={{
                padding: '12px 16px',
                marginBottom: '20px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '14px',
              }}>
                {error}
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isSaving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#f87171',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={16} />
                Delete
              </button>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSaving}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '10px',
                    border: '1px solid rgba(138, 43, 226, 0.3)',
                    background: 'transparent',
                    color: '#9ca3af',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={isSaving || !name.trim()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    background: name.trim()
                      ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.6) 0%, rgba(139, 92, 246, 0.7) 100%)'
                      : 'rgba(255, 255, 255, 0.1)',
                    color: name.trim() ? '#fff' : '#6b7280',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: (name.trim() && !isSaving) ? 'pointer' : 'not-allowed',
                  }}
                >
                  {isSaving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style jsx global>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default EditPlaybookModal;
