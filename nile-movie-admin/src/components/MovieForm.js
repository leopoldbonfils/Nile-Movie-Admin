import React, { useState, useEffect } from 'react';
import { Upload, Film, Image } from 'lucide-react';

const MovieForm = ({ onSubmit, initialData = null, loading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: 'Action',
    director: '',
    cast: '',
    year: new Date().getFullYear(),
    duration: '',
    rating: 0,
    ageRating: 'PG-13',
    language: 'English',
    releaseDate: '',
    trending: false,
    comingSoon: false,
    featured: false
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const genres = ['Action', 'Horror', 'Romance', 'Sci-Fi', 'Crime', 'Fantasy', 'Comedy', 'War', 'Drama', 'Thriller'];
  const ageRatings = ['G', 'PG', 'PG-13', 'R', 'NC-17'];

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        genre: initialData.genre || 'Action',
        director: initialData.director || '',
        cast: Array.isArray(initialData.cast) ? initialData.cast.join(', ') : (initialData.cast || ''),
        year: initialData.year || new Date().getFullYear(),
        duration: initialData.duration || '',
        rating: initialData.rating || 0,
        ageRating: initialData.ageRating || 'PG-13',
        language: initialData.language || 'English',
        releaseDate: initialData.releaseDate ? new Date(initialData.releaseDate).toISOString().split('T')[0] : '',
        trending: initialData.trending || false,
        comingSoon: initialData.comingSoon || false,
        featured: initialData.featured || false
      });
      
      if (initialData.thumbnailUrl) {
        setThumbnailPreview(initialData.thumbnailUrl);
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submitData = new FormData();
    
    // Append all form fields
    Object.keys(formData).forEach(key => {
      if (key === 'cast') {
        // Convert comma-separated string to array
        const castArray = formData.cast.split(',').map(c => c.trim()).filter(c => c);
        submitData.append(key, JSON.stringify(castArray));
      } else {
        submitData.append(key, formData[key]);
      }
    });
    
    // Append files
    if (thumbnailFile) {
      submitData.append('thumbnail', thumbnailFile);
    }
    
    if (videoFile) {
      submitData.append('video', videoFile);
    }
    
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="movie-form">
      <div className="form-grid">
        {/* Title */}
        <div className="form-group full-width">
          <label htmlFor="title">Movie Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter movie title"
            required
            disabled={loading}
          />
        </div>

        {/* Description */}
        <div className="form-group full-width">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter movie description"
            rows="4"
            required
            disabled={loading}
          ></textarea>
        </div>

        {/* Genre */}
        <div className="form-group">
          <label htmlFor="genre">Genre *</label>
          <select
            id="genre"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            required
            disabled={loading}
          >
            {genres.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* Director */}
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
            disabled={loading}
          />
        </div>

        {/* Cast */}
        <div className="form-group full-width">
          <label htmlFor="cast">Cast (comma-separated) *</label>
          <input
            type="text"
            id="cast"
            name="cast"
            value={formData.cast}
            onChange={handleChange}
            placeholder="Actor 1, Actor 2, Actor 3"
            required
            disabled={loading}
          />
        </div>

        {/* Year */}
        <div className="form-group">
          <label htmlFor="year">Release Year *</label>
          <input
            type="number"
            id="year"
            name="year"
            value={formData.year}
            onChange={handleChange}
            min="1900"
            max="2100"
            required
            disabled={loading}
          />
        </div>

        {/* Duration */}
        <div className="form-group">
          <label htmlFor="duration">Duration *</label>
          <input
            type="text"
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            placeholder="e.g., 2h 30m"
            required
            disabled={loading}
          />
        </div>

        {/* Rating */}
        <div className="form-group">
          <label htmlFor="rating">Rating (0-5)</label>
          <input
            type="number"
            id="rating"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            min="0"
            max="5"
            step="0.1"
            disabled={loading}
          />
        </div>

        {/* Age Rating */}
        <div className="form-group">
          <label htmlFor="ageRating">Age Rating *</label>
          <select
            id="ageRating"
            name="ageRating"
            value={formData.ageRating}
            onChange={handleChange}
            required
            disabled={loading}
          >
            {ageRatings.map(ar => (
              <option key={ar} value={ar}>{ar}</option>
            ))}
          </select>
        </div>

        {/* Language */}
        <div className="form-group">
          <label htmlFor="language">Language</label>
          <input
            type="text"
            id="language"
            name="language"
            value={formData.language}
            onChange={handleChange}
            placeholder="English"
            disabled={loading}
          />
        </div>

        {/* Release Date */}
        <div className="form-group">
          <label htmlFor="releaseDate">Release Date *</label>
          <input
            type="date"
            id="releaseDate"
            name="releaseDate"
            value={formData.releaseDate}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        {/* Thumbnail Upload */}
        <div className="form-group full-width">
          <label htmlFor="thumbnail">Thumbnail Image {!initialData && '*'}</label>
          <div className="file-upload-area">
            <input
              type="file"
              id="thumbnail"
              accept="image/*"
              onChange={handleThumbnailChange}
              required={!initialData}
              disabled={loading}
            />
            <div className="file-upload-label">
              <Image size={24} />
              <span>{thumbnailFile ? thumbnailFile.name : 'Choose thumbnail image'}</span>
            </div>
          </div>
          {thumbnailPreview && (
            <div className="image-preview">
              <img src={thumbnailPreview} alt="Thumbnail preview" />
            </div>
          )}
        </div>

        {/* Video Upload */}
        <div className="form-group full-width">
          <label htmlFor="video">Video File {!initialData && '*'}</label>
          <div className="file-upload-area">
            <input
              type="file"
              id="video"
              accept="video/*"
              onChange={handleVideoChange}
              required={!initialData}
              disabled={loading}
            />
            <div className="file-upload-label">
              <Film size={24} />
              <span>{videoFile ? videoFile.name : 'Choose video file (MP4)'}</span>
            </div>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="form-group full-width">
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="trending"
                checked={formData.trending}
                onChange={handleChange}
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
                disabled={loading}
              />
              <span>Featured</span>
            </label>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={loading}>
          <Upload size={20} />
          {loading ? 'Uploading...' : (initialData ? 'Update Movie' : 'Upload Movie')}
        </button>
      </div>
    </form>
  );
};

export default MovieForm;