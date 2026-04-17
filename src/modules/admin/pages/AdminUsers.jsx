/**
 * Admin Users Page
 * Main admin page for user management
 */

import React from "react";
import { UserList } from "../components/UserManagement";

const AdminUsers = () => {
  return (
    <div className="min-h-screen bg-black">
      <UserList />
    </div>
  );
};

export default AdminUsers;
