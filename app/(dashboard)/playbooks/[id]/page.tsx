"use client";

import { use } from "react";
import { PlaybookDetail } from "@/components/playbooks/PlaybookDetail";

interface PlaybookPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PlaybookPage({ params }: PlaybookPageProps) {
  const { id } = use(params);
  
  return (
    <div className="container mx-auto py-6">
      <PlaybookDetail playbookId={id} />
    </div>
  );
}
