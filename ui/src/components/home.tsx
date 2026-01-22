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
    SidebarTrigger,
    SidebarFooter
} from "./ui/sidebar";
import { Music2, Loader2, Library, Network, History } from "lucide-react";
import { cn } from "../lib/utils";
import PlatformLogin from "./platform-connect";
import { NavUser } from "./nav-user";
import { Button } from "./ui/button";

export default function Home({
    history,
    isAnalyzing,
    setAnalyzing,
    isLoggedIn,
}: {
    history: Array<TrackData>,
    isAnalyzing: boolean,
    setAnalyzing: (isAnalyzing: boolean) => void,
    isLoggedIn: boolean,
}) {
    const [index, setIndex] = useState(0);
    const selectedTrack = useMemo(() => history.at(index), [history, index]);

    const setSelectedItem = (newIndex: number) => {
        const N = history.length - 1
        if (newIndex < 0) newIndex = 0
        if (newIndex > N) newIndex = N
        setIndex(newIndex)
    }

    useEffect(() => { setIndex(0) }, [history.length])

    return (
        <SidebarProvider defaultOpen={true}>
            <div className="flex h-screen w-screen bg-background">
                {/* Sidebar */}
                <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
                    <_SidebarHeader />
                    <_SidebarContent tracks={history} setSelectedItem={setSelectedItem} index={index} />
                    <SidebarFooter className="bg-background">
                        {isLoggedIn && <NavUser isAnalyzing={isAnalyzing} setAnalyzing={setAnalyzing} />}
                    </SidebarFooter>
                </Sidebar>

                {/* Page content */}
                <SidebarInset className="flex flex-col">
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4 bg-background">
                        <SidebarTrigger className="text-foreground" />
                        <div className="flex-1" />
                        {!isLoggedIn
                            ? <PlatformLogin />
                            : <>
                                <Button variant="outline">Analyse History <History /></Button>
                                <Button size="icon" variant="ghost"><Network /></Button>
                            </>}
                    </header>


                    <main className="flex-1 overflow-auto p-6 bg-background">
                        <div className="max-w-6xl mx-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
                                <div className="lg:sticky lg:top-0 lg:self-start">
                                    <PlayerCard
                                        currentTrack={selectedTrack}
                                        analysis={selectedTrack?.analysis}
                                    />
                                </div>
                                <div className="min-h-screen">
                                    <Insights
                                        analysis={selectedTrack?.analysis}
                                        loading={selectedTrack?.loading}
                                        error={selectedTrack?.error}
                                        trackId={selectedTrack?.trackId}
                                    />
                                </div>
                            </div>
                        </div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}

const _SidebarHeader = () => {
    return (
        <SidebarHeader className="border-b border-border p-4 h-16 bg-background">
            <div className="flex items-center gap-2">
                <Library className="h-6 w-6 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Liner Notes</h2>
            </div>
        </SidebarHeader>
    )
}

const _SidebarContent = ({
    tracks, setSelectedItem, index
}: {
    tracks: Array<TrackData>, setSelectedItem: (newIndex: number) => void, index: number
}) => {
    return (
        <SidebarContent className="p-2 bg-background">
            <SidebarMenu>
                {tracks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                        <Music2 className="h-12 w-12 mb-4 opacity-50" />
                        <p className="text-sm">No tracks yet</p>
                        <p className="text-xs mt-1">Play a song on Spotify</p>
                    </div>
                ) : (
                    tracks.map((track, i) => (
                        <SidebarMenuItem key={`track-${i}`}>
                            <SidebarMenuButton
                                onClick={() => setSelectedItem(i)}
                                isActive={i === index}
                                size="lg"
                                className={cn(
                                    "flex items-center gap-3 h-auto rounded-lg transition-all",
                                    i === index
                                        ? "bg-accent text-accent-foreground"
                                        : "hover:bg-secondary text-foreground"
                                )}
                            >
                                <div className="relative flex-shrink-0">
                                    {track.image ? (
                                        <img
                                            src={track.image}
                                            alt={track.name}
                                            className={cn(
                                                "w-12 h-12 rounded-md object-cover transition-all",
                                                i === index ? "ring-2 ring-primary" : "opacity-80"
                                            )}
                                        />
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 48 48"
                                            className={cn(
                                                "w-12 h-12 rounded-md object-cover transition-all",
                                                i === index ? "ring-2 ring-primary" : "opacity-80"
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
    )
}