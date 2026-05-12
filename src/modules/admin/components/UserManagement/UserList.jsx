import React, { useState, useEffect } from "react";
import { Users, Plus, Search } from "lucide-react";
import { useUsers, useAuditLog } from "../../hooks/useUsers";
import UserTable from "./UserTable";
import CreateUserForm from "./CreateUserForm";
import EditUserDialog from "./EditUserDialog";
import UserDetail from "./UserDetail";
import AuditLog from "./AuditLog";
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
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    department: "",
    status: "",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    fetchUsers(filters);
  }, [pagination.page]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchUsers(newFilters);
  };

  const handleSelectUser = (userId, selected) => {
    const newSelected = new Set(selectedUsers);
    if (selected) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedUsers(new Set(users.map((u) => u.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      await createUser(userData);
      setShowCreateForm(false);
    } catch (err) {
      console.error("Error creating user:", err);
    }
  };

  const handleUpdateUser = async (userId, userData) => {
    try {
      await updateUser(userId, userData);
      setEditingUser(null);
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting user:", err);
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
          <h1 className="text-2xl font-semibold text-white">Users</h1>
          <p className="text-sm text-white/40">Create, manage, and monitor user accounts</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="!w-auto h-9 px-4 bg-white text-black rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center gap-2"
        >
          <Plus size={14} />
          Create User
        </button>
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
                    onEdit={setEditingUser}
                    onDelete={(user) => setShowDeleteConfirm(user)}
                    onViewDetails={setSelectedUser}
                  />
                )}
              </div>
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

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          onSubmit={handleUpdateUser}
          onCancel={() => setEditingUser(null)}
        />
      )}

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedUser(null)}
              className="text-white/40 hover:text-white mb-4 text-sm"
            >
              ← Back
            </button>
            <UserDetail user={selectedUser} />
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <ConfirmDeleteDialog
          title="Delete User"
          message={`Are you sure you want to deactivate ${showDeleteConfirm.first_name} ${showDeleteConfirm.last_name}? This action cannot be undone.`}
          onConfirm={() => handleDeleteUser(showDeleteConfirm.id)}
          onCancel={() => setShowDeleteConfirm(null)}
        />
      )}
    </div>
  );
};

export default UserList;
