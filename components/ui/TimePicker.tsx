"use client";

import { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown } from 'lucide-react';

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  required?: boolean;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = ['00', '15', '30', '45'];
const AMPM = ['AM', 'PM'];

export function TimePicker({ value, onChange, label, required }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  
  // Parse the time value into components
  const parseValue = () => {
    if (!value) {
      return { hour: 12, minute: '00', ampm: 'PM' };
    }
    const [hours, minutes] = value.split(':');
    let hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    
    // Find closest minute option
    const minuteInt = parseInt(minutes, 10);
    const closestMinute = MINUTES.reduce((prev, curr) => {
      const prevDiff = Math.abs(parseInt(prev, 10) - minuteInt);
      const currDiff = Math.abs(parseInt(curr, 10) - minuteInt);
      return currDiff < prevDiff ? curr : prev;
    });
    
    return { hour, minute: closestMinute, ampm };
  };
  
  const { hour: selectedHour, minute: selectedMinute, ampm: selectedAmPm } = parseValue();
  
  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update dropdown position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      });
    }
  }, [isOpen]);
  
  // Update value when time components change
  const updateTime = (hour: number, minute: string, ampm: string) => {
    let hour24 = hour;
    if (ampm === 'PM' && hour !== 12) hour24 += 12;
    if (ampm === 'AM' && hour === 12) hour24 = 0;
    
    const timeString = `${hour24.toString().padStart(2, '0')}:${minute}`;
    onChange(timeString);
  };
  
  // Format display value
  const formatDisplayValue = () => {
    if (!value) return label;
    return `${selectedHour}:${selectedMinute} ${selectedAmPm}`;
  };
  
  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      <label style={{
        display: 'block',
        color: 'rgb(196, 181, 253)',
        fontSize: '0.8rem',
        fontWeight: '500',
        marginBottom: '6px'
      }}>
        {label}
        {required && <span style={{ color: '#f87171' }}> *</span>}
      </label>
      
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '12px 14px',
          borderRadius: '10px',
          background: isOpen ? 'rgba(138, 43, 226, 0.2)' : 'rgba(138, 43, 226, 0.1)',
          border: isOpen ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid rgba(138, 43, 226, 0.3)',
          color: value ? '#fff' : '#9ca3af',
          fontSize: '0.9rem',
          outline: 'none',
          transition: '0.2s',
          boxSizing: 'border-box',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <span>{formatDisplayValue()}</span>
        <ChevronDown 
          style={{ 
            height: '16px', 
            width: '16px', 
            color: '#c4b5fd',
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }} 
        />
      </button>
      
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          width: dropdownPosition.width,
          background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.98) 0%, rgba(26, 10, 46, 0.98) 100%)',
          border: '1px solid rgba(138, 43, 226, 0.4)',
          borderRadius: '12px',
          boxShadow: '0 15px 40px rgba(0, 0, 0, 0.6)',
          zIndex: 9999,
          overflow: 'hidden',
          padding: '12px'
        }}>
          <div style={{ 
            display: 'flex', 
            gap: '8px',
            justifyContent: 'center'
          }}>
            {/* Hour */}
            <div style={{ flex: 1 }}>
              <div style={{ color: '#9ca3af', fontSize: '0.7rem', marginBottom: '4px', textAlign: 'center' }}>Hour</div>
              <div 
                style={{ 
                  maxHeight: '150px', 
                  overflowY: 'auto',
                  background: 'rgba(0, 0, 0, 0.4)',
                  borderRadius: '8px',
                  padding: '4px'
                }}
              >
                {HOURS.map(hour => (
                  <button
                    type="button"
                    key={hour}
                    onClick={() => updateTime(hour, selectedMinute, selectedAmPm)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      background: selectedHour === hour ? 'rgba(138, 43, 226, 0.4)' : 'transparent',
                      border: 'none',
                      color: selectedHour === hour ? '#e9d5ff' : '#d1d5db',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      fontWeight: selectedHour === hour ? '600' : '400'
                    }}
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Minute */}
            <div style={{ flex: 1 }}>
              <div style={{ color: '#9ca3af', fontSize: '0.7rem', marginBottom: '4px', textAlign: 'center' }}>Min</div>
              <div 
                style={{ 
                  maxHeight: '150px', 
                  overflowY: 'auto',
                  background: 'rgba(0, 0, 0, 0.4)',
                  borderRadius: '8px',
                  padding: '4px'
                }}
              >
                {MINUTES.map(min => (
                  <button
                    type="button"
                    key={min}
                    onClick={() => updateTime(selectedHour, min, selectedAmPm)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      background: selectedMinute === min ? 'rgba(138, 43, 226, 0.4)' : 'transparent',
                      border: 'none',
                      color: selectedMinute === min ? '#e9d5ff' : '#d1d5db',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      fontWeight: selectedMinute === min ? '600' : '400'
                    }}
                  >
                    {min}
                  </button>
                ))}
              </div>
            </div>
            
            {/* AM/PM */}
            <div style={{ flex: 1 }}>
              <div style={{ color: '#9ca3af', fontSize: '0.7rem', marginBottom: '4px', textAlign: 'center' }}>Period</div>
              <div 
                style={{ 
                  maxHeight: '150px', 
                  overflowY: 'auto',
                  background: 'rgba(0, 0, 0, 0.4)',
                  borderRadius: '8px',
                  padding: '4px'
                }}
              >
                {AMPM.map(period => (
                  <button
                    type="button"
                    key={period}
                    onClick={() => updateTime(selectedHour, selectedMinute, period)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      background: selectedAmPm === period ? 'rgba(138, 43, 226, 0.4)' : 'transparent',
                      border: 'none',
                      color: selectedAmPm === period ? '#e9d5ff' : '#d1d5db',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      fontWeight: selectedAmPm === period ? '600' : '400'
                    }}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
