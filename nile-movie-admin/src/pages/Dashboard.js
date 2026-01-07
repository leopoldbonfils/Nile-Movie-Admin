import React, { useState, useEffect } from 'react';
import { Film, Users, TrendingUp, Eye } from 'lucide-react';
import { dashboardService, movieService } from '../api/services';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalUsers: 0,
    totalViews: 0,
    trendingMovies: 0
  });
  const [recentMovies, setRecentMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load stats (if endpoint exists, otherwise calculate from movies)
      try {
        const statsResponse = await dashboardService.getStats();
        setStats(statsResponse.data);
      } catch (error) {
        // If stats endpoint doesn't exist, calculate manually
        const moviesResponse = await movieService.getMovies({ limit: 100 });
        const movies = moviesResponse.data || [];
        
        setStats({
          totalMovies: moviesResponse.total || movies.length,
          totalUsers: 0, // Would need users endpoint
          totalViews: movies.reduce((sum, movie) => sum + (movie.views || 0), 0),
          trendingMovies: movies.filter(m => m.trending).length
        });
      }

      // Load recent movies
      const moviesResponse = await movieService.getMovies({ limit: 5 });
      setRecentMovies(moviesResponse.data || []);

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Movies',
      value: stats.totalMovies,
      icon: Film,
      color: '#00bfff'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: '#16a34a'
    },
    {
      title: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: '#fbbf24'
    },
    {
      title: 'Trending Movies',
      value: stats.trendingMovies,
      icon: TrendingUp,
      color: '#ef4444'
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="page-header">
          <h1>Loading Dashboard...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome to Nile Movie Admin Panel</p>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card" style={{ borderTopColor: stat.color }}>
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
              <stat.icon size={28} />
            </div>
            <div className="stat-info">
              <p className="stat-label">{stat.title}</p>
              <h2 className="stat-value">{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">Recent Movies</h2>
          </div>
          <div className="movies-table">
            {recentMovies.length === 0 ? (
              <p className="empty-state">No movies found. Upload your first movie!</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Thumbnail</th>
                    <th>Title</th>
                    <th>Genre</th>
                    <th>Year</th>
                    <th>Rating</th>
                    <th>Views</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMovies.map((movie) => (
                    <tr key={movie.id}>
                      <td>
                        <img 
                          src={movie.thumbnailUrl || 'https://via.placeholder.com/60x90'} 
                          alt={movie.title}
                          className="movie-thumb"
                        />
                      </td>
                      <td className="movie-title-cell">{movie.title}</td>
                      <td>
                        <span className="genre-badge">{movie.genre}</span>
                      </td>
                      <td>{movie.year}</td>
                      <td>
                        <span className="rating-badge">⭐ {movie.rating}</span>
                      </td>
                      <td>{movie.views?.toLocaleString() || 0}</td>
                      <td>
                        <span className={`status-badge ${movie.isActive ? 'active' : 'inactive'}`}>
                          {movie.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;