"use client";

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTraining } from '@/hooks/useTraining';
import { TaskList } from '@/components/training/TaskList';
import { PlayerAchievements } from '@/components/training/PlayerAchievements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  ArrowDown, 
  ArrowLeft, 
  ArrowUp, 
  Award, 
  CheckCircle, 
  ChevronRight, 
  Clock, 
  Loader2, 
  Plus, 
  User,
  Trophy
} from 'lucide-react';
import { format } from 'date-fns';

interface PlayerDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PlayerDetailPage({ params }: PlayerDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { playerProgress, getTasksForPlayer, isLoading } = useTraining();
  
  const [activeTab, setActiveTab] = useState<string>("progress");
  const [backBtnHover, setBackBtnHover] = useState(false);
  const [assignBtnHover, setAssignBtnHover] = useState(false);

  // Card style matching app theme
  const cardStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, rgba(10, 0, 20, 0.95) 0%, rgba(26, 10, 46, 0.9) 50%, rgba(15, 5, 25, 0.95) 100%)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(138, 43, 226, 0.3)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(138, 43, 226, 0.1)",
    borderRadius: "16px"
  };
  
  // Find the player by ID
  const player = playerProgress.find(p => p.userId === id);
  
  const handleBack = () => {
    router.push('/training');
  };
  
  const handleAssignTask = () => {
    router.push(`/training/tasks/assign?userId=${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="container mx-auto py-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="max-w-md mx-auto text-center p-6 border rounded-lg">
          <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Player Not Found</h2>
          <p className="text-gray-500 mb-4">
            The player profile you're looking for could not be found. It may have been deleted or you may have followed an invalid link.
          </p>
          <Button onClick={handleBack}>Return to Training Dashboard</Button>
        </div>
      </div>
    );
  }

  // Get progress color
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#22c55e';
    if (progress >= 60) return '#3b82f6';
    if (progress >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{ padding: '24px' }}>
      <button
        onClick={handleBack}
        onMouseEnter={() => setBackBtnHover(true)}
        onMouseLeave={() => setBackBtnHover(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          borderRadius: '10px',
          background: backBtnHover ? 'rgba(138, 43, 226, 0.2)' : 'transparent',
          border: '1px solid rgba(138, 43, 226, 0.3)',
          color: '#c4b5fd',
          fontSize: '0.9rem',
          fontWeight: '500',
          cursor: 'pointer',
          marginBottom: '20px',
          transition: 'all 0.2s',
        }}
      >
        <ArrowLeft style={{ height: '16px', width: '16px' }} />
        Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        {/* Player Profile Card */}
        <div style={{ ...cardStyle, padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(37, 99, 235, 0.4) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <User style={{ height: '24px', width: '24px', color: '#60a5fa' }} />
              </div>
              <div>
                <h1 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>{player.userName}</h1>
                {player.position && (
                  <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{player.position}</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Overall Progress</span>
              <span style={{ color: getProgressColor(player.overallProgress), fontSize: '0.95rem', fontWeight: '700' }}>
                {player.overallProgress}%
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
                width: `${player.overallProgress}%`,
                background: `linear-gradient(90deg, ${getProgressColor(player.overallProgress)}80, ${getProgressColor(player.overallProgress)})`,
                borderRadius: '5px',
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
          
          {/* Task Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              borderRadius: '10px',
              padding: '12px',
              textAlign: 'center',
            }}>
              <CheckCircle style={{ height: '18px', width: '18px', color: '#4ade80', margin: '0 auto 6px' }} />
              <p style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>{player.tasks.completed}</p>
              <p style={{ color: '#6b7280', fontSize: '0.7rem', margin: 0 }}>Completed</p>
            </div>
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '10px',
              padding: '12px',
              textAlign: 'center',
            }}>
              <Clock style={{ height: '18px', width: '18px', color: '#60a5fa', margin: '0 auto 6px' }} />
              <p style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>
                {player.tasks.total - player.tasks.completed - player.tasks.overdue}
              </p>
              <p style={{ color: '#6b7280', fontSize: '0.7rem', margin: 0 }}>In Progress</p>
            </div>
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '10px',
              padding: '12px',
              textAlign: 'center',
            }}>
              <AlertTriangle style={{ height: '18px', width: '18px', color: '#f87171', margin: '0 auto 6px' }} />
              <p style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>{player.tasks.overdue}</p>
              <p style={{ color: '#6b7280', fontSize: '0.7rem', margin: 0 }}>Overdue</p>
            </div>
          </div>
          
          <div style={{ height: '1px', background: 'rgba(138, 43, 226, 0.2)', margin: '20px 0' }} />
          
          {/* Skills Assessment */}
          <div>
            <h3 style={{ color: '#9ca3af', fontSize: '0.85rem', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award style={{ height: '14px', width: '14px' }} />
              Skills Assessment
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h4 style={{ color: '#4ade80', fontSize: '0.75rem', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ArrowUp style={{ height: '12px', width: '12px' }} />
                  STRENGTHS
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {player.strengths.map((strength, index) => (
                    <span key={index} style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: 'rgba(34, 197, 94, 0.15)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      color: '#4ade80',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                    }}>
                      {strength}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 style={{ color: '#f87171', fontSize: '0.75rem', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ArrowDown style={{ height: '12px', width: '12px' }} />
                  TO IMPROVE
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {player.areasToImprove.map((area, index) => (
                    <span key={index} style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#f87171',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                    }}>
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleAssignTask}
            onMouseEnter={() => setAssignBtnHover(true)}
            onMouseLeave={() => setAssignBtnHover(false)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              marginTop: '24px',
              borderRadius: '10px',
              background: assignBtnHover
                ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.5) 0%, rgba(138, 43, 226, 0.6) 100%)'
                : 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(138, 43, 226, 0.5) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.5)',
              color: '#fff',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Plus style={{ height: '16px', width: '16px' }} />
            Assign New Task
          </button>
        </div>
        
        {/* Content Area */}
        <div>
          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '20px',
            padding: '6px',
            background: 'rgba(10, 0, 20, 0.6)',
            borderRadius: '14px',
            border: '1px solid rgba(138, 43, 226, 0.2)',
            width: 'fit-content',
          }}>
            <button
              onClick={() => setActiveTab('progress')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'progress' 
                  ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.5) 0%, rgba(138, 43, 226, 0.6) 100%)'
                  : 'transparent',
                color: activeTab === 'progress' ? '#fff' : '#c4b5fd',
                fontWeight: activeTab === 'progress' ? '600' : '500',
                fontSize: '0.9rem',
              }}
            >
              <Award style={{ height: '16px', width: '16px' }} />
              Progress History
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'tasks' 
                  ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.5) 0%, rgba(138, 43, 226, 0.6) 100%)'
                  : 'transparent',
                color: activeTab === 'tasks' ? '#fff' : '#c4b5fd',
                fontWeight: activeTab === 'tasks' ? '600' : '500',
                fontSize: '0.9rem',
              }}
            >
              <CheckCircle style={{ height: '16px', width: '16px' }} />
              Tasks
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'achievements' 
                  ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.5) 0%, rgba(138, 43, 226, 0.6) 100%)'
                  : 'transparent',
                color: activeTab === 'achievements' ? '#fff' : '#c4b5fd',
                fontWeight: activeTab === 'achievements' ? '600' : '500',
                fontSize: '0.9rem',
              }}
            >
              <Trophy style={{ height: '16px', width: '16px' }} />
              Achievements
            </button>
          </div>
          
          {/* Tab Content */}
          {activeTab === 'progress' && (
            <div style={{ ...cardStyle, padding: '24px' }}>
              <h2 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600', marginBottom: '20px' }}>Recent Activity</h2>
              
              {player.recentActivity.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {player.recentActivity.map((activity, index) => {
                    const getActivityStyle = (type: string) => {
                      switch (type) {
                        case 'started': return { bg: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' };
                        case 'progress': return { bg: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
                        case 'completed': return { bg: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' };
                        default: return { bg: 'rgba(156, 163, 175, 0.2)', color: '#9ca3af', border: 'rgba(156, 163, 175, 0.3)' };
                      }
                    };
                    const style = getActivityStyle(activity.type);
                    
                    return (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px',
                        background: 'rgba(10, 0, 20, 0.5)',
                        borderRadius: '10px',
                        borderLeft: `3px solid ${style.color}`,
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{
                              padding: '3px 10px',
                              borderRadius: '6px',
                              background: style.bg,
                              border: `1px solid ${style.border}`,
                              color: style.color,
                              fontSize: '0.7rem',
                              fontWeight: '600',
                              textTransform: 'capitalize',
                            }}>
                              {activity.type === 'progress' ? 'Updated' : activity.type}
                            </span>
                            <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500' }}>{activity.taskTitle}</span>
                          </div>
                          <p style={{ color: '#6b7280', fontSize: '0.75rem', margin: 0 }}>
                            {format(new Date(activity.date), 'MMMM d, yyyy - h:mm a')}
                          </p>
                        </div>
                        <button
                          onClick={() => router.push(`/training/tasks/${activity.taskId}`)}
                          style={{
                            padding: '8px',
                            borderRadius: '8px',
                            background: 'rgba(138, 43, 226, 0.1)',
                            border: '1px solid rgba(138, 43, 226, 0.2)',
                            color: '#c4b5fd',
                            cursor: 'pointer',
                          }}
                        >
                          <ChevronRight style={{ height: '16px', width: '16px' }} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>No recent activity recorded.</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'tasks' && (
            <div style={{ ...cardStyle, padding: '24px' }}>
              <TaskList userId={player.userId} showAssignButton={false} showFilters={false} cardStyle={cardStyle} />
            </div>
          )}

          {activeTab === 'achievements' && (
            <div style={{ ...cardStyle, padding: '24px' }}>
              <PlayerAchievements 
                userId={player.userId} 
                tasksCompleted={player.tasks.completed} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
