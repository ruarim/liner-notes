import type { AnalysisData, TrackDetails } from "../../../src/types"
import { cn } from "../lib/utils"
import { Loader2 } from "lucide-react"

export const TrackItem = ({ track, selected }: { track: TrackDetails, selected: boolean }) => {
    return <>
        <div className="relative flex-shrink-0">
            {track.image ? (
                <img
                    src={track.image}
                    alt={track.name}
                    className={cn(
                        "w-12 h-12 rounded-md object-cover transition-all",
                        selected ? "ring-2 ring-primary" : "opacity-80"
                    )}
                />
            ) : (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className={cn(
                        "w-12 h-12 rounded-md object-cover transition-all",
                        selected ? "ring-2 ring-primary" : "opacity-80"
                    )}
                >
                    <rect width="48" height="48" fill="#cccccc" />
                </svg>
            )}
            {track.loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                </div>
            )}
        </div>
        <div className="flex-1 min-w-0">
            <p className={cn(
                "text-sm font-medium truncate",
                selected ? "text-accent-foreground" : "text-foreground"
            )}>
                {track.name}
            </p>
            <p className={cn(
                "text-xs truncate",
                selected ? "text-accent-foreground/70" : "text-muted-foreground"
            )}>
                {track.artist}
            </p>
        </div>
    </>
}

export default function TrackCard({ track, analysis }: { track?: TrackDetails, analysis?: AnalysisData }) {
    return (
        <div className="bg-card border border-border rounded-xl p-4 shadow-lg">
                {track?.image ? (
                    <img
                        src={track.image}
                        alt="Album Art"
                    className="w-full rounded-lg shadow-md mb-4"
                    />
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 300 300"
                    className="w-full rounded-lg shadow-md mb-4"
                    >
                        <rect width="300" height="300" fill="#cccccc" />
                    </svg>
                )}
            <div className="space-y-2 text-center">
                <h2 className="text-xl font-bold text-card-foreground">
                    {track?.name ? track.name : 'Nothing playing'}
                </h2>
                <p className="text-sm text-muted-foreground">
                    {track?.artist ? track.artist : 'Open Spotify and play a song'}
                </p>
                {track?.album && (
                    <p className="text-xs text-muted-foreground/70">
                        {track.album}
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