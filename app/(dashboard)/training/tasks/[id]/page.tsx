"use client";

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTraining } from '@/hooks/useTraining';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { 
  AlertTriangle, 
  ArrowLeft, 
  Calendar, 
  CheckCircle, 
  Clock, 
  ExternalLink, 
  FileVideo, 
  Info, 
  Loader2, 
  PlayIcon, 
  User 
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface TaskDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { tasks, updateTaskProgress, isLoading } = useTraining();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<string>("details");
  const [progress, setProgress] = useState<number>(0);
  const [updating, setUpdating] = useState(false);
  const [backBtnHover, setBackBtnHover] = useState(false);

  // Card style matching app theme
  const cardStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, rgba(10, 0, 20, 0.95) 0%, rgba(26, 10, 46, 0.9) 50%, rgba(15, 5, 25, 0.95) 100%)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(138, 43, 226, 0.3)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(138, 43, 226, 0.1)",
    borderRadius: "16px"
  };
  
  // Find the task by ID
  const task = tasks.find(t => t.id === id);
  
  // If task exists, initialize progress with current value
  if (task && progress === 0) {
    setProgress(task.completionPercentage);
  }
  
  const handleBack = () => {
    router.push('/training');
  };

  const handleUpdateProgress = async () => {
    if (!task) return;
    
    try {
      setUpdating(true);
      await updateTaskProgress(task.id, progress);
      toast({
        title: "Progress updated",
        description: progress >= 100 
          ? "Task marked as completed!" 
          : `Progress updated to ${progress}%`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container mx-auto py-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Task not found</AlertTitle>
          <AlertDescription>
            The requested training task could not be found. It may have been deleted or you may have followed an invalid link.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Format dates
  const assignedDate = format(new Date(task.assignedDate), 'MMMM d, yyyy');
  const dueDate = task.dueDate ? format(new Date(task.dueDate), 'MMMM d, yyyy') : 'No due date';
  const lastUpdated = formatDistanceToNow(new Date(task.lastUpdated), { addSuffix: true });
  
  // Task status badge styling
  const getStatusBadge = () => {
    switch (task.status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Task difficulty badge styling
  const getDifficultyBadge = () => {
    switch (task.difficulty) {
      case 'beginner':
        return <Badge variant="outline" className="text-green-500 border-green-500">Beginner</Badge>;
      case 'intermediate':
        return <Badge variant="outline" className="text-blue-500 border-blue-500">Intermediate</Badge>;
      case 'advanced':
        return <Badge variant="outline" className="text-red-500 border-red-500">Advanced</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <div className="lg:col-span-2" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <div style={{ ...cardStyle, padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                {getStatusBadge()}
                <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', marginTop: '12px' }}>{task.title}</h1>
              </div>
              {getDifficultyBadge()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <span style={{
                padding: '4px 12px',
                borderRadius: '6px',
                background: 'rgba(168, 85, 247, 0.2)',
                color: '#c4b5fd',
                fontSize: '0.8rem',
                fontWeight: '500',
              }}>{task.category}</span>
              <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Assigned by {task.assignedByName}</span>
            </div>
            
            {/* Tab Navigation */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '20px',
              padding: '6px',
              background: 'rgba(10, 0, 20, 0.6)',
              borderRadius: '12px',
              border: '1px solid rgba(138, 43, 226, 0.2)',
            }}>
              <button
                onClick={() => setActiveTab('details')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === 'details' 
                    ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.5) 0%, rgba(138, 43, 226, 0.6) 100%)'
                    : 'transparent',
                  color: activeTab === 'details' ? '#fff' : '#c4b5fd',
                  fontWeight: activeTab === 'details' ? '600' : '500',
                  fontSize: '0.85rem',
                }}
              >
                <Info style={{ height: '14px', width: '14px' }} />
                Details
              </button>
              {task.playId && (
                <button
                  onClick={() => setActiveTab('play')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    background: activeTab === 'play' 
                      ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.5) 0%, rgba(138, 43, 226, 0.6) 100%)'
                      : 'transparent',
                    color: activeTab === 'play' ? '#fff' : '#c4b5fd',
                    fontWeight: activeTab === 'play' ? '600' : '500',
                    fontSize: '0.85rem',
                  }}
                >
                  <PlayIcon style={{ height: '14px', width: '14px' }} />
                  Associated Play
                </button>
              )}
              {task.videoUrl && (
                <button
                  onClick={() => setActiveTab('video')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    background: activeTab === 'video' 
                      ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.5) 0%, rgba(138, 43, 226, 0.6) 100%)'
                      : 'transparent',
                    color: activeTab === 'video' ? '#fff' : '#c4b5fd',
                    fontWeight: activeTab === 'video' ? '600' : '500',
                    fontSize: '0.85rem',
                  }}
                >
                  <FileVideo style={{ height: '14px', width: '14px' }} />
                  Training Video
                </button>
              )}
            </div>

            {/* Tab Content */}
            {activeTab === 'details' && (
              <div>
                <p style={{ color: '#d1d5db', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
                  {task.description}
                </p>
                
                <div style={{ height: '1px', background: 'rgba(138, 43, 226, 0.2)', margin: '24px 0' }} />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <h3 style={{ color: '#9ca3af', fontSize: '0.8rem', fontWeight: '500', marginBottom: '6px' }}>Assigned Date</h3>
                    <p style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                      <Calendar style={{ height: '14px', width: '14px', color: '#a855f7' }} />
                      {assignedDate}
                    </p>
                  </div>
                  <div>
                    <h3 style={{ color: '#9ca3af', fontSize: '0.8rem', fontWeight: '500', marginBottom: '6px' }}>Due Date</h3>
                    <p style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                      <Calendar style={{ height: '14px', width: '14px', color: '#a855f7' }} />
                      {dueDate}
                    </p>
                  </div>
                  <div>
                    <h3 style={{ color: '#9ca3af', fontSize: '0.8rem', fontWeight: '500', marginBottom: '6px' }}>Last Updated</h3>
                    <p style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                      <Clock style={{ height: '14px', width: '14px', color: '#a855f7' }} />
                      {lastUpdated}
                    </p>
                  </div>
                  <div>
                    <h3 style={{ color: '#9ca3af', fontSize: '0.8rem', fontWeight: '500', marginBottom: '6px' }}>Assigned By</h3>
                    <p style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                      <User style={{ height: '14px', width: '14px', color: '#a855f7' }} />
                      {task.assignedByName}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'play' && task.playId && (
              <div style={{
                background: 'rgba(10, 0, 20, 0.6)',
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                border: '1px solid rgba(138, 43, 226, 0.2)',
              }}>
                <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600', marginBottom: '12px' }}>
                  Associated Play: {task.playName}
                </h3>
                <p style={{ color: '#9ca3af', marginBottom: '20px', fontSize: '0.9rem' }}>
                  This task is associated with a play from the playbook. Review and practice this play to complete the task.
                </p>
                <Link href={`/plays/${task.playId}`} passHref>
                  <button style={{
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
                  }}>
                    <PlayIcon style={{ height: '16px', width: '16px' }} />
                    View Play
                  </button>
                </Link>
              </div>
            )}

            {activeTab === 'video' && task.videoUrl && (
              <div style={{
                background: 'rgba(10, 0, 20, 0.6)',
                borderRadius: '12px',
                padding: '48px',
                textAlign: 'center',
                border: '1px solid rgba(138, 43, 226, 0.2)',
              }}>
                <FileVideo style={{ height: '48px', width: '48px', color: '#a855f7', margin: '0 auto 16px' }} />
                <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600', marginBottom: '12px' }}>
                  Training Video Available
                </h3>
                <p style={{ color: '#9ca3af', marginBottom: '20px', fontSize: '0.9rem' }}>
                  Click the button below to view the training video in a new tab.
                </p>
                <a href={task.videoUrl} target="_blank" rel="noopener noreferrer">
                  <button style={{
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
                  }}>
                    <ExternalLink style={{ height: '16px', width: '16px' }} />
                    Open Video
                  </button>
                </a>
              </div>
            )}
          </div>
        
          {/* Progress Sidebar */}
          <div style={{ ...cardStyle, padding: '24px' }}>
            <h2 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' }}>Track Your Progress</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '20px' }}>
              Update your progress as you work on this task
            </p>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Current Progress</span>
                <span style={{ color: '#a855f7', fontSize: '0.95rem', fontWeight: '700' }}>{task.completionPercentage}%</span>
              </div>
              <div style={{
                height: '8px',
                borderRadius: '4px',
                background: 'rgba(138, 43, 226, 0.2)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${task.completionPercentage}%`,
                  background: 'linear-gradient(90deg, #a855f7, #7c3aed)',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease',
                }} />
              </div>
              <p style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '6px' }}>Last updated {lastUpdated}</p>
            </div>
            
            {task.status !== 'completed' && (
              <>
                <div style={{ height: '1px', background: 'rgba(138, 43, 226, 0.2)', margin: '20px 0' }} />
                
                <div>
                  <h3 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500', marginBottom: '12px' }}>Update Progress</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#c4b5fd', fontSize: '0.9rem', fontWeight: '600' }}>{progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={progress}
                    onChange={(e) => setProgress(parseInt(e.target.value))}
                    disabled={updating}
                    style={{ width: '100%', accentColor: '#a855f7' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#6b7280', padding: '0 4px' }}>
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                  <button
                    onClick={handleUpdateProgress}
                    disabled={progress === task.completionPercentage || updating}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      marginTop: '16px',
                      borderRadius: '10px',
                      background: progress === task.completionPercentage || updating
                        ? 'rgba(138, 43, 226, 0.1)'
                        : 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(138, 43, 226, 0.5) 100%)',
                      border: '1px solid rgba(168, 85, 247, 0.5)',
                      color: progress === task.completionPercentage || updating ? '#6b7280' : '#fff',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      cursor: progress === task.completionPercentage || updating ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {updating && <Loader2 className="animate-spin" style={{ height: '16px', width: '16px' }} />}
                    {progress >= 100 ? (
                      <>
                        <CheckCircle style={{ height: '16px', width: '16px' }} />
                        Mark as Completed
                      </>
                    ) : (
                      'Update Progress'
                    )}
                  </button>
                </div>
              </>
            )}
            
            {task.status === 'completed' && (
              <div style={{
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                marginTop: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <CheckCircle style={{ height: '16px', width: '16px', color: '#4ade80' }} />
                  <span style={{ color: '#4ade80', fontWeight: '600', fontSize: '0.9rem' }}>Task Completed!</span>
                </div>
                <p style={{ color: '#86efac', fontSize: '0.8rem' }}>
                  You&apos;ve successfully completed this training task.
                </p>
              </div>
            )}
            
            {task.status === 'overdue' && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                marginTop: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <AlertTriangle style={{ height: '16px', width: '16px', color: '#f87171' }} />
                  <span style={{ color: '#f87171', fontWeight: '600', fontSize: '0.9rem' }}>Task Overdue</span>
                </div>
                <p style={{ color: '#fca5a5', fontSize: '0.8rem' }}>
                  This task was due on {dueDate}. Please complete it as soon as possible.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
