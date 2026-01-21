import type { AnalysisData, TrackData } from "../../../src/types";

export default function PlayerCard({ currentTrack, analysis }: { currentTrack?: TrackData, analysis?: AnalysisData }) {
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
                <div className="flex flex-wrap gap-2 pt-2">
                    {analysis?.tags?.map((tag, index) => (
                        <span key={index} className="px-2 py-1 h-6 bg-primary/10 text-primary rounded-full text-xs">
                            {tag}
                        </span>
                    ))}
                    {!analysis?.tags && Array.from({ length: 5 }).map((_, index) => (
                        <span key={index} className="px-2 py-1 h-6 w-16 bg-primary/10 text-primary rounded-full text-xs animate-pulse">
                            
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}