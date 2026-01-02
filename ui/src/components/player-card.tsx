import type { TrackData } from "../../../src/types";

export default function PlayerCard({ currentTrack }: { currentTrack?: TrackData }) {
    return (
        <div className="shrink-0 text-center md:sticky md:top-0 space-y-2">
            <img
                src={currentTrack?.image ? currentTrack.image : 'https://via.placeholder.com/300?text=Paused'}
                alt="Album Art"
                className="w-full rounded-xl shadow-lg mb-5"
            />
            <h2 className="text-2xl font-bold mb-1">
                {currentTrack?.name ? currentTrack.name : 'Nothing playing'}
            </h2>
            <p className="text-[#b3b3b3]">
                {currentTrack?.artist ? currentTrack.artist : 'Open Spotify and play a song'}
            </p>
        </div>
    )
}