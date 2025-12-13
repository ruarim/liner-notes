import type { TrackData } from "../../../src/types";

export default function PlayerCard({ data }: { data: TrackData }) {
    return (
        <div className="w-full md:w-[320px] shrink-0 text-center md:sticky md:top-0">
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
        </div>
    )
}