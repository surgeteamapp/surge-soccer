"use client";

import { useTraining, TrainingTask, PlayerProgress } from '@/hooks/useTraining';

export const TestTrainingHook = () => {
  const { 
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
  } = useTraining();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-xl font-bold mb-4">Training Hook Test</h2>
      
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Tasks ({tasks.length})</h3>
        <ul className="list-disc pl-5">
          {tasks.slice(0, 3).map((task: TrainingTask) => (
            <li key={task.id}>
              {task.title} - {task.status} ({task.completionPercentage}%)
            </li>
          ))}
        </ul>
      </div>
      
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Player Progress ({playerProgress.length})</h3>
        <ul className="list-disc pl-5">
          {playerProgress.slice(0, 3).map((player: PlayerProgress) => (
            <li key={player.userId}>
              {player.userName} - {player.overallProgress}%
            </li>
          ))}
        </ul>
      </div>
      
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Tasks by Status</h3>
        <div className="grid grid-cols-4 gap-2">
          <div className="p-2 bg-gray-100 rounded">
            <div className="font-medium">Pending</div>
            <div className="text-xl">{getTasksByStatus('pending').length}</div>
          </div>
          <div className="p-2 bg-gray-100 rounded">
            <div className="font-medium">In Progress</div>
            <div className="text-xl">{getTasksByStatus('in_progress').length}</div>
          </div>
          <div className="p-2 bg-gray-100 rounded">
            <div className="font-medium">Completed</div>
            <div className="text-xl">{getTasksByStatus('completed').length}</div>
          </div>
          <div className="p-2 bg-gray-100 rounded">
            <div className="font-medium">Overdue</div>
            <div className="text-xl">{getTasksByStatus('overdue').length}</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Available Functions</h3>
        <ul className="list-disc pl-5">
          <li>getTasksForPlayer()</li>
          <li>getProgressForPlayer()</li>
          <li>getTasksByStatus()</li>
          <li>getTasksByCategory()</li>
          <li>updateTaskProgress()</li>
          <li>assignTask()</li>
        </ul>
      </div>
    </div>
  );
};

export default TestTrainingHook;
