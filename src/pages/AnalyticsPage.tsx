import { useBlog } from '@contexts/BlogContext'
import { useAuth } from '@contexts/AuthContext'
import { useSubscription } from '@contexts/SubscriptionContext'
import { useUserManagement } from '@contexts/UserManagementContext'
import '../styles/AnalyticsPage.css'

const AnalyticsPage = () => {
  const { posts } = useBlog()
  const { user } = useAuth()
  const { getSubscribers, getSubscribedUsers } = useSubscription()
  const { users } = useUserManagement()

  if (!user) return null

  // My posts
  const myPosts = posts.filter((p) => p.author === user.username)
  
  // Total engagement on my posts
  const totalLikes = myPosts.reduce((sum, p) => sum + p.likes.length, 0)
  const totalComments = myPosts.reduce((sum, p) => sum + p.comments.length, 0)
  const totalShares = myPosts.reduce((sum, p) => sum + p.shares, 0)
  
  // Engagement I've given
  const myLikes = posts.filter((p) => p.likes.includes(user.username)).length
  const myComments = posts.reduce((sum, p) => {
    const myPostComments = p.comments.filter((c) => c.author === user.username).length
    const myReplies = p.comments.reduce((rSum, c) => 
      rSum + c.replies.filter((r) => r.author === user.username).length, 0
    )
    return sum + myPostComments + myReplies
  }, 0)

  // Subscriptions
  const subscribers = getSubscribers(user.username)
  const subscribedTo = getSubscribedUsers()

  // Most liked post
  const mostLikedPost = myPosts.length > 0
    ? myPosts.reduce((max, p) => (p.likes.length > max.likes.length ? p : max), myPosts[0])
    : null

  // Most commented post
  const mostCommentedPost = myPosts.length > 0
    ? myPosts.reduce((max, p) => (p.comments.length > max.comments.length ? p : max), myPosts[0])
    : null

  // Activity over time (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    date.setHours(0, 0, 0, 0)
    return date.getTime()
  })

  const activityByDay = last7Days.map((dayStart) => {
    const dayEnd = dayStart + 24 * 60 * 60 * 1000
    const postsCount = myPosts.filter((p) => p.timestamp >= dayStart && p.timestamp < dayEnd).length
    return postsCount
  })

  const maxActivity = Math.max(...activityByDay, 1)

  // Top contributors (users who engaged with my posts)
  const engagementMap: { [key: string]: number } = {}
  myPosts.forEach((post) => {
    post.likes.forEach((username) => {
      engagementMap[username] = (engagementMap[username] || 0) + 1
    })
    post.comments.forEach((comment) => {
      engagementMap[comment.author] = (engagementMap[comment.author] || 0) + 2
      comment.replies.forEach((reply) => {
        engagementMap[reply.author] = (engagementMap[reply.author] || 0) + 1
      })
    })
  })
  
  const topContributors = Object.entries(engagementMap)
    .filter(([username]) => username !== user.username)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([username, score]) => {
      const u = users.find((u) => u.username === username)
      return {
        username,
        name: u ? `${u.firstName} ${u.lastName}` : username,
        score,
      }
    })

  // Post performance
  const postPerformance = myPosts.map((post) => ({
    id: post.id,
    title: post.title,
    likes: post.likes.length,
    comments: post.comments.length,
    shares: post.shares,
    totalEngagement: post.likes.length + post.comments.length + post.shares,
  })).sort((a, b) => b.totalEngagement - a.totalEngagement).slice(0, 5)

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const avgLikesPerPost = myPosts.length > 0 ? (totalLikes / myPosts.length).toFixed(1) : '0'
  const avgCommentsPerPost = myPosts.length > 0 ? (totalComments / myPosts.length).toFixed(1) : '0'

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1 className="analytics-title">Analytics Dashboard</h1>
        <p className="analytics-subtitle">Track your blog performance and engagement</p>
      </div>

      {/* Overview Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3 className="stat-value">{myPosts.length}</h3>
            <p className="stat-label">Total Posts</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">❤️</div>
          <div className="stat-content">
            <h3 className="stat-value">{totalLikes}</h3>
            <p className="stat-label">Likes Received</p>
            <p className="stat-detail">Avg: {avgLikesPerPost}/post</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <h3 className="stat-value">{totalComments}</h3>
            <p className="stat-label">Comments Received</p>
            <p className="stat-detail">Avg: {avgCommentsPerPost}/post</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔗</div>
          <div className="stat-content">
            <h3 className="stat-value">{totalShares}</h3>
            <p className="stat-label">Shares</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3 className="stat-value">{subscribers.length}</h3>
            <p className="stat-label">Subscribers</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <h3 className="stat-value">{subscribedTo.length}</h3>
            <p className="stat-label">Subscribed To</p>
          </div>
        </div>
      </div>

      {/* My Activity */}
      <div className="section-grid">
        <div className="analytics-section">
          <h2 className="section-title">My Activity</h2>
          <div className="activity-stats">
            <div className="activity-item">
              <span className="activity-label">Likes Given</span>
              <span className="activity-value">{myLikes}</span>
            </div>
            <div className="activity-item">
              <span className="activity-label">Comments Written</span>
              <span className="activity-value">{myComments}</span>
            </div>
            <div className="activity-item">
              <span className="activity-label">Posts Created</span>
              <span className="activity-value">{myPosts.length}</span>
            </div>
          </div>
        </div>

        {/* Top Posts */}
        <div className="analytics-section">
          <h2 className="section-title">Top Posts</h2>
          <div className="top-posts-list">
            {mostLikedPost && (
              <div className="top-post-item">
                <span className="top-post-label">Most Liked</span>
                <p className="top-post-title">{mostLikedPost.title}</p>
                <span className="top-post-stat">❤️ {mostLikedPost.likes.length} likes</span>
              </div>
            )}
            {mostCommentedPost && (
              <div className="top-post-item">
                <span className="top-post-label">Most Discussed</span>
                <p className="top-post-title">{mostCommentedPost.title}</p>
                <span className="top-post-stat">💬 {mostCommentedPost.comments.length} comments</span>
              </div>
            )}
            {!mostLikedPost && <p className="no-data">No posts yet</p>}
          </div>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="analytics-section full-width">
        <h2 className="section-title">Post Activity (Last 7 Days)</h2>
        <div className="chart-container">
          <div className="bar-chart">
            {activityByDay.map((count, index) => (
              <div key={index} className="bar-wrapper">
                <div className="bar-label">{count}</div>
                <div className="bar-column">
                  <div
                    className="bar"
                    style={{ height: `${(count / maxActivity) * 100}%` }}
                  />
                </div>
                <div className="bar-date">{formatDate(last7Days[index])}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Post Performance Table */}
      {postPerformance.length > 0 && (
        <div className="analytics-section full-width">
          <h2 className="section-title">Post Performance</h2>
          <div className="table-container">
            <table className="performance-table">
              <thead>
                <tr>
                  <th>Post Title</th>
                  <th>❤️ Likes</th>
                  <th>💬 Comments</th>
                  <th>🔗 Shares</th>
                  <th>Total Engagement</th>
                </tr>
              </thead>
              <tbody>
                {postPerformance.map((post) => (
                  <tr key={post.id}>
                    <td className="post-title-cell">{post.title}</td>
                    <td>{post.likes}</td>
                    <td>{post.comments}</td>
                    <td>{post.shares}</td>
                    <td className="engagement-cell">{post.totalEngagement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Contributors */}
      {topContributors.length > 0 && (
        <div className="analytics-section full-width">
          <h2 className="section-title">Top Contributors</h2>
          <p className="section-subtitle">Users who engage most with your posts</p>
          <div className="contributors-list">
            {topContributors.map(({ username, name, score }, index) => (
              <div key={username} className="contributor-item">
                <div className="contributor-rank">#{index + 1}</div>
                <div className="contributor-info">
                  <p className="contributor-name">{name}</p>
                  <p className="contributor-username">@{username}</p>
                </div>
                <div className="contributor-score">
                  <span className="score-value">{score}</span>
                  <span className="score-label">engagement</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscribers & Following */}
      <div className="section-grid">
        <div className="analytics-section">
          <h2 className="section-title">My Subscribers ({subscribers.length})</h2>
          {subscribers.length > 0 ? (
            <div className="user-list">
              {subscribers.map((username) => {
                const u = users.find((u) => u.username === username)
                return (
                  <div key={username} className="user-item">
                    {u?.profileImage ? (
                      <img src={u.profileImage} alt={username} className="user-avatar-small" />
                    ) : (
                      <div className="user-avatar-small-placeholder">
                        {u?.firstName?.charAt(0)}{u?.lastName?.charAt(0)}
                      </div>
                    )}
                    <div className="user-item-info">
                      <p className="user-item-name">{u ? `${u.firstName} ${u.lastName}` : username}</p>
                      <p className="user-item-username">@{username}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="no-data">No subscribers yet</p>
          )}
        </div>

        <div className="analytics-section">
          <h2 className="section-title">Following ({subscribedTo.length})</h2>
          {subscribedTo.length > 0 ? (
            <div className="user-list">
              {subscribedTo.map((username) => {
                const u = users.find((u) => u.username === username)
                return (
                  <div key={username} className="user-item">
                    {u?.profileImage ? (
                      <img src={u.profileImage} alt={username} className="user-avatar-small" />
                    ) : (
                      <div className="user-avatar-small-placeholder">
                        {u?.firstName?.charAt(0)}{u?.lastName?.charAt(0)}
                      </div>
                    )}
                    <div className="user-item-info">
                      <p className="user-item-name">{u ? `${u.firstName} ${u.lastName}` : username}</p>
                      <p className="user-item-username">@{username}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="no-data">Not following anyone yet</p>
          )}
        </div>
      </div>

      {/* Engagement Breakdown */}
      <div className="analytics-section full-width">
        <h2 className="section-title">Engagement Breakdown</h2>
        <div className="engagement-chart">
          <div className="engagement-bar-container">
            <div className="engagement-bar-wrapper">
              <div className="engagement-bar likes-bar" style={{ width: `${totalLikes > 0 ? (totalLikes / (totalLikes + totalComments + totalShares)) * 100 : 0}%` }}>
                <span className="engagement-bar-label">Likes: {totalLikes}</span>
              </div>
            </div>
            <div className="engagement-bar-wrapper">
              <div className="engagement-bar comments-bar" style={{ width: `${totalComments > 0 ? (totalComments / (totalLikes + totalComments + totalShares)) * 100 : 0}%` }}>
                <span className="engagement-bar-label">Comments: {totalComments}</span>
              </div>
            </div>
            <div className="engagement-bar-wrapper">
              <div className="engagement-bar shares-bar" style={{ width: `${totalShares > 0 ? (totalShares / (totalLikes + totalComments + totalShares)) * 100 : 0}%` }}>
                <span className="engagement-bar-label">Shares: {totalShares}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage
