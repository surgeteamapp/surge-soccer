"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  BookOpen, 
  ChevronLeft, 
  Save, 
  Trash2, 
  Loader2,
  AlertTriangle
} from "lucide-react";

interface EditPlaybookPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditPlaybookPage({ params }: EditPlaybookPageProps) {
  const { id } = use(params);
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch playbook data
  useEffect(() => {
    const fetchPlaybook = async () => {
      try {
        const response = await fetch(`/api/playbooks/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch playbook");
        }
        
        setName(data.playbook.name);
        setDescription(data.playbook.description || "");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlaybook();
  }, [id]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Playbook name is required");
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/playbooks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to save playbook");
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/playbooks/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete playbook");
      }
      
      router.push("/playbooks");
    } catch (err: any) {
      setError(err.message);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, rgba(10, 0, 20, 0.95) 0%, rgba(26, 10, 46, 0.9) 50%, rgba(15, 5, 25, 0.95) 100%)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(138, 43, 226, 0.3)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(138, 43, 226, 0.1)",
    borderRadius: "16px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid rgba(138, 43, 226, 0.3)",
    background: "rgba(0, 0, 0, 0.3)",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
  };

  if (isLoading) {
    return (
      <div style={{ padding: "24px" }}>
        <div style={{ ...cardStyle, padding: "64px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Loader2 className="animate-spin" style={{ height: "48px", width: "48px", color: "#a855f7" }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ ...cardStyle, padding: "24px", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={() => router.push("/playbooks")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              border: "1px solid rgba(138, 43, 226, 0.3)",
              background: "rgba(138, 43, 226, 0.1)",
              color: "#a855f7",
              cursor: "pointer",
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <BookOpen style={{ color: "#a855f7" }} size={24} />
            <h1 style={{ 
              fontSize: "1.5rem", 
              fontWeight: "700", 
              color: "white", 
              margin: 0,
              textShadow: "0 0 20px rgba(138, 43, 226, 0.5)"
            }}>
              Edit Playbook
            </h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{ ...cardStyle, padding: "24px" }}>
        {error && (
          <div style={{
            padding: "12px 16px",
            marginBottom: "20px",
            borderRadius: "10px",
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#f87171",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <AlertTriangle size={16} />
            {error}
          </div>
        )}
        
        {saveSuccess && (
          <div style={{
            padding: "12px 16px",
            marginBottom: "20px",
            borderRadius: "10px",
            background: "rgba(34, 197, 94, 0.15)",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            color: "#22c55e",
            fontSize: "14px",
          }}>
            Playbook saved successfully!
          </div>
        )}
        
        <div style={{ marginBottom: "20px" }}>
          <label style={{
            display: "block",
            marginBottom: "8px",
            fontSize: "14px",
            fontWeight: "500",
            color: "#c4b5fd",
          }}>
            Playbook Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Offensive Strategies 2024"
            style={inputStyle}
          />
        </div>
        
        <div style={{ marginBottom: "32px" }}>
          <label style={{
            display: "block",
            marginBottom: "8px",
            fontSize: "14px",
            fontWeight: "500",
            color: "#c4b5fd",
          }}>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this playbook..."
            rows={4}
            style={{
              ...inputStyle,
              resize: "vertical",
              minHeight: "100px",
            }}
          />
        </div>
        
        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              borderRadius: "10px",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              background: "rgba(239, 68, 68, 0.1)",
              color: "#f87171",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            <Trash2 size={16} />
            Delete
          </button>
          
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => router.push("/playbooks")}
              style={{
                padding: "12px 24px",
                borderRadius: "10px",
                border: "1px solid rgba(138, 43, 226, 0.3)",
                background: "transparent",
                color: "#9ca3af",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            
            <button
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
                borderRadius: "10px",
                border: "none",
                background: name.trim()
                  ? "linear-gradient(135deg, rgba(168, 85, 247, 0.6) 0%, rgba(139, 92, 246, 0.7) 100%)"
                  : "rgba(255, 255, 255, 0.1)",
                color: name.trim() ? "#fff" : "#6b7280",
                fontSize: "14px",
                fontWeight: "600",
                cursor: name.trim() && !isSaving ? "pointer" : "not-allowed",
              }}
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        }}>
          <div
            onClick={() => setShowDeleteConfirm(false)}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0, 0, 0, 0.7)",
              backdropFilter: "blur(4px)",
            }}
          />
          
          <div style={{
            position: "relative",
            width: "100%",
            maxWidth: "400px",
            ...cardStyle,
            padding: "24px",
          }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                background: "rgba(239, 68, 68, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}>
                <AlertTriangle style={{ color: "#f87171" }} size={28} />
              </div>
              <h3 style={{ color: "#fff", fontSize: "1.25rem", fontWeight: "600", margin: "0 0 8px" }}>
                Delete Playbook?
              </h3>
              <p style={{ color: "#9ca3af", fontSize: "0.9rem", margin: 0 }}>
                This will permanently delete "{name}" and all its plays. This action cannot be undone.
              </p>
            </div>
            
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  borderRadius: "10px",
                  border: "1px solid rgba(138, 43, 226, 0.3)",
                  background: "transparent",
                  color: "#9ca3af",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px 20px",
                  borderRadius: "10px",
                  border: "none",
                  background: "linear-gradient(135deg, rgba(239, 68, 68, 0.6) 0%, rgba(220, 38, 38, 0.7) 100%)",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                }}
              >
                {isDeleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
