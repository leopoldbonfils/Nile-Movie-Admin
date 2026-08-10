import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Edit, Trash2, Eye, EyeOff, Search, List as ListIcon } from 'lucide-react';
import { movieService } from '../api/services';
import './MoviesList.css';

function MoviesList() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState('All');

  const [editingMovie, setEditingMovie] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editThumbnail, setEditThumbnail] = useState(null);
  const [editVideo, setEditVideo] = useState(null);
  const [editTrailer, setEditTrailer] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

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

  const handleEdit = (movie) => {
    setEditingMovie(movie);
    setEditFormData({
      title: movie.title || '',
      description: movie.description || '',
      director: movie.director || '',
      genre: movie.genre || '',
      year: movie.year || new Date().getFullYear(),
      rating: movie.rating || 0,
      trending: movie.trending || false,
      comingSoon: movie.comingSoon || false,
      featured: movie.featured || false,
      releaseDate: movie.releaseDate ? movie.releaseDate.split('T')[0] : ''
    });
    setEditThumbnail(null);
    setEditVideo(null);
    setEditTrailer(null);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      setSavingEdit(true);
      const data = new FormData();
      Object.keys(editFormData).forEach(key => {
        data.append(key, editFormData[key]);
      });
      if (editThumbnail) data.append('thumbnail', editThumbnail);
      if (editVideo) data.append('video', editVideo);
      if (editTrailer) data.append('trailer', editTrailer);

      await movieService.updateMovie(editingMovie.id, data);
      setEditingMovie(null);
      loadMovies();
    } catch (err) {
      console.error('Error saving movie edit:', err);
      alert('Failed to update movie');
    } finally {
      setSavingEdit(false);
    }
  };

  // Handle image error - show placeholder
  const handleImageError = (e) => {
    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"%3E%3Crect width="300" height="450" fill="%23141414"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23808080" font-family="Arial" font-size="20"%3ENo Image%3C/text%3E%3C/svg%3E';
  };

  // Get full image URL
  const getImageUrl = (thumbnailUrl) => {
    if (!thumbnailUrl) return null;
    
    if (thumbnailUrl.startsWith('http')) return thumbnailUrl;
    
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    return `${baseUrl}${thumbnailUrl}`;
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
                  src={getImageUrl(movie.thumbnailUrl)} 
                  alt={movie.title}
                  className="movie-thumbnail"
                  onError={handleImageError}
                />
                <div className="movie-overlay">
                  <div className="movie-actions">
                    <button 
                      onClick={() => handleEdit(movie)}
                      className="action-btn"
                      title="Edit Movie & Categories"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(movie.id)}
                      className="action-btn"
                      title={movie.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {movie.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    <button 
                      onClick={() => navigate(`/dashboard/episodes/${movie.id}`)}
                      className="action-btn"
                      title="Manage Episodes"
                    >
                      <ListIcon size={18} />
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
                {movie.comingSoon && (
                  <div className="inactive-badge" style={{ backgroundColor: '#00A8FF', top: 10, left: 10 }}>Coming Soon</div>
                )}
              </div>
              
              <div className="movie-info">
                <h3 className="movie-title">{movie.title}</h3>
                <div className="movie-meta">
                  <span className="genre-tag">
                    {Array.isArray(movie.genres) && movie.genres.length > 0 
                      ? movie.genres[0] 
                      : movie.genre || 'N/A'}
                  </span>
                  <span className="year-tag">{movie.year}</span>
                </div>
                <div className="movie-badges" style={{ marginTop: '6px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {movie.trending && <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255, 69, 58, 0.2)', color: '#FF453A', fontWeight: 'bold' }}>🔥 Trending</span>}
                  {movie.featured && <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255, 214, 10, 0.2)', color: '#FFD60A', fontWeight: 'bold' }}>⭐ Featured</span>}
                  {movie.comingSoon && <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(0, 168, 255, 0.2)', color: '#00A8FF', fontWeight: 'bold' }}>⏳ Coming Soon</span>}
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

      {/* Edit Movie Modal */}
      {editingMovie && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#1C1C1E', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', color: '#FFF', border: '1px solid #2C2C2E' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px', color: '#FFF' }}>Edit Movie & Category Status</h2>
            
            <form onSubmit={handleSaveEdit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#8E8E93', marginBottom: '4px' }}>Title</label>
                <input type="text" value={editFormData.title} onChange={e => setEditFormData({ ...editFormData, title: e.target.value })} style={{ width: '100%', padding: '10px', backgroundColor: '#2C2C2E', border: '1px solid #3A3A3C', borderRadius: '6px', color: '#FFF' }} required />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#8E8E93', marginBottom: '4px' }}>Description</label>
                <textarea rows="3" value={editFormData.description} onChange={e => setEditFormData({ ...editFormData, description: e.target.value })} style={{ width: '100%', padding: '10px', backgroundColor: '#2C2C2E', border: '1px solid #3A3A3C', borderRadius: '6px', color: '#FFF' }} required />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#8E8E93', marginBottom: '4px' }}>Director</label>
                  <input type="text" value={editFormData.director} onChange={e => setEditFormData({ ...editFormData, director: e.target.value })} style={{ width: '100%', padding: '10px', backgroundColor: '#2C2C2E', border: '1px solid #3A3A3C', borderRadius: '6px', color: '#FFF' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#8E8E93', marginBottom: '4px' }}>Rating (0-10)</label>
                  <input type="number" step="0.1" value={editFormData.rating} onChange={e => setEditFormData({ ...editFormData, rating: parseFloat(e.target.value) })} style={{ width: '100%', padding: '10px', backgroundColor: '#2C2C2E', border: '1px solid #3A3A3C', borderRadius: '6px', color: '#FFF' }} />
                </div>
              </div>

              {/* Display Category Checkboxes */}
              <div style={{ backgroundColor: '#2C2C2E', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '10px', color: '#00A8FF' }}>Category & Display Flags</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={editFormData.trending} onChange={e => setEditFormData({ ...editFormData, trending: e.target.checked })} />
                    <span>🔥 Trending Section</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={editFormData.featured} onChange={e => setEditFormData({ ...editFormData, featured: e.target.checked })} />
                    <span>⭐ Featured Hero & Section</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={editFormData.comingSoon} onChange={e => setEditFormData({ ...editFormData, comingSoon: e.target.checked })} />
                    <span>⏳ Coming Soon Section (Playback Locked until Release Date)</span>
                  </label>
                </div>
              </div>

              {/* Release Date */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#8E8E93', marginBottom: '4px' }}>Release Date</label>
                <input type="date" value={editFormData.releaseDate} onChange={e => setEditFormData({ ...editFormData, releaseDate: e.target.value })} style={{ width: '100%', padding: '10px', backgroundColor: '#2C2C2E', border: '1px solid #3A3A3C', borderRadius: '6px', color: '#FFF' }} />
              </div>

              {/* File replacements */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#8E8E93', marginBottom: '4px' }}>Replace Thumbnail Image (Optional)</label>
                <input type="file" accept="image/*" onChange={e => setEditThumbnail(e.target.files[0])} style={{ color: '#8E8E93' }} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#8E8E93', marginBottom: '4px' }}>Replace Main Video File (Optional)</label>
                <input type="file" accept="video/*" onChange={e => setEditVideo(e.target.files[0])} style={{ color: '#8E8E93' }} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#8E8E93', marginBottom: '4px' }}>Replace Trailer File (Optional)</label>
                <input type="file" accept="video/*" onChange={e => setEditTrailer(e.target.files[0])} style={{ color: '#8E8E93' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setEditingMovie(null)} className="btn-secondary" disabled={savingEdit}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={savingEdit}>{savingEdit ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MoviesList;