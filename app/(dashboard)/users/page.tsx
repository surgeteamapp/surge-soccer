"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  Users, 
  Search, 
  Filter, 
  Mail, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  UserPlus,
  Edit3,
  Trash2,
  CheckCircle,
  Clock,
  X,
  AlertTriangle,
  Eye,
  EyeOff
} from "lucide-react";

// Glass card style matching dashboard design
const cardStyle = {
  background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.95) 0%, rgba(26, 10, 46, 0.9) 50%, rgba(15, 5, 25, 0.95) 100%)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(138, 43, 226, 0.3)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(138, 43, 226, 0.1)',
  borderRadius: '16px',
};

const modalOverlayStyle = {
  position: 'fixed' as const,
  inset: 0,
  background: 'rgba(0, 0, 0, 0.8)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
};

const modalStyle = {
  ...cardStyle,
  width: '100%',
  maxWidth: '480px',
  maxHeight: '90vh',
  overflow: 'auto',
  padding: '24px',
};

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '10px',
  background: 'rgba(138, 43, 226, 0.1)',
  border: '1px solid rgba(138, 43, 226, 0.3)',
  color: '#fff',
  fontSize: '0.875rem',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box' as const,
};

const labelStyle = {
  display: 'block',
  color: '#c4b5fd',
  fontSize: '0.8rem',
  fontWeight: '500',
  marginBottom: '6px',
};

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive?: boolean;
  phoneNumber?: string | null;
  emailVerified: string | null;
  createdAt: string;
  lastLogin: string | null;
}

interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  password: string;
  phoneNumber: string;
}

const ROLES = ["ADMIN", "COACH", "TEAM_MANAGER", "EQUIPMENT_MANAGER", "PLAYER", "FAMILY"];

const defaultFormData: UserFormData = {
  email: '',
  firstName: '',
  lastName: '',
  role: 'PLAYER',
  password: '',
  phoneNumber: '',
};

