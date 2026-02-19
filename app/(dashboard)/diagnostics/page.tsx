"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Database,
  Shield,
  Server,
  Users,
  Clock,
  ArrowLeft,
  Cpu
} from "lucide-react";

interface DiagnosticCheck {
  name: string;
  status: "healthy" | "warning" | "error";
  message: string;
  details?: string;
  responseTime?: number;
}

interface DiagnosticsData {
  overallStatus: "healthy" | "warning" | "error";
  checks: DiagnosticCheck[];
  timestamp: string;
  serverUptime: number;
  nodeVersion: string;
}

const cardStyle = {
  background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.95) 0%, rgba(26, 10, 46, 0.9) 50%, rgba(15, 5, 25, 0.95) 100%)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(138, 43, 226, 0.3)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(138, 43, 226, 0.1)',
  borderRadius: '16px',
};

export default function DiagnosticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [diagnostics, setDiagnostics] = useState<DiagnosticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isRefreshHovered, setIsRefreshHovered] = useState(false);
  const [isBackHovered, setIsBackHovered] = useState(false);
  const [isUsersHovered, setIsUsersHovered] = useState(false);
  const [isRerunHovered, setIsRerunHovered] = useState(false);

  const fetchDiagnostics = async () => {
    try {
      const response = await fetch("/api/admin/diagnostics");
      if (response.ok) {
        const data = await response.json();
        setDiagnostics(data);
      }
    } catch (error) {
      console.error("Error fetching diagnostics:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role !== "ADMIN") {
        router.push("/dashboard");
        return;
      }
      fetchDiagnostics();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, session, router]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDiagnostics();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="h-5 w-5 text-green-400" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Activity className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return { bg: "rgba(34, 197, 94, 0.2)", border: "rgba(34, 197, 94, 0.5)", text: "#4ade80" };
      case "warning":
        return { bg: "rgba(234, 179, 8, 0.2)", border: "rgba(234, 179, 8, 0.5)", text: "#facc15" };
      case "error":
        return { bg: "rgba(239, 68, 68, 0.2)", border: "rgba(239, 68, 68, 0.5)", text: "#f87171" };
      default:
        return { bg: "rgba(107, 114, 128, 0.2)", border: "rgba(107, 114, 128, 0.5)", text: "#9ca3af" };
    }
  };

  const getCheckIcon = (name: string) => {
    if (name.includes("Database")) return <Database className="h-5 w-5" />;
    if (name.includes("Auth")) return <Shield className="h-5 w-5" />;
    if (name.includes("User")) return <Users className="h-5 w-5" />;
    if (name.includes("Memory")) return <Cpu className="h-5 w-5" />;
    if (name.includes("Environment")) return <Server className="h-5 w-5" />;
    return <Activity className="h-5 w-5" />;
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading || status === "loading") {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <RefreshCw className="h-8 w-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link
            href="/dashboard"
            onMouseEnter={() => setIsBackHovered(true)}
            onMouseLeave={() => setIsBackHovered(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "10px",
              background: isBackHovered 
                ? "rgba(138, 43, 226, 0.35)" 
                : "rgba(138, 43, 226, 0.2)",
              border: isBackHovered 
                ? "1px solid rgba(168, 85, 247, 0.5)" 
                : "1px solid rgba(138, 43, 226, 0.3)",
              color: isBackHovered ? "#e9d5ff" : "#c4b5fd",
              textDecoration: "none",
              fontSize: "0.875rem",
              transition: "all 0.2s",
              transform: isBackHovered ? "translateX(-2px)" : "none",
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#fff", margin: 0 }}>
            System Diagnostics
          </h1>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          onMouseEnter={() => setIsRefreshHovered(true)}
          onMouseLeave={() => setIsRefreshHovered(false)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            borderRadius: "10px",
            background: isRefreshHovered && !refreshing
              ? "linear-gradient(135deg, rgba(168, 85, 247, 0.6) 0%, rgba(138, 43, 226, 0.7) 100%)"
              : "linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(138, 43, 226, 0.5) 100%)",
            border: "1px solid rgba(168, 85, 247, 0.6)",
            color: "#fff",
            cursor: refreshing ? "not-allowed" : "pointer",
            opacity: refreshing ? 0.7 : 1,
            fontSize: "0.875rem",
            fontWeight: "600",
            transition: "all 0.2s",
            transform: isRefreshHovered && !refreshing ? "translateY(-2px)" : "none",
            boxShadow: isRefreshHovered && !refreshing ? "0 4px 15px rgba(138, 43, 226, 0.4)" : "none",
          }}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Overall Status Card */}
      {diagnostics && (
        <div style={{ ...cardStyle, padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  background: getStatusColor(diagnostics.overallStatus).bg,
                  border: `1px solid ${getStatusColor(diagnostics.overallStatus).border}`
                }}
              >
                {diagnostics.overallStatus === "healthy" && <CheckCircle2 className="h-8 w-8 text-green-400" />}
                {diagnostics.overallStatus === "warning" && <AlertTriangle className="h-8 w-8 text-yellow-400" />}
                {diagnostics.overallStatus === "error" && <XCircle className="h-8 w-8 text-red-400" />}
              </div>
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#fff", margin: 0 }}>
                  System Status:{" "}
                  <span style={{ color: getStatusColor(diagnostics.overallStatus).text, textTransform: "capitalize" }}>
                    {diagnostics.overallStatus}
                  </span>
                </h2>
                <p style={{ color: "#9ca3af", fontSize: "0.875rem", margin: "4px 0 0 0" }}>
                  Last checked: {new Date(diagnostics.timestamp).toLocaleString()}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#9ca3af", fontSize: "0.75rem", marginBottom: "4px" }}>
                  <Clock className="h-3 w-3" />
                  Server Uptime
                </div>
                <span style={{ color: "#fff", fontWeight: "bold", fontSize: "1.1rem" }}>
                  {formatUptime(diagnostics.serverUptime)}
                </span>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#9ca3af", fontSize: "0.75rem", marginBottom: "4px" }}>
                  <Server className="h-3 w-3" />
                  Node Version
                </div>
                <span style={{ color: "#fff", fontWeight: "bold", fontSize: "1.1rem" }}>
                  {diagnostics.nodeVersion}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Diagnostic Checks */}
      <div style={{ ...cardStyle, padding: "24px" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#fff", margin: "0 0 20px 0", display: "flex", alignItems: "center", gap: "8px" }}>
          <Activity className="h-5 w-5 text-purple-400" />
          Diagnostic Checks
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {diagnostics?.checks.map((check, index) => {
            const colors = getStatusColor(check.status);
            return (
              <div
                key={index}
                style={{
                  padding: "16px 20px",
                  borderRadius: "12px",
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ color: colors.text }}>
                    {getCheckIcon(check.name)}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: "#fff", fontWeight: "600" }}>{check.name}</span>
                      {getStatusIcon(check.status)}
                    </div>
                    <p style={{ color: "#9ca3af", fontSize: "0.875rem", margin: "2px 0 0 0" }}>
                      {check.message}
                    </p>
                    {check.details && (
                      <p style={{ color: "#6b7280", fontSize: "0.75rem", margin: "4px 0 0 0" }}>
                        {check.details}
                      </p>
                    )}
                  </div>
                </div>

                {check.responseTime !== undefined && (
                  <div
                    style={{
                      padding: "4px 12px",
                      borderRadius: "6px",
                      background: "rgba(0, 0, 0, 0.3)",
                      fontSize: "0.75rem",
                      color: check.responseTime > 500 ? "#facc15" : "#4ade80"
                    }}
                  >
                    {check.responseTime}ms
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ ...cardStyle, padding: "24px" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#fff", margin: "0 0 16px 0" }}>
          Quick Actions
        </h3>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link
            href="/users"
            onMouseEnter={() => setIsUsersHovered(true)}
            onMouseLeave={() => setIsUsersHovered(false)}
            style={{
              padding: "12px 20px",
              borderRadius: "10px",
              background: isUsersHovered 
                ? "rgba(138, 43, 226, 0.35)" 
                : "rgba(138, 43, 226, 0.2)",
              border: isUsersHovered 
                ? "1px solid rgba(168, 85, 247, 0.5)" 
                : "1px solid rgba(138, 43, 226, 0.3)",
              color: isUsersHovered ? "#e9d5ff" : "#c4b5fd",
              textDecoration: "none",
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s",
              transform: isUsersHovered ? "translateY(-2px)" : "none",
            }}
          >
            <Users className="h-4 w-4" />
            Manage Users
          </Link>
          <button
            onClick={handleRefresh}
            onMouseEnter={() => setIsRerunHovered(true)}
            onMouseLeave={() => setIsRerunHovered(false)}
            style={{
              padding: "12px 20px",
              borderRadius: "10px",
              background: isRerunHovered 
                ? "rgba(138, 43, 226, 0.35)" 
                : "rgba(138, 43, 226, 0.2)",
              border: isRerunHovered 
                ? "1px solid rgba(168, 85, 247, 0.5)" 
                : "1px solid rgba(138, 43, 226, 0.3)",
              color: isRerunHovered ? "#e9d5ff" : "#c4b5fd",
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              transition: "all 0.2s",
              transform: isRerunHovered ? "translateY(-2px)" : "none",
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Re-run Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
}
