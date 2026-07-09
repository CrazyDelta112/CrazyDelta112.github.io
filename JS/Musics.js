document.addEventListener('DOMContentLoaded', async () => {
  let albumsData = [];
  let currentAlbumTracks = [];
  let currentTrackIndex = -1;
  let isPlaying = false;

  const audio = document.getElementById('audioPlayer');
  const playBtn = document.getElementById('playBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const stopBtn = document.getElementById('stopBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const currentTrackSpan = document.getElementById('currentTrack');
  const progressFill = document.getElementById('progressFill');
  const progressBar = document.getElementById('progressBar');
  const currentTimeSpan = document.getElementById('currentTime');
  const durationSpan = document.getElementById('durationTime');
  const volumeSlider = document.getElementById('volumeSlider');
  const volumeIcon = document.getElementById('volumeIcon');
  const togglePlayerBtn = document.getElementById('togglePlayerBtn');
  const player = document.getElementById('musicPlayer');

  togglePlayerBtn.addEventListener('click', () => {
    player.classList.toggle('collapsed');
    const icon = togglePlayerBtn.querySelector('i');
    if (player.classList.contains('collapsed')) {
      icon.classList.remove('fa-chevron-down');
      icon.classList.add('fa-chevron-up');
    } else {
      icon.classList.remove('fa-chevron-up');
      icon.classList.add('fa-chevron-down');
    }
  });

  async function loadAlbums() {
    try {
      const res = await fetch('/Data/Musics.json');
      if (!res.ok) throw new Error('Failed to load music data');
      albumsData = await res.json();
      renderAlbums();
    } catch (err) {
      console.error(err);
      document.getElementById('albumsContainer').innerHTML = '<div class="error">ERROR 1204: Could not load music.</div>';
    }
  }

  function renderAlbums() {
    const container = document.getElementById('albumsContainer');
    container.innerHTML = '';
    const grouped = {};
    albumsData.forEach(album => {
      if (!grouped[album.series]) grouped[album.series] = [];
      grouped[album.series].push(album);
    });
    for (const [series, albums] of Object.entries(grouped)) {
      const section = document.createElement('section');
      section.className = 'music-section';
      section.innerHTML = `<h2 class="section-title">${series}</h2><div class="albums-grid"></div>`;
      const grid = section.querySelector('.albums-grid');
      albums.forEach(album => {
        const card = document.createElement('div');
        card.className = 'music-card glass';
        card.innerHTML = `
          <div class="album-cover">
            <img src="${album.cover}" alt="${album.title}" onerror="this.src='/Assets/Images/placeholder.png'">
            <div class="play-overlay" data-album-id="${album.id}">
              <i class="fas fa-play-circle"></i>
            </div>
          </div>
          <div class="album-info">
            <h3>${escapeHtml(album.title)}</h3>
            <p class="composer">${escapeHtml(album.composer)}</p>
            <p class="year">${escapeHtml(album.year)}</p>
            <div class="tracklist" data-album-id="${album.id}">
              ${album.tracks.map((track, idx) => `
                <div class="track" data-src="${track.src}" data-track-name="${escapeHtml(track.name)}" data-album-id="${album.id}" data-track-idx="${idx}">
                  ${escapeHtml(track.name)}
                </div>
              `).join('')}
            </div>
            <button class="toggle-tracklist" data-album-id="${album.id}">
              Show All <i class="fas fa-chevron-down"></i>
            </button>
          </div>
        `;
        grid.appendChild(card);
      });
      container.appendChild(section);
    }
    attachEvents();
  }

  function attachEvents() {
    document.querySelectorAll('.play-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        e.stopPropagation();
        const albumId = overlay.dataset.albumId;
        const firstTrack = document.querySelector(`.tracklist[data-album-id="${albumId}"] .track`);
        if (firstTrack) playTrack(firstTrack);
      });
    });
    document.querySelectorAll('.toggle-tracklist').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const albumId = btn.dataset.albumId;
        const tracklist = document.querySelector(`.tracklist[data-album-id="${albumId}"]`);
        tracklist.classList.toggle('expanded');
        const icon = btn.querySelector('i');
        if (tracklist.classList.contains('expanded')) {
          icon.classList.remove('fa-chevron-down');
          icon.classList.add('fa-chevron-up');
          btn.innerHTML = 'Show Less ' + icon.outerHTML;
        } else {
          icon.classList.remove('fa-chevron-up');
          icon.classList.add('fa-chevron-down');
          btn.innerHTML = 'Show All ' + icon.outerHTML;
        }
      });
    });
    document.querySelectorAll('.track').forEach(track => {
      track.addEventListener('click', () => playTrack(track));
    });
  }

  function playTrack(trackElement) {
    const src = trackElement.dataset.src;
    const trackName = trackElement.dataset.trackName;
    const albumId = trackElement.dataset.albumId;
    if (!src) return;
    const album = albumsData.find(a => a.id === albumId);
    const albumTitle = album ? album.title : 'Unknown';
    currentAlbumTracks = Array.from(document.querySelectorAll(`.tracklist[data-album-id="${albumId}"] .track`));
    currentTrackIndex = currentAlbumTracks.indexOf(trackElement);
    document.querySelectorAll('.track').forEach(t => t.classList.remove('playing'));
    trackElement.classList.add('playing');
    currentTrackSpan.textContent = `${albumTitle} - ${trackName}`;
    audio.src = src;
    audio.load();
    audio.play().then(() => {
      isPlaying = true;
      updatePlayPauseButtons();
    }).catch(e => console.warn(e));
  }

  function updatePlayPauseButtons() {
    if (isPlaying) {
      playBtn.style.display = 'none';
      pauseBtn.style.display = 'flex';
    } else {
      playBtn.style.display = 'flex';
      pauseBtn.style.display = 'none';
    }
  }

  function updateProgress() {
    if (audio.duration) {
      const percent = (audio.currentTime / audio.duration) * 100;
      progressFill.style.width = percent + '%';
      const curMin = Math.floor(audio.currentTime / 60);
      const curSec = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
      currentTimeSpan.textContent = `${curMin}:${curSec}`;
      const durMin = Math.floor(audio.duration / 60);
      const durSec = Math.floor(audio.duration % 60).toString().padStart(2, '0');
      durationSpan.textContent = `${durMin}:${durSec}`;
    }
  }

  function playPrevious() {
    if (currentAlbumTracks.length && currentTrackIndex > 0) {
      playTrack(currentAlbumTracks[currentTrackIndex - 1]);
    }
  }
  function playNext() {
    if (currentAlbumTracks.length && currentTrackIndex < currentAlbumTracks.length - 1) {
      playTrack(currentAlbumTracks[currentTrackIndex + 1]);
    }
  }

  playBtn.addEventListener('click', () => {
    if (audio.src) {
      audio.play();
      isPlaying = true;
      updatePlayPauseButtons();
    }
  });
  pauseBtn.addEventListener('click', () => {
    audio.pause();
    isPlaying = false;
    updatePlayPauseButtons();
  });
  stopBtn.addEventListener('click', () => {
    audio.pause();
    audio.currentTime = 0;
    isPlaying = false;
    updatePlayPauseButtons();
    progressFill.style.width = '0%';
    currentTimeSpan.textContent = '0:00';
  });
  prevBtn.addEventListener('click', playPrevious);
  nextBtn.addEventListener('click', playNext);
  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('ended', playNext);
  progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    if (audio.duration) audio.currentTime = percent * audio.duration;
  });
  volumeSlider.addEventListener('input', () => {
    audio.volume = parseFloat(volumeSlider.value);
    updateVolumeIcon();
  });
  volumeIcon.addEventListener('click', () => {
    if (audio.volume > 0) {
      audio.volume = 0;
      volumeSlider.value = 0;
    } else {
      audio.volume = 0.7;
      volumeSlider.value = 0.7;
    }
    updateVolumeIcon();
  });
  function updateVolumeIcon() {
    if (audio.volume === 0) volumeIcon.className = 'fas fa-volume-mute';
    else if (audio.volume < 0.5) volumeIcon.className = 'fas fa-volume-down';
    else volumeIcon.className = 'fas fa-volume-up';
  }
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, (m) => {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }
  updatePlayPauseButtons();
  updateVolumeIcon();
  loadAlbums();
});