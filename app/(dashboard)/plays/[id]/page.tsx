"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlayViewer } from "@/components/playbooks/PlayViewer";
import { Loader2 } from "lucide-react";

interface PlayPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PlayPage({ params }: PlayPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [play, setPlay] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlay = async () => {
      try {
        const response = await fetch(`/api/plays/${id}`);
        if (!response.ok) throw new Error('Play not found');
        const data = await response.json();
        setPlay(data.play);
      } catch (err) {
        setError('Play not found');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlay();
  }, [id]);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0014 0%, #1a0a2e 50%, #0f0519 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#a855f7' }} />
      </div>
    );
  }

  if (error || !play) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0014 0%, #1a0a2e 50%, #0f0519 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9ca3af',
      }}>
        <p style={{ marginBottom: '16px' }}>Play not found</p>
        <button
          onClick={() => router.push('/playbooks')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: 'rgba(168, 85, 247, 0.3)',
            color: '#c4b5fd',
            cursor: 'pointer',
          }}
        >
          Back to Playbooks
        </button>
      </div>
    );
  }

  return (
    <PlayViewer
      playId={id}
      playName={play.name}
      playDescription={play.description}
      category={play.category}
      frames={play.frames || []}
      authorName={play.authorName}
    />
  );
}
