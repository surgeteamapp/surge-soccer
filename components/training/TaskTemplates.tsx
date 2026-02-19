"use client";

import { useState, useEffect } from 'react';
import { safeLocalStorage, STORAGE_KEYS } from '@/lib/localStorage';
import { TrainingCategories } from '@/hooks/useTraining';
import { 
  BookTemplate, 
  Plus, 
  Trash2, 
  X, 
  Save,
  ChevronDown,
  Loader2
} from 'lucide-react';

export interface TrainingTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  videoUrl?: string;
  createdAt: string;
}

interface TaskTemplatesProps {
  onSelectTemplate: (template: TrainingTemplate) => void;
  onSaveTemplate: (template: Omit<TrainingTemplate, 'id' | 'createdAt'>) => void;
  currentValues?: {
    title: string;
    description: string;
    category: string;
    difficulty: string;
    videoUrl?: string;
  };
}

export const TaskTemplates = ({ onSelectTemplate, onSaveTemplate, currentValues }: TaskTemplatesProps) => {
  const [templates, setTemplates] = useState<TrainingTemplate[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    try {
      const saved = safeLocalStorage.getItem(STORAGE_KEYS.TRAINING_TEMPLATES);
      if (saved) {
        setTemplates(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const saveTemplate = () => {
    if (!templateName.trim() || !currentValues) return;
    
    setSaving(true);
    try {
      const newTemplate: TrainingTemplate = {
        id: `template-${Date.now()}`,
        name: templateName.trim(),
        title: currentValues.title,
        description: currentValues.description,
        category: currentValues.category,
        difficulty: currentValues.difficulty as any,
        videoUrl: currentValues.videoUrl,
        createdAt: new Date().toISOString(),
      };
      
      const updatedTemplates = [...templates, newTemplate];
      setTemplates(updatedTemplates);
      safeLocalStorage.setItem(STORAGE_KEYS.TRAINING_TEMPLATES, JSON.stringify(updatedTemplates));
      
      setTemplateName('');
      setShowSaveModal(false);
      onSaveTemplate(newTemplate);
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteTemplate = (id: string) => {
    const updatedTemplates = templates.filter(t => t.id !== id);
    setTemplates(updatedTemplates);
    safeLocalStorage.setItem(STORAGE_KEYS.TRAINING_TEMPLATES, JSON.stringify(updatedTemplates));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#22c55e';
      case 'intermediate': return '#3b82f6';
      case 'advanced': return '#ef4444';
      default: return '#9ca3af';
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {/* Load from Template Button */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '10px',
              background: isOpen ? 'rgba(168, 85, 247, 0.3)' : 'rgba(138, 43, 226, 0.2)',
              border: '1px solid rgba(138, 43, 226, 0.4)',
              color: '#c4b5fd',
              fontSize: '0.85rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <BookTemplate style={{ height: '16px', width: '16px' }} />
            Load Template
            <ChevronDown style={{ 
              height: '14px', 
              width: '14px',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }} />
          </button>
          
          {isOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '8px',
              minWidth: '320px',
              background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.98) 0%, rgba(26, 10, 46, 0.98) 100%)',
              border: '1px solid rgba(138, 43, 226, 0.4)',
              borderRadius: '12px',
              overflow: 'hidden',
              zIndex: 50,
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(138, 43, 226, 0.2)' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                  Saved Templates ({templates.length})
                </span>
              </div>
              
              {templates.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center' }}>
                  <BookTemplate style={{ height: '32px', width: '32px', color: '#6b7280', margin: '0 auto 8px' }} />
                  <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: 0 }}>
                    No templates saved yet
                  </p>
                  <p style={{ color: '#6b7280', fontSize: '0.75rem', margin: '4px 0 0 0' }}>
                    Fill out a task and click "Save as Template"
                  </p>
                </div>
              ) : (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderBottom: '1px solid rgba(138, 43, 226, 0.1)',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(138, 43, 226, 0.15)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      onClick={() => {
                        onSelectTemplate(template);
                        setIsOpen(false);
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <p style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500', margin: 0 }}>
                          {template.name}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: 'rgba(168, 85, 247, 0.2)',
                            color: '#c4b5fd',
                            fontSize: '0.7rem',
                          }}>
                            {template.category}
                          </span>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: `${getDifficultyColor(template.difficulty)}20`,
                            color: getDifficultyColor(template.difficulty),
                            fontSize: '0.7rem',
                            textTransform: 'capitalize',
                          }}>
                            {template.difficulty}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTemplate(template.id);
                        }}
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#f87171',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 style={{ height: '14px', width: '14px' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Save as Template Button */}
        <button
          type="button"
          onClick={() => setShowSaveModal(true)}
          disabled={!currentValues?.title || !currentValues?.description}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '10px',
            background: !currentValues?.title || !currentValues?.description 
              ? 'rgba(138, 43, 226, 0.1)' 
              : 'rgba(34, 197, 94, 0.2)',
            border: !currentValues?.title || !currentValues?.description 
              ? '1px solid rgba(138, 43, 226, 0.2)' 
              : '1px solid rgba(34, 197, 94, 0.4)',
            color: !currentValues?.title || !currentValues?.description 
              ? '#6b7280' 
              : '#4ade80',
            fontSize: '0.85rem',
            fontWeight: '500',
            cursor: !currentValues?.title || !currentValues?.description ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Save style={{ height: '16px', width: '16px' }} />
          Save as Template
        </button>
      </div>

      {/* Save Template Modal */}
      {showSaveModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.98) 0%, rgba(26, 10, 46, 0.95) 100%)',
            border: '1px solid rgba(138, 43, 226, 0.4)',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
                Save as Template
              </h3>
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                }}
              >
                <X style={{ height: '20px', width: '20px' }} />
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#c4b5fd', fontSize: '0.85rem', marginBottom: '8px' }}>
                Template Name
              </label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Weekly Passing Drill"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'rgba(138, 43, 226, 0.1)',
                  border: '1px solid rgba(138, 43, 226, 0.3)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
            
            <div style={{
              padding: '12px',
              borderRadius: '10px',
              background: 'rgba(10, 0, 20, 0.5)',
              marginBottom: '20px',
            }}>
              <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: '0 0 6px 0' }}>Will save:</p>
              <p style={{ color: '#fff', fontSize: '0.85rem', margin: 0, fontWeight: '500' }}>
                {currentValues?.title || 'No title'}
              </p>
              <p style={{ color: '#6b7280', fontSize: '0.75rem', margin: '4px 0 0 0' }}>
                {currentValues?.category} • {currentValues?.difficulty}
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(138, 43, 226, 0.1)',
                  border: '1px solid rgba(138, 43, 226, 0.3)',
                  color: '#c4b5fd',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveTemplate}
                disabled={!templateName.trim() || saving}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '10px',
                  background: !templateName.trim() || saving
                    ? 'rgba(138, 43, 226, 0.1)'
                    : 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(138, 43, 226, 0.5) 100%)',
                  border: '1px solid rgba(168, 85, 247, 0.5)',
                  color: !templateName.trim() || saving ? '#6b7280' : '#fff',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: !templateName.trim() || saving ? 'not-allowed' : 'pointer',
                }}
              >
                {saving && <Loader2 className="animate-spin" style={{ height: '16px', width: '16px' }} />}
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
