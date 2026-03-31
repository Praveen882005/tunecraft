/**
 * =====================================================
 * Tunecraft - Personal Music Streaming App
 * Frontend: React + Custom CSS
 * =====================================================
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "./App.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ─── Icons (inline SVG components) ───────────────────────────────────────────
const Icon = {
  Play: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  ),
  Pause: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  ),
  Next: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,4 15,12 5,20" />
      <rect x="16" y="4" width="3" height="16" />
    </svg>
  ),
  Prev: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <polygon points="19,4 9,12 19,20" />
      <rect x="5" y="4" width="3" height="16" />
    </svg>
  ),
  Shuffle: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  ),
  Music: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  ),
  Upload: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  ),
  Delete: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Playlist: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  Volume: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  ),
  Search: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Home: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Close: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

// ─── Utilities ────────────────────────────────────────────────────────────────
function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatFileSize(bytes) {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

// Generate a deterministic color from a string
function stringToColor(str) {
  const colors = [
    "#ff6b6b",
    "#ffd93d",
    "#6bcb77",
    "#4d96ff",
    "#c77dff",
    "#ff9a3c",
    "#00d2ff",
    "#f72585",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// ─── Upload Modal ─────────────────────────────────────────────────────────────
function UploadModal({ onClose, onUploadSuccess, playlists }) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [playlist, setPlaylist] = useState("All Songs");
  const [newPlaylist, setNewPlaylist] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".mp3")) {
      setError("Only MP3 files are supported.");
      return;
    }
    setFile(f);
    setError("");
    // Auto-fill title from filename
    if (!title) {
      const name = f.name.replace(/\.mp3$/i, "").replace(/[-_]/g, " ");
      setTitle(name);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const handleSubmit = async () => {
    if (!file) return setError("Please select an MP3 file.");
    if (!title.trim()) return setError("Please enter a song title.");

    const finalPlaylist = newPlaylist.trim() || playlist;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title.trim());
    formData.append("artist", artist.trim() || "Unknown Artist");
    formData.append("playlist", finalPlaylist);

    setUploading(true);
    setProgress(0);
    setError("");

    try {
      const res = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 300000, // 5 minutes timeout
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        onUploadProgress: (e) => {
          const progressPercent = Math.round((e.loaded / e.total) * 100);
          setProgress(progressPercent);
          console.log(`Upload progress: ${progressPercent}%`);
        },
      });
      onUploadSuccess(res.data.song);
      onClose();
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        "Upload failed. Check bot config.";
      console.error("Upload error:", errorMsg);
      setError(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && !uploading && onClose()}
    >
      <div className="modal">
        <div className="modal-header">
          <h2>Upload Song</h2>
          {!uploading && (
            <button className="modal-close" onClick={onClose}>
              <Icon.Close />
            </button>
          )}
        </div>

        <div
          className={`drop-zone ${dragOver ? "drag-over" : ""} ${file ? "has-file" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".mp3,audio/mpeg"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
          <div className="drop-icon">
            <Icon.Upload />
          </div>
          {file ? (
            <div className="drop-file-name">
              <span className="dot" style={{ background: "#6bcb77" }} />
              {file.name}
            </div>
          ) : (
            <>
              <p className="drop-label">
                Drop MP3 here or <span>browse</span>
              </p>
              <p className="drop-hint">Maximum 100MB</p>
            </>
          )}
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>Song Title *</label>
            <input
              type="text"
              placeholder="Enter song title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={uploading}
            />
          </div>
          <div className="form-field">
            <label>Artist</label>
            <input
              type="text"
              placeholder="Artist name"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              disabled={uploading}
            />
          </div>
          <div className="form-field">
            <label>Playlist</label>
            <select
              value={playlist}
              onChange={(e) => setPlaylist(e.target.value)}
              disabled={uploading}
            >
              <option>All Songs</option>
              {playlists
                .filter((p) => p !== "All Songs")
                .map((p) => (
                  <option key={p}>{p}</option>
                ))}
            </select>
          </div>
          <div className="form-field">
            <label>New Playlist (optional)</label>
            <input
              type="text"
              placeholder="Create new playlist..."
              value={newPlaylist}
              onChange={(e) => setNewPlaylist(e.target.value)}
              disabled={uploading}
            />
          </div>
        </div>

        {error && <div className="upload-error">{error}</div>}

        {uploading && (
          <div className="progress-bar-wrap">
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span>{progress}% — Uploading to Telegram...</span>
          </div>
        )}

        <div className="modal-actions">
          <button
            className="btn-secondary"
            onClick={onClose}
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={uploading || !file}
          >
            {uploading ? "Uploading..." : "Upload Song"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Song Row ─────────────────────────────────────────────────────────────────
function SongRow({ song, index, isPlaying, isCurrent, onPlay, onDelete }) {
  const color = stringToColor(song.title);
  return (
    <div
      className={`song-row ${isCurrent ? "current" : ""}`}
      onClick={() => onPlay(song, index)}
    >
      <div className="song-index">
        {isCurrent && isPlaying ? (
          <span className="playing-bars">
            <span />
            <span />
            <span />
          </span>
        ) : (
          <span className="idx-num">{index + 1}</span>
        )}
      </div>
      <div
        className="song-avatar"
        style={{ background: `${color}22`, border: `1px solid ${color}44` }}
      >
        <span style={{ color }}>
          <Icon.Music />
        </span>
      </div>
      <div className="song-info">
        <div className="song-title-text">{song.title}</div>
        <div className="song-artist-text">
          {song.artist || "Unknown Artist"}
        </div>
      </div>
      <div className="song-playlist-tag">{song.playlist}</div>
      <div className="song-size">{formatFileSize(song.fileSize)}</div>
      <div
        className="song-play-btn"
        onClick={(e) => {
          e.stopPropagation();
          onPlay(song, index);
        }}
      >
        {isCurrent && isPlaying ? <Icon.Pause /> : <Icon.Play />}
      </div>
      <button
        className="song-delete-btn"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(song._id);
        }}
        title="Delete"
      >
        <Icon.Delete />
      </button>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState(["All Songs"]);
  const [activePlaylist, setActivePlaylist] = useState("All Songs");
  const [currentSong, setCurrentSong] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const audioRef = useRef(new Audio());
  const progressRef = useRef();

  // ─── Load songs & playlists ─────────────────────────────────────────────────
  const fetchSongs = useCallback(async () => {
    try {
      setLoading(true);
      const [songsRes, playlistsRes] = await Promise.all([
        axios.get(`${API_BASE}/songs`),
        axios.get(`${API_BASE}/playlists`),
      ]);
      setSongs(songsRes.data.songs || []);
      const pl = playlistsRes.data.playlists || [];
      setPlaylists(["All Songs", ...pl.filter((p) => p !== "All Songs")]);
    } catch (err) {
      showToast("Failed to load songs. Is the backend running?", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  // ─── Audio event listeners ──────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;

    const handlers = {
      timeupdate: () => setCurrentTime(audio.currentTime),
      loadedmetadata: () => setDuration(audio.duration),
      ended: handleSongEnd,
      error: () => showToast("Playback error. Try again.", "error"),
    };

    Object.entries(handlers).forEach(([e, h]) => audio.addEventListener(e, h));
    return () =>
      Object.entries(handlers).forEach(([e, h]) =>
        audio.removeEventListener(e, h),
      );
  }, [shuffle, currentIndex, songs]);

  // ─── Filtered songs ─────────────────────────────────────────────────────────
  const filteredSongs = songs.filter((song) => {
    const matchesPlaylist =
      activePlaylist === "All Songs" || song.playlist === activePlaylist;
    const matchesSearch =
      !searchQuery ||
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (song.artist &&
        song.artist.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPlaylist && matchesSearch;
  });

  // ─── Play a song ─────────────────────────────────────────────────────────────
  const playSong = useCallback(
    async (song, idx) => {
      const audio = audioRef.current;

      if (currentSong?._id === song._id) {
        // Toggle play/pause
        if (isPlaying) {
          audio.pause();
          setIsPlaying(false);
        } else {
          await audio.play();
          setIsPlaying(true);
        }
        return;
      }

      const streamUrl = `${API_BASE}/music/${song.fileId}`;
      audio.src = streamUrl;
      audio.load();

      try {
        await audio.play();
        setCurrentSong(song);
        setCurrentIndex(idx);
        setIsPlaying(true);
      } catch (err) {
        showToast("Playback failed. Check your connection.", "error");
      }
    },
    [currentSong, isPlaying],
  );

  // ─── Song end → autoplay next ────────────────────────────────────────────────
  const handleSongEnd = useCallback(() => {
    const list = filteredSongs.length > 0 ? filteredSongs : songs;
    if (list.length === 0) return;

    let nextIdx;
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * list.length);
    } else {
      nextIdx = (currentIndex + 1) % list.length;
    }
    const next = list[nextIdx];
    if (next) playSong(next, nextIdx);
  }, [currentIndex, filteredSongs, songs, shuffle, playSong]);

  const playNext = () => {
    const list = filteredSongs.length > 0 ? filteredSongs : songs;
    if (list.length === 0) return;
    let nextIdx = shuffle
      ? Math.floor(Math.random() * list.length)
      : (currentIndex + 1) % list.length;
    playSong(list[nextIdx], nextIdx);
  };

  const playPrev = () => {
    const list = filteredSongs.length > 0 ? filteredSongs : songs;
    if (list.length === 0) return;
    let prevIdx = (currentIndex - 1 + list.length) % list.length;
    playSong(list[prevIdx], prevIdx);
  };

  // ─── Progress bar seek ───────────────────────────────────────────────────────
  const handleSeek = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = ratio * duration;
    setCurrentTime(ratio * duration);
  };

  // ─── Volume ──────────────────────────────────────────────────────────────────
  const handleVolume = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    audioRef.current.volume = v;
  };

  // ─── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this song?")) return;
    try {
      await axios.delete(`${API_BASE}/song/${id}`);
      if (currentSong?._id === id) {
        audioRef.current.pause();
        setCurrentSong(null);
        setIsPlaying(false);
      }
      setSongs((prev) => prev.filter((s) => s._id !== id));
      showToast("Song deleted.", "success");
    } catch (err) {
      showToast("Delete failed.", "error");
    }
  };

  // ─── Toast ───────────────────────────────────────────────────────────────────
  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ─── Upload success ───────────────────────────────────────────────────────────
  const handleUploadSuccess = (song) => {
    setSongs((prev) => [song, ...prev]);
    if (!playlists.includes(song.playlist)) {
      setPlaylists((prev) => [...prev, song.playlist]);
    }
    showToast(`"${song.title}" uploaded successfully!`, "success");
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="app">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Icon.Music />
          </div>
          <span>Tunecraft</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Library</div>
          <button
            className={`nav-item ${activePlaylist === "All Songs" ? "active" : ""}`}
            onClick={() => {
              setActivePlaylist("All Songs");
              setSidebarOpen(false);
            }}
          >
            <Icon.Home /> All Songs
          </button>
        </nav>

        {playlists.filter((p) => p !== "All Songs").length > 0 && (
          <nav className="sidebar-playlists">
            <div className="nav-section-label">Playlists</div>
            {playlists
              .filter((p) => p !== "All Songs")
              .map((pl) => (
                <button
                  key={pl}
                  className={`nav-item playlist-item ${activePlaylist === pl ? "active" : ""}`}
                  onClick={() => {
                    setActivePlaylist(pl);
                    setSidebarOpen(false);
                  }}
                >
                  <div
                    className="pl-dot"
                    style={{ background: stringToColor(pl) }}
                  />
                  {pl}
                </button>
              ))}
          </nav>
        )}

        <div className="sidebar-footer">
          <button className="upload-btn" onClick={() => setShowUpload(true)}>
            <Icon.Upload /> Upload Song
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="main">
        {/* Topbar */}
        <header className="topbar">
          <button
            className="hamburger"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span />
            <span />
            <span />
          </button>
          <div className="search-wrap">
            <Icon.Search />
            <input
              type="text"
              placeholder="Search songs, artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className="topbar-upload-btn"
            onClick={() => setShowUpload(true)}
          >
            <Icon.Upload /> <span>Upload</span>
          </button>
        </header>

        {/* Content */}
        <div className="content">
          <div className="content-header">
            <div>
              <h1>{activePlaylist}</h1>
              <p>
                {filteredSongs.length} songs
                {searchQuery ? ` matching "${searchQuery}"` : ""}
              </p>
            </div>
          </div>

          {/* Songs table header */}
          <div className="songs-table-header">
            <span>#</span>
            <span></span>
            <span>Title</span>
            <span>Playlist</span>
            <span>Size</span>
            <span></span>
            <span></span>
          </div>

          {/* Songs list */}
          <div className="songs-list">
            {loading ? (
              <div className="empty-state">
                <div className="spinner" />
                <p>Loading your music...</p>
              </div>
            ) : filteredSongs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <Icon.Music />
                </div>
                <p>
                  {searchQuery
                    ? "No songs match your search"
                    : "No songs yet. Upload some music!"}
                </p>
                {!searchQuery && (
                  <button
                    className="btn-primary small"
                    onClick={() => setShowUpload(true)}
                  >
                    <Icon.Upload /> Upload Your First Song
                  </button>
                )}
              </div>
            ) : (
              filteredSongs.map((song, i) => (
                <SongRow
                  key={song._id}
                  song={song}
                  index={i}
                  isPlaying={isPlaying}
                  isCurrent={currentSong?._id === song._id}
                  onPlay={playSong}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>
      </main>

      {/* ── Player Bar ── */}
      <footer className="player-bar">
        <div className="player-song">
          {currentSong ? (
            <>
              <div
                className="player-thumb"
                style={{
                  background: `${stringToColor(currentSong.title)}22`,
                  border: `1px solid ${stringToColor(currentSong.title)}55`,
                }}
              >
                <span style={{ color: stringToColor(currentSong.title) }}>
                  <Icon.Music />
                </span>
              </div>
              <div className="player-song-info">
                <div className="player-song-title">{currentSong.title}</div>
                <div className="player-song-artist">
                  {currentSong.artist || "Unknown Artist"}
                </div>
              </div>
            </>
          ) : (
            <div className="player-no-song">No song selected</div>
          )}
        </div>

        <div className="player-controls">
          <button
            className={`ctrl-btn shuffle ${shuffle ? "active" : ""}`}
            onClick={() => setShuffle(!shuffle)}
            title="Shuffle"
          >
            <Icon.Shuffle />
          </button>
          <button className="ctrl-btn" onClick={playPrev} title="Previous">
            <Icon.Prev />
          </button>
          <button
            className="ctrl-btn play-pause"
            onClick={() => currentSong && playSong(currentSong, currentIndex)}
            disabled={!currentSong}
          >
            {isPlaying ? <Icon.Pause /> : <Icon.Play />}
          </button>
          <button className="ctrl-btn" onClick={playNext} title="Next">
            <Icon.Next />
          </button>

          <div className="progress-wrap">
            <span className="time-label">{formatTime(currentTime)}</span>
            <div
              className="progress-track"
              ref={progressRef}
              onClick={handleSeek}
            >
              <div
                className="progress-fill"
                style={{
                  width: duration ? `${(currentTime / duration) * 100}%` : "0%",
                }}
              />
              <div
                className="progress-thumb"
                style={{
                  left: duration ? `${(currentTime / duration) * 100}%` : "0%",
                }}
              />
            </div>
            <span className="time-label">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="player-volume">
          <Icon.Volume />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolume}
            className="volume-slider"
          />
        </div>
      </footer>

      {/* ── Upload Modal ── */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploadSuccess={handleUploadSuccess}
          playlists={playlists}
        />
      )}

      {/* ── Toast ── */}
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
