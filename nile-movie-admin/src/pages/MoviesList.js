import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Edit, Trash2, Eye, EyeOff, Search } from 'lucide-react';
import { movieService } from '../api/services';
import './MoviesList.css';

function MoviesList() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState('All');

  const genres = ['All', 'Action', 'Horror', 'Romance', 'Sci-Fi', 'Crime', 'Fantasy', 'Comedy', 'War', 'Drama', 'Thriller'];

  useEffect(() => {
    loadMovies();
  }, [searchQuery, filterGenre]);

  const loadMovies = async () => {
    try {
      setLoading(true);
      const filters = {
        search: searchQuery || undefined,
        genre: filterGenre !== 'All' ? filterGenre : undefined
      };
      
      const response = await movieService.getMovies(filters);
      setMovies(response.data || []);
    } catch (error) {
      console.error('Error loading movies:', error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await movieService.deleteMovie(id);
      loadMovies();
    } catch (error) {
      console.error('Error deleting movie:', error);
      alert('Failed to delete movie');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await movieService.toggleStatus(id);
      loadMovies();
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to update status');
    }
  };

  return (
    <div className="movies-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Movies Management</h1>
          <p className="page-subtitle">Manage all movies in the catalog</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/upload')}
          className="btn-primary"
        >
          <Film size={20} />
          Add New Movie
        </button>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <select 
          value={filterGenre} 
          onChange={(e) => setFilterGenre(e.target.value)}
          className="genre-filter"
        >
          {genres.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading-state">Loading movies...</div>
      ) : movies.length === 0 ? (
        <div className="empty-state">
          <Film size={64} />
          <h2>No Movies Found</h2>
          <p>Start by uploading your first movie</p>
          <button 
            onClick={() => navigate('/dashboard/upload')}
            className="btn-primary"
          >
            Upload Movie
          </button>
        </div>
      ) : (
        <div className="movies-grid">
          {movies.map((movie) => (
            <div key={movie.id} className="movie-card">
              <div className="movie-thumbnail-container">
                <img 
                  src={movie.thumbnailUrl || 'https://via.placeholder.com/300x450'} 
                  alt={movie.title}
                  className="movie-thumbnail"
                />
                <div className="movie-overlay">
                  <div className="movie-actions">
                    <button 
                      onClick={() => handleToggleStatus(movie.id)}
                      className="action-btn"
                      title={movie.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {movie.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    <button 
                      onClick={() => handleDelete(movie.id, movie.title)}
                      className="action-btn delete-btn"
                      title="Delete Movie"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                {!movie.isActive && (
                  <div className="inactive-badge">Inactive</div>
                )}
              </div>
              
              <div className="movie-info">
                <h3 className="movie-title">{movie.title}</h3>
                <div className="movie-meta">
                  <span className="genre-tag">{movie.genre}</span>
                  <span className="year-tag">{movie.year}</span>
                </div>
                <div className="movie-stats">
                  <span>⭐ {movie.rating}</span>
                  <span>👁️ {movie.views?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MoviesList;