"use client";

import { useState, useRef, useEffect } from 'react';
import { formatTime, formatRelativeTime } from '@/lib/utils';
import { PencilIcon, TrashIcon, CheckIcon, XIcon, MessageSquare } from 'lucide-react';
import type { VideoNote } from '@/hooks/useVideos';

interface VideoNotesProps {
  notes: VideoNote[];
  currentTime: number;
  onAddNote: (note: { timestamp: number; content: string; drawingData?: any }) => void;
  onDeleteNote?: (noteId: string) => void;
  onSeek: (timestamp: number) => void;
  isCoach: boolean;
}

export function VideoNotes({
  notes,
  currentTime,
  onAddNote,
  onDeleteNote,
  onSeek,
  isCoach
}: VideoNotesProps) {
  const [newNoteContent, setNewNoteContent] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [sortOrder, setSortOrder] = useState<'time' | 'recent'>('time');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Focus the input when showing note form
  useEffect(() => {
    if (showNoteInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showNoteInput]);
  
  // Handle adding a new note
  const handleAddNote = () => {
    if (newNoteContent.trim()) {
      onAddNote({
        timestamp: currentTime,
        content: newNoteContent.trim(),
      });
      setNewNoteContent('');
      setShowNoteInput(false);
    }
  };
  
  // Cancel adding a note
  const handleCancelNote = () => {
    setNewNoteContent('');
    setShowNoteInput(false);
  };
  
  // Sort notes based on the selected order
  const sortedNotes = [...notes].sort((a, b) => {
    if (sortOrder === 'time') {
      return a.timestamp - b.timestamp;
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
  
  // Group notes by timestamp or date added
  const groupedNotes = sortedNotes.reduce((acc, note) => {
    const key = sortOrder === 'time' 
      ? Math.floor(note.timestamp / 60) * 60 // Group by minute
      : new Date(note.createdAt).toDateString(); // Group by day
      
    if (!acc[key]) {
      acc[key] = [];
    }
    
    acc[key].push(note);
    return acc;
  }, {} as Record<string | number, VideoNote[]>);
  
  // Format group header
  const formatGroupHeader = (key: string | number) => {
    if (sortOrder === 'time') {
      // Format minute range (0:00 - 0:59)
      const startTime = formatTime(Number(key));
      const endTime = formatTime(Number(key) + 59);
      return `${startTime} - ${endTime}`;
    } else {
      // Format date
      return new Date(key).toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Video Notes
          </h3>
          
          {/* Toggle sort order */}
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                sortOrder === 'time'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
              onClick={() => setSortOrder('time')}
            >
              By Time
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                sortOrder === 'recent'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
              onClick={() => setSortOrder('recent')}
            >
              Recent
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {/* Add note button */}
        {!showNoteInput && isCoach && (
          <button
            onClick={() => setShowNoteInput(true)}
            className="mb-4 flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            <span>Add note at {formatTime(currentTime)}</span>
          </button>
        )}
        
        {/* Add note form */}
        {showNoteInput && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md">
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              Adding note at <span className="font-medium">{formatTime(currentTime)}</span>
            </div>
            <textarea
              ref={inputRef}
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 p-2 text-gray-900 dark:text-gray-100 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 mb-2"
              placeholder="Enter your note..."
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancelNote}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                disabled={!newNoteContent.trim()}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Note
              </button>
            </div>
          </div>
        )}
        
        {/* Notes list */}
        <div className="space-y-6">
          {Object.keys(groupedNotes).length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notes have been added yet</p>
            </div>
          ) : (
            Object.entries(groupedNotes).map(([key, notesInGroup]) => (
              <div key={key}>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {formatGroupHeader(key)}
                </h4>
                <div className="space-y-3">
                  {notesInGroup.map((note) => (
                    <NoteItem 
                      key={note.id} 
                      note={note} 
                      onSeek={onSeek} 
                      onDelete={onDeleteNote} 
                      isCoach={isCoach}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Individual note component
function NoteItem({ 
  note, 
  onSeek, 
  onDelete,
  isCoach
}: { 
  note: VideoNote; 
  onSeek: (timestamp: number) => void;
  onDelete?: (noteId: string) => void;
  isCoach: boolean;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = () => {
    if (onDelete) {
      onDelete(note.id);
    }
    setIsDeleting(false);
  };
  
  if (isDeleting) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
        <p className="text-sm text-red-800 dark:text-red-200 mb-2">Are you sure you want to delete this note?</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setIsDeleting(false)}
            className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-1 text-xs bg-red-600 text-white rounded-md"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
      <div className="flex justify-between items-start">
        <button
          onClick={() => onSeek(note.timestamp)}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
        >
          {formatTime(note.timestamp)}
        </button>
        <div className="flex items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
            {formatRelativeTime(note.createdAt)}
          </span>
          {isCoach && onDelete && (
            <button
              onClick={() => setIsDeleting(true)}
              className="text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      
      <div className="mt-1">
        <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{note.content}</p>
      </div>
      
      <div className="mt-2 flex justify-between items-center">
        <div className="flex items-center">
          <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs font-medium py-0.5 px-2 rounded-full">
            {note.userRole.toLowerCase()}
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {note.userName}
        </div>
      </div>
      
      {/* Indicator if note has drawing data */}
      {note.drawingData && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
          Contains drawing annotations
        </div>
      )}
    </div>
  );
}
