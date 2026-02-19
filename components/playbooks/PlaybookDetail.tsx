"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Playbook, Play, PlayCategories, PlayCategoryLabels } from '@/hooks/usePlaybooks';
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronDown,
  Clock, 
  Edit3, 
  Loader2, 
  Plus, 
  Search, 
  Layers,
  Calendar,
  Trash2,
  Play as PlayIcon,
  MoreVertical,
  X,
  Save,
  FileText,
  Target,
  Tag,
  Check
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface PlaybookDetailProps {
  playbookId: string;
}

export const PlaybookDetail = ({ playbookId }: PlaybookDetailProps) => {
  const router = useRouter();
  
  // State for fetching playbook directly
  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPlayModal, setShowNewPlayModal] = useState(false);
  const [isCreatingPlay, setIsCreatingPlay] = useState(false);
  const [hoveredPlay, setHoveredPlay] = useState<string | null>(null);
  
  // New play form state
  const [newPlayName, setNewPlayName] = useState('');
  const [newPlayDescription, setNewPlayDescription] = useState('');
  const [newPlayCategory, setNewPlayCategory] = useState<string>(PlayCategories[0]);
  const [newPlayTags, setNewPlayTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  // Fetch playbook directly from API
  useEffect(() => {
    const fetchPlaybook = async () => {
      setIsLoading(true);
      setFetchError(null);
      
      try {
        const response = await fetch(`/api/playbooks/${playbookId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch playbook');
        }
        
        const pb = data.playbook;
        const transformedPlaybook: Playbook = {
          id: pb.id,
          name: pb.name,
          description: pb.description,
          teamId: pb.teamId,
          createdAt: new Date(pb.createdAt),
          updatedAt: new Date(pb.updatedAt),
          plays: (pb.plays || []).map((play: any) => ({
            id: play.id,
            name: play.name,
            description: play.description,
            category: play.category,
            tags: play.tags || [],
            isPublished: play.isPublished,
            createdAt: new Date(play.createdAt),
            updatedAt: new Date(play.updatedAt),
            authorId: play.createdById || play.authorId,
            authorName: play.createdBy ? `${play.createdBy.firstName} ${play.createdBy.lastName}` : 'Unknown',
            versions: (play.playVersions || []).map((v: any) => ({
              id: v.id,
              name: `Version ${v.versionNumber}`,
              description: v.notes,
              createdAt: new Date(v.createdAt),
              createdBy: play.createdById,
              createdByName: play.createdBy ? `${play.createdBy.firstName} ${play.createdBy.lastName}` : 'Unknown',
              views: [],
            })),
            currentVersionId: play.playVersions?.[0]?.id || null,
          })),
        };
        
        setPlaybook(transformedPlaybook);
      } catch (err: any) {
        console.error('Failed to fetch playbook:', err);
        setFetchError(err.message || 'Failed to load playbook');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlaybook();
  }, [playbookId]);
  
  const handleBack = () => {
    router.push('/playbooks');
  };
  
  const handleViewPlay = (playId: string) => {
    router.push(`/plays/${playId}`);
  };
  
  const handleEditPlay = (playId: string) => {
    router.push(`/plays/${playId}/edit`);
  };

  const handleCreatePlay = async () => {
    if (!newPlayName.trim()) {
      setCreateError('Play name is required');
      return;
    }
    
    setIsCreatingPlay(true);
    setCreateError(null);
    
    try {
      const response = await fetch('/api/plays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPlayName,
          description: newPlayDescription,
          category: newPlayCategory,
          tags: newPlayTags,
          playbookId: playbookId,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create play');
      }
      
      // Refresh playbook data
      const refreshResponse = await fetch(`/api/playbooks/${playbookId}`);
      const refreshData = await refreshResponse.json();
      if (refreshResponse.ok) {
        const pb = refreshData.playbook;
        setPlaybook({
          ...playbook!,
          plays: (pb.plays || []).map((play: any) => ({
            id: play.id,
            name: play.name,
            description: play.description,
            category: play.category,
            tags: play.tags || [],
            isPublished: play.isPublished,
            createdAt: new Date(play.createdAt),
            updatedAt: new Date(play.updatedAt),
            authorId: play.createdById || play.authorId,
            authorName: play.createdBy ? `${play.createdBy.firstName} ${play.createdBy.lastName}` : 'Unknown',
            versions: [],
            currentVersionId: null,
          })),
        });
      }
      
      setShowNewPlayModal(false);
      setNewPlayName('');
      setNewPlayDescription('');
      setNewPlayCategory(PlayCategories[0]);
      setNewPlayTags([]);
      setTagInput('');
      
      // Navigate to edit the new play
      router.push(`/plays/${data.play.id}/edit`);
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create play');
    } finally {
      setIsCreatingPlay(false);
    }
  };

  // Filter plays based on search
  const filteredPlays = playbook?.plays.filter(play => {
    if (!searchQuery) return true;
    return play.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           play.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           play.category.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];

  // Stats
  const totalPlays = playbook?.plays.length || 0;
  const categories = Array.from(new Set(playbook?.plays.map(p => p.category) || []));

  // Styles
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
  };

  if (isLoading) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ ...cardStyle, padding: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 className="animate-spin" style={{ height: '48px', width: '48px', color: '#a855f7' }} />
        </div>
      </div>
    );
  }
  
  if (fetchError || !playbook) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ ...cardStyle, padding: '48px', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'rgba(239, 68, 68, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <X style={{ height: '32px', width: '32px', color: '#ef4444' }} />
          </div>
          <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '600', margin: '0 0 8px' }}>
            {fetchError || 'Playbook not found'}
          </h3>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: '0 0 24px' }}>
            The playbook you're looking for doesn't exist or couldn't be loaded.
          </p>
          <button
            onClick={handleBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(138, 43, 226, 0.5) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.5)',
              color: '#fff',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            <ChevronLeft size={18} />
            Back to Playbooks
          </button>
        </div>
      </div>
    );
  }

  const formattedDate = format(new Date(playbook.createdAt), 'MMMM d, yyyy');
  const updatedTimeAgo = formatDistanceToNow(new Date(playbook.updatedAt), { addSuffix: true });

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header Card */}
      <div style={{ ...cardStyle, padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={handleBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                border: '1px solid rgba(138, 43, 226, 0.3)',
                background: 'rgba(138, 43, 226, 0.1)',
                color: '#a855f7',
                cursor: 'pointer',
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                <BookOpen style={{ color: '#a855f7' }} size={24} />
                <h1 style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: '700', 
                  color: 'white', 
                  margin: 0,
                  textShadow: '0 0 20px rgba(138, 43, 226, 0.5)'
                }}>
                  {playbook.name}
                </h1>
              </div>
              <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: 0 }}>
                {playbook.description || 'No description'}
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowNewPlayModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(138, 43, 226, 0.5) 100%)',
                border: '1px solid rgba(168, 85, 247, 0.5)',
                color: '#fff',
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              <Plus size={18} />
              Add Play
            </button>
          </div>
        </div>
        
        {/* Stats Row */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '16px', 
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(138, 43, 226, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(168, 85, 247, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Layers size={20} style={{ color: '#a855f7' }} />
            </div>
            <div>
              <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0, textTransform: 'uppercase' }}>Total Plays</p>
              <p style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>{totalPlays}</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Target size={20} style={{ color: '#3b82f6' }} />
            </div>
            <div>
              <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0, textTransform: 'uppercase' }}>Categories</p>
              <p style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>{categories.length}</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(34, 197, 94, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Calendar size={20} style={{ color: '#22c55e' }} />
            </div>
            <div>
              <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0, textTransform: 'uppercase' }}>Created</p>
              <p style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '600', margin: 0 }}>{formattedDate}</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Clock size={20} style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0, textTransform: 'uppercase' }}>Updated</p>
              <p style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '600', margin: 0 }}>{updatedTimeAgo}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search and Plays Section */}
      <div style={{ ...cardStyle, padding: '24px' }}>
        {/* Search Bar */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ position: 'relative' }}>
            <Search 
              size={18} 
              style={{ 
                position: 'absolute', 
                left: '14px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#9ca3af' 
              }} 
            />
            <input
              type="text"
              placeholder="Search plays..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                ...inputStyle,
                paddingLeft: '44px',
              }}
            />
          </div>
        </div>
        
        {/* Plays Grid */}
        {filteredPlays.length === 0 ? (
          <div style={{ 
            padding: '64px 24px', 
            textAlign: 'center',
            background: 'rgba(138, 43, 226, 0.05)',
            borderRadius: '12px',
            border: '1px dashed rgba(138, 43, 226, 0.3)',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'rgba(168, 85, 247, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Layers style={{ height: '32px', width: '32px', color: '#a855f7' }} />
            </div>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600', margin: '0 0 8px' }}>
              {searchQuery ? 'No plays match your search' : 'No plays yet'}
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: '0 0 24px' }}>
              {searchQuery ? 'Try a different search term.' : 'Create your first play to start designing strategies.'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowNewPlayModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(138, 43, 226, 0.5) 100%)',
                  border: '1px solid rgba(168, 85, 247, 0.5)',
                  color: '#fff',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                <Plus size={18} />
                Create First Play
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {filteredPlays.map(play => (
              <div
                key={play.id}
                onMouseEnter={() => setHoveredPlay(play.id)}
                onMouseLeave={() => setHoveredPlay(null)}
                style={{
                  background: hoveredPlay === play.id 
                    ? 'linear-gradient(135deg, rgba(138, 43, 226, 0.2) 0%, rgba(75, 0, 130, 0.15) 100%)'
                    : 'linear-gradient(135deg, rgba(138, 43, 226, 0.1) 0%, rgba(75, 0, 130, 0.05) 100%)',
                  border: `1px solid ${hoveredPlay === play.id ? 'rgba(168, 85, 247, 0.5)' : 'rgba(138, 43, 226, 0.25)'}`,
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: hoveredPlay === play.id ? 'translateY(-2px)' : 'none',
                }}
                onClick={() => handleViewPlay(play.id)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: 'rgba(168, 85, 247, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <PlayIcon size={18} style={{ color: '#a855f7' }} />
                    </div>
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: '600', margin: 0 }}>{play.name}</h4>
                      <span style={{ 
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'rgba(59, 130, 246, 0.2)',
                        color: '#60a5fa',
                        fontSize: '0.7rem',
                        fontWeight: '500',
                        marginTop: '4px',
                      }}>
                        {play.category.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditPlay(play.id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      border: '1px solid rgba(138, 43, 226, 0.3)',
                      background: 'rgba(138, 43, 226, 0.1)',
                      color: '#a855f7',
                      cursor: 'pointer',
                      opacity: hoveredPlay === play.id ? 1 : 0,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    <Edit3 size={14} />
                  </button>
                </div>
                <p style={{ 
                  color: '#9ca3af', 
                  fontSize: '0.85rem', 
                  margin: '0 0 12px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {play.description || 'No description'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '0.75rem' }}>
                  <Clock size={12} />
                  <span>{formatDistanceToNow(new Date(play.updatedAt), { addSuffix: true })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* New Play Modal */}
      {showNewPlayModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}>
          <div
            onClick={() => setShowNewPlayModal(false)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(4px)',
            }}
          />
          
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '480px',
            ...cardStyle,
            padding: 0,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderBottom: '1px solid rgba(138, 43, 226, 0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <PlayIcon style={{ color: '#a855f7' }} size={22} />
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#fff' }}>
                  Create New Play
                </h2>
              </div>
              
              <button
                onClick={() => setShowNewPlayModal(false)}
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
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>
            
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#c4b5fd' }}>
                  Play Name *
                </label>
                <input
                  type="text"
                  value={newPlayName}
                  onChange={(e) => setNewPlayName(e.target.value)}
                  placeholder="e.g., Box Formation Attack"
                  style={inputStyle}
                  autoFocus
                />
              </div>
              
              {/* Custom Category Dropdown */}
              <div style={{ marginBottom: '20px', position: 'relative' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#c4b5fd' }}>
                  Category
                </label>
                <div
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: `1px solid ${showCategoryDropdown ? 'rgba(168, 85, 247, 0.6)' : 'rgba(138, 43, 226, 0.3)'}`,
                    background: 'rgba(0, 0, 0, 0.3)',
                    color: '#fff',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>{PlayCategoryLabels[newPlayCategory] || newPlayCategory}</span>
                  <ChevronDown 
                    size={18} 
                    style={{ 
                      color: '#a855f7',
                      transform: showCategoryDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }} 
                  />
                </div>
                
                {showCategoryDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    background: 'linear-gradient(135deg, rgba(26, 10, 46, 0.98) 0%, rgba(15, 5, 30, 0.98) 100%)',
                    border: '1px solid rgba(168, 85, 247, 0.4)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    zIndex: 100,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(138, 43, 226, 0.2)',
                  }}>
                    {PlayCategories.map((cat, index) => (
                      <div
                        key={cat}
                        onClick={() => {
                          setNewPlayCategory(cat);
                          setShowCategoryDropdown(false);
                        }}
                        style={{
                          padding: '12px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          background: newPlayCategory === cat 
                            ? 'rgba(168, 85, 247, 0.25)' 
                            : 'transparent',
                          borderBottom: index < PlayCategories.length - 1 
                            ? '1px solid rgba(138, 43, 226, 0.15)' 
                            : 'none',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (newPlayCategory !== cat) {
                            e.currentTarget.style.background = 'rgba(168, 85, 247, 0.15)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (newPlayCategory !== cat) {
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
                      >
                        <span style={{ color: newPlayCategory === cat ? '#c4b5fd' : '#e5e7eb' }}>
                          {PlayCategoryLabels[cat] || cat}
                        </span>
                        {newPlayCategory === cat && (
                          <Check size={16} style={{ color: '#a855f7' }} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Tags Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#c4b5fd' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag size={14} />
                    Tags (optional)
                  </div>
                </label>
                
                {newPlayTags.length > 0 && (
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '8px', 
                    marginBottom: '10px' 
                  }}>
                    {newPlayTags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(139, 92, 246, 0.4) 100%)',
                          border: '1px solid rgba(168, 85, 247, 0.5)',
                          color: '#c4b5fd',
                          fontSize: '12px',
                          fontWeight: '500',
                        }}
                      >
                        {tag}
                        <button
                          onClick={() => setNewPlayTags(newPlayTags.filter(t => t !== tag))}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            border: 'none',
                            background: 'rgba(255, 255, 255, 0.2)',
                            color: '#c4b5fd',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && tagInput.trim()) {
                        e.preventDefault();
                        if (!newPlayTags.includes(tagInput.trim())) {
                          setNewPlayTags([...newPlayTags, tagInput.trim()]);
                        }
                        setTagInput('');
                      }
                    }}
                    placeholder="Type a tag and press Enter..."
                    style={{
                      ...inputStyle,
                      flex: 1,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (tagInput.trim() && !newPlayTags.includes(tagInput.trim())) {
                        setNewPlayTags([...newPlayTags, tagInput.trim()]);
                        setTagInput('');
                      }
                    }}
                    disabled={!tagInput.trim()}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1px solid rgba(168, 85, 247, 0.4)',
                      background: tagInput.trim() 
                        ? 'rgba(168, 85, 247, 0.3)' 
                        : 'rgba(255, 255, 255, 0.05)',
                      color: tagInput.trim() ? '#c4b5fd' : '#6b7280',
                      cursor: tagInput.trim() ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#c4b5fd' }}>
                  Description (optional)
                </label>
                <textarea
                  value={newPlayDescription}
                  onChange={(e) => setNewPlayDescription(e.target.value)}
                  placeholder="Brief description of this play..."
                  rows={3}
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                    minHeight: '80px',
                  }}
                />
              </div>
              
              {createError && (
                <div style={{
                  padding: '12px 16px',
                  marginBottom: '20px',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  fontSize: '14px',
                }}>
                  {createError}
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowNewPlayModal(false)}
                  disabled={isCreatingPlay}
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
                  onClick={handleCreatePlay}
                  disabled={isCreatingPlay || !newPlayName.trim()}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    background: newPlayName.trim()
                      ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.6) 0%, rgba(139, 92, 246, 0.7) 100%)'
                      : 'rgba(255, 255, 255, 0.1)',
                    color: newPlayName.trim() ? '#fff' : '#6b7280',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: newPlayName.trim() && !isCreatingPlay ? 'pointer' : 'not-allowed',
                  }}
                >
                  {isCreatingPlay ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  {isCreatingPlay ? 'Creating...' : 'Create Play'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaybookDetail;
