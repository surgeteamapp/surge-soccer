"use client";

import { useState, useRef, useEffect } from 'react';
import { PlayText } from '@/hooks/usePlaybooks';

interface PlayTextAnnotationProps {
  text: PlayText;
  isSelected: boolean;
  canEdit: boolean;
  onSelect: (id: string) => void;
  onTextChange: (id: string, updates: Partial<PlayText>) => void;
  onTextDelete: (id: string) => void;
}

export const PlayTextAnnotation = ({
  text,
  isSelected,
  canEdit,
  onSelect,
  onTextChange,
  onTextDelete
}: PlayTextAnnotationProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(text.content);
  const textRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Handle selection
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(text.id);
  };
  
  // Handle double click to edit
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!canEdit) return;
    
    e.stopPropagation();
    setIsEditing(true);
  };
  
  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canEdit || isEditing) return;
    
    e.stopPropagation();
    onSelect(text.id);
    setIsDragging(true);
  };
  
  // Update position on drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && textRef.current && canEdit) {
        const rect = textRef.current.parentElement?.getBoundingClientRect();
        if (rect) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          onTextChange(text.id, { x, y });
        }
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, text.id, onTextChange, canEdit]);
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditValue(e.target.value);
  };
  
  // Save changes on blur or Enter key
  const handleInputBlur = () => {
    onTextChange(text.id, { content: editValue });
    setIsEditing(false);
  };
  
  // Handle keydown in edit mode
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onTextChange(text.id, { content: editValue });
      setIsEditing(false);
    }
    
    if (e.key === 'Escape') {
      setEditValue(text.content);
      setIsEditing(false);
    }
  };
  
  // Handle delete key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSelected && !isEditing && (e.key === 'Delete' || e.key === 'Backspace') && canEdit) {
        onTextDelete(text.id);
      }
    };
    
    if (isSelected) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSelected, isEditing, onTextDelete, text.id, canEdit]);

  return (
    <div
      ref={textRef}
      style={{
        position: 'absolute',
        left: text.x,
        top: text.y,
        width: text.width ? `${text.width}px` : 'auto',
        height: text.height ? `${text.height}px` : 'auto',
        color: text.color,
        fontSize: `${text.fontSize}px`,
        fontWeight: text.bold ? 'bold' : 'normal',
        fontStyle: text.italic ? 'italic' : 'normal',
        cursor: canEdit ? (isDragging ? 'grabbing' : 'grab') : 'default',
        padding: '4px',
        border: isSelected ? '2px dashed #2196F3' : '1px dashed transparent',
        backgroundColor: isSelected ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
        userSelect: 'none',
        whiteSpace: 'pre-wrap',
        maxWidth: text.width ? `${text.width}px` : '300px',
        transition: isDragging ? 'none' : 'all 0.2s ease',
        overflow: 'hidden',
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
    >
      {isEditing ? (
        <textarea
          ref={inputRef}
          value={editValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          style={{
            width: text.width ? `${text.width}px` : '200px',
            height: text.height ? `${text.height}px` : '60px',
            minWidth: '100px',
            minHeight: '40px',
            color: text.color === '#000000' ? '#ffffff' : text.color,
            fontSize: `${text.fontSize}px`,
            fontWeight: text.bold ? 'bold' : 'normal',
            fontStyle: text.italic ? 'italic' : 'normal',
            border: '2px solid #2196F3',
            borderRadius: '4px',
            padding: '4px',
            backgroundColor: 'transparent',
            resize: 'both',
            outline: 'none',
            textShadow: '0 1px 2px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.5)',
          }}
        />
      ) : (
        <span style={{
          display: 'block',
          width: text.width ? '100%' : 'auto',
          height: text.height ? '100%' : 'auto',
          textShadow: '0 1px 2px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.5)',
        }}>
          {text.content}
        </span>
      )}
    </div>
  );
};
