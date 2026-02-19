import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export interface TrainingTask {
  id: string;
  title: string;
  description: string;
  category: string;
  assignedBy: string;
  assignedByName: string;
  assignedDate: Date;
  dueDate: Date | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completionPercentage: number;
  lastUpdated: Date;
  videoUrl?: string;
  playId?: string;
  playName?: string;
}

export interface PlayerProgress {
  userId: string;
  userName: string;
  playerNumber?: number;
  position?: string;
  tasks: {
    completed: number;
    total: number;
    overdue: number;
  };
  recentActivity: {
    date: Date;
    taskId: string;
    taskTitle: string;
    type: 'started' | 'progress' | 'completed';
  }[];
  overallProgress: number; // 0-100
  strengths: string[];
  areasToImprove: string[];
}

// Training categories
export const TrainingCategories = [
  'Ball Control',
  'Passing',
  'Shooting',
  'Positioning',
  'Tactical Knowledge',
  'Play Execution',
  'Fitness',
  'General'
];

export function useTraining() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<TrainingTask[]>([]);
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch training tasks and player progress
  useEffect(() => {
    const fetchTrainingData = async () => {
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch tasks from API
        const tasksResponse = await fetch('/api/training/tasks');
        if (!tasksResponse.ok) {
          throw new Error('Failed to fetch training tasks');
        }
        const tasksData = await tasksResponse.json();
        
        // Fetch player progress from API
        const progressResponse = await fetch('/api/training/progress');
        if (!progressResponse.ok) {
          throw new Error('Failed to fetch player progress');
        }
        const progressData = await progressResponse.json();
        
        // Transform dates from strings to Date objects
        const transformedTasks: TrainingTask[] = tasksData.map((task: any) => ({
          ...task,
          assignedDate: new Date(task.assignedDate),
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
          lastUpdated: new Date(task.lastUpdated),
        }));
        
        const transformedProgress: PlayerProgress[] = progressData.map((progress: any) => ({
          ...progress,
          recentActivity: progress.recentActivity.map((activity: any) => ({
            ...activity,
            date: new Date(activity.date),
          })),
        }));
        
        setTasks(transformedTasks);
        setPlayerProgress(transformedProgress);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch training data:', err);
        setError('Failed to load training data. Please try again later.');
        setIsLoading(false);
      }
    };
    
    if (session?.user) {
      fetchTrainingData();
    }
  }, [session]);

  // Get tasks for a specific player
  const getTasksForPlayer = (userId: string): TrainingTask[] => {
    return tasks.filter(() => {
      // Tasks already come filtered from the API
      // If needed, we could make an additional API call here
      return true;
    });
  };

  // Get progress for a specific player
  const getProgressForPlayer = (userId: string): PlayerProgress | undefined => {
    return playerProgress.find((p: PlayerProgress) => p.userId === userId);
  };

  // Get tasks by status
  const getTasksByStatus = (status: TrainingTask['status']): TrainingTask[] => {
    return tasks.filter((task: TrainingTask) => task.status === status);
  };

  // Get tasks by category
  const getTasksByCategory = (category: string): TrainingTask[] => {
    return tasks.filter((task: TrainingTask) => task.category === category);
  };

  // Update task progress
  const updateTaskProgress = async (taskId: string, progress: number): Promise<TrainingTask> => {
    try {
      const response = await fetch(`/api/training/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progress }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task progress');
      }

      // Fetch updated tasks
      const tasksResponse = await fetch('/api/training/tasks');
      if (tasksResponse.ok) {
        const updatedTasksData = await tasksResponse.json();
        const transformedTasks: TrainingTask[] = updatedTasksData.map((task: any) => ({
          ...task,
          assignedDate: new Date(task.assignedDate),
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
          lastUpdated: new Date(task.lastUpdated),
        }));
        setTasks(transformedTasks);

        // Also update player progress
        const progressResponse = await fetch('/api/training/progress');
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          const transformedProgress: PlayerProgress[] = progressData.map((prog: any) => ({
            ...prog,
            recentActivity: prog.recentActivity.map((activity: any) => ({
              ...activity,
              date: new Date(activity.date),
            })),
          }));
          setPlayerProgress(transformedProgress);
        }
      }

      // Find and return the updated task
      const updatedTask = tasks.find((t: TrainingTask) => t.id === taskId);
      if (!updatedTask) {
        throw new Error('Task not found after update');
      }

      return {
        ...updatedTask,
        completionPercentage: progress,
        status: progress >= 100 ? 'completed' as const : progress > 0 ? 'in_progress' as const : 'pending' as const,
        lastUpdated: new Date(),
      };
    } catch (err) {
      console.error('Failed to update task progress:', err);
      throw err;
    }
  };

  // Assign a new task to a player
  const assignTask = async (taskData: {
    title: string;
    description: string;
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    dueDate?: Date;
    videoUrl?: string;
    playId?: string;
    playName?: string;
    assignTo: string[];
  }): Promise<TrainingTask> => {
    try {
      const response = await fetch('/api/training/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error('Failed to assign task');
      }

      const newTask = await response.json();

      // Transform the new task
      const transformedTask: TrainingTask = {
        ...newTask,
        assignedDate: new Date(newTask.assignedDate),
        dueDate: newTask.dueDate ? new Date(newTask.dueDate) : null,
        lastUpdated: new Date(newTask.lastUpdated),
      };

      // Update local state
      setTasks([transformedTask, ...tasks]);

      // Refresh player progress
      const progressResponse = await fetch('/api/training/progress');
      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        const transformedProgress: PlayerProgress[] = progressData.map((prog: any) => ({
          ...prog,
          recentActivity: prog.recentActivity.map((activity: any) => ({
            ...activity,
            date: new Date(activity.date),
          })),
        }));
        setPlayerProgress(transformedProgress);
      }

      return transformedTask;
    } catch (err) {
      console.error('Failed to assign task:', err);
      throw err;
    }
  };

  return {
    tasks,
    playerProgress,
    isLoading,
    error,
    getTasksForPlayer,
    getProgressForPlayer,
    getTasksByStatus,
    getTasksByCategory,
    updateTaskProgress,
    assignTask
  };
}
