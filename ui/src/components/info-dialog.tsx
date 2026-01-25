import { History, Play, Network } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Separator } from "./ui/separator";

export function InfoDialog({
    open,
    onOpenChange
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>About Liner Notes</DialogTitle>
                    <DialogDescription>
                        Explore your music with these tools.
                    </DialogDescription>
                </DialogHeader>
                <Separator />
                <div className="space-y-5">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-muted rounded-md mt-1">
                            <History className="h-5 w-5" />
                        </div>
                        <div className="grid gap-1">
                            <h4 className="font-medium">Analyse Now Playing</h4>
                            <p className="text-sm text-muted-foreground">
                                Instantly analyse the track currently playing on Spotify and add it to your history.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-muted rounded-md mt-1">
                            <Play className="h-5 w-5" />
                        </div>
                        <div className="grid gap-1">
                            <h4 className="font-medium">Analyse Recent</h4>
                            <p className="text-sm text-muted-foreground">
                                View tracks you've recently finished listening to and select them for analysis.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-muted rounded-md mt-1">
                            <Network className="h-5 w-5" />
                        </div>
                        <div className="grid gap-1">
                            <h4 className="font-medium">Graph View</h4>
                            <p className="text-sm text-muted-foreground">
                                Visualize relationships between the selected track and others based on shared analysis tags.
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}