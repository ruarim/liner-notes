import type { TrackData } from "../../../src/types";
import { cn } from "../lib/utils";

export default function History(
    { history, currentIndex, seek }: 
    { history: Array<TrackData>, currentIndex: number, seek: (newIndex: number) => void }
) {
    console.log(history)
    return (
        <div className="flex overflow-scroll gap-2 p-0.5 pb-3">
            {history.map((t, i) => (
                <HistoryIcon
                    key={`history -${i}`}
                    track={t}
                    selected={i === currentIndex}
                    onClick={() => seek(i)}
                />
            ))}
        </div>
    )
}

function HistoryIcon({ track, selected, onClick }: { track: TrackData, selected: boolean, onClick: () => void }) {
    return (
        <img
            src={track.image ?? 'https://via.placeholder.com/300?text=Paused'}
            alt="Album Art"
            className={cn(
                "w-16 h-16 rounded-xl shadow-lg transition-all border-2",
                selected
                    ? "border-primary-foreground scale-105"
                    : "border-transparent opacity-70"
            )}
            onClick={onClick}
        />
    )
}