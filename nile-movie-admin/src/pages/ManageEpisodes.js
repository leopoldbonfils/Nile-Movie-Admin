import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Save, ArrowLeft, Video, Film } from 'lucide-react';
import { movieService } from '../api/services';
import './ManageEpisodes.css';

function ManageEpisodes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [showSeasonForm, setShowSeasonForm] = useState(false);
  const [newSeason, setNewSeason] = useState({ seasonNumber: '', title: '', description: '', releaseDate: '' });

  const [showEpisodeForm, setShowEpisodeForm] = useState(null); // seasonId
  const [newEpisode, setNewEpisode] = useState({ episodeNumber: '', title: '', description: '', duration: '', videoFile: null });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [movieRes, seasonsRes] = await Promise.all([
        movieService.getMovie(id),
        movieService.getSeasons(id)
      ]);
      setMovie(movieRes.data);
      
      // Load episodes for each season
      const seasonsData = seasonsRes.data || [];
      const seasonsWithEpisodes = await Promise.all(
        seasonsData.map(async (s) => {
          const epRes = await movieService.getSeasonEpisodes(id, s.id);
          return { ...s, episodes: epRes.data || [] };
        })
      );
      setSeasons(seasonsWithEpisodes);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load movie data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSeason = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await movieService.createSeason(id, newSeason);
      setShowSeasonForm(false);
      setNewSeason({ seasonNumber: '', title: '', description: '', releaseDate: '' });
      loadData();
    } catch (error) {
      console.error('Error creating season:', error);
      alert('Failed to create season');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateEpisode = async (e, seasonId) => {
    e.preventDefault();
    if (!newEpisode.videoFile) {
      alert("Please select a video file for the episode.");
      return;
    }
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('episodeNumber', newEpisode.episodeNumber);
      formData.append('title', newEpisode.title);
      formData.append('description', newEpisode.description);
      formData.append('duration', newEpisode.duration);
      formData.append('video', newEpisode.videoFile);

      await movieService.createEpisode(id, seasonId, formData);
      setShowEpisodeForm(null);
      setNewEpisode({ episodeNumber: '', title: '', description: '', duration: '', videoFile: null });
      loadData();
    } catch (error) {
      console.error('Error creating episode:', error);
      alert('Failed to create episode');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="loading-state">Loading...</div>;
  if (!movie) return <div className="error-state">Movie not found</div>;

  return (
    <div className="manage-episodes-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard/movies')}>
          <ArrowLeft size={20} /> Back to Movies
        </button>
        <div className="header-content">
          <h1 className="page-title">Manage Episodes</h1>
          <p className="page-subtitle">{movie.title}</p>
        </div>
      </div>

      <div className="episodes-container">
        <div className="seasons-header">
          <h2>Seasons</h2>
          <button 
            className="btn-primary"
            onClick={() => setShowSeasonForm(!showSeasonForm)}
          >
            <Plus size={20} /> Add Season
          </button>
        </div>

        {showSeasonForm && (
          <form className="season-form card" onSubmit={handleCreateSeason}>
            <h3>New Season</h3>
            <div className="form-group">
              <label>Season Number</label>
              <input 
                type="number" 
                required 
                value={newSeason.seasonNumber} 
                onChange={e => setNewSeason({...newSeason, seasonNumber: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Title (Optional)</label>
              <input 
                type="text" 
                value={newSeason.title} 
                onChange={e => setNewSeason({...newSeason, title: e.target.value})} 
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowSeasonForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Season'}
              </button>
            </div>
          </form>
        )}

        <div className="seasons-list">
          {seasons.length === 0 ? (
            <p className="empty-state">No seasons found. Create one to add episodes.</p>
          ) : (
            seasons.map(season => (
              <div key={season.id} className="season-card card">
                <div className="season-header">
                  <h3>Season {season.seasonNumber} {season.title ? `- ${season.title}` : ''}</h3>
                  <button 
                    className="btn-secondary"
                    onClick={() => setShowEpisodeForm(season.id)}
                  >
                    <Plus size={16} /> Add Episode
                  </button>
                </div>

                {showEpisodeForm === season.id && (
                  <form className="episode-form" onSubmit={(e) => handleCreateEpisode(e, season.id)}>
                    <h4>New Episode</h4>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Episode Number</label>
                        <input 
                          type="number" 
                          required 
                          value={newEpisode.episodeNumber} 
                          onChange={e => setNewEpisode({...newEpisode, episodeNumber: e.target.value})} 
                        />
                      </div>
                      <div className="form-group">
                        <label>Title</label>
                        <input 
                          type="text" 
                          required 
                          value={newEpisode.title} 
                          onChange={e => setNewEpisode({...newEpisode, title: e.target.value})} 
                        />
                      </div>
                      <div className="form-group">
                        <label>Duration</label>
                        <input 
                          type="text" 
                          placeholder="e.g., 45m" 
                          required 
                          value={newEpisode.duration} 
                          onChange={e => setNewEpisode({...newEpisode, duration: e.target.value})} 
                        />
                      </div>
                      <div className="form-group full-width">
                        <label>Description</label>
                        <textarea 
                          rows="2"
                          value={newEpisode.description} 
                          onChange={e => setNewEpisode({...newEpisode, description: e.target.value})} 
                        />
                      </div>
                      <div className="form-group full-width">
                        <label>Video File</label>
                        <input 
                          type="file" 
                          accept="video/*" 
                          required 
                          onChange={e => setNewEpisode({...newEpisode, videoFile: e.target.files[0]})} 
                        />
                      </div>
                    </div>
                    <div className="form-actions">
                      <button type="button" className="btn-secondary" onClick={() => setShowEpisodeForm(null)}>Cancel</button>
                      <button type="submit" className="btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Uploading...' : 'Save & Upload Episode'}
                      </button>
                    </div>
                  </form>
                )}

                <div className="episodes-list">
                  {season.episodes.length === 0 ? (
                    <p className="no-episodes">No episodes in this season yet.</p>
                  ) : (
                    <table className="episodes-table">
                      <thead>
                        <tr>
                          <th>Ep</th>
                          <th>Title</th>
                          <th>Duration</th>
                          <th>Video Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {season.episodes.map(ep => (
                          <tr key={ep.id}>
                            <td>{ep.episodeNumber}</td>
                            <td>{ep.title}</td>
                            <td>{ep.duration}</td>
                            <td>
                              {ep.videoUrl ? (
                                <span className="status-badge active"><Video size={14}/> Uploaded</span>
                              ) : (
                                <span className="status-badge inactive">Missing</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ManageEpisodes;
