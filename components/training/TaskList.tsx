"use client";

import { useState } from 'react';
import { useTraining, TrainingTask, TrainingCategories } from '@/hooks/useTraining';
import { TaskCard } from './TaskCard';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle,
  Clock, 
  Loader2, 
  Plus, 
  Search, 
  AlertTriangle,
  ListTodo,
  Target
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface TaskListProps {
  userId?: string;
  showAssignButton?: boolean;
  showFilters?: boolean;
  cardStyle?: React.CSSProperties;
}

export const TaskList = ({ 
  userId, 
  showAssignButton = true,
  showFilters = true,
  cardStyle
}: TaskListProps) => {
  // Default card style if not provided
  const defaultCardStyle: React.CSSProperties = cardStyle || {
    background: "linear-gradient(135deg, rgba(10, 0, 20, 0.95) 0%, rgba(26, 10, 46, 0.9) 50%, rgba(15, 5, 25, 0.95) 100%)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(138, 43, 226, 0.3)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(138, 43, 226, 0.1)",
    borderRadius: "16px"
  };
  const router = useRouter();
  const { toast } = useToast();
  const { tasks, isLoading, updateTaskProgress } = useTraining();
  
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [assignBtnHover, setAssignBtnHover] = useState(false);
  
  const handleViewTask = (taskId: string) => {
    router.push(`/training/tasks/${taskId}`);
  };
  
  const handleAssignTask = () => {
    router.push('/training/tasks/assign');
  };
  
  const handleUpdateProgress = async (taskId: string, progress: number) => {
    try {
      await updateTaskProgress(taskId, progress);
      toast({
        title: "Progress updated",
        description: progress >= 100 ? "Task marked as completed!" : `Progress updated to ${progress}%`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      });
    }
  };
  
  const getFilteredTasks = () => {
    let filteredTasks = userId ? tasks : tasks;
    
    if (activeTab !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === activeTab);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.category.toLowerCase().includes(query)
      );
    }
    
    if (categoryFilter) {
      filteredTasks = filteredTasks.filter(task => task.category === categoryFilter);
    }
    
    if (difficultyFilter) {
      filteredTasks = filteredTasks.filter(task => task.difficulty === difficultyFilter);
    }
    
    return filteredTasks;
  };
  
  const filteredTasks = getFilteredTasks();
  
  const taskCounts = {
    all: tasks.length,
    pending: tasks.filter(task => task.status === 'pending').length,
    in_progress: tasks.filter(task => task.status === 'in_progress').length,
    completed: tasks.filter(task => task.status === 'completed').length,
    overdue: tasks.filter(task => task.status === 'overdue').length
  };

  const tabs = [
    { id: 'all', label: 'All Tasks', count: taskCounts.all, icon: ListTodo, color: '#a855f7' },
    { id: 'in_progress', label: 'In Progress', count: taskCounts.in_progress, icon: Clock, color: '#3b82f6' },
    { id: 'pending', label: 'Pending', count: taskCounts.pending, icon: Target, color: '#f59e0b' },
    { id: 'completed', label: 'Completed', count: taskCounts.completed, icon: CheckCircle, color: '#22c55e' },
    { id: 'overdue', label: 'Overdue', count: taskCounts.overdue, icon: AlertTriangle, color: '#ef4444' },
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
          <ListTodo style={{ height: '24px', width: '24px', color: '#a855f7' }} />
          <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Training Tasks</h2>
          <span style={{ 
            padding: '4px 10px', 
            borderRadius: '8px', 
            background: 'rgba(168, 85, 247, 0.2)', 
            color: '#c4b5fd', 
            fontSize: '0.8rem',
            fontWeight: '500'
          }}>
            {tasks.length} Total
          </span>
        </div>
        {showAssignButton && (
          <button
            onClick={handleAssignTask}
            onMouseEnter={() => setAssignBtnHover(true)}
            onMouseLeave={() => setAssignBtnHover(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              background: assignBtnHover
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
            Assign New Task
          </button>
        )}
      </div>

      {/* Status Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        padding: '6px',
        background: 'rgba(10, 0, 20, 0.6)',
        borderRadius: '14px',
        border: '1px solid rgba(138, 43, 226, 0.2)',
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
            <tab.icon style={{ height: '14px', width: '14px', color: activeTab === tab.id ? '#fff' : tab.color }} />
            {tab.label}
            <span style={{
              padding: '2px 8px',
              borderRadius: '6px',
              background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : `${tab.color}20`,
              color: activeTab === tab.id ? '#fff' : tab.color,
              fontSize: '0.7rem',
              fontWeight: '600',
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      {showFilters && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{
            flex: '1 1 250px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: '12px',
            background: 'rgba(10, 0, 20, 0.8)',
            border: '1px solid rgba(138, 43, 226, 0.3)',
          }}>
            <Search style={{ height: '16px', width: '16px', color: '#a855f7' }} />
            <input
              type="text"
              placeholder="Search tasks..."
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
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '12px',
              background: 'rgba(10, 0, 20, 0.8)',
              border: '1px solid rgba(138, 43, 226, 0.3)',
              color: categoryFilter ? '#fff' : '#9ca3af',
              fontSize: '0.85rem',
              cursor: 'pointer',
              outline: 'none',
              minWidth: '150px',
            }}
          >
            <option value="">All Categories</option>
            {TrainingCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '12px',
              background: 'rgba(10, 0, 20, 0.8)',
              border: '1px solid rgba(138, 43, 226, 0.3)',
              color: difficultyFilter ? '#fff' : '#9ca3af',
              fontSize: '0.85rem',
              cursor: 'pointer',
              outline: 'none',
              minWidth: '150px',
            }}
          >
            <option value="">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      )}

      {/* Tasks Grid */}
      {filteredTasks.length === 0 ? (
        <div style={{
          ...defaultCardStyle,
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
            <ListTodo style={{ height: '32px', width: '32px', color: '#a855f7' }} />
          </div>
          <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600', margin: '0 0 8px 0' }}>
            No tasks found
          </h3>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: '0 0 16px 0' }}>
            {searchQuery || categoryFilter || difficultyFilter 
              ? 'Try adjusting your filters.' 
              : 'No tasks available in this category.'}
          </p>
          {showAssignButton && (
            <button
              onClick={handleAssignTask}
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
              Assign New Task
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onView={handleViewTask}
              onUpdateProgress={handleUpdateProgress}
            />
          ))}
        </div>
      )}
    </div>
  );
};
