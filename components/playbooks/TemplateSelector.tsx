"use client";

import React, { useState } from 'react';
import { 
  FORMATION_TEMPLATES, 
  FormationTemplate,
  getTemplatesByCategory 
} from '@/lib/playbook-templates';
import { 
  Layout,
  Shield,
  Flag,
  X,
  Check,
} from 'lucide-react';

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: FormationTemplate) => void;
}

export const TemplateSelector = ({
  isOpen,
  onClose,
  onSelectTemplate,
}: TemplateSelectorProps) => {
  const [activeCategory, setActiveCategory] = useState<'OFFENSIVE' | 'DEFENSIVE' | 'SET_PIECE'>('OFFENSIVE');
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = [
    { id: 'OFFENSIVE', label: 'Offensive', icon: Layout },
    { id: 'DEFENSIVE', label: 'Defensive', icon: Shield },
    { id: 'SET_PIECE', label: 'Set Pieces', icon: Flag },
  ] as const;

  const templates = getTemplatesByCategory(activeCategory);

  const handleSelect = () => {
    if (selectedTemplate) {
      const template = FORMATION_TEMPLATES.find(t => t.id === selectedTemplate);
      if (template) {
        onSelectTemplate(template);
        onClose();
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.98) 0%, rgba(26, 10, 46, 0.95) 100%)',
        border: '1px solid rgba(138, 43, 226, 0.3)',
        borderRadius: '20px',
        width: '700px',
        maxHeight: '80vh',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 60px rgba(138, 43, 226, 0.2)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(138, 43, 226, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ 
              margin: 0, 
              fontSize: '1.25rem', 
              fontWeight: '600',
              color: '#fff',
            }}>
              Formation Templates
            </h2>
            <p style={{ 
              margin: '4px 0 0', 
              fontSize: '13px', 
              color: '#6b7280',
            }}>
              Start with a preset formation
            </p>
          </div>
          
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#9ca3af',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Category tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '16px 24px',
          borderBottom: '1px solid rgba(138, 43, 226, 0.1)',
        }}>
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isActive 
                    ? 'rgba(168, 85, 247, 0.3)'
                    : 'rgba(255, 255, 255, 0.05)',
                  color: isActive ? '#c4b5fd' : '#9ca3af',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontWeight: isActive ? '500' : '400',
                }}
              >
                <Icon size={16} />
                {cat.label}
              </button>
            );
          })}
        </div>
        
        {/* Templates grid */}
        <div style={{
          padding: '20px 24px',
          maxHeight: '400px',
          overflowY: 'auto',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
          }}>
            {templates.map((template) => {
              const isHovered = hoveredTemplate === template.id;
              const isSelected = selectedTemplate === template.id;
              
              return (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  onMouseEnter={() => setHoveredTemplate(template.id)}
                  onMouseLeave={() => setHoveredTemplate(null)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: isSelected 
                      ? 'rgba(168, 85, 247, 0.2)'
                      : isHovered 
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected 
                      ? '2px solid rgba(168, 85, 247, 0.5)'
                      : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                  }}>
                    <div>
                      <h3 style={{
                        margin: 0,
                        fontSize: '15px',
                        fontWeight: '500',
                        color: isSelected ? '#c4b5fd' : '#fff',
                      }}>
                        {template.name}
                      </h3>
                      <p style={{
                        margin: '4px 0 0',
                        fontSize: '12px',
                        color: '#6b7280',
                        lineHeight: 1.4,
                      }}>
                        {template.description}
                      </p>
                    </div>
                    
                    {isSelected && (
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'rgba(168, 85, 247, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Check size={14} color="#fff" />
                      </div>
                    )}
                  </div>
                  
                  {/* Mini preview */}
                  <div style={{
                    marginTop: '12px',
                    height: '60px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '8px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    <svg width="100%" height="100%" viewBox="0 0 200 60">
                      {/* Mini field */}
                      <rect 
                        x="5" y="5" 
                        width="190" height="50" 
                        fill="rgba(138, 43, 226, 0.1)"
                        stroke="rgba(138, 43, 226, 0.3)"
                        strokeWidth="1"
                        rx="3"
                      />
                      <line 
                        x1="100" y1="5" 
                        x2="100" y2="55" 
                        stroke="rgba(138, 43, 226, 0.3)"
                        strokeWidth="1"
                      />
                      
                      {/* Player positions (scaled) */}
                      {template.positions.map((pos, i) => (
                        <circle
                          key={i}
                          cx={(pos.x / 900) * 190 + 5}
                          cy={(pos.y / 500) * 50 + 5}
                          r="5"
                          fill={pos.isOpponent ? 'rgba(239, 68, 68, 0.8)' : 'rgba(168, 85, 247, 0.8)'}
                        />
                      ))}
                      
                      {/* Ball position */}
                      {template.ballPosition && (
                        <circle
                          cx={(template.ballPosition.x / 900) * 190 + 5}
                          cy={(template.ballPosition.y / 500) * 50 + 5}
                          r="3"
                          fill="#f5f5f5"
                        />
                      )}
                    </svg>
                  </div>
                  
                  {/* Player count */}
                  <div style={{
                    marginTop: '8px',
                    fontSize: '11px',
                    color: '#6b7280',
                  }}>
                    {template.positions.filter(p => !p.isOpponent).length} team players
                    {template.positions.filter(p => p.isOpponent).length > 0 && 
                      ` • ${template.positions.filter(p => p.isOpponent).length} opponents`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(138, 43, 226, 0.2)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#9ca3af',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedTemplate}
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              border: 'none',
              background: selectedTemplate 
                ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.6) 0%, rgba(139, 92, 246, 0.7) 100%)'
                : 'rgba(255, 255, 255, 0.1)',
              color: selectedTemplate ? '#fff' : '#6b7280',
              cursor: selectedTemplate ? 'pointer' : 'not-allowed',
              fontWeight: '500',
            }}
          >
            Use Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;
