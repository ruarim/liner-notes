import { cn } from "../lib/utils";

interface EqVisualizerProps {
    className?: string;
    barCount?: number;
    isPlaying?: boolean;
}

export function EqVisualizer({
    className,
    barCount = 4,
    isPlaying = true
}: EqVisualizerProps) {
    return (
        <div className={cn("flex items-end gap-[2px] h-4 w-6", className)} aria-hidden="true">
            {Array.from({ length: barCount }).map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        "bg-primary w-1 rounded-t-sm",
                        isPlaying && "animate-music-bar"
                    )}
                    style={{
                        height: "100%",
                        animationDelay: `${i * 0.25}s`,
                        animationDuration: "0.8s",
                    }}
                />
            ))}
        </div>
    );
}
