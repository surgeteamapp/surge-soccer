// Player Achievement and XP System for Training

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji or icon name
  xpReward: number;
  category: 'completion' | 'streak' | 'mastery' | 'speed' | 'special';
  requirement: {
    type: 'tasks_completed' | 'streak_days' | 'category_mastery' | 'perfect_week' | 'early_completion';
    value: number;
    category?: string;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface PlayerAchievementProgress {
  odecachievementId: string;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export interface PlayerXPData {
  totalXP: number;
  level: number;
  currentLevelXP: number;
  xpToNextLevel: number;
  streak: number;
  lastActivityDate: string;
  achievements: PlayerAchievementProgress[];
}

// XP Level thresholds
export const XP_LEVELS = [
  { level: 1, xpRequired: 0, title: 'Rookie' },
  { level: 2, xpRequired: 100, title: 'Beginner' },
  { level: 3, xpRequired: 250, title: 'Developing' },
  { level: 4, xpRequired: 500, title: 'Improving' },
  { level: 5, xpRequired: 800, title: 'Competent' },
  { level: 6, xpRequired: 1200, title: 'Skilled' },
  { level: 7, xpRequired: 1700, title: 'Advanced' },
  { level: 8, xpRequired: 2300, title: 'Expert' },
  { level: 9, xpRequired: 3000, title: 'Master' },
  { level: 10, xpRequired: 4000, title: 'Legend' },
];

// Achievement definitions
export const ACHIEVEMENTS: Achievement[] = [
  // Completion achievements
  {
    id: 'first-task',
    name: 'First Steps',
    description: 'Complete your first training task',
    icon: '🎯',
    xpReward: 25,
    category: 'completion',
    requirement: { type: 'tasks_completed', value: 1 },
    rarity: 'common',
  },
  {
    id: 'five-tasks',
    name: 'Getting Started',
    description: 'Complete 5 training tasks',
    icon: '⭐',
    xpReward: 50,
    category: 'completion',
    requirement: { type: 'tasks_completed', value: 5 },
    rarity: 'common',
  },
  {
    id: 'ten-tasks',
    name: 'Dedicated Player',
    description: 'Complete 10 training tasks',
    icon: '🏆',
    xpReward: 100,
    category: 'completion',
    requirement: { type: 'tasks_completed', value: 10 },
    rarity: 'rare',
  },
  {
    id: 'twenty-five-tasks',
    name: 'Training Expert',
    description: 'Complete 25 training tasks',
    icon: '🌟',
    xpReward: 250,
    category: 'completion',
    requirement: { type: 'tasks_completed', value: 25 },
    rarity: 'epic',
  },
  {
    id: 'fifty-tasks',
    name: 'Training Legend',
    description: 'Complete 50 training tasks',
    icon: '👑',
    xpReward: 500,
    category: 'completion',
    requirement: { type: 'tasks_completed', value: 50 },
    rarity: 'legendary',
  },
  
  // Streak achievements
  {
    id: 'streak-3',
    name: 'Hot Start',
    description: 'Maintain a 3-day training streak',
    icon: '🔥',
    xpReward: 30,
    category: 'streak',
    requirement: { type: 'streak_days', value: 3 },
    rarity: 'common',
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day training streak',
    icon: '💪',
    xpReward: 75,
    category: 'streak',
    requirement: { type: 'streak_days', value: 7 },
    rarity: 'rare',
  },
  {
    id: 'streak-14',
    name: 'Unstoppable',
    description: 'Maintain a 14-day training streak',
    icon: '⚡',
    xpReward: 150,
    category: 'streak',
    requirement: { type: 'streak_days', value: 14 },
    rarity: 'epic',
  },
  {
    id: 'streak-30',
    name: 'Iron Will',
    description: 'Maintain a 30-day training streak',
    icon: '🏅',
    xpReward: 300,
    category: 'streak',
    requirement: { type: 'streak_days', value: 30 },
    rarity: 'legendary',
  },
  
  // Speed achievements
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Complete a task before its due date',
    icon: '🐦',
    xpReward: 20,
    category: 'speed',
    requirement: { type: 'early_completion', value: 1 },
    rarity: 'common',
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Complete 5 tasks early',
    icon: '⏱️',
    xpReward: 75,
    category: 'speed',
    requirement: { type: 'early_completion', value: 5 },
    rarity: 'rare',
  },
  
  // Special achievements
  {
    id: 'perfect-week',
    name: 'Perfect Week',
    description: 'Complete all assigned tasks in a week',
    icon: '🌈',
    xpReward: 100,
    category: 'special',
    requirement: { type: 'perfect_week', value: 1 },
    rarity: 'epic',
  },
];

// Calculate level from XP
export function calculateLevel(totalXP: number): { level: number; title: string; currentLevelXP: number; xpToNextLevel: number } {
  let currentLevel = XP_LEVELS[0];
  let nextLevel = XP_LEVELS[1];
  
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= XP_LEVELS[i].xpRequired) {
      currentLevel = XP_LEVELS[i];
      nextLevel = XP_LEVELS[i + 1] || XP_LEVELS[i];
      break;
    }
  }
  
  const currentLevelXP = totalXP - currentLevel.xpRequired;
  const xpToNextLevel = nextLevel.xpRequired - currentLevel.xpRequired;
  
  return {
    level: currentLevel.level,
    title: currentLevel.title,
    currentLevelXP,
    xpToNextLevel,
  };
}

// Get rarity color
export function getRarityColor(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'common': return '#9ca3af';
    case 'rare': return '#3b82f6';
    case 'epic': return '#a855f7';
    case 'legendary': return '#fbbf24';
    default: return '#9ca3af';
  }
}

// XP rewards for actions
export const XP_REWARDS = {
  TASK_COMPLETE: 15,
  TASK_COMPLETE_EARLY: 25,
  TASK_COMPLETE_ON_TIME: 20,
  DAILY_LOGIN: 5,
  STREAK_BONUS_MULTIPLIER: 0.1, // 10% bonus per streak day
};
