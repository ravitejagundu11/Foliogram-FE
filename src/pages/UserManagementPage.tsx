import { useState } from 'react'
import { useUserManagement } from '@contexts/UserManagementContext'
import { useAuth } from '@contexts/AuthContext'
import { Users } from 'lucide-react'
import PageHeader from '@components/PageHeader'
import '../styles/UserManagementPage.css'
import '../styles/PageHeader.css'

const UserManagementPage = () => {
  const { users, updateUserRole, removeUser } = useUserManagement()
  const { user: currentUser } = useAuth()
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<'user' | 'admin' | 'recruiter'>('user')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const handleEditRole = (username: string, currentRole: 'user' | 'admin' | 'recruiter') => {
    setEditingUser(username)
    setSelectedRole(currentRole)
  }

  const handleSaveRole = (username: string) => {
    updateUserRole(username, selectedRole)
    setEditingUser(null)
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
  }

  const handleDeleteUser = (username: string) => {
    removeUser(username)
    setConfirmDelete(null)
  }

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'role-badge role-badge-admin'
      case 'recruiter':
        return 'role-badge role-badge-recruiter'
      default:
        return 'role-badge role-badge-user'
    }
  }

  return (
    <div className="user-management-container">
      <PageHeader
        title="User Management"
        subtitle="Manage user roles and permissions"
        icon={Users}
      />

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Name</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.username}>
                <td className="font-medium">{user.username}</td>
                <td>
                  {user.firstName} {user.lastName}
                </td>
                <td>{user.email}</td>
                <td>{user.contactNumber}</td>
                <td>
                  {editingUser === user.username ? (
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as 'user' | 'admin' | 'recruiter')}
                      className="role-select"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="recruiter">Recruiter</option>
                    </select>
                  ) : (
                    <span className={getRoleBadgeClass(user.role)}>{user.role}</span>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    {editingUser === user.username ? (
                      <>
                        <button onClick={() => handleSaveRole(user.username)} className="btn-save">
                          Save
                        </button>
                        <button onClick={handleCancelEdit} className="btn-cancel">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditRole(user.username, user.role)}
                          className="btn-edit"
                          disabled={user.username === currentUser?.username}
                        >
                          Edit Role
                        </button>
                        {confirmDelete === user.username ? (
                          <>
                            <button onClick={() => handleDeleteUser(user.username)} className="btn-confirm-delete">
                              Confirm
                            </button>
                            <button onClick={() => setConfirmDelete(null)} className="btn-cancel">
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(user.username)}
                            className="btn-delete"
                            disabled={user.username === currentUser?.username}
                          >
                            Remove
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  {user.username === currentUser?.username && (
                    <p className="text-xs text-gray-500 mt-1">(Current user)</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="empty-state">
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserManagementPage
