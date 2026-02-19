"use client";

import React, { useState } from 'react';
import { usePlaybooks, PlayCategories } from '@/hooks/usePlaybooks';
import { PlaybookCard } from './PlaybookCard';
import { PlayCard } from './PlayCard';
import { NewPlaybookModal } from './NewPlaybookModal';
import { EditPlaybookModal } from './EditPlaybookModal';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, Loader2, Plus, Search, Tag, Layers, 
  Layout, FileText, TrendingUp
} from 'lucide-react';

interface PlaybookListProps {
  cardStyle?: React.CSSProperties;
}

export const PlaybookList = ({ cardStyle }: PlaybookListProps) => {
  const router = useRouter();
  const { playbooks, availableTags, isLoading, refetch } = usePlaybooks();
  
  // Default card style if not provided
  const defaultCardStyle: React.CSSProperties = cardStyle || { 
    background: "linear-gradient(135deg, rgba(10, 0, 20, 0.95) 0%, rgba(26, 10, 46, 0.9) 50%, rgba(15, 5, 25, 0.95) 100%)", 
    backdropFilter: "blur(20px)", 
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(138, 43, 226, 0.3)", 
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(138, 43, 226, 0.1)",
    borderRadius: "16px" 
  };
  
  const [activeTab, setActiveTab] = useState<string>("playbooks");
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [hoveredStat, setHoveredStat] = useState<string | null>(null);
  const [createBtnHover, setCreateBtnHover] = useState(false);
  const [showNewPlaybookModal, setShowNewPlaybookModal] = useState(false);
  const [editingPlaybook, setEditingPlaybook] = useState<string | null>(null);
  
  const handleViewPlaybook = (playbookId: string) => router.push(`/playbooks/${playbookId}`);
  const handleEditPlaybook = (playbookId: string) => setEditingPlaybook(playbookId);
  const handleViewPlay = (playId: string) => router.push(`/plays/${playId}`);
  const handleEditPlay = (playId: string) => router.push(`/plays/${playId}/edit`);
  const handleCreatePlaybook = () => setShowNewPlaybookModal(true);
  
  const filteredPlaybooks = playbooks.filter(playbook => {
    if (searchQuery && !playbook.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !playbook.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });
  
  const allPlays = playbooks.flatMap(playbook => playbook.plays);
  
  const filteredPlays = allPlays.filter(play => {
    if (searchQuery && !play.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !play.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (categoryFilter && play.category !== categoryFilter) return false;
    if (tagFilter && !play.tags.includes(tagFilter)) return false;
    return true;
  });

  // Calculate stats
  const uniqueCategories = Array.from(new Set(allPlays.map(p => p.category)));
  const recentlyUpdated = playbooks.filter(p => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(p.updatedAt) > weekAgo;
  }).length;

  const statCards = [
    { label: "Playbooks", value: playbooks.length, icon: BookOpen, color: "#a855f7" },
    { label: "Total Plays", value: allPlays.length, icon: Layers, color: "#3b82f6" },
  ];

  const tabs = [
    { id: 'playbooks', label: 'Playbooks', count: playbooks.length, icon: BookOpen },
    { id: 'plays', label: 'Individual Plays', count: allPlays.length, icon: Tag },
  ];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '64px 0' }}>
        <Loader2 className="animate-spin" style={{ height: '48px', width: '48px', color: '#a855f7' }} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BookOpen style={{ height: '24px', width: '24px', color: '#a855f7' }} />
          <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Playbook Manager</h2>
          <span style={{ 
            padding: '4px 10px', 
            borderRadius: '8px', 
            background: 'rgba(168, 85, 247, 0.2)', 
            color: '#c4b5fd', 
            fontSize: '0.8rem',
            fontWeight: '500'
          }}>
            {playbooks.length} Playbooks
          </span>
        </div>
        <button
          onClick={handleCreatePlaybook}
          onMouseEnter={() => setCreateBtnHover(true)}
          onMouseLeave={() => setCreateBtnHover(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            background: createBtnHover
              ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.5) 0%, rgba(138, 43, 226, 0.6) 100%)'
              : 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(138, 43, 226, 0.5) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.5)',
            color: '#fff',
            fontWeight: '600',
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Plus style={{ height: '16px', width: '16px' }} />
          New Playbook
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {statCards.map((stat) => (
          <div
            key={stat.label}
            onMouseEnter={() => setHoveredStat(stat.label)}
            onMouseLeave={() => setHoveredStat(null)}
            style={{
              background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.15) 0%, rgba(75, 0, 130, 0.1) 100%)',
              border: `1px solid ${hoveredStat === stat.label ? 'rgba(168, 85, 247, 0.5)' : 'rgba(138, 43, 226, 0.25)'}`,
              borderRadius: '12px',
              padding: '16px',
              transition: 'all 0.2s',
              transform: hoveredStat === stat.label ? 'translateY(-2px)' : 'none',
              textAlign: 'center',
            }}
          >
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px', 
              background: `${stat.color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              <stat.icon style={{ height: '20px', width: '20px', color: stat.color }} />
            </div>
            <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</p>
            <p style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', margin: '4px 0 0 0' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '20px',
        padding: '4px',
        background: 'rgba(138, 43, 226, 0.08)',
        borderRadius: '12px',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            onMouseEnter={() => setHoveredTab(tab.id)}
            onMouseLeave={() => setHoveredTab(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeTab === tab.id 
                ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.5) 0%, rgba(138, 43, 226, 0.6) 100%)'
                : hoveredTab === tab.id
                  ? 'rgba(138, 43, 226, 0.15)'
                  : 'transparent',
              color: activeTab === tab.id ? '#fff' : '#c4b5fd',
              fontWeight: activeTab === tab.id ? '600' : '500',
              fontSize: '0.85rem',
            }}
          >
            <tab.icon style={{ height: '14px', width: '14px' }} />
            {tab.label}
            <span style={{
              padding: '2px 8px',
              borderRadius: '6px',
              background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'rgba(168, 85, 247, 0.2)',
              color: activeTab === tab.id ? '#fff' : '#c4b5fd',
              fontSize: '0.7rem',
              fontWeight: '600',
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{
          flex: '1 1 250px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 14px',
          borderRadius: '10px',
          background: 'rgba(138, 43, 226, 0.1)',
          border: '1px solid rgba(138, 43, 226, 0.25)',
        }}>
          <Search style={{ height: '16px', width: '16px', color: '#a855f7' }} />
          <input
            type="text"
            placeholder={activeTab === "playbooks" ? "Search playbooks..." : "Search plays..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '0.85rem',
            }}
          />
        </div>
        
        {activeTab === "plays" && (
          <>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(138, 43, 226, 0.1)',
                border: '1px solid rgba(138, 43, 226, 0.25)',
                color: categoryFilter ? '#fff' : '#9ca3af',
                fontSize: '0.85rem',
                cursor: 'pointer',
                outline: 'none',
                minWidth: '150px',
              }}
            >
              <option value="">All Categories</option>
              {PlayCategories.map((category: string) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(138, 43, 226, 0.1)',
                border: '1px solid rgba(138, 43, 226, 0.25)',
                color: tagFilter ? '#fff' : '#9ca3af',
                fontSize: '0.85rem',
                cursor: 'pointer',
                outline: 'none',
                minWidth: '150px',
              }}
            >
              <option value="">All Tags</option>
              {availableTags.map((tag: string) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* Content */}
      {activeTab === "playbooks" ? (
        filteredPlaybooks.length === 0 ? (
          <div style={{
            background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.95) 0%, rgba(26, 10, 46, 0.9) 50%, rgba(15, 5, 25, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(138, 43, 226, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(138, 43, 226, 0.1)',
            borderRadius: '16px',
            padding: '48px',
            textAlign: 'center',
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
              <BookOpen style={{ height: '32px', width: '32px', color: '#a855f7' }} />
            </div>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600', margin: '0 0 8px 0' }}>
              No playbooks found
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: '0 0 16px 0' }}>
              {searchQuery ? 'Try adjusting your search.' : 'Create your first playbook to get started.'}
            </p>
            <button
              onClick={handleCreatePlaybook}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(138, 43, 226, 0.5) 100%)',
                border: '1px solid rgba(168, 85, 247, 0.5)',
                color: '#fff',
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              <Plus style={{ height: '16px', width: '16px' }} />
              New Playbook
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {filteredPlaybooks.map(playbook => (
              <PlaybookCard
                key={playbook.id}
                playbook={playbook}
                onView={handleViewPlaybook}
                onEdit={handleEditPlaybook}
              />
            ))}
          </div>
        )
      ) : (
        filteredPlays.length === 0 ? (
          <div style={{
            background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.95) 0%, rgba(26, 10, 46, 0.9) 50%, rgba(15, 5, 25, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(138, 43, 226, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(138, 43, 226, 0.1)',
            borderRadius: '16px',
            padding: '48px',
            textAlign: 'center',
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
            <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600', margin: '0 0 8px 0' }}>
              No plays found
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: '0 0 16px 0' }}>
              {searchQuery || categoryFilter || tagFilter 
                ? 'Try adjusting your filters.' 
                : 'Create a playbook and add plays to get started.'}
            </p>
            <button
              onClick={handleCreatePlaybook}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(138, 43, 226, 0.5) 100%)',
                border: '1px solid rgba(168, 85, 247, 0.5)',
                color: '#fff',
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              <Plus style={{ height: '16px', width: '16px' }} />
              New Playbook
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {filteredPlays.map(play => (
              <PlayCard
                key={play.id}
                play={play}
                onView={handleViewPlay}
                onEdit={handleEditPlay}
              />
            ))}
          </div>
        )
      )}
      
      {/* New Playbook Modal */}
      <NewPlaybookModal
        isOpen={showNewPlaybookModal}
        onClose={() => setShowNewPlaybookModal(false)}
        onSuccess={() => refetch()}
      />
      
      {/* Edit Playbook Modal */}
      <EditPlaybookModal
        isOpen={editingPlaybook !== null}
        playbook={playbooks.find(p => p.id === editingPlaybook) || null}
        onClose={() => setEditingPlaybook(null)}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
