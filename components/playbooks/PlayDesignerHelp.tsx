"use client";

import React from 'react';
import { X, Users, Circle, Move, Play, Zap, ArrowRight, Layers } from 'lucide-react';

interface PlayDesignerHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlayDesignerHelp: React.FC<PlayDesignerHelpProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const cardStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, rgba(10, 0, 20, 0.98) 0%, rgba(26, 10, 46, 0.95) 50%, rgba(15, 5, 25, 0.98) 100%)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(138, 43, 226, 0.3)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(138, 43, 226, 0.1)",
    borderRadius: "16px",
  };

  const stepStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: 'rgba(138, 43, 226, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(138, 43, 226, 0.2)',
  };

  const iconStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(138, 43, 226, 0.3)',
    borderRadius: '8px',
    flexShrink: 0,
  };

  const tipStyle: React.CSSProperties = {
    padding: '10px 12px',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderLeft: '3px solid #f59e0b',
    borderRadius: '0 8px 8px 0',
    marginBottom: '10px',
    fontSize: '13px',
    color: '#fbbf24',
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          ...cardStyle,
          width: '600px',
          maxHeight: '80vh',
          overflow: 'auto',
          padding: '24px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#fff', margin: 0, fontSize: '1.5rem' }}>
            How to Create a Play
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px',
              cursor: 'pointer',
              color: '#fff',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Steps */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#a78bfa', marginBottom: '16px', fontSize: '1rem' }}>Step-by-Step Guide</h3>
          
          <div style={stepStyle}>
            <div style={iconStyle}><Users size={18} color="#a78bfa" /></div>
            <div>
              <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}>1. Add Players</div>
              <div style={{ color: '#9ca3af', fontSize: '13px' }}>
                Use the "Add Player" tools to place team members and opponents on the field. 
                Each player can be assigned a role (G=Goalie, S=Striker, W=Wing, C=Center).
              </div>
            </div>
          </div>

          <div style={stepStyle}>
            <div style={iconStyle}><Circle size={18} color="#a78bfa" /></div>
            <div>
              <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}>2. Add the Ball</div>
              <div style={{ color: '#9ca3af', fontSize: '13px' }}>
                Click the "Add Ball" tool and place the ball near the player who will start with it.
              </div>
            </div>
          </div>

          <div style={stepStyle}>
            <div style={iconStyle}><Layers size={18} color="#a78bfa" /></div>
            <div>
              <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}>3. Create Frames</div>
              <div style={{ color: '#9ca3af', fontSize: '13px' }}>
                Click the "+" button in the timeline to add animation frames. 
                Each frame represents a moment in the play.
              </div>
            </div>
          </div>

          <div style={stepStyle}>
            <div style={iconStyle}><Move size={18} color="#a78bfa" /></div>
            <div>
              <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}>4. Position Players</div>
              <div style={{ color: '#9ca3af', fontSize: '13px' }}>
                In each frame, drag players to their new positions. 
                Use the rotation handle to change their facing direction.
              </div>
            </div>
          </div>

          <div style={stepStyle}>
            <div style={iconStyle}><Zap size={18} color="#f59e0b" /></div>
            <div>
              <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}>5. Add Actions</div>
              <div style={{ color: '#9ca3af', fontSize: '13px' }}>
                Select a player, then choose an action (Spin Left, Spin Right, Punch Pass, etc.) 
                from the properties panel. An orange circle will appear showing the action zone.
              </div>
            </div>
          </div>

          <div style={stepStyle}>
            <div style={iconStyle}><ArrowRight size={18} color="#f59e0b" /></div>
            <div>
              <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}>6. Draw Ball Path</div>
              <div style={{ color: '#9ca3af', fontSize: '13px' }}>
                Use the "Ball Path" tool to draw where the ball will travel. 
                <strong style={{ color: '#f59e0b' }}> Start the path inside the orange action zone</strong> of the player hitting the ball.
              </div>
            </div>
          </div>

          <div style={stepStyle}>
            <div style={iconStyle}><Play size={18} color="#a78bfa" /></div>
            <div>
              <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}>7. Preview & Adjust</div>
              <div style={{ color: '#9ca3af', fontSize: '13px' }}>
                Press Play to preview your animation. Adjust frame duration and ball speed as needed.
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div>
          <h3 style={{ color: '#f59e0b', marginBottom: '12px', fontSize: '1rem' }}>Important Tips</h3>
          
          <div style={tipStyle}>
            <strong>One Ball Path Per Frame:</strong> Each frame can only have one ball path. 
            Drawing a new path will replace the existing one.
          </div>
          
          <div style={tipStyle}>
            <strong>Action Zone:</strong> The orange dashed circle around a player with an action 
            shows where the ball path should start for proper synchronization.
          </div>
          
          <div style={tipStyle}>
            <strong>Ball Continues Across Frames:</strong> The ball will continue from the endpoint 
            of the previous frame's ball path to the start of the current frame's path.
          </div>
          
          <div style={tipStyle}>
            <strong>Timing Sync:</strong> When a ball path starts in an action zone, the ball will 
            wait for the player's "strike" motion before moving.
          </div>
          
          <div style={tipStyle}>
            <strong>Ball Speed:</strong> Select a ball path to adjust its speed. 
            Use slower speeds (0.25x-0.5x) for longer passes.
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            marginTop: '20px',
            padding: '12px',
            backgroundColor: 'rgba(138, 43, 226, 0.3)',
            border: '1px solid rgba(138, 43, 226, 0.5)',
            borderRadius: '8px',
            color: '#fff',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Got it!
        </button>
      </div>
    </div>
  );
};
