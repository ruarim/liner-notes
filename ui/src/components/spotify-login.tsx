export default function SpotifyLogin() {
    return (
        <div className="h-screen w-screen bg-[#191414] text-white flex items-center justify-center p-4">
            <div className="bg-[#282828] p-8 rounded-2xl shadow-2xl text-center w-full max-w-100">
                <h1 className="text-2xl font-bold mb-2">Music Researcher</h1>
                <p className="text-[#b3b3b3] mb-6">Connect to see your current track.</p>
                <a
                    href="/login"
                    className="inline-block bg-[#1DB954] hover:bg-[#1ed760] text-white font-bold py-3 px-6 rounded-full transition-colors"
                >
                    Login with Spotify
                </a>
            </div>
        </div>
    )
}