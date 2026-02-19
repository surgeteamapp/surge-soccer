"use client";

import { use } from "react";
import { PlayDesignerNew } from "@/components/playbooks/PlayDesignerNew";

interface PlayEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PlayEditPage({ params }: PlayEditPageProps) {
  const { id } = use(params);
  
  return <PlayDesignerNew playId={id} />;
}
