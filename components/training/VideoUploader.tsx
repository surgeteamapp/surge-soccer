"use client";

import { useState, useRef } from 'react';
import { 
  Upload, 
  Video, 
  X, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Link as LinkIcon,
  Cloud
} from 'lucide-react';

interface VideoUploaderProps {
  onVideoSelect: (videoUrl: string) => void;
  currentVideoUrl?: string;
}

export const VideoUploader = ({ onVideoSelect, currentVideoUrl }: VideoUploaderProps) => {
  const [uploadMethod, setUploadMethod] = useState<'url' | 'upload'>('url');
  const [videoUrl, setVideoUrl] = useState(currentVideoUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlSubmit = () => {
    if (videoUrl.trim()) {
      // Validate URL format
      try {
        new URL(videoUrl);
        onVideoSelect(videoUrl);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      } catch {
        setUploadError('Please enter a valid URL');
      }
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please select a valid video file (MP4, WebM, OGG, or MOV)');
      return;
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('File size must be less than 100MB');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      // Simulate upload progress (in real implementation, this would be actual cloud upload)
      // For now, we'll create a local blob URL for demo purposes
      // In production, replace this with actual cloud storage upload (e.g., AWS S3, Cloudinary, etc.)
      
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setUploadProgress(i);
      }

      // Create a blob URL for demo (replace with actual cloud URL in production)
      const blobUrl = URL.createObjectURL(file);
      
      // In production, you would upload to cloud storage and get a permanent URL
      // const response = await uploadToCloudStorage(file);
      // const cloudUrl = response.url;
      
      onVideoSelect(blobUrl);
      setVideoUrl(blobUrl);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      setUploadError('Failed to upload video. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const clearVideo = () => {
    setVideoUrl('');
    onVideoSelect('');
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      {/* Method Toggle */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        padding: '4px',
        background: 'rgba(10, 0, 20, 0.6)',
        borderRadius: '10px',
        border: '1px solid rgba(138, 43, 226, 0.2)',
      }}>
        <button
          type="button"
          onClick={() => setUploadMethod('url')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '10px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            background: uploadMethod === 'url' 
              ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(138, 43, 226, 0.5) 100%)'
              : 'transparent',
            color: uploadMethod === 'url' ? '#fff' : '#c4b5fd',
            fontWeight: uploadMethod === 'url' ? '600' : '500',
            fontSize: '0.85rem',
          }}
        >
          <LinkIcon style={{ height: '14px', width: '14px' }} />
          Video URL
        </button>
        <button
          type="button"
          onClick={() => setUploadMethod('upload')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '10px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            background: uploadMethod === 'upload' 
              ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(138, 43, 226, 0.5) 100%)'
              : 'transparent',
            color: uploadMethod === 'upload' ? '#fff' : '#c4b5fd',
            fontWeight: uploadMethod === 'upload' ? '600' : '500',
            fontSize: '0.85rem',
          }}
        >
          <Cloud style={{ height: '14px', width: '14px' }} />
          Upload Video
        </button>
      </div>

      {/* URL Input */}
      {uploadMethod === 'url' && (
        <div>
          <div style={{
            display: 'flex',
            gap: '10px',
          }}>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => {
                setVideoUrl(e.target.value);
                setUploadError(null);
              }}
              placeholder="https://youtube.com/watch?v=... or video URL"
              style={{
                flex: 1,
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'rgba(138, 43, 226, 0.1)',
                border: '1px solid rgba(138, 43, 226, 0.3)',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={handleUrlSubmit}
              disabled={!videoUrl.trim()}
              style={{
                padding: '12px 20px',
                borderRadius: '10px',
                background: !videoUrl.trim()
                  ? 'rgba(138, 43, 226, 0.1)'
                  : 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(138, 43, 226, 0.5) 100%)',
                border: '1px solid rgba(168, 85, 247, 0.5)',
                color: !videoUrl.trim() ? '#6b7280' : '#fff',
                fontWeight: '600',
                fontSize: '0.85rem',
                cursor: !videoUrl.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              Add
            </button>
          </div>
          <p style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '8px' }}>
            Supports YouTube, Vimeo, or direct video URLs
          </p>
        </div>
      )}

      {/* File Upload */}
      {uploadMethod === 'upload' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/quicktime"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          {!isUploading && !videoUrl && (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '32px',
                borderRadius: '12px',
                border: '2px dashed rgba(138, 43, 226, 0.4)',
                background: 'rgba(10, 0, 20, 0.4)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.6)';
                e.currentTarget.style.background = 'rgba(168, 85, 247, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(138, 43, 226, 0.4)';
                e.currentTarget.style.background = 'rgba(10, 0, 20, 0.4)';
              }}
            >
              <Upload style={{ height: '32px', width: '32px', color: '#a855f7', margin: '0 auto 12px' }} />
              <p style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500', margin: 0 }}>
                Click to upload a video
              </p>
              <p style={{ color: '#6b7280', fontSize: '0.75rem', margin: '8px 0 0 0' }}>
                MP4, WebM, OGG, or MOV • Max 100MB
              </p>
            </div>
          )}

          {isUploading && (
            <div style={{
              padding: '24px',
              borderRadius: '12px',
              background: 'rgba(10, 0, 20, 0.6)',
              border: '1px solid rgba(138, 43, 226, 0.3)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <Loader2 className="animate-spin" style={{ height: '20px', width: '20px', color: '#a855f7' }} />
                <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500' }}>
                  Uploading video...
                </span>
                <span style={{ color: '#c4b5fd', fontSize: '0.85rem', marginLeft: 'auto' }}>
                  {uploadProgress}%
                </span>
              </div>
              <div style={{
                height: '6px',
                borderRadius: '3px',
                background: 'rgba(138, 43, 226, 0.2)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${uploadProgress}%`,
                  background: 'linear-gradient(90deg, #a855f7, #7c3aed)',
                  borderRadius: '3px',
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Success/Error Messages */}
      {uploadError && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px',
          marginTop: '12px',
          borderRadius: '10px',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        }}>
          <AlertCircle style={{ height: '16px', width: '16px', color: '#f87171' }} />
          <span style={{ color: '#fca5a5', fontSize: '0.85rem' }}>{uploadError}</span>
        </div>
      )}

      {uploadSuccess && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px',
          marginTop: '12px',
          borderRadius: '10px',
          background: 'rgba(34, 197, 94, 0.15)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
        }}>
          <CheckCircle style={{ height: '16px', width: '16px', color: '#4ade80' }} />
          <span style={{ color: '#86efac', fontSize: '0.85rem' }}>Video added successfully!</span>
        </div>
      )}

      {/* Preview Current Video */}
      {videoUrl && !isUploading && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          borderRadius: '10px',
          background: 'rgba(10, 0, 20, 0.6)',
          border: '1px solid rgba(138, 43, 226, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'rgba(168, 85, 247, 0.2)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Video style={{ height: '20px', width: '20px', color: '#a855f7' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: '#fff', fontSize: '0.85rem', fontWeight: '500', margin: 0 }}>
              Video attached
            </p>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '0.75rem', 
              margin: '2px 0 0 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {videoUrl.length > 50 ? `${videoUrl.substring(0, 50)}...` : videoUrl}
            </p>
          </div>
          <button
            type="button"
            onClick={clearVideo}
            style={{
              padding: '8px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              cursor: 'pointer',
            }}
          >
            <X style={{ height: '16px', width: '16px' }} />
          </button>
        </div>
      )}
    </div>
  );
};
