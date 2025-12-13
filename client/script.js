const loginSection = document.getElementById('login-section');
const playerSection = document.getElementById('player-section');
const trackNameEl = document.getElementById('track-name');
const artistNameEl = document.getElementById('artist-name');
const albumArtEl = document.getElementById('album-art');
const statusEl = document.getElementById('status');
const analysisEl = document.getElementById('analysis-text');

async function fetchNowPlaying() {
    try {
        const response = await fetch('/api/now-playing');
        const data = await response.json();

        // 1. Handle not logged in
        if (data.error === 'Not logged in') {
            loginSection.classList.remove('hidden');
            playerSection.classList.add('hidden');
            return;
        }

        loginSection.classList.add('hidden');
        playerSection.classList.remove('hidden');

        if (data.is_playing === false) {
            trackNameEl.innerText = 'Nothing playing';
            artistNameEl.innerText = 'Open Spotify and play a song';
            albumArtEl.src = 'https://via.placeholder.com/300?text=Paused';
        } else {
            trackNameEl.innerText = data.name;
            artistNameEl.innerText = data.artist;

            if (albumArtEl.src !== data.image) {
                albumArtEl.src = data.image;
            }
        }

        if (data.analysis) {
            let formattedHTML = data.analysis
                .replace(/\*\*(.*?)\*\*/g, '<h3 style="color: #1DB954; margin-bottom: 5px; margin-top: 15px;">$1</h3>')
                .replace(/\n/g, '<br>');

            analysisEl.innerHTML = formattedHTML;
        }

        // 4. Update timestamp
        statusEl.innerText = `Last updated: ${new Date().toLocaleTimeString()}`;

    } catch (err) {
        console.error('Error fetching data:', err);
        statusEl.innerText = 'Error connecting to server';
    }
}

// Poll every 5 seconds (5000ms)
setInterval(fetchNowPlaying, 5000);

// Initial fetch on load
fetchNowPlaying();