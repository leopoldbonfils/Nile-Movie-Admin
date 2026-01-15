import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Film, Image, AlertCircle, CheckCircle, X } from 'lucide-react';
import { movieService } from '../api/services';
import './UploadMovie.css';

function UploadMovie() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genres: [],
    director: '',
    cast: '',
    year: new Date().getFullYear(),
    duration: '',
    rating: '0',
    ageRating: 'PG-13',
    language: 'English',
    trending: false,
    comingSoon: false,
    featured: false,
    releaseDate: ''
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const availableGenres = ['Action', 'Horror', 'Romance', 'Sci-Fi', 'Crime', 'Fantasy', 'Comedy', 'War', 'Drama', 'Thriller'];
  const ageRatings = ['G', 'PG', 'PG-13', 'R', 'NC-17'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    setError('');
  };

  const handleGenreToggle = (genre) => {
    setFormData(prev => {
      const isSelected = prev.genres.includes(genre);
      return {
        ...prev,
        genres: isSelected
          ? prev.genres.filter(g => g !== genre)
          : [...prev.genres, genre]
      };
    });
  };

  const removeGenre = (genre) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.filter(g => g !== genre)
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Thumbnail must be less than 5MB');
        e.target.value = '';
        return;
      }
      
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      if (file.size > 10 * 1024 * 1024 * 1024) {
        setError('Video must be less than 10GB');
        e.target.value = '';
        return;
      }
      
      setVideoFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate required fields
    if (!formData.title || !formData.description || !formData.director) {
      setError('Please fill in all required fields (Title, Description, Director)');
      return;
    }

    if (formData.genres.length === 0) {
      setError('Please select at least one genre');
      return;
    }

    if (!thumbnailFile) {
      setError('Please select a thumbnail image');
      return;
    }

    if (!videoFile) {
      setError('Please select a video file');
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      
      // Append form fields
      Object.keys(formData).forEach(key => {
        if (key === 'cast') {
          const castArray = formData[key].split(',').map(s => s.trim()).filter(s => s);
          data.append(key, JSON.stringify(castArray));
        } else if (key === 'genres') {
          data.append(key, JSON.stringify(formData[key]));
        } else {
          data.append(key, formData[key]);
        }
      });

      // Append files
      data.append('thumbnail', thumbnailFile);
      data.append('video', videoFile);

      await movieService.uploadMovie(data);

      setSuccess('Movie uploaded successfully!');
      
      setTimeout(() => {
        navigate('/dashboard/movies');
      }, 2000);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to upload movie. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      title: '',
      description: '',
      genres: [],
      director: '',
      cast: '',
      year: new Date().getFullYear(),
      duration: '',
      rating: '0',
      ageRating: 'PG-13',
      language: 'English',
      trending: false,
      comingSoon: false,
      featured: false,
      releaseDate: ''
    });
    setThumbnailFile(null);
    setVideoFile(null);
    setThumbnailPreview(null);
    setError('');
    setSuccess('');
    
    const thumbnailInput = document.getElementById('thumbnail');
    const videoInput = document.getElementById('video');
    if (thumbnailInput) thumbnailInput.value = '';
    if (videoInput) videoInput.value = '';
  };

  return (
    <div className="upload-page">
      <div className="page-header">
        <h1 className="page-title">Upload New Movie</h1>
        <p className="page-subtitle">Add a new movie to the Nile Movie catalog</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-section">
          <h2 className="section-title">Basic Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Movie Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter movie title"
                required
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Genres * (Click to select/deselect)</label>
              
              {/* Selected Genres Display */}
              {formData.genres.length > 0 && (
                <div className="selected-genres">
                  {formData.genres.map(genre => (
                    <span key={genre} className="genre-chip">
                      {genre}
                      <button
                        type="button"
                        onClick={() => removeGenre(genre)}
                        className="genre-chip-remove"
                        disabled={loading}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Genre Selection Buttons */}
              <div className="genre-buttons">
                {availableGenres.map(genre => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => handleGenreToggle(genre)}
                    className={`genre-button ${formData.genres.includes(genre) ? 'selected' : ''}`}
                    disabled={loading}
                  >
                    {genre}
                  </button>
                ))}
              </div>
              
              {formData.genres.length === 0 && (
                <small style={{color: '#808080', fontSize: '0.875rem', display: 'block', marginTop: '0.5rem'}}>
                  No genres selected
                </small>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter movie description"
              required
              rows="4"
              className="form-textarea"
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="director">Director *</label>
              <input
                type="text"
                id="director"
                name="director"
                value={formData.director}
                onChange={handleChange}
                placeholder="Director name"
                required
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="cast">Cast (comma-separated)</label>
              <input
                type="text"
                id="cast"
                name="cast"
                value={formData.cast}
                onChange={handleChange}
                placeholder="Actor 1, Actor 2, Actor 3"
                className="form-input"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">Movie Details</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="year">Release Year *</label>
              <input
                type="number"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                min="1900"
                max={new Date().getFullYear() + 5}
                required
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="duration">Duration (e.g., 2h 15m) *</label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="2h 15m"
                required
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="rating">Rating (0-10)</label>
              <input
                type="number"
                id="rating"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                min="0"
                max="10"
                step="0.1"
                className="form-input"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ageRating">Age Rating *</label>
              <select
                id="ageRating"
                name="ageRating"
                value={formData.ageRating}
                onChange={handleChange}
                required
                className="form-input"
                disabled={loading}
              >
                {ageRatings.map(rating => <option key={rating} value={rating}>{rating}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="language">Language *</label>
              <input
                type="text"
                id="language"
                name="language"
                value={formData.language}
                onChange={handleChange}
                required
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="releaseDate">Release Date</label>
              <input
                type="date"
                id="releaseDate"
                name="releaseDate"
                value={formData.releaseDate}
                onChange={handleChange}
                className="form-input"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">Media Files</h2>
          
          <div className="form-row">
            <div className="form-group file-upload-group">
              <label htmlFor="thumbnail">
                <Image size={20} />
                Thumbnail Image * (Max 5MB)
              </label>
              <input
                type="file"
                id="thumbnail"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="file-input"
                disabled={loading}
              />
              {thumbnailPreview && (
                <div className="file-preview">
                  <img src={thumbnailPreview} alt="Thumbnail preview" />
                </div>
              )}
              {thumbnailFile && (
                <p className="file-info">✅ Selected: {thumbnailFile.name}</p>
              )}
            </div>

            <div className="form-group file-upload-group">
              <label htmlFor="video">
                <Film size={20} />
                Video File * (Max 10GB)
              </label>
              <input
                type="file"
                id="video"
                accept="video/*"
                onChange={handleVideoChange}
                className="file-input"
                disabled={loading}
              />
              {videoFile && (
                <p className="file-info">
                  ✅ Selected: {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
              {!videoFile && (
                <p className="file-info" style={{color: '#808080'}}>
                  No video file selected
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">Status Flags</h2>
          
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="trending"
                checked={formData.trending}
                onChange={handleChange}
                className="checkbox-input"
                disabled={loading}
              />
              <span>Trending</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="comingSoon"
                checked={formData.comingSoon}
                onChange={handleChange}
                className="checkbox-input"
                disabled={loading}
              />
              <span>Coming Soon</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="checkbox-input"
                disabled={loading}
              />
              <span>Featured</span>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={handleReset}
            className="btn-secondary"
            disabled={loading}
          >
            Reset Form
          </button>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading || !videoFile || !thumbnailFile || formData.genres.length === 0}
          >
            {loading ? (
              <>
                <Upload size={20} className="spinning" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={20} />
                Upload Movie
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UploadMovie;