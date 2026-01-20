import { LOGIN } from "../lib/paths";

export default function SpotifyLogin() {
    return (
        <div className="h-screen w-screen bg-background text-foreground flex items-center justify-center p-4">
            <div className="bg-card border border-border p-8 rounded-2xl shadow-2xl text-center w-full max-w-100">
                <h1 className="text-2xl font-bold mb-2">Music Researcher</h1>
                <p className="text-muted-foreground mb-6">Connect to see your current track.</p>
                <a
                    href={`${LOGIN}`}
                    className="inline-block bg-primary hover:bg-primary/80 text-primary-foreground font-bold py-3 px-6 rounded-full transition-colors"
                >
                    Login with Spotify
                </a>
            </div>
        </div>
    )
}