"use client";

import { useState, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import { 
  Youtube, 
  Video, 
  Upload, 
  XCircle, 
  Tag, 
  Plus, 
  X, 
  Globe, 
  Lock 
} from "lucide-react";
import { useVideos } from "@/hooks/useVideos";

interface VideoUploadFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function VideoUploadForm({ onClose, onSuccess }: VideoUploadFormProps) {
  const { data: session } = useSession();
  const { addVideo, availableTags } = useVideos();
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoType, setVideoType] = useState<"youtube" | "dailyco">("youtube");
  const [youtubeId, setYoutubeId] = useState("");
  const [dailyVideoId, setDailyVideoId] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Extract YouTube ID from URL if provided
  const handleYoutubeInput = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setYoutubeId(value);
    
    // Try to extract YouTube ID if a URL was pasted
    if (value.includes("youtube.com") || value.includes("youtu.be")) {
      try {
        const url = new URL(value);
        if (url.hostname.includes("youtube.com")) {
          // Handle youtube.com URLs
          const searchParams = new URLSearchParams(url.search);
          const extractedId = searchParams.get("v");
          if (extractedId) {
            setYoutubeId(extractedId);
          }
        } else if (url.hostname.includes("youtu.be")) {
          // Handle youtu.be URLs
          const extractedId = url.pathname.substring(1);
          if (extractedId) {
            setYoutubeId(extractedId);
          }
        }
      } catch (err) {
        // Invalid URL, keep the raw input
        console.error("Error parsing YouTube URL", err);
      }
    }
  };
  
  // Add a tag
  const handleAddTag = () => {
    if (customTag && !tags.includes(customTag)) {
      setTags([...tags, customTag]);
      setCustomTag("");
    }
  };
  
  // Remove a tag
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };
  
  // Toggle a tag from suggestions
  const handleToggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };
  
  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate form
      if (!title) {
        throw new Error("Title is required");
      }
      
      if (videoType === "youtube" && !youtubeId) {
        throw new Error("YouTube ID is required");
      }
      
      if (videoType === "dailyco" && !dailyVideoId) {
        throw new Error("Daily.co Video ID is required");
      }
      
      // Prepare video data
      const videoData = {
        title,
        description,
        youtubeId: videoType === "youtube" ? youtubeId : undefined,
        dailyVideoId: videoType === "dailyco" ? dailyVideoId : undefined,
        uploaderId: session?.user?.id || "",
        uploaderName: session?.user?.name || "",
        isPublic,
        tags,
      };
      
      // Add the video
      await addVideo(videoData);
      
      // Success
      onSuccess();
    } catch (err) {
      console.error("Error adding video", err);
      setError(err instanceof Error ? err.message : "Failed to add video");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add New Video
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {/* Error message */}
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/30 p-3 rounded-md text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          
          {/* Video type selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Video Source
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVideoType("youtube")}
                className={`flex items-center justify-center p-3 rounded-md border ${
                  videoType === "youtube"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                }`}
              >
                <Youtube className="h-5 w-5 mr-2" />
                <span>YouTube</span>
              </button>
              <button
                type="button"
                onClick={() => setVideoType("dailyco")}
                className={`flex items-center justify-center p-3 rounded-md border ${
                  videoType === "dailyco"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                }`}
              >
                <Video className="h-5 w-5 mr-2" />
                <span>Daily.co</span>
              </button>
            </div>
          </div>
          
          {/* Title */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              required
            />
          </div>
          
          {/* Description */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
          </div>
          
          {/* YouTube ID */}
          {videoType === "youtube" && (
            <div className="mb-4">
              <label htmlFor="youtubeId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                YouTube Video ID or URL *
              </label>
              <input
                id="youtubeId"
                type="text"
                value={youtubeId}
                onChange={handleYoutubeInput}
                placeholder="e.g. dQw4w9WgXcQ or https://youtube.com/watch?v=dQw4w9WgXcQ"
                className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                required={videoType === "youtube"}
              />
              {youtubeId && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Preview:</p>
                  <div className="mt-1 aspect-video w-full max-w-md bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
                    <img 
                      src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Daily.co ID */}
          {videoType === "dailyco" && (
            <div className="mb-4">
              <label htmlFor="dailycoId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Daily.co Room ID *
              </label>
              <input
                id="dailycoId"
                type="text"
                value={dailyVideoId}
                onChange={(e) => setDailyVideoId(e.target.value)}
                placeholder="e.g. abc123xyz"
                className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                required={videoType === "dailyco"}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Enter the room ID from your Daily.co dashboard
              </p>
            </div>
          )}
          
          {/* Visibility */}
          <div className="mb-4">
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Visibility
            </span>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="visibility"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <Globe className="h-4 w-4 ml-2 mr-1 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Public</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="visibility"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <Lock className="h-4 w-4 ml-2 mr-1 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Private</span>
              </label>
            </div>
          </div>
          
          {/* Tags */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags
            </label>
            
            {/* Selected Tags */}
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span 
                  key={tag}
                  className="flex items-center bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-sm px-2 py-1 rounded-full"
                >
                  {tag}
                  <button 
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            
            {/* Add custom tag */}
            <div className="flex">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                placeholder="Add custom tag"
                className="flex-1 rounded-l-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={!customTag}
                className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-r-md hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            {/* Tag suggestions */}
            {availableTags.length > 0 && (
              <div className="mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Suggested tags:
                </span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {availableTags
                    .filter(tag => !tags.includes(tag))
                    .slice(0, 10)
                    .map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        {tag}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Form actions */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Adding..." : "Add Video"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
