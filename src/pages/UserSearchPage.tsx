import { useState } from 'react'
import { useUserManagement } from '@contexts/UserManagementContext'
import { useSubscription } from '@contexts/SubscriptionContext'
import { useAuth } from '@contexts/AuthContext'
import UserProfileModal from '@components/UserProfileModal'
import '../styles/UserSearchPage.css'

const UserSearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const { users } = useUserManagement()
  const { isSubscribed, getSubscribedUsers } = useSubscription()
  const { user } = useAuth()

  const filteredUsers = users.filter((u) => {
    if (u.username === user?.username) return false
    const query = searchQuery.toLowerCase()
    return (
      u.username.toLowerCase().includes(query) ||
      u.firstName?.toLowerCase().includes(query) ||
      u.lastName?.toLowerCase().includes(query) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(query)
    )
  })

  const subscribedUsernames = getSubscribedUsers()

  return (
    <div className="user-search-container">
      <div className="search-header">
        <h1 className="search-title">Search Users</h1>
        <p className="search-subtitle">Find and subscribe to other users to follow their blog posts</p>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search by username or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {subscribedUsernames.length > 0 && (
        <div className="subscribed-section">
          <h2 className="section-title">Your Subscriptions ({subscribedUsernames.length})</h2>
          <div className="users-grid">
            {users
              .filter((u) => subscribedUsernames.includes(u.username))
              .map((u) => (
                <div
                  key={u.username}
                  className="user-card subscribed-card"
                  onClick={() => setSelectedUser(u.username)}
                >
                  {u.profileImage ? (
                    <img src={u.profileImage} alt={u.username} className="user-avatar" />
                  ) : (
                    <div className="user-avatar-placeholder">
                      {u.firstName?.charAt(0)}
                      {u.lastName?.charAt(0)}
                    </div>
                  )}
                  <div className="user-info">
                    <h3 className="user-name">
                      {u.firstName} {u.lastName}
                    </h3>
                    <p className="user-username">@{u.username}</p>
                    <span className="user-role-badge">{u.role}</span>
                  </div>
                  <div className="subscribed-indicator">✓ Subscribed</div>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="results-section">
        <h2 className="section-title">
          {searchQuery ? `Search Results (${filteredUsers.length})` : 'All Users'}
        </h2>
        {filteredUsers.length === 0 ? (
          <p className="no-results">No users found</p>
        ) : (
          <div className="users-grid">
            {filteredUsers.map((u) => (
              <div
                key={u.username}
                className="user-card"
                onClick={() => setSelectedUser(u.username)}
              >
                {u.profileImage ? (
                  <img src={u.profileImage} alt={u.username} className="user-avatar" />
                ) : (
                  <div className="user-avatar-placeholder">
                    {u.firstName?.charAt(0)}
                    {u.lastName?.charAt(0)}
                  </div>
                )}
                <div className="user-info">
                  <h3 className="user-name">
                    {u.firstName} {u.lastName}
                  </h3>
                  <p className="user-username">@{u.username}</p>
                  <span className="user-role-badge">{u.role}</span>
                </div>
                {isSubscribed(u.username) && (
                  <div className="subscribed-indicator">✓ Subscribed</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedUser && (
        <UserProfileModal username={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  )
}

export default UserSearchPage
