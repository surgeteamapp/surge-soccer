"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Smile, X, Image as ImageIcon, Film } from "lucide-react";

interface AttachmentPreview {
  file: File;
  previewUrl: string;
  type: 'image' | 'video';
}

interface ChatInputProps {
  onSendMessage: (content: string, mentions: string[], attachments?: File[]) => void;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ 
  onSendMessage, 
  onTyping, 
  disabled = false, 
  placeholder = "Type a message..." 
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isAttachHovered, setIsAttachHovered] = useState(false);
  const [isEmojiHovered, setIsEmojiHovered] = useState(false);
  const [isSendHovered, setIsSendHovered] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState<string>('smileys');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  
  // iOS-style emoji categories
  const emojiCategories: Record<string, { icon: string; emojis: string[] }> = {
    smileys: {
      icon: '😀',
      emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐']
    },
    gestures: {
      icon: '👋',
      emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄']
    },
    hearts: {
      icon: '❤️',
      emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '💌', '💋', '😻', '🫶', '🥹']
    },
    animals: {
      icon: '🐶',
      emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞', '🐜', '🪰', '🪲', '🪳', '🦟', '🦗', '🕷️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🦣', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🪶', '🐓', '🦃', '🦤', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦫', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔']
    },
    food: {
      icon: '🍕',
      emojis: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '🫖', '☕', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾', '🧊']
    },
    activities: {
      icon: '⚽',
      emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤺', '🤾', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚵', '🚴', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️', '🎫', '🎟️', '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🪘', '🎷', '🎺', '🪗', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩']
    },
    objects: {
      icon: '💡',
      emojis: ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳', '💎', '⚖️', '🪜', '🧰', '🪛', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🪚', '🔩', '⚙️', '🪤', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳️', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪']
    },
    symbols: {
      icon: '💯',
      emojis: ['💯', '🔥', '✨', '⭐', '🌟', '💫', '⚡', '💥', '💢', '💦', '💨', '🕳️', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤', '⚫', '⚪', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '🟫', '⬛', '⬜', '◼️', '◻️', '◾', '◽', '▪️', '▫️', '🔶', '🔷', '🔸', '🔹', '🔺', '🔻', '💠', '🔘', '🔳', '🔲', '✅', '❌', '❎', '➕', '➖', '➗', '✖️', '♾️', '💲', '💱', '™️', '©️', '®️', '〰️', '➰', '➿', '🔚', '🔙', '🔛', '🔝', '🔜', '✔️', '☑️', '🔃', '🔄', '🔀', '🔁', '🔂', '▶️', '⏩', '⏭️', '⏯️', '◀️', '⏪', '⏮️', '🔼', '⏫', '🔽', '⏬', '⏸️', '⏹️', '⏺️', '⏏️', '🎦', '🔅', '🔆', '📶', '📳', '📴', '♀️', '♂️', '⚧️', '✳️', '✴️', '❇️', '©️', '®️', '™️', '#️⃣', '*️⃣', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔠', '🔡', '🔢', '🔣', '🔤', '🅰️', '🆎', '🅱️', '🆑', '🆒', '🆓', 'ℹ️', '🆔', 'Ⓜ️', '🆕', '🆖', '🅾️', '🆗', '🅿️', '🆘', '🆙', '🆚', '🈁', '🈂️', '🈷️', '🈶', '🈯', '🉐', '🈹', '🈚', '🈲', '🉑', '🈸', '🈴', '🈳', '㊗️', '㊙️', '🈺', '🈵']
    }
  };
  
  // Insert emoji into message
  const insertEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    textareaRef.current?.focus();
  };
  
  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);
  
  // Adjust textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);
  
  // Handle typing indicator with debounce
  useEffect(() => {
    if (message.trim() !== '') {
      onTyping(true);
      
      const timer = setTimeout(() => {
        onTyping(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    } else {
      onTyping(false);
    }
  }, [message, onTyping]);
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newAttachments: AttachmentPreview[] = [];
    
    Array.from(files).forEach(file => {
      // Check if it's an image or video
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const previewUrl = URL.createObjectURL(file);
        newAttachments.push({
          file,
          previewUrl,
          type: file.type.startsWith('image/') ? 'image' : 'video',
        });
      }
    });
    
    setAttachments(prev => [...prev, ...newAttachments].slice(0, 5)); // Limit to 5 attachments
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].previewUrl);
      updated.splice(index, 1);
      return updated;
    });
  };
  
  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      attachments.forEach(a => URL.revokeObjectURL(a.previewUrl));
    };
  }, []);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() === "" && attachments.length === 0) || disabled) return;
    
    // Extract mentions (e.g., @username)
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    
    while ((match = mentionRegex.exec(message)) !== null) {
      mentions.push(match[1]);
    }
    
    const files = attachments.map(a => a.file);
    onSendMessage(message, mentions, files.length > 0 ? files : undefined);
    setMessage("");
    setAttachments([]);
    
    // Focus back on textarea after sending
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };
  
  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const canSend = (message.trim() || attachments.length > 0) && !disabled;
  
  return (
    <form 
      onSubmit={handleSubmit}
      style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(138, 43, 226, 0.2)',
        background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.8) 0%, rgba(26, 10, 46, 0.6) 100%)',
      }}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '12px',
          flexWrap: 'wrap',
        }}>
          {attachments.map((attachment, index) => (
            <div
              key={index}
              style={{
                position: 'relative',
                width: '80px',
                height: '80px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid rgba(138, 43, 226, 0.4)',
              }}
            >
              {attachment.type === 'image' ? (
                <img
                  src={attachment.previewUrl}
                  alt="Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(138, 43, 226, 0.2)',
                }}>
                  <Film style={{ height: '24px', width: '24px', color: '#a855f7' }} />
                </div>
              )}
              <button
                type="button"
                onClick={() => removeAttachment(index)}
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.7)',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
              >
                <X style={{ height: '12px', width: '12px' }} />
              </button>
              <div style={{
                position: 'absolute',
                bottom: '2px',
                left: '2px',
                padding: '2px 4px',
                borderRadius: '4px',
                background: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
              }}>
                {attachment.type === 'image' ? (
                  <ImageIcon style={{ height: '10px', width: '10px', color: '#a855f7' }} />
                ) : (
                  <Film style={{ height: '10px', width: '10px', color: '#a855f7' }} />
                )}
              </div>
            </div>
          ))}
          {attachments.length < 5 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '8px',
                border: '1px dashed rgba(138, 43, 226, 0.4)',
                background: 'rgba(138, 43, 226, 0.1)',
                color: '#9ca3af',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                fontSize: '0.7rem',
                transition: 'all 0.2s',
              }}
            >
              <Paperclip style={{ height: '16px', width: '16px' }} />
              Add more
            </button>
          )}
        </div>
      )}
      
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
        {/* Attachment button */}
        <button
          type="button"
          title="Add attachment"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          onMouseEnter={() => setIsAttachHovered(true)}
          onMouseLeave={() => setIsAttachHovered(false)}
          style={{
            padding: '10px',
            borderRadius: '10px',
            background: isAttachHovered && !disabled
              ? 'rgba(138, 43, 226, 0.25)'
              : 'rgba(138, 43, 226, 0.1)',
            border: isAttachHovered && !disabled
              ? '1px solid rgba(168, 85, 247, 0.5)'
              : '1px solid rgba(138, 43, 226, 0.3)',
            color: isAttachHovered && !disabled ? '#c084fc' : '#9ca3af',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            transform: isAttachHovered && !disabled ? 'scale(1.05)' : 'none',
          }}
        >
          <Paperclip style={{ height: '18px', width: '18px' }} />
        </button>
        
        {/* Message input */}
        <div style={{ flex: 1, position: 'relative' }}>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            style={{
              width: '100%',
              padding: '12px 44px 12px 14px',
              borderRadius: '12px',
              background: 'rgba(138, 43, 226, 0.1)',
              border: isFocused 
                ? '1px solid rgba(168, 85, 247, 0.5)' 
                : '1px solid rgba(138, 43, 226, 0.3)',
              color: '#fff',
              fontSize: '0.9rem',
              outline: 'none',
              resize: 'none',
              maxHeight: '120px',
              overflowY: 'auto',
              boxSizing: 'border-box',
            }}
          />
          
          {/* Emoji button */}
          <button
            type="button"
            title="Add emoji"
            disabled={disabled}
            onClick={() => !disabled && setShowEmojiPicker(!showEmojiPicker)}
            onMouseEnter={() => setIsEmojiHovered(true)}
            onMouseLeave={() => setIsEmojiHovered(false)}
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '12px',
              background: showEmojiPicker ? 'rgba(138, 43, 226, 0.3)' : 'none',
              border: 'none',
              borderRadius: '4px',
              color: showEmojiPicker ? '#c084fc' : isEmojiHovered && !disabled ? '#c084fc' : '#9ca3af',
              cursor: disabled ? 'not-allowed' : 'pointer',
              padding: '2px',
              transition: 'all 0.2s',
              transform: isEmojiHovered && !disabled ? 'scale(1.15)' : 'none',
            }}
          >
            <Smile style={{ height: '18px', width: '18px' }} />
          </button>
          
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              style={{
                position: 'absolute',
                bottom: '100%',
                right: '0',
                marginBottom: '8px',
                width: '320px',
                background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.98) 0%, rgba(26, 10, 46, 0.95) 100%)',
                border: '1px solid rgba(138, 43, 226, 0.4)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                overflow: 'hidden',
                zIndex: 100,
              }}
            >
              {/* Category tabs */}
              <div style={{
                display: 'flex',
                borderBottom: '1px solid rgba(138, 43, 226, 0.2)',
                padding: '8px',
                gap: '4px',
              }}>
                {Object.entries(emojiCategories).map(([key, { icon }]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setEmojiCategory(key)}
                    style={{
                      flex: 1,
                      padding: '6px',
                      background: emojiCategory === key ? 'rgba(138, 43, 226, 0.3)' : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '1.1rem',
                      transition: 'all 0.15s',
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              
              {/* Emoji grid */}
              <div style={{
                height: '200px',
                overflowY: 'auto',
                padding: '8px',
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gap: '2px',
              }}>
                {emojiCategories[emojiCategory]?.emojis.map((emoji, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    style={{
                      padding: '6px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      transition: 'all 0.1s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(138, 43, 226, 0.3)';
                      e.currentTarget.style.transform = 'scale(1.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Send button */}
        <button
          type="submit"
          disabled={!canSend}
          title="Send message"
          onMouseEnter={() => setIsSendHovered(true)}
          onMouseLeave={() => setIsSendHovered(false)}
          style={{
            padding: '10px',
            borderRadius: '10px',
            background: canSend 
              ? isSendHovered
                ? 'linear-gradient(135deg, rgba(138, 43, 226, 0.8) 0%, rgba(168, 85, 247, 0.9) 100%)'
                : 'linear-gradient(135deg, rgba(138, 43, 226, 0.6) 0%, rgba(168, 85, 247, 0.7) 100%)'
              : 'rgba(138, 43, 226, 0.1)',
            border: canSend 
              ? '1px solid rgba(168, 85, 247, 0.6)' 
              : '1px solid rgba(138, 43, 226, 0.2)',
            color: canSend ? '#fff' : '#6b7280',
            cursor: canSend ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: canSend 
              ? isSendHovered 
                ? '0 0 20px rgba(138, 43, 226, 0.5)' 
                : '0 0 15px rgba(138, 43, 226, 0.3)' 
              : 'none',
            transition: 'all 0.2s',
            transform: canSend && isSendHovered ? 'scale(1.08)' : 'none',
          }}
        >
          <Send style={{ height: '18px', width: '18px' }} />
        </button>
      </div>
      
      {/* Helper text */}
      <p style={{ 
        color: '#6b7280', 
        fontSize: '0.7rem', 
        marginTop: '8px',
        paddingLeft: '4px',
      }}>
        Press <span style={{ 
          padding: '2px 6px', 
          background: 'rgba(138, 43, 226, 0.15)', 
          borderRadius: '4px',
          color: '#9ca3af',
        }}>Shift</span> + <span style={{ 
          padding: '2px 6px', 
          background: 'rgba(138, 43, 226, 0.15)', 
          borderRadius: '4px',
          color: '#9ca3af',
        }}>Enter</span> for a new line
      </p>
    </form>
  );
}
