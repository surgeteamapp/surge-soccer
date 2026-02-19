"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AssignTaskForm } from '@/components/training/AssignTaskForm';
import { Loader2 } from 'lucide-react';

// Card style matching app theme
const cardStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, rgba(10, 0, 20, 0.95) 0%, rgba(26, 10, 46, 0.9) 50%, rgba(15, 5, 25, 0.95) 100%)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(138, 43, 226, 0.3)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(138, 43, 226, 0.1)",
  borderRadius: "16px"
};

function AssignTaskPageContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || undefined;
  
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ ...cardStyle, padding: '24px' }}>
        <AssignTaskForm selectedUserId={userId} />
      </div>
    </div>
  );
}

export default function AssignTaskPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '64px 0' }}>
        <Loader2 className="animate-spin" style={{ height: '48px', width: '48px', color: '#a855f7' }} />
      </div>
    }>
      <AssignTaskPageContent />
    </Suspense>
  );
}
