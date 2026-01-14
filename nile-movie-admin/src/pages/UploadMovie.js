import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Film, Image, AlertCircle, CheckCircle } from 'lucide-react';
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
    genres: [], // Changed from genre to genres (array)
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

  const genres = ['Action', 'Horror', 'Romance', 'Sci-Fi', 'Crime', 'Fantasy', 'Comedy', 'War', 'Drama', 'Thriller'];
  const ageRatings = ['G', 'PG', 'PG-13', 'R', 'NC-17'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle multiple genre selection
    if (name === 'genres') {
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setFormData({
        ...formData,
        genres: selectedOptions
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
    setError('');
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    console.log('Thumbnail selected:', file); // Debug log
    
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Thumbnail must be less than 5MB');
        e.target.value = ''; // Clear the input
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
    console.log('Video selected:', file); // Debug log
    
    if (file) {
      if (file.size > 10 * 1024 * 1024 * 1024) { // 10GB limit
        setError('Video must be less than 10GB');
        e.target.value = ''; // Clear the input
        return;
      }
      
      setVideoFile(file);
      console.log('Video file set:', file.name, file.size); // Debug log
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('Form data:', formData);
    console.log('Thumbnail file:', thumbnailFile);
    console.log('Video file:', videoFile);

    // Validate required fields
    if (!formData.title || !formData.description || !formData.director) {
      setError('Please fill in all required fields (Title, Description, Director)');
      return;
    }

    if (!thumbnailFile) {
      setError('Please select a thumbnail image');
      return;
    }

    if (!videoFile) {
      setError('Please select a video file');
      console.log('Video file is null or undefined');
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
          // Send genres as JSON array
          data.append(key, JSON.stringify(formData[key]));
        } else {
          data.append(key, formData[key]);
        }
      });

      // Append files
      data.append('thumbnail', thumbnailFile);
      data.append('video', videoFile);

      console.log('FormData entries:');
      for (let pair of data.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await movieService.uploadMovie(data);
      console.log('Upload response:', response);

      setSuccess('Movie uploaded successfully!');
      
      // Reset form
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
      genres: [], // Reset to empty array
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
    
    // Clear file inputs
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
              <label htmlFor="genres">Genres * (Hold Ctrl/Cmd to select multiple)</label>
              <select
                id="genres"
                name="genres"
                value={formData.genres}
                onChange={handleChange}
                required
                multiple
                className="form-input"
                disabled={loading}
                style={{ minHeight: '120px' }}
              >
                {genres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <small style={{color: '#b3b3b3', fontSize: '0.875rem'}}>
                Selected: {formData.genres.length > 0 ? formData.genres.join(', ') : 'None'}
              </small>
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
            disabled={loading || !videoFile || !thumbnailFile}
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