import type { TrackDetails } from "../../../src/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { History, ChevronsUpDown, Loader2 } from "lucide-react";
import { TrackItem } from "./track";
import * as Api from "../lib/api";
import { useState } from "react";

export default function AnalyseRecent({
    setHistory,
    history,
}: {
    setHistory: React.Dispatch<React.SetStateAction<Array<TrackDetails>>>
    history: Array<TrackDetails>
}) {
    const [loading, setLoading] = useState(false);
    const [tracks, setTracks] = useState<Array<TrackDetails>>([]);

    const fetchTracks = async () => {
        setLoading(true);
        try {
            const response = await Api.getRecentlyPlayed();
            const newTracks = response.filter(track => !history.some(t => t.trackId === track.trackId));
            setTracks(newTracks);
        } catch (error) {
            console.error('Error fetching recently played tracks', error);
        } finally {
            setLoading(false);
        }
    }

    const handleAnalyseTrack = (track: TrackDetails) => {
        setHistory((prev) => [
            { ...track, loading: true },
            ...prev
        ]);
        Api.analyseTrack(track.trackId)
    }

    return (
        <DropdownMenu onOpenChange={(open) => {
            if (open) fetchTracks();
        }}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <History />
                    <span>Analyse Recent</span>
                    <ChevronsUpDown />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-[600px] max-w-[250px]">
                {loading && tracks.length === 0 && (
                    <DropdownMenuItem disabled>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                    </DropdownMenuItem>
                )}
                {!loading && tracks.length === 0 && (
                    <DropdownMenuItem disabled>
                        <span className="text-muted-foreground">No tracks found</span>
                    </DropdownMenuItem>
                )}
                {tracks.map((track, index) => (
                    <DropdownMenuItem
                        key={index}
                        onClick={() => handleAnalyseTrack(track)}
                    >
                        <TrackItem track={track} selected={false} />
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}