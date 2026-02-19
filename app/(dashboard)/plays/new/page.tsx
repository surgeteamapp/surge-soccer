"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PlayDesignerNew } from '@/components/playbooks/PlayDesignerNew';

function NewPlayContent() {
  const searchParams = useSearchParams();
  const playbookId = searchParams.get('playbookId') || undefined;

  return <PlayDesignerNew playbookId={playbookId} />;
}

export default function NewPlayPage() {
  return (
    <Suspense fallback={<div style={{ padding: '24px', color: '#fff' }}>Loading...</div>}>
      <NewPlayContent />
    </Suspense>
  );
}
