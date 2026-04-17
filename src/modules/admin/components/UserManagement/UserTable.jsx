/**
 * User Table Component
 * Displays users in a table with selection and actions
 */

import React from "react";
import { Edit2, Trash2, Eye, Mail, Phone } from "lucide-react";
import UserRow from "./UserRow";

const UserTable = ({
  users,
  selectedUsers,
  onSelectUser,
  onSelectAll,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={
                    users.length > 0 && selectedUsers.size === users.length
                  }
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="cursor-pointer"
                />
              </th>
              <th className="px-6 py-4 text-left text-white/60 text-sm font-semibold tracking-wide">
                Name
              </th>
              <th className="px-6 py-4 text-left text-white/60 text-sm font-semibold tracking-wide">
                Email
              </th>
              <th className="px-6 py-4 text-left text-white/60 text-sm font-semibold tracking-wide">
                Role
              </th>
              <th className="px-6 py-4 text-left text-white/60 text-sm font-semibold tracking-wide">
                Department
              </th>
              <th className="px-6 py-4 text-left text-white/60 text-sm font-semibold tracking-wide">
                Status
              </th>
              <th className="px-6 py-4 text-left text-white/60 text-sm font-semibold tracking-wide">
                Last Login
              </th>
              <th className="px-6 py-4 text-right text-white/60 text-sm font-semibold tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                isSelected={selectedUsers.has(user.id)}
                onSelect={(selected) => onSelectUser(user.id, selected)}
                onEdit={() => onEdit(user)}
                onDelete={() => onDelete(user)}
                onViewDetails={() => onViewDetails(user)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="p-8 text-center">
          <div className="text-white/40">
            <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No users found</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;
