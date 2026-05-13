import React, { useState, useEffect } from "react";
import { Users, Plus, Search, Users as UsersIcon, Trash2 } from "lucide-react";
import { useUsers, useAuditLog, useDepartments } from "../../hooks/useUsers";
import UserTable from "./UserTable";
import CreateUserForm from "./CreateUserForm";
import UserDetail from "./UserDetail";
import AuditLog from "./AuditLog";
import DepartmentList from "./DepartmentList";
import UserFilters from "./UserFilters";
import BulkActions from "./BulkActions";
import ConfirmDeleteDialog from "../../../../components/ConfirmDeleteDialog";
import SearchDialog from "./SearchDialog";
import GroupUserModal from "./GroupUserModal";
import RingLoader from "@/components/ui/RingLoader";
import { cn } from "@/lib/utils";

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
    bulkDeleteUsers,
  } = useUsers();
  const { departments, loading: deptsLoading, error: deptsError, refetch: refetchDepts } = useDepartments();
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [startInEditMode, setStartInEditMode] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    department: "",
    status: "",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isRemovingUser, setIsRemovingUser] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers(filters);
  }, [pagination.page, filters, fetchUsers]);

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
      await createUser(userData, filters);
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
    console.log("UserList.handleSaveUser: updatedUser =", updatedUser);
    setIsSavingEdit(true);
    try {
      const serverResponse = await updateUser(updatedUser.id, updatedUser, filters);
      console.log("UserList.handleSaveUser: serverResponse =", serverResponse);
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
      await deleteUser(userId, filters);
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
      const serverResponse = await updateUser(selectedUser.id, {
        is_active: !selectedUser.is_active,
      }, filters);
      console.log('handleToggleActive: serverResponse =', serverResponse);
      setSelectedUser(serverResponse.data || serverResponse);
      console.log('Toggle active successful!');
    } catch (err) {
      console.error("Error toggling user active status:", err);
    } finally {
      setIsTogglingActive(false);
    }
  };

  const handleBulkUpdate = async (updates) => {
    try {
      await bulkUpdateUsers(Array.from(selectedUsers), updates, filters);
      setSelectedUsers(new Set());
    } catch (err) {
      console.error("Error bulk updating users:", err);
    }
  };

  const handleBulkDelete = async () => {
    console.log('handleBulkDelete called with user IDs:', Array.from(selectedUsers));
    setIsDeleting(true);
    try {
      await bulkDeleteUsers(Array.from(selectedUsers), filters);
      setSelectedUsers(new Set());
      setShowDeleteConfirm(null);
      setIsBulkDelete(false);
    } catch (err) {
      console.error("Error bulk deleting users:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleRemoveUser = async (userId) => {
    setIsRemovingUser(userId);
    try {
      await updateUser(userId, { department_id: null }, filters);
    } catch (err) {
      console.error("Error removing user from group:", err);
    } finally {
      setIsRemovingUser(null);
    }
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


      </header>

      <main className="flex-1 px-10 pt-5 pb-5 relative z-10 overflow-hidden flex flex-col gap-0 min-h-0">
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-xl text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="flex items-center shrink-0 pb-4">
          <div className="relative flex items-center p-1 bg-white/[0.02] border border-white/20 rounded-md">
            <div 
              className={cn(
                "absolute inset-y-0 shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all duration-300 ease-out z-0",
                activeTab === 'users' 
                  ? "left-0 w-1/3 rounded-l rounded-r-none bg-blue-500/20" 
                  : activeTab === 'groups'
                  ? "left-1/3 w-1/3 bg-blue-500/20"
                  : "left-2/3 w-1/3 rounded-r rounded-l-none bg-blue-500/20"
              )}
            />
            <button
              onClick={() => setActiveTab('users')}
              className={cn(
                "relative z-10 px-6 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300",
                activeTab === 'users' ? "text-blue-400" : "text-white/50 hover:text-white/80"
              )}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={cn(
                "relative z-10 px-6 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300",
                activeTab === 'groups' ? "text-blue-400" : "text-white/50 hover:text-white/80"
              )}
            >
              Groups
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={cn(
                "relative z-10 px-6 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300",
                activeTab === 'audit' ? "text-blue-400" : "text-white/50 hover:text-white/80"
              )}
            >
              Audit Log
            </button>
          </div>
          {activeTab === 'users' && (
            <div className="ml-auto flex items-center gap-3">
              {selectedUsers.size > 0 && (
                <button
                  onClick={() => {
                    setIsBulkDelete(true);
                    setShowDeleteConfirm({});
                  }}
                  disabled={isDeleting}
                  className="h-8 w-8 rounded-md bg-zinc-900/50 border border-zinc-800 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all flex items-center justify-center group disabled:opacity-50"
                  title="Delete Selected Users"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={() => setIsSearchDialogOpen(true)}
                className="h-8 w-8 rounded-md bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center group"
                title="Search Users"
              >
                <Search size={16} />
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                className="h-8 w-8 rounded-md bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center group"
                title="Create User"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
          {activeTab === 'groups' && (
            <div className="ml-auto flex items-center gap-3">
              <button
                // TODO: Add group search dialog later
                className="h-8 w-8 rounded-md bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center group"
                title="Search Groups"
              >
                <Search size={16} />
              </button>
              <button
                // TODO: Add create group modal later
                className="h-8 w-8 rounded-md bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center group"
                title="Create Group"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0 pt-4">
          {activeTab === 'users' && (
            loading ? (
              <div className="flex-1 flex items-center justify-center">
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
                currentPage={pagination.page}
                totalPages={Math.ceil(pagination.count / pagination.pageSize)}
                onPageChange={handlePageChange}
                pagination={pagination}
              />
            )
          )}

          {activeTab === 'groups' && (
            <DepartmentList
              departments={departments}
              loading={deptsLoading}
              error={deptsError}
              onSelectDepartment={setSelectedDepartment}
            />
          )}

          {activeTab === 'audit' && (
            <AuditLog />
          )}
        </div>
      </main>

      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCreateForm(false)} />
          <CreateUserForm
            onSubmit={handleCreateUser}
            onCancel={() => setShowCreateForm(false)}
          />
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

      <SearchDialog
        isOpen={isSearchDialogOpen}
        onClose={() => setIsSearchDialogOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelect={(user) => {
          setSelectedUser(user);
          setIsSearchDialogOpen(false);
        }}
      />
      <GroupUserModal
        department={selectedDepartment}
        users={users}
        onViewDetails={(user) => {
          setStartInEditMode(false);
          setSelectedUser(user);
        }}
        onRemoveUser={handleRemoveUser}
        isRemovingUser={isRemovingUser}
        onClose={() => setSelectedDepartment(null)}
      />
      <ConfirmDeleteDialog
        isOpen={!!showDeleteConfirm}
        title={isBulkDelete ? "Delete Selected Users" : "Delete User"}
        description={
          isBulkDelete 
            ? `Are you sure you want to delete ${selectedUsers.size} selected user${selectedUsers.size !== 1 ? 's' : ''}? This action cannot be undone.`
            : `Are you sure you want to delete ${showDeleteConfirm?.first_name || 'this user'} ${showDeleteConfirm?.last_name || ''}? This action cannot be undone.`
        }
        onConfirm={() => {
          console.log('ConfirmDeleteDialog onConfirm called!');
          if (isBulkDelete) {
            handleBulkDelete();
          } else if (showDeleteConfirm) {
            handleDeleteUser(showDeleteConfirm.id);
          }
        }}
        onClose={() => {
          setShowDeleteConfirm(null);
          setIsBulkDelete(false);
        }}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default UserList;
