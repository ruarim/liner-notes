import { useEffect, useMemo, useState } from "react";
import type { TrackData } from "../../../src/types";
import Insights from "./analysis";
import PlayerCard from "./player-card";
import {
    SidebarProvider,
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarInset,
    SidebarTrigger
} from "./ui/sidebar";
import { Music2, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

export default function Home({ data, isAnalyzing, setAnalyzing }: { data: Array<TrackData>, isAnalyzing: boolean, setAnalyzing: (isAnalyzing: boolean) => void }) {
    const [index, setIndex] = useState(data.length - 1);
    const selectedTrack = useMemo(() => data.at(index), [data, index]);

    const seek = (newIndex: number) => {
        const N = data.length - 1
        if (newIndex < 0) newIndex = 0
        if (newIndex > N) newIndex = N
        setIndex(newIndex)
    }

    useEffect(() => { setIndex(data.length - 1) }, [data.length])

    return (
        <SidebarProvider defaultOpen={true}>
            <div className="flex h-screen w-screen bg-background">
                <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
                    <SidebarHeader className="border-b border-border p-4 h-16 bg-background">
                        <div className="flex items-center gap-2">
                            <Music2 className="h-6 w-6 text-primary" />
                            <h2 className="text-lg font-bold text-foreground">Track History</h2>
                        </div>
                    </SidebarHeader>
                    <SidebarContent className="p-2 bg-background">
                        <SidebarMenu>
                            {data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                                    <Music2 className="h-12 w-12 mb-4 opacity-50" />
                                    <p className="text-sm">No tracks yet</p>
                                    <p className="text-xs mt-1">Play a song on Spotify</p>
                                </div>
                            ) : (
                                data.map((track, i) => (
                                    <SidebarMenuItem key={`track-${i}`}>
                                        <SidebarMenuButton
                                            onClick={() => seek(i)}
                                            isActive={i === index}
                                            className={cn(
                                                "flex items-center gap-3 p-3 rounded-lg transition-all",
                                                i === index
                                                    ? "bg-accent text-accent-foreground"
                                                    : "hover:bg-secondary text-foreground"
                                            )}
                                        >
                                            <div className="relative flex-shrink-0">
                                                <img
                                                    src={track.image ?? 'https://via.placeholder.com/48?text=?'}
                                                    alt={track.name}
                                                    className={cn(
                                                        "w-12 h-12 rounded-md object-cover transition-all",
                                                        i === index ? "ring-2 ring-primary" : "opacity-80"
                                                    )}
                                                />
                                                {track.loading && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                                                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={cn(
                                                    "text-sm font-medium truncate",
                                                    i === index ? "text-accent-foreground" : "text-foreground"
                                                )}>
                                                    {track.name}
                                                </p>
                                                <p className={cn(
                                                    "text-xs truncate",
                                                    i === index ? "text-accent-foreground/70" : "text-muted-foreground"
                                                )}>
                                                    {track.artist}
                                                </p>
                                            </div>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))
                            )}
                        </SidebarMenu>
                    </SidebarContent>
                </Sidebar>

                <SidebarInset className="flex flex-col">
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4 bg-background">
                        <SidebarTrigger className="text-foreground" />
                        <div className="flex-1" />
                        <button
                            onClick={() => setAnalyzing(!isAnalyzing)}
                            className={cn(
                                "px-4 py-2 rounded-full font-bold transition-all duration-200 text-sm",
                                isAnalyzing
                                    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                            )}
                        >
                            {isAnalyzing ? 'Stop Analysis' : 'Start Analysis'}
                        </button>
                    </header>

                    <main className="flex-1 overflow-auto p-6 bg-background">
                        <div className="max-w-6xl mx-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
                                <div className="lg:sticky lg:top-0 lg:self-start">
                                    <PlayerCard currentTrack={selectedTrack} />
                                </div>
                                <div className="min-h-[500px]">
                                    <Insights analysis={selectedTrack?.analysis} loading={selectedTrack?.loading} />
                                </div>
                            </div>
                        </div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}