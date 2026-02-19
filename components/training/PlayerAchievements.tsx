"use client";

import { useState, useEffect } from 'react';
import { 
  ACHIEVEMENTS, 
  Achievement, 
  PlayerXPData, 
  calculateLevel, 
  getRarityColor,
  XP_LEVELS 
} from '@/lib/achievements';
import { safeLocalStorage, STORAGE_KEYS } from '@/lib/localStorage';
import { Award, Flame, Zap, Lock, Star, TrendingUp } from 'lucide-react';

interface PlayerAchievementsProps {
  userId: string;
  tasksCompleted: number;
  compact?: boolean;
}

export const PlayerAchievements = ({ userId, tasksCompleted, compact = false }: PlayerAchievementsProps) => {
  const [xpData, setXpData] = useState<PlayerXPData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadXPData();
  }, [userId]);

  const loadXPData = () => {
    try {
      const key = `${STORAGE_KEYS.MVP_PREFIX}xp-${userId}`;
      const saved = safeLocalStorage.getItem(key);
      if (saved) {
        setXpData(JSON.parse(saved));
      } else {
        // Initialize new player XP data
        const initialData: PlayerXPData = {
          totalXP: 0,
          level: 1,
          currentLevelXP: 0,
          xpToNextLevel: 100,
          streak: 0,
          lastActivityDate: '',
          achievements: ACHIEVEMENTS.map(a => ({
            odecachievementId: a.id,
            progress: 0,
            maxProgress: a.requirement.value,
          })),
        };
        setXpData(initialData);
      }
    } catch (error) {
      console.error('Error loading XP data:', error);
    }
  };

  // Check achievement unlock status based on tasks completed
  const getAchievementStatus = (achievement: Achievement) => {
    if (achievement.requirement.type === 'tasks_completed') {
      const progress = Math.min(tasksCompleted, achievement.requirement.value);
      const isUnlocked = progress >= achievement.requirement.value;
      return { progress, isUnlocked };
    }
    if (achievement.requirement.type === 'streak_days' && xpData) {
      const progress = Math.min(xpData.streak, achievement.requirement.value);
      const isUnlocked = progress >= achievement.requirement.value;
      return { progress, isUnlocked };
    }
    return { progress: 0, isUnlocked: false };
  };

  const levelInfo = xpData ? calculateLevel(xpData.totalXP) : { level: 1, title: 'Rookie', currentLevelXP: 0, xpToNextLevel: 100 };
  const levelProgress = levelInfo.xpToNextLevel > 0 ? (levelInfo.currentLevelXP / levelInfo.xpToNextLevel) * 100 : 0;

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'completion', label: 'Completion' },
    { id: 'streak', label: 'Streaks' },
    { id: 'speed', label: 'Speed' },
    { id: 'special', label: 'Special' },
  ];

  const filteredAchievements = selectedCategory === 'all' 
    ? ACHIEVEMENTS 
    : ACHIEVEMENTS.filter(a => a.category === selectedCategory);

  const unlockedCount = ACHIEVEMENTS.filter(a => getAchievementStatus(a).isUnlocked).length;

  if (compact) {
    // Compact view for embedding in other components
    return (
      <div style={{
        padding: '16px',
        borderRadius: '12px',
        background: 'rgba(10, 0, 20, 0.6)',
        border: '1px solid rgba(138, 43, 226, 0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award style={{ height: '18px', width: '18px', color: '#fbbf24' }} />
            <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>Level {levelInfo.level}</span>
            <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>• {levelInfo.title}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {xpData && xpData.streak > 0 && (
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '6px',
                background: 'rgba(251, 191, 36, 0.2)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                color: '#fbbf24',
                fontSize: '0.75rem',
                fontWeight: '600',
              }}>
                <Flame style={{ height: '12px', width: '12px' }} />
                {xpData.streak}
              </span>
            )}
          </div>
        </div>
        
        {/* XP Bar */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: '#6b7280', fontSize: '0.7rem' }}>{xpData?.totalXP || 0} XP</span>
            <span style={{ color: '#6b7280', fontSize: '0.7rem' }}>{levelInfo.currentLevelXP}/{levelInfo.xpToNextLevel}</span>
          </div>
          <div style={{
            height: '6px',
            borderRadius: '3px',
            background: 'rgba(138, 43, 226, 0.2)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${levelProgress}%`,
              background: 'linear-gradient(90deg, #a855f7, #7c3aed)',
              borderRadius: '3px',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {/* Recent achievements preview */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {ACHIEVEMENTS.slice(0, 5).map(achievement => {
            const status = getAchievementStatus(achievement);
            return (
              <div
                key={achievement.id}
                title={`${achievement.name}: ${achievement.description}`}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: status.isUnlocked 
                    ? `linear-gradient(135deg, ${getRarityColor(achievement.rarity)}30, ${getRarityColor(achievement.rarity)}15)` 
                    : 'rgba(75, 85, 99, 0.2)',
                  border: status.isUnlocked 
                    ? `1px solid ${getRarityColor(achievement.rarity)}50` 
                    : '1px solid rgba(75, 85, 99, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: status.isUnlocked ? '1rem' : '0.8rem',
                  opacity: status.isUnlocked ? 1 : 0.4,
                }}
              >
                {status.isUnlocked ? achievement.icon : <Lock style={{ height: '12px', width: '12px', color: '#6b7280' }} />}
              </div>
            );
          })}
          <div style={{
            padding: '0 8px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(138, 43, 226, 0.1)',
            border: '1px solid rgba(138, 43, 226, 0.2)',
            display: 'flex',
            alignItems: 'center',
            color: '#c4b5fd',
            fontSize: '0.75rem',
          }}>
            {unlockedCount}/{ACHIEVEMENTS.length}
          </div>
        </div>
      </div>
    );
  }

  // Full view
  return (
    <div>
      {/* Header with Level and XP */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '24px',
        padding: '20px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)',
        border: '1px solid rgba(168, 85, 247, 0.3)',
      }}>
        {/* Level Badge */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(168, 85, 247, 0.4)',
        }}>
          <span style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '800' }}>{levelInfo.level}</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.65rem', fontWeight: '500' }}>LEVEL</span>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>{levelInfo.title}</h3>
            {xpData && xpData.streak > 0 && (
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '8px',
                background: 'rgba(251, 191, 36, 0.2)',
                border: '1px solid rgba(251, 191, 36, 0.4)',
                color: '#fbbf24',
                fontSize: '0.8rem',
                fontWeight: '600',
              }}>
                <Flame style={{ height: '14px', width: '14px' }} />
                {xpData.streak} day streak
              </span>
            )}
          </div>
          
          {/* XP Progress */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#c4b5fd', fontSize: '0.85rem', fontWeight: '500' }}>
                {xpData?.totalXP || 0} XP Total
              </span>
              <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                {levelInfo.currentLevelXP} / {levelInfo.xpToNextLevel} to Level {levelInfo.level + 1}
              </span>
            </div>
            <div style={{
              height: '10px',
              borderRadius: '5px',
              background: 'rgba(138, 43, 226, 0.2)',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${levelProgress}%`,
                background: 'linear-gradient(90deg, #a855f7, #ec4899)',
                borderRadius: '5px',
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0 }}>Achievements</p>
          <p style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', margin: '4px 0 0 0' }}>
            {unlockedCount}<span style={{ color: '#6b7280', fontSize: '1rem' }}>/{ACHIEVEMENTS.length}</span>
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        padding: '6px',
        background: 'rgba(10, 0, 20, 0.6)',
        borderRadius: '12px',
        border: '1px solid rgba(138, 43, 226, 0.2)',
        overflowX: 'auto',
      }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: selectedCategory === cat.id 
                ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.5) 0%, rgba(138, 43, 226, 0.6) 100%)'
                : 'transparent',
              color: selectedCategory === cat.id ? '#fff' : '#c4b5fd',
              fontWeight: selectedCategory === cat.id ? '600' : '500',
              fontSize: '0.85rem',
              whiteSpace: 'nowrap',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '12px',
      }}>
        {filteredAchievements.map(achievement => {
          const status = getAchievementStatus(achievement);
          const progressPercent = (status.progress / achievement.requirement.value) * 100;
          
          return (
            <div
              key={achievement.id}
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: status.isUnlocked 
                  ? `linear-gradient(135deg, ${getRarityColor(achievement.rarity)}15, ${getRarityColor(achievement.rarity)}08)` 
                  : 'rgba(10, 0, 20, 0.6)',
                border: status.isUnlocked 
                  ? `1px solid ${getRarityColor(achievement.rarity)}40` 
                  : '1px solid rgba(75, 85, 99, 0.3)',
                opacity: status.isUnlocked ? 1 : 0.7,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: status.isUnlocked 
                    ? `linear-gradient(135deg, ${getRarityColor(achievement.rarity)}30, ${getRarityColor(achievement.rarity)}15)` 
                    : 'rgba(75, 85, 99, 0.2)',
                  border: status.isUnlocked 
                    ? `1px solid ${getRarityColor(achievement.rarity)}40` 
                    : '1px solid rgba(75, 85, 99, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                }}>
                  {status.isUnlocked ? achievement.icon : <Lock style={{ height: '18px', width: '18px', color: '#6b7280' }} />}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h4 style={{ color: status.isUnlocked ? '#fff' : '#9ca3af', fontSize: '0.9rem', fontWeight: '600', margin: 0 }}>
                      {achievement.name}
                    </h4>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: `${getRarityColor(achievement.rarity)}20`,
                      color: getRarityColor(achievement.rarity),
                      fontSize: '0.65rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                    }}>
                      {achievement.rarity}
                    </span>
                  </div>
                  <p style={{ color: '#6b7280', fontSize: '0.8rem', margin: '0 0 8px 0' }}>
                    {achievement.description}
                  </p>
                  
                  {!status.isUnlocked && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#6b7280', fontSize: '0.7rem' }}>
                          {status.progress} / {achievement.requirement.value}
                        </span>
                        <span style={{ color: '#c4b5fd', fontSize: '0.7rem', fontWeight: '500' }}>
                          +{achievement.xpReward} XP
                        </span>
                      </div>
                      <div style={{
                        height: '4px',
                        borderRadius: '2px',
                        background: 'rgba(138, 43, 226, 0.2)',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${progressPercent}%`,
                          background: getRarityColor(achievement.rarity),
                          borderRadius: '2px',
                        }} />
                      </div>
                    </div>
                  )}
                  
                  {status.isUnlocked && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Star style={{ height: '12px', width: '12px', color: '#fbbf24' }} />
                      <span style={{ color: '#4ade80', fontSize: '0.75rem', fontWeight: '500' }}>
                        Unlocked! +{achievement.xpReward} XP
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
