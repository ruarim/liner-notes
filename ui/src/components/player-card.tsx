import type { TrackData } from "../../../src/types";
import { Button } from "./ui/button";
import { StepBackIcon, StepForwardIcon } from 'lucide-react'

export default function PlayerCard({
    data, seek
}: {
    data: TrackData, seek: (diff: number) => void
}) {
    return (
        <div className="w-full md:w-[320px] shrink-0 text-center md:sticky md:top-0 space-y-2">
            <img
                src={data?.is_playing ? data.image : 'https://via.placeholder.com/300?text=Paused'}
                alt="Album Art"
                className="w-full rounded-xl shadow-lg mb-5"
            />
            <h2 className="text-2xl font-bold mb-1">
                {data?.is_playing ? data.name : 'Nothing playing'}
            </h2>
            <p className="text-[#b3b3b3]">
                {data?.is_playing ? data.artist : 'Open Spotify and play a song'}
            </p>
            <div className="flex grow gap-2 justify-center">
                <Button
                    size={'lg'}
                    onClick={() => seek(-1)}
                >
                    <StepBackIcon className="h-24" />
                </Button>
                <Button
                    size={'lg'}
                    onClick={() => seek(+1)}
                >
                    <StepForwardIcon className="h-24" />
                </Button>
            </div>
        </div>
    )
}