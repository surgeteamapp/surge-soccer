"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Save, Loader2 } from 'lucide-react';

export default function NewPlaybookPage() {
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
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create playbook');
      }
      
      const { playbook } = await response.json();
      router.push(`/playbooks/${playbook.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create playbook');
      setIsSubmitting(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.95) 0%, rgba(26, 10, 46, 0.9) 50%, rgba(15, 5, 25, 0.95) 100%)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(138, 43, 226, 0.3)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(138, 43, 226, 0.1)',
    borderRadius: '16px',
  };

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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0014 0%, #1a0a2e 50%, #0f0519 100%)',
      padding: '24px',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          ...cardStyle,
          padding: '20px 24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          <button
            onClick={() => router.back()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#9ca3af',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={18} />
            Back
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BookOpen style={{ color: '#a855f7' }} size={24} />
            <h1 style={{ 
              margin: 0, 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              color: '#fff' 
            }}>
              Create New Playbook
            </h1>
          </div>
        </div>
        
        {/* Form */}
        <div style={{ ...cardStyle, padding: '32px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
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
              />
            </div>
            
            <div style={{ marginBottom: '24px' }}>
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
                rows={4}
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                  minHeight: '100px',
                }}
              />
            </div>
            
            {error && (
              <div style={{
                padding: '12px 16px',
                marginBottom: '24px',
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
                onClick={() => router.back()}
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
                  cursor: name.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                {isSubmitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                {isSubmitting ? 'Creating...' : 'Create Playbook'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
