"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, BookOpen, Save, Loader2 } from 'lucide-react';

interface NewPlaybookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (playbook: any) => void;
}

export const NewPlaybookModal = ({ isOpen, onClose, onSuccess }: NewPlaybookModalProps) => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Playbook name is required');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/playbooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      
      const data = await response.json();
      console.log('Create playbook response:', response.status, data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create playbook');
      }
      
      const playbook = data.playbook;
      
      // Reset form
      setName('');
      setDescription('');
      
      if (onSuccess) {
        onSuccess(playbook);
      }
      
      onClose();
      router.push(`/playbooks/${playbook.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create playbook');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setName('');
      setDescription('');
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid rgba(138, 43, 226, 0.3)',
    background: 'rgba(0, 0, 0, 0.3)',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.15s ease',
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
              Create New Playbook
            </h2>
          </div>
          
          <button
            onClick={handleClose}
            disabled={isSubmitting}
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
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: '10px',
                border: '1px solid rgba(138, 43, 226, 0.3)',
                background: 'transparent',
                color: '#9ca3af',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              style={{
                flex: 1,
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
                cursor: (name.trim() && !isSubmitting) ? 'pointer' : 'not-allowed',
              }}
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
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

export default NewPlaybookModal;
