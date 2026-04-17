/**
 * User Management List Component
 * Main page for managing users with filtering and CRUD operations
 */

import React, { useState, useEffect } from "react";
import { People, Plus, Search, Filter, Download } from "lucide-react";
import { useUsers, useAuditLog } from "../hooks/useUsers";
import UserTable from "./UserTable";
import CreateUserForm from "./CreateUserForm";
import EditUserDialog from "./EditUserDialog";
import UserDetail from "./UserDetail";
import AuditLog from "./AuditLog";
import UserFilters from "./UserFilters";
import BulkActions from "./BulkActions";
import ConfirmDeleteDialog from "../../../components/ConfirmDeleteDialog";

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

  // Initial load
  useEffect(() => {
    fetchUsers(filters);
  }, [pagination.page]);

  // Handle search and filters
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchUsers(newFilters);
  };

  // Handle user selection
  const handleSelectUser = (userId, selected) => {
    const newSelected = new Set(selectedUsers);
    if (selected) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedUsers(new Set(users.map((u) => u.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  // Handle create
  const handleCreateUser = async (userData) => {
    try {
      await createUser(userData);
      setShowCreateForm(false);
      // Toast notification would be nice here
    } catch (err) {
      console.error("Error creating user:", err);
    }
  };

  // Handle update
  const handleUpdateUser = async (userId, userData) => {
    try {
      await updateUser(userId, userData);
      setEditingUser(null);
      // Toast notification
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  // Handle delete
  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      setShowDeleteConfirm(null);
      // Toast notification
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  // Handle bulk operations
  const handleBulkUpdate = async (updates) => {
    try {
      await bulkUpdateUsers(Array.from(selectedUsers), updates);
      setSelectedUsers(new Set());
      // Toast notification
    } catch (err) {
      console.error("Error bulk updating users:", err);
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="px-10 py-8 flex justify-between items-end border-b border-zinc-800 relative z-20 bg-black/50 backdrop-blur-xl shrink-0">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <People className="w-8 h-8 text-blue-500" />
            User Management
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Create, manage, and monitor user accounts
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm tracking-widest flex items-center gap-2 transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          Create User
        </button>
      </header>

      {/* Filters */}
      <div className="px-10">
        <UserFilters filters={filters} onFilterChange={handleFilterChange} />
      </div>

      {/* Bulk Actions */}
      {selectedUsers.size > 0 && (
        <div className="px-10">
          <BulkActions
            count={selectedUsers.size}
            onClear={() => setSelectedUsers(new Set())}
            onBulkUpdate={handleBulkUpdate}
          />
        </div>
      )}

      {/* Users Table */}
      <div className="px-10">
        {loading ? (
          <div className="p-8 text-center text-white/40">Loading users...</div>
        ) : error ? (
          <div className="p-8 bg-red-900/20 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        ) : (
          <>
            <UserTable
              users={users}
              selectedUsers={selectedUsers}
              onSelectUser={handleSelectUser}
              onSelectAll={handleSelectAll}
              onEdit={setEditingUser}
              onDelete={(user) => setShowDeleteConfirm(user)}
              onViewDetails={setSelectedUser}
            />

            {/* Pagination */}
            <div className="mt-6 flex justify-between items-center">
              <p className="text-white/60 text-sm">
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
                  className="px-4 py-2 bg-zinc-900/30 hover:bg-zinc-900/50 disabled:opacity-50 text-white rounded-lg transition-colors duration-200"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-white/60">
                  Page {pagination.page}
                </span>
                <button
                  disabled={!pagination.next || loading}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className="px-4 py-2 bg-zinc-900/30 hover:bg-zinc-900/50 disabled:opacity-50 text-white rounded-lg transition-colors duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Create New User
            </h2>
            <CreateUserForm
              onSubmit={handleCreateUser}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserDialog
          user={editingUser}
          onSubmit={handleUpdateUser}
          onCancel={() => setEditingUser(null)}
        />
      )}

      {/* User Detail View */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-8">
            <button
              onClick={() => setSelectedUser(null)}
              className="text-white/60 hover:text-white mb-4 text-sm"
            >
              ← Back
            </button>
            <UserDetail user={selectedUser} />
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
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
