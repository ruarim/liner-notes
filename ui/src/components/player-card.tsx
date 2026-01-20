import type { TrackData } from "../../../src/types";

export default function PlayerCard({ currentTrack }: { currentTrack?: TrackData }) {
    return (
        <div className="bg-card border border-border rounded-xl p-4 shadow-lg">
            <img
                src={currentTrack?.image ? currentTrack.image : 'https://via.placeholder.com/300?text=Paused'}
                alt="Album Art"
                className="w-full rounded-lg shadow-md mb-4"
            />
            <div className="space-y-2 text-center">
                <h2 className="text-xl font-bold text-card-foreground">
                    {currentTrack?.name ? currentTrack.name : 'Nothing playing'}
                </h2>
                <p className="text-sm text-muted-foreground">
                    {currentTrack?.artist ? currentTrack.artist : 'Open Spotify and play a song'}
                </p>
                {currentTrack?.album && (
                    <p className="text-xs text-muted-foreground/70">
                        {currentTrack.album}
                    </p>
                )}
            </div>
        </div>
    )
}