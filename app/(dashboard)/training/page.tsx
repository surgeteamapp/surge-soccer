"use client";

import { useState } from 'react';
import { ProgressDashboard } from '@/components/training/ProgressDashboard';
import { TaskList } from '@/components/training/TaskList';
import { useTraining } from '@/hooks/useTraining';
import { 
  Award, ListTodo, TrendingUp, Target, Users, Calendar,
  CheckCircle, Clock, Dumbbell, ChevronRight, Plus
} from 'lucide-react';

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState<"progress" | "tasks">("progress");
  const [hoveredStat, setHoveredStat] = useState<string | null>(null);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [assignBtnHover, setAssignBtnHover] = useState(false);
  
  const { tasks, playerProgress } = useTraining();
  
  // Calculate real stats from actual data
  const activeTasks = tasks.filter(t => t.status === 'in_progress' || t.status === 'pending').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const avgProgress = playerProgress.length > 0 
    ? Math.round(playerProgress.reduce((sum, p) => sum + p.overallProgress, 0) / playerProgress.length)
    : 0;

  // Consistent card style matching app theme
  const cardStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, rgba(10, 0, 20, 0.95) 0%, rgba(26, 10, 46, 0.9) 50%, rgba(15, 5, 25, 0.95) 100%)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(138, 43, 226, 0.3)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(138, 43, 226, 0.1)",
    borderRadius: "16px"
  };

  const statCards = [
    { label: "Active Tasks", value: activeTasks, icon: ListTodo, color: "#a855f7" },
    { label: "Completed", value: completedTasks, icon: CheckCircle, color: "#22c55e" },
    { label: "Avg Progress", value: `${avgProgress}%`, icon: TrendingUp, color: "#3b82f6" },
    { label: "Total Players", value: playerProgress.length, icon: Users, color: "#f59e0b" },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{
        ...cardStyle,
        padding: '24px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%', marginBottom: '16px' }}>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            color: '#ffffff',
            margin: 0,
          }}>
            Training Center
          </h1>
          <p style={{ color: '#9ca3af', marginTop: '8px', fontSize: '0.95rem' }}>
            Track progress, manage tasks, and develop your team&apos;s skills
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          
          <button
            onClick={() => window.location.href = '/training/tasks/assign'}
            onMouseEnter={() => setAssignBtnHover(true)}
            onMouseLeave={() => setAssignBtnHover(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '12px',
              background: assignBtnHover
                ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.5) 0%, rgba(138, 43, 226, 0.6) 100%)'
                : 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(138, 43, 226, 0.5) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.5)',
              color: '#fff',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              transform: assignBtnHover ? 'scale(1.02)' : 'scale(1)',
              boxShadow: assignBtnHover ? '0 0 20px rgba(168, 85, 247, 0.4)' : 'none',
            }}
          >
            <Plus style={{ height: '18px', width: '18px' }} />
            Assign Task
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
          {[
            { id: "progress", label: "Player Progress", icon: Award },
            { id: "tasks", label: "Training Tasks", icon: ListTodo },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: activeTab === tab.id 
                  ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.5) 0%, rgba(138, 43, 226, 0.6) 100%)'
                  : hoveredTab === tab.id
                    ? 'rgba(138, 43, 226, 0.2)'
                    : 'rgba(138, 43, 226, 0.1)',
                color: activeTab === tab.id ? '#fff' : '#c4b5fd',
                fontWeight: activeTab === tab.id ? '600' : '500',
                fontSize: '0.9rem',
              }}
            >
              <tab.icon style={{ height: '16px', width: '16px' }} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '16px',
        marginBottom: '24px',
      }}>
        {statCards.map((stat) => (
          <div
            key={stat.label}
            onMouseEnter={() => setHoveredStat(stat.label)}
            onMouseLeave={() => setHoveredStat(null)}
            style={{
              ...cardStyle,
              padding: '20px',
              border: hoveredStat === stat.label 
                ? '1px solid rgba(168, 85, 247, 0.5)' 
                : '1px solid rgba(138, 43, 226, 0.3)',
              transition: 'all 0.3s ease',
              transform: hoveredStat === stat.label ? 'translateY(-4px)' : 'none',
              boxShadow: hoveredStat === stat.label 
                ? '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 50px rgba(138, 43, 226, 0.2)' 
                : cardStyle.boxShadow,
              cursor: 'default',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                padding: '12px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${stat.color}30 0%, ${stat.color}15 100%)`,
                border: `1px solid ${stat.color}40`,
              }}>
                <stat.icon style={{ height: '22px', width: '22px', color: stat.color }} />
              </div>
              <div>
                <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0, fontWeight: '500' }}>{stat.label}</p>
                <p style={{ 
                  color: '#fff', 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  margin: '4px 0 0 0',
                  textShadow: `0 0 20px ${stat.color}40`
                }}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{
        ...cardStyle,
        padding: '24px',
      }}>
        {activeTab === "progress" ? (
          <ProgressDashboard cardStyle={cardStyle} />
        ) : (
          <TaskList cardStyle={cardStyle} />
        )}
      </div>
    </div>
  );
}
