"use client";

import { PlaybookList } from "@/components/playbooks/PlaybookList";
import React from "react";

export default function PlaybooksPage() {
  // Card style matching other pages
  const cardStyle: React.CSSProperties = { 
    background: "linear-gradient(135deg, rgba(10, 0, 20, 0.95) 0%, rgba(26, 10, 46, 0.9) 50%, rgba(15, 5, 25, 0.95) 100%)", 
    backdropFilter: "blur(20px)", 
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(138, 43, 226, 0.3)", 
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(138, 43, 226, 0.1)",
    borderRadius: "16px" 
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{
        ...cardStyle,
        padding: '24px',
        marginBottom: '24px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 700, 
            color: 'white', 
            textShadow: '0 0 20px rgba(138, 43, 226, 0.5)', 
            margin: 0 
          }}>
            Playbooks
          </h1>
          <p style={{ color: '#9ca3af', marginTop: '8px', fontSize: '0.95rem' }}>
            Create, organize, and manage your team strategies
          </p>
        </div>
      </div>

      {/* PlaybookList component */}
      <PlaybookList cardStyle={cardStyle} />
    </div>
  );
}
