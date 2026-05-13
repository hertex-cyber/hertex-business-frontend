import React, { useState, useEffect } from "react";
import { Users, Plus, Search, Users as UsersIcon } from "lucide-react";
import { useUsers, useAuditLog, useDepartments } from "../../hooks/useUsers";
import UserTable from "./UserTable";
import CreateUserForm from "./CreateUserForm";
import UserDetail from "./UserDetail";
import AuditLog from "./AuditLog";
import DepartmentList from "./DepartmentList";
import UserFilters from "./UserFilters";
import BulkActions from "./BulkActions";
import ConfirmDeleteDialog from "../../../../components/ConfirmDeleteDialog";
import RingLoader from "@/components/ui/RingLoader";

const UserList = () => {
  const {
    users,
    loading,
    error,
    pagination,
    setPagination,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    bulkUpdateUsers,
  } = useUsers();
  const { departments, loading: deptsLoading, error: deptsError, refetch: refetchDepts } = useDepartments();
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [startInEditMode, setStartInEditMode] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    department: "",
    status: "",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [isTogglingActive, setIsTogglingActive] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    fetchUsers(filters);
  }, [pagination.page]);

  useEffect(() => {
    if (selectedUser && users.length > 0) {
      const updatedUserFromList = users.find(u => u.id === selectedUser.id);
      if (updatedUserFromList) {
        setSelectedUser(updatedUserFromList);
      }
    }
  }, [users, selectedUser?.id]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleCreateUser = async (userData) => {
    try {
      await createUser(userData);
      setShowCreateForm(false);
    } catch (err) {
      console.error("Error creating user:", err);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleEditUser = (user) => {
    setStartInEditMode(true);
    setSelectedUser(user);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)));
    }
  };

  const handleSaveUser = async (updatedUser) => {
    setIsSavingEdit(true);
    try {
      const serverResponse = await updateUser(updatedUser.id, updatedUser);
      setSelectedUser(serverResponse.data || serverResponse);
    } catch (err) {
      console.error("Error updating user:", err);
      throw err;
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    console.log('handleDeleteUser called with userId:', userId);
    setIsDeleting(true);
    try {
      await deleteUser(userId);
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting user:", err);
      // Special handling for "User is already inactive" error
      if (err.message && err.message.includes("User is already inactive")) {
        setShowDeleteConfirm(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async () => {
    if (!selectedUser) return;
    console.log('handleToggleActive called for user:', selectedUser.id, 'current status:', selectedUser.is_active);
    setIsTogglingActive(true);
    try {
      // Update local state immediately for UI feedback
      setSelectedUser(prev => prev ? { ...prev, is_active: !prev.is_active } : null);
      
      await updateUser(selectedUser.id, {
        is_active: !selectedUser.is_active,
      });
      console.log('Toggle active successful!');
    } catch (err) {
      // Revert on error
      setSelectedUser(prev => prev ? { ...prev, is_active: selectedUser.is_active } : null);
      console.error("Error toggling user active status:", err);
    } finally {
      setIsTogglingActive(false);
    }
  };

  const handleBulkUpdate = async (updates) => {
    try {
      await bulkUpdateUsers(Array.from(selectedUsers), updates);
      setSelectedUsers(new Set());
    } catch (err) {
      console.error("Error bulk updating users:", err);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="flex flex-col bg-black h-full">
      <header className="px-10 py-8 flex justify-between items-center border-b border-white/5 relative z-20 bg-black/50 backdrop-blur-xl shrink-0">
        <div className="space-y-0.5">
          {activeTab === 'users' && (
            <>
              <h1 className="text-2xl font-semibold text-white">Users</h1>
              <p className="text-sm text-white/40">Create, manage, and monitor user accounts</p>
            </>
          )}
          {activeTab === 'groups' && (
            <>
              <h1 className="text-2xl font-semibold text-white">Groups</h1>
              <p className="text-sm text-white/40">Organize users into departments and teams</p>
            </>
          )}
          {activeTab === 'audit' && (
            <>
              <h1 className="text-2xl font-semibold text-white">Audit Log</h1>
              <p className="text-sm text-white/40">Track all user activities and system changes</p>
            </>
          )}
        </div>
        {activeTab === 'users' && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="!w-auto h-9 px-4 bg-white text-black rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center gap-2"
          >
            <Plus size={14} />
            Create User
          </button>
        )}
        {activeTab === 'groups' && (
          <button
            className="!w-auto h-9 px-4 bg-white text-black rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center gap-2"
          >
            <Plus size={14} />
            Create Group
          </button>
        )}
      </header>

      <main className="flex-1 px-10 pt-5 pb-5 relative z-10 overflow-hidden flex flex-col gap-0 min-h-0">
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-xl text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="flex items-center border-b border-white/5 shrink-0 pb-4">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2.5 text-sm capitalize transition-all border-b-2 -mb-px ${
                activeTab === 'users'
                  ? 'text-white border-blue-500 font-medium'
                  : 'text-white/30 border-transparent hover:text-white/60'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-4 py-2.5 text-sm capitalize transition-all border-b-2 -mb-px ${
                activeTab === 'groups'
                  ? 'text-white border-blue-500 font-medium'
                  : 'text-white/30 border-transparent hover:text-white/60'
              }`}
            >
              Groups
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2.5 text-sm capitalize transition-all border-b-2 -mb-px ${
                activeTab === 'audit'
                  ? 'text-white border-blue-500 font-medium'
                  : 'text-white/30 border-transparent hover:text-white/60'
              }`}
            >
              Audit Log
            </button>
          </div>
          {activeTab === 'users' && (
            <div className="ml-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={13} />
              <input
                type="text"
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-8 pr-3 h-8 w-52 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-white/20 outline-none focus:border-white/20 transition-all"
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pt-4">
            {activeTab === 'users' && (
              <div className="space-y-4">
                {loading ? (
                  <div className="p-8 text-center">
                    <RingLoader className="mx-auto" />
                  </div>
                ) : (
                  <UserTable
                    users={users}
                    selectedUsers={selectedUsers}
                    onSelectUser={handleSelectUser}
                    onSelectAll={handleSelectAll}
                    onDelete={(user) => setShowDeleteConfirm(user)}
                    onViewDetails={(user) => {
                      setStartInEditMode(false);
                      setSelectedUser(user);
                    }}
                    onEditUser={handleEditUser}
                  />
                )}
              </div>
            )}

            {activeTab === 'groups' && (
              <DepartmentList
                departments={departments}
                loading={deptsLoading}
                error={deptsError}
              />
            )}

            {activeTab === 'audit' && (
              <AuditLog />
            )}
          </div>

          {/* Fixed footer with pagination */}
          {activeTab === 'users' && !loading && (
            <div className="shrink-0 pt-4 border-t border-white/5 mt-4 flex justify-between items-center">
              <p className="text-white/40 text-sm">
                Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
                {Math.min(
                  pagination.page * pagination.pageSize,
                  pagination.count,
                )}{" "}
                of {pagination.count} users
              </p>
              <div className="flex gap-2">
                <button
                  disabled={!pagination.previous || loading}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white/60 rounded-lg text-sm transition-all"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-white/40 text-sm">
                  Page {pagination.page}
                </span>
                <button
                  disabled={!pagination.next || loading}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white/60 rounded-lg text-sm transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Create New User
            </h2>
            <CreateUserForm
              onSubmit={handleCreateUser}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => {
            setSelectedUser(null);
            setStartInEditMode(false);
          }} />
          <UserDetail
            user={selectedUser}
            departments={departments}
            initialEditMode={startInEditMode}
            onClose={() => {
              setSelectedUser(null);
              setStartInEditMode(false);
            }}
            onDelete={() => { 
              setShowDeleteConfirm(selectedUser); 
              setSelectedUser(null);
              setStartInEditMode(false);
            }}
            onToggleActive={handleToggleActive}
            onSave={handleSaveUser}
            isToggling={isTogglingActive}
            isSaving={isSavingEdit}
          />
        </div>
      )}

      <ConfirmDeleteDialog
        isOpen={!!showDeleteConfirm}
        title="Delete User"
        description={`Are you sure you want to delete ${showDeleteConfirm?.first_name || 'this user'} ${showDeleteConfirm?.last_name || ''}? This action cannot be undone.`}
        onConfirm={() => {
          console.log('ConfirmDeleteDialog onConfirm called!');
          console.log('showDeleteConfirm:', showDeleteConfirm);
          if (showDeleteConfirm) {
            handleDeleteUser(showDeleteConfirm.id);
          }
        }}
        onClose={() => setShowDeleteConfirm(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default UserList;