export default function UsersPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>(defaultFormData);
  const [formError, setFormError] = useState<string>("");
  const [formLoading, setFormLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Button hover states
  const [addBtnHover, setAddBtnHover] = useState(false);
  const [addBtnActive, setAddBtnActive] = useState(false);
  const [backBtnHover, setBackBtnHover] = useState(false);
  const [backBtnActive, setBackBtnActive] = useState(false);
  const [filterBtnHover, setFilterBtnHover] = useState(false);
  const [filterBtnActive, setFilterBtnActive] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  
  // Modal button states
  const [closeBtnHover, setCloseBtnHover] = useState(false);
  const [cancelBtnHover, setCancelBtnHover] = useState(false);
  const [cancelBtnActive, setCancelBtnActive] = useState(false);
  const [submitBtnHover, setSubmitBtnHover] = useState(false);
  const [submitBtnActive, setSubmitBtnActive] = useState(false);
  const [deleteBtnHover, setDeleteBtnHover] = useState(false);
  const [deleteBtnActive, setDeleteBtnActive] = useState(false);
  const [showModalRoleDropdown, setShowModalRoleDropdown] = useState(false);
  const [hoveredModalRole, setHoveredModalRole] = useState<string | null>(null);

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Open Add Modal
  const openAddModal = () => {
    setFormData(defaultFormData);
    setFormError("");
    setShowPassword(false);
    setShowAddModal(true);
  };

  // Open Edit Modal
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role,
      password: '',
      phoneNumber: user.phoneNumber || '',
    });
    setFormError("");
    setShowPassword(false);
    setShowEditModal(true);
  };

  // Open Delete Modal
  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Close all modals
  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedUser(null);
    setFormData(defaultFormData);
    setFormError("");
    setShowModalRoleDropdown(false);
    setCloseBtnHover(false);
    setCancelBtnHover(false);
    setSubmitBtnHover(false);
    setDeleteBtnHover(false);
  };

  // Handle Add User
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    // Validation
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.password) {
      setFormError("Please fill in all required fields");
      setFormLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setFormError("Password must be at least 6 characters");
      setFormLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Failed to create user");
        setFormLoading(false);
        return;
      }

      showNotification('success', `User ${formData.firstName} ${formData.lastName} created successfully`);
      closeModals();
      fetchUsers();
    } catch (error) {
      setFormError("An error occurred. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  // Handle Edit User
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setFormError("");
    setFormLoading(true);

    // Validation
    if (!formData.email || !formData.firstName || !formData.lastName) {
      setFormError("Please fill in all required fields");
      setFormLoading(false);
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setFormError("Password must be at least 6 characters");
      setFormLoading(false);
      return;
    }

    try {
      const updateData: any = { ...formData };
      if (!formData.password) delete updateData.password;

      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Failed to update user");
        setFormLoading(false);
        return;
      }

      showNotification('success', `User ${formData.firstName} ${formData.lastName} updated successfully`);
      closeModals();
      fetchUsers();
    } catch (error) {
      setFormError("An error occurred. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setFormLoading(true);

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        showNotification('error', data.error || "Failed to delete user");
        setFormLoading(false);
        return;
      }

      showNotification('success', `User deleted successfully`);
      closeModals();
      fetchUsers();
    } catch (error) {
      showNotification('error', "An error occurred. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          fullName.includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  // Get unique roles
  const roles = ["ALL", ...Array.from(new Set(users.map(u => u.role)))];

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "ADMIN":
        return { background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' };
      case "COACH":
        return { background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' };
      case "TEAM_MANAGER":
        return { background: 'rgba(14, 165, 233, 0.2)', color: '#38bdf8', border: '1px solid rgba(14, 165, 233, 0.3)' };
      case "PLAYER":
        return { background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)' };
      case "FAMILY":
        return { background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.3)' };
      case "EQUIPMENT_MANAGER":
        return { background: 'rgba(249, 115, 22, 0.2)', color: '#fb923c', border: '1px solid rgba(249, 115, 22, 0.3)' };
      default:
        return { background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' };
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (status === "loading" || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ color: '#c084fc', fontSize: '1rem' }}>Loading users...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '90px',
          right: '24px',
          padding: '14px 20px',
          borderRadius: '12px',
          background: notification.type === 'success' 
            ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.9) 0%, rgba(22, 163, 74, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(185, 28, 28, 0.9) 100%)',
          border: `1px solid ${notification.type === 'success' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
          color: '#fff',
          fontSize: '0.875rem',
          fontWeight: '500',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'slideIn 0.3s ease'
        }}>
          {notification.type === 'success' ? <CheckCircle style={{ height: '20px', width: '20px' }} /> : <AlertTriangle style={{ height: '20px', width: '20px' }} />}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.15) 0%, rgba(75, 0, 130, 0.08) 100%)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(138, 43, 226, 0.3)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 8px 32px 0 rgba(138, 43, 226, 0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #c084fc 0%, #a855f7 50%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0,
            }}>
              User Management
            </h1>
            <p style={{ color: '#9ca3af', marginTop: '8px', fontSize: '0.95rem' }}>
              Manage team members, roles, and permissions • {filteredUsers.length} users total
            </p>
          </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={openAddModal}
            onMouseEnter={() => setAddBtnHover(true)}
            onMouseLeave={() => { setAddBtnHover(false); setAddBtnActive(false); }}
            onMouseDown={() => setAddBtnActive(true)}
            onMouseUp={() => setAddBtnActive(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '10px',
              background: addBtnActive
                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.5) 0%, rgba(22, 163, 74, 0.6) 100%)'
                : addBtnHover
                  ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.4) 0%, rgba(22, 163, 74, 0.5) 100%)'
                  : 'linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(22, 163, 74, 0.4) 100%)',
              border: addBtnHover 
                ? '1px solid rgba(74, 222, 128, 0.7)' 
                : '1px solid rgba(34, 197, 94, 0.5)',
              color: '#4ade80',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: addBtnActive ? 'scale(0.97)' : addBtnHover ? 'scale(1.03)' : 'scale(1)',
              boxShadow: addBtnActive
                ? 'inset 0 2px 8px rgba(0, 0, 0, 0.3)'
                : addBtnHover
                  ? '0 0 20px rgba(34, 197, 94, 0.4), 0 4px 15px rgba(0, 0, 0, 0.2)'
                  : 'none'
            }}
          >
            <UserPlus style={{ height: '16px', width: '16px', color: '#4ade80', filter: addBtnHover ? 'drop-shadow(0 0 4px rgba(74, 222, 128, 0.5))' : 'none' }} />
            Add User
          </button>
          <Link 
            href="/dashboard"
            onMouseEnter={() => setBackBtnHover(true)}
            onMouseLeave={() => { setBackBtnHover(false); setBackBtnActive(false); }}
            onMouseDown={() => setBackBtnActive(true)}
            onMouseUp={() => setBackBtnActive(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '10px',
              background: backBtnActive
                ? 'rgba(138, 43, 226, 0.35)'
                : backBtnHover
                  ? 'rgba(138, 43, 226, 0.25)'
                  : 'rgba(138, 43, 226, 0.15)',
              border: backBtnHover 
                ? '1px solid rgba(168, 85, 247, 0.6)' 
                : '1px solid rgba(138, 43, 226, 0.3)',
              color: backBtnHover ? '#e9d5ff' : '#c4b5fd',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: backBtnActive ? 'scale(0.97)' : backBtnHover ? 'scale(1.03)' : 'scale(1)',
              boxShadow: backBtnActive
                ? 'inset 0 2px 8px rgba(0, 0, 0, 0.3)'
                : backBtnHover
                  ? '0 0 20px rgba(138, 43, 226, 0.3), 0 4px 15px rgba(0, 0, 0, 0.2)'
                  : 'none'
            }}
          >
            <ChevronLeft style={{ height: '16px', width: '16px', color: backBtnHover ? '#e9d5ff' : '#c4b5fd' }} />
            Back to Dashboard
          </Link>
        </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div style={{ ...cardStyle, padding: '16px', position: 'relative', zIndex: 50 }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ 
            flex: '1 1 300px',
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'rgba(138, 43, 226, 0.1)',
            border: '1px solid rgba(138, 43, 226, 0.2)'
          }}>
            <Search style={{ height: '16px', width: '16px', color: '#c084fc' }} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: '0.875rem'
              }}
            />
          </div>

          {/* Role Filter - Custom Dropdown */}
          <div style={{ position: 'relative', zIndex: 100 }}>
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              onMouseEnter={() => setFilterBtnHover(true)}
              onMouseLeave={() => { setFilterBtnHover(false); setFilterBtnActive(false); }}
              onMouseDown={() => setFilterBtnActive(true)}
              onMouseUp={() => setFilterBtnActive(false)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '10px',
                background: filterBtnActive
                  ? 'rgba(138, 43, 226, 0.3)'
                  : filterBtnHover || showRoleDropdown
                    ? 'rgba(138, 43, 226, 0.2)'
                    : 'rgba(138, 43, 226, 0.1)',
                border: filterBtnHover || showRoleDropdown
                  ? '1px solid rgba(168, 85, 247, 0.5)'
                  : '1px solid rgba(138, 43, 226, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: filterBtnActive ? 'scale(0.97)' : filterBtnHover ? 'scale(1.02)' : 'scale(1)',
                boxShadow: filterBtnActive
                  ? 'inset 0 2px 6px rgba(0, 0, 0, 0.2)'
                  : filterBtnHover || showRoleDropdown
                    ? '0 0 15px rgba(138, 43, 226, 0.25)'
                    : 'none'
              }}
            >
              <Filter style={{ 
                height: '16px', 
                width: '16px', 
                color: '#c084fc',
                filter: filterBtnHover ? 'drop-shadow(0 0 3px rgba(192, 132, 252, 0.5))' : 'none'
              }} />
              <span style={{ 
                color: filterBtnHover || showRoleDropdown ? '#e9d5ff' : '#c4b5fd', 
                fontSize: '0.875rem',
                minWidth: '80px',
                textAlign: 'left'
              }}>
                {roleFilter === "ALL" ? "All Roles" : roleFilter.replace('_', ' ')}
              </span>
              <ChevronDown style={{ 
                height: '16px', 
                width: '16px', 
                color: filterBtnHover || showRoleDropdown ? '#e9d5ff' : '#c4b5fd',
                transition: 'transform 0.2s',
                transform: showRoleDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
              }} />
            </button>

            {/* Dropdown Menu */}
            {showRoleDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '8px',
                minWidth: '180px',
                background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.98) 0%, rgba(26, 10, 46, 0.95) 100%)',
                border: '1px solid rgba(138, 43, 226, 0.4)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(138, 43, 226, 0.15)',
                zIndex: 9999,
                overflow: 'hidden'
              }}>
                {roles.map((role, index) => {
                  const isSelected = roleFilter === role;
                  const isHovered = hoveredRole === role;
                  return (
                    <button
                      key={role}
                      onClick={() => {
                        setRoleFilter(role);
                        setCurrentPage(1);
                        setShowRoleDropdown(false);
                      }}
                      onMouseEnter={() => setHoveredRole(role)}
                      onMouseLeave={() => setHoveredRole(null)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: isSelected ? '#a855f7' : isHovered ? '#e9d5ff' : '#d1d5db',
                        background: isSelected 
                          ? 'rgba(138, 43, 226, 0.25)' 
                          : isHovered 
                            ? 'rgba(168, 85, 247, 0.15)' 
                            : 'transparent',
                        borderBottom: index < roles.length - 1 ? '1px solid rgba(138, 43, 226, 0.2)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: 'none',
                        transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                      }}
                    >
                      {role === "ALL" ? "All Roles" : role.replace('_', ' ')}
                      {isSelected && (
                        <CheckCircle style={{ height: '16px', width: '16px', color: '#a855f7' }} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div style={{ ...cardStyle, padding: '0', overflow: 'hidden', position: 'relative', zIndex: 10 }}>
        {/* Table Header */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '2fr 1fr 1fr 1fr 80px',
          padding: '14px 20px',
          background: 'rgba(138, 43, 226, 0.1)',
          borderBottom: '1px solid rgba(138, 43, 226, 0.2)',
          gap: '12px'
        }}>
          <span style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>User</span>
          <span style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Role</span>
          <span style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Status</span>
          <span style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Joined</span>
          <span style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Actions</span>
        </div>

        {/* Table Body */}
        {paginatedUsers.length > 0 ? (
          paginatedUsers.map((user, index) => (
            <div 
              key={user.id}
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '2fr 1fr 1fr 1fr 80px',
                padding: '14px 20px',
                borderBottom: index < paginatedUsers.length - 1 ? '1px solid rgba(138, 43, 226, 0.1)' : 'none',
                alignItems: 'center',
                gap: '12px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(138, 43, 226, 0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {/* User Name & Email */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '10px', 
                  background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.3) 0%, rgba(168, 85, 247, 0.2) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#e9d5ff',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  {user.firstName?.[0]?.toUpperCase() || ''}{user.lastName?.[0]?.toUpperCase() || ''}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: '#fff', fontSize: '0.875rem', fontWeight: '500' }}>
                    {user.firstName && user.lastName 
                      ? `${user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1).toLowerCase()} ${user.lastName.charAt(0).toUpperCase() + user.lastName.slice(1).toLowerCase()}`
                      : user.email?.split('@')[0] || 'Unknown'}
                  </span>
                  <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{user.email}</span>
                </div>
              </div>

              {/* Role */}
              <div>
                <span style={{ 
                  padding: '4px 10px', 
                  borderRadius: '6px', 
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  display: 'inline-block',
                  ...getRoleBadgeStyle(user.role)
                }}>
                  {user.role.replace('_', ' ')}
                </span>
              </div>

              {/* Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {user.emailVerified ? (
                  <>
                    <CheckCircle style={{ height: '16px', width: '16px', color: '#4ade80' }} />
                    <span style={{ color: '#4ade80', fontSize: '0.8rem' }}>Verified</span>
                  </>
                ) : (
                  <>
                    <Clock style={{ height: '16px', width: '16px', color: '#fbbf24' }} />
                    <span style={{ color: '#fbbf24', fontSize: '0.8rem' }}>Pending</span>
                  </>
                )}
              </div>

              {/* Joined Date */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar style={{ height: '12px', width: '12px', color: '#c084fc' }} />
                <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                  {formatDate(user.createdAt)}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  onClick={() => openEditModal(user)}
                  style={{ 
                    padding: '6px', 
                    borderRadius: '6px', 
                    background: 'rgba(59, 130, 246, 0.1)', 
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.25)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  title="Edit user"
                >
                  <Edit3 style={{ height: '14px', width: '14px', color: '#60a5fa' }} />
                </button>
                <button 
                  onClick={() => openDeleteModal(user)}
                  style={{ 
                    padding: '6px', 
                    borderRadius: '6px', 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  title="Delete user"
                >
                  <Trash2 style={{ height: '14px', width: '14px', color: '#f87171' }} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Users style={{ height: '48px', width: '48px', color: 'rgba(168, 85, 247, 0.3)', margin: '0 auto 12px' }} />
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No users found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: currentPage === 1 ? 'rgba(138, 43, 226, 0.05)' : 'rgba(138, 43, 226, 0.15)',
              border: '1px solid rgba(138, 43, 226, 0.2)',
              color: currentPage === 1 ? '#6b7280' : '#c4b5fd',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.875rem'
            }}
          >
            <ChevronLeft style={{ height: '16px', width: '16px' }} />
            Prev
          </button>
          
          <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: currentPage === totalPages ? 'rgba(138, 43, 226, 0.05)' : 'rgba(138, 43, 226, 0.15)',
              border: '1px solid rgba(138, 43, 226, 0.2)',
              color: currentPage === totalPages ? '#6b7280' : '#c4b5fd',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.875rem'
            }}
          >
            Next
            <ChevronRight style={{ height: '16px', width: '16px' }} />
          </button>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={{ ...modalStyle, boxSizing: 'border-box' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>Add New User</h2>
              <button 
                onClick={closeModals}
                onMouseEnter={() => setCloseBtnHover(true)}
                onMouseLeave={() => setCloseBtnHover(false)}
                style={{ 
                  background: closeBtnHover ? 'rgba(239, 68, 68, 0.2)' : 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  color: closeBtnHover ? '#f87171' : '#9ca3af', 
                  padding: '6px',
                  borderRadius: '8px',
                  transition: 'all 0.2s',
                  transform: closeBtnHover ? 'scale(1.1)' : 'scale(1)'
                }}
              >
                <X style={{ height: '20px', width: '20px' }} />
              </button>
            </div>

            {formError && (
              <div style={{ 
                padding: '12px', 
                borderRadius: '8px', 
                background: 'rgba(239, 68, 68, 0.1)', 
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '0.875rem',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertTriangle style={{ height: '16px', width: '16px' }} />
                {formError}
              </div>
            )}

            <form onSubmit={handleAddUser} style={{ width: '100%' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', width: '100%' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label style={labelStyle}>First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    style={inputStyle}
                    placeholder="John"
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label style={labelStyle}>Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    style={inputStyle}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px', width: '100%' }}>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={inputStyle}
                  placeholder="john.doe@example.com"
                />
              </div>

              <div style={{ marginBottom: '16px', position: 'relative', zIndex: 50 }}>
                <label style={labelStyle}>Role *</label>
                <button
                  type="button"
                  onClick={() => setShowModalRoleDropdown(!showModalRoleDropdown)}
                  style={{
                    ...inputStyle,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: showModalRoleDropdown ? 'rgba(138, 43, 226, 0.2)' : 'rgba(138, 43, 226, 0.1)',
                    border: showModalRoleDropdown ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid rgba(138, 43, 226, 0.3)',
                  }}
                >
                  <span>{formData.role.replace('_', ' ')}</span>
                  <ChevronDown style={{ 
                    height: '16px', 
                    width: '16px', 
                    color: '#c4b5fd',
                    transition: 'transform 0.2s',
                    transform: showModalRoleDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
                  }} />
                </button>
                {showModalRoleDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.98) 0%, rgba(26, 10, 46, 0.95) 100%)',
                    border: '1px solid rgba(138, 43, 226, 0.4)',
                    borderRadius: '10px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                    zIndex: 100,
                    overflow: 'hidden'
                  }}>
                    {ROLES.map((role, index) => {
                      const isSelected = formData.role === role;
                      const isHovered = hoveredModalRole === role;
                      return (
                        <button
                          type="button"
                          key={role}
                          onClick={() => {
                            setFormData({ ...formData, role });
                            setShowModalRoleDropdown(false);
                          }}
                          onMouseEnter={() => setHoveredModalRole(role)}
                          onMouseLeave={() => setHoveredModalRole(null)}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            textAlign: 'left',
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            color: isSelected ? '#a855f7' : isHovered ? '#e9d5ff' : '#d1d5db',
                            background: isSelected 
                              ? 'rgba(138, 43, 226, 0.25)' 
                              : isHovered 
                                ? 'rgba(168, 85, 247, 0.15)' 
                                : 'transparent',
                            borderBottom: index < ROLES.length - 1 ? '1px solid rgba(138, 43, 226, 0.2)' : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            border: 'none',
                            transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                          }}
                        >
                          {role.replace('_', ' ')}
                          {isSelected && <CheckCircle style={{ height: '14px', width: '14px', color: '#a855f7' }} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '16px', width: '100%' }}>
                <label style={labelStyle}>Password *</label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    style={{ ...inputStyle, paddingRight: '40px' }}
                    placeholder="Min. 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#9ca3af',
                      padding: '4px'
                    }}
                  >
                    {showPassword ? <EyeOff style={{ height: '16px', width: '16px' }} /> : <Eye style={{ height: '16px', width: '16px' }} />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '24px', width: '100%' }}>
                <label style={labelStyle}>Phone Number (optional)</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  style={inputStyle}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={closeModals}
                  onMouseEnter={() => setCancelBtnHover(true)}
                  onMouseLeave={() => { setCancelBtnHover(false); setCancelBtnActive(false); }}
                  onMouseDown={() => setCancelBtnActive(true)}
                  onMouseUp={() => setCancelBtnActive(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    background: cancelBtnActive 
                      ? 'rgba(239, 68, 68, 0.4)' 
                      : cancelBtnHover 
                        ? 'rgba(239, 68, 68, 0.3)' 
                        : 'rgba(239, 68, 68, 0.15)',
                    border: cancelBtnHover 
                      ? '1px solid rgba(248, 113, 113, 0.6)' 
                      : '1px solid rgba(239, 68, 68, 0.3)',
                    color: cancelBtnHover ? '#fca5a5' : '#f87171',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    transform: cancelBtnActive ? 'scale(0.97)' : cancelBtnHover ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: cancelBtnHover ? '0 0 12px rgba(239, 68, 68, 0.2)' : 'none'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  onMouseEnter={() => !formLoading && setSubmitBtnHover(true)}
                  onMouseLeave={() => { setSubmitBtnHover(false); setSubmitBtnActive(false); }}
                  onMouseDown={() => !formLoading && setSubmitBtnActive(true)}
                  onMouseUp={() => setSubmitBtnActive(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    background: submitBtnActive
                      ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.6) 0%, rgba(22, 163, 74, 0.7) 100%)'
                      : submitBtnHover
                        ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.5) 0%, rgba(22, 163, 74, 0.6) 100%)'
                        : 'linear-gradient(135deg, rgba(34, 197, 94, 0.4) 0%, rgba(22, 163, 74, 0.5) 100%)',
                    border: submitBtnHover 
                      ? '1px solid rgba(74, 222, 128, 0.7)' 
                      : '1px solid rgba(34, 197, 94, 0.5)',
                    color: '#4ade80',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: formLoading ? 'not-allowed' : 'pointer',
                    opacity: formLoading ? 0.7 : 1,
                    transition: 'all 0.2s',
                    transform: submitBtnActive ? 'scale(0.97)' : submitBtnHover ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: submitBtnHover && !formLoading ? '0 0 15px rgba(34, 197, 94, 0.3)' : 'none'
                  }}
                >
                  {formLoading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={{ ...modalStyle, boxSizing: 'border-box' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>Edit User</h2>
              <button 
                onClick={closeModals}
                onMouseEnter={() => setCloseBtnHover(true)}
                onMouseLeave={() => setCloseBtnHover(false)}
                style={{ 
                  background: closeBtnHover ? 'rgba(239, 68, 68, 0.2)' : 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  color: closeBtnHover ? '#f87171' : '#9ca3af', 
                  padding: '6px',
                  borderRadius: '8px',
                  transition: 'all 0.2s',
                  transform: closeBtnHover ? 'scale(1.1)' : 'scale(1)'
                }}
              >
                <X style={{ height: '20px', width: '20px' }} />
              </button>
            </div>

            {formError && (
              <div style={{ 
                padding: '12px', 
                borderRadius: '8px', 
                background: 'rgba(239, 68, 68, 0.1)', 
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '0.875rem',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertTriangle style={{ height: '16px', width: '16px' }} />
                {formError}
              </div>
            )}

            <form onSubmit={handleEditUser} style={{ width: '100%' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', width: '100%' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label style={labelStyle}>First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label style={labelStyle}>Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px', width: '100%' }}>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '16px', position: 'relative', zIndex: 50 }}>
                <label style={labelStyle}>Role *</label>
                <button
                  type="button"
                  onClick={() => setShowModalRoleDropdown(!showModalRoleDropdown)}
                  style={{
                    ...inputStyle,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: showModalRoleDropdown ? 'rgba(138, 43, 226, 0.2)' : 'rgba(138, 43, 226, 0.1)',
                    border: showModalRoleDropdown ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid rgba(138, 43, 226, 0.3)',
                  }}
                >
                  <span>{formData.role.replace('_', ' ')}</span>
                  <ChevronDown style={{ 
                    height: '16px', 
                    width: '16px', 
                    color: '#c4b5fd',
                    transition: 'transform 0.2s',
                    transform: showModalRoleDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
                  }} />
                </button>
                {showModalRoleDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    background: 'linear-gradient(135deg, rgba(10, 0, 20, 0.98) 0%, rgba(26, 10, 46, 0.95) 100%)',
                    border: '1px solid rgba(138, 43, 226, 0.4)',
                    borderRadius: '10px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                    zIndex: 100,
                    overflow: 'hidden'
                  }}>
                    {ROLES.map((role, index) => {
                      const isSelected = formData.role === role;
                      const isHovered = hoveredModalRole === role;
                      return (
                        <button
                          type="button"
                          key={role}
                          onClick={() => {
                            setFormData({ ...formData, role });
                            setShowModalRoleDropdown(false);
                          }}
                          onMouseEnter={() => setHoveredModalRole(role)}
                          onMouseLeave={() => setHoveredModalRole(null)}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            textAlign: 'left',
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            color: isSelected ? '#a855f7' : isHovered ? '#e9d5ff' : '#d1d5db',
                            background: isSelected 
                              ? 'rgba(138, 43, 226, 0.25)' 
                              : isHovered 
                                ? 'rgba(168, 85, 247, 0.15)' 
                                : 'transparent',
                            borderBottom: index < ROLES.length - 1 ? '1px solid rgba(138, 43, 226, 0.2)' : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            border: 'none',
                            transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                          }}
                        >
                          {role.replace('_', ' ')}
                          {isSelected && <CheckCircle style={{ height: '14px', width: '14px', color: '#a855f7' }} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '16px', width: '100%' }}>
                <label style={labelStyle}>New Password (leave blank to keep current)</label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    style={{ ...inputStyle, paddingRight: '40px' }}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#9ca3af',
                      padding: '4px'
                    }}
                  >
                    {showPassword ? <EyeOff style={{ height: '16px', width: '16px' }} /> : <Eye style={{ height: '16px', width: '16px' }} />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '24px', width: '100%' }}>
                <label style={labelStyle}>Phone Number</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={closeModals}
                  onMouseEnter={() => setCancelBtnHover(true)}
                  onMouseLeave={() => { setCancelBtnHover(false); setCancelBtnActive(false); }}
                  onMouseDown={() => setCancelBtnActive(true)}
                  onMouseUp={() => setCancelBtnActive(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    background: cancelBtnActive 
                      ? 'rgba(239, 68, 68, 0.4)' 
                      : cancelBtnHover 
                        ? 'rgba(239, 68, 68, 0.3)' 
                        : 'rgba(239, 68, 68, 0.15)',
                    border: cancelBtnHover 
                      ? '1px solid rgba(248, 113, 113, 0.6)' 
                      : '1px solid rgba(239, 68, 68, 0.3)',
                    color: cancelBtnHover ? '#fca5a5' : '#f87171',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    transform: cancelBtnActive ? 'scale(0.97)' : cancelBtnHover ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: cancelBtnHover ? '0 0 12px rgba(239, 68, 68, 0.2)' : 'none'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  onMouseEnter={() => !formLoading && setSubmitBtnHover(true)}
                  onMouseLeave={() => { setSubmitBtnHover(false); setSubmitBtnActive(false); }}
                  onMouseDown={() => !formLoading && setSubmitBtnActive(true)}
                  onMouseUp={() => setSubmitBtnActive(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    background: submitBtnActive
                      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.6) 0%, rgba(37, 99, 235, 0.7) 100%)'
                      : submitBtnHover
                        ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.5) 0%, rgba(37, 99, 235, 0.6) 100%)'
                        : 'linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, rgba(37, 99, 235, 0.5) 100%)',
                    border: submitBtnHover 
                      ? '1px solid rgba(96, 165, 250, 0.7)' 
                      : '1px solid rgba(59, 130, 246, 0.5)',
                    color: '#60a5fa',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: formLoading ? 'not-allowed' : 'pointer',
                    opacity: formLoading ? 0.7 : 1,
                    transition: 'all 0.2s',
                    transform: submitBtnActive ? 'scale(0.97)' : submitBtnHover ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: submitBtnHover && !formLoading ? '0 0 15px rgba(59, 130, 246, 0.3)' : 'none'
                  }}
                >
                  {formLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={{ ...modalStyle, maxWidth: '400px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <Trash2 style={{ height: '28px', width: '28px', color: '#f87171' }} />
            </div>
            
            <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', marginBottom: '12px' }}>
              Delete User
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '8px' }}>
              Are you sure you want to delete this user?
            </p>
            <p style={{ color: '#f87171', fontSize: '0.875rem', fontWeight: '500', marginBottom: '24px' }}>
              {selectedUser.email}
            </p>
            <p style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '24px' }}>
              This action cannot be undone. All user data will be permanently removed.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={closeModals}
                onMouseEnter={() => setCancelBtnHover(true)}
                onMouseLeave={() => { setCancelBtnHover(false); setCancelBtnActive(false); }}
                onMouseDown={() => setCancelBtnActive(true)}
                onMouseUp={() => setCancelBtnActive(false)}
                style={{
                  padding: '10px 24px',
                  borderRadius: '10px',
                  background: cancelBtnActive 
                    ? 'rgba(239, 68, 68, 0.4)' 
                    : cancelBtnHover 
                      ? 'rgba(239, 68, 68, 0.3)' 
                      : 'rgba(239, 68, 68, 0.15)',
                  border: cancelBtnHover 
                    ? '1px solid rgba(248, 113, 113, 0.6)' 
                    : '1px solid rgba(239, 68, 68, 0.3)',
                  color: cancelBtnHover ? '#fca5a5' : '#f87171',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  transform: cancelBtnActive ? 'scale(0.97)' : cancelBtnHover ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: cancelBtnHover ? '0 0 12px rgba(239, 68, 68, 0.2)' : 'none'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={formLoading}
                onMouseEnter={() => !formLoading && setDeleteBtnHover(true)}
                onMouseLeave={() => { setDeleteBtnHover(false); setDeleteBtnActive(false); }}
                onMouseDown={() => !formLoading && setDeleteBtnActive(true)}
                onMouseUp={() => setDeleteBtnActive(false)}
                style={{
                  padding: '10px 24px',
                  borderRadius: '10px',
                  background: deleteBtnActive
                    ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.6) 0%, rgba(185, 28, 28, 0.7) 100%)'
                    : deleteBtnHover
                      ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.5) 0%, rgba(185, 28, 28, 0.6) 100%)'
                      : 'linear-gradient(135deg, rgba(239, 68, 68, 0.4) 0%, rgba(185, 28, 28, 0.5) 100%)',
                  border: deleteBtnHover 
                    ? '1px solid rgba(248, 113, 113, 0.7)' 
                    : '1px solid rgba(239, 68, 68, 0.5)',
                  color: '#f87171',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: formLoading ? 'not-allowed' : 'pointer',
                  opacity: formLoading ? 0.7 : 1,
                  transition: 'all 0.2s',
                  transform: deleteBtnActive ? 'scale(0.97)' : deleteBtnHover ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: deleteBtnHover && !formLoading ? '0 0 15px rgba(239, 68, 68, 0.3)' : 'none'
                }}
              >
                {formLoading ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
