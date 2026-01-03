import { useEffect, useMemo, useState } from "react";
import type { TrackData } from "../../../src/types";
import Insights from "./analysis";
import PlayerCard from "./player-card";
import History from "./history";

export default function Home({ data }: { data: Array<TrackData> }) {
    const [index, setIndex] = useState(data.length-1);
    const selectedTrack = useMemo(() => data.at(index), [data, index]);
    
    const seek = (newIndex: number) => {
        const N = data.length-1
        if (newIndex < 0) newIndex = 0
        if (newIndex > N) newIndex = N 
        setIndex(newIndex)
    }

    useEffect(() => { setIndex(data.length-1) }, [data.length])

    return (
        <div className="h-screen w-screen bg-[#191414] text-white flex items-center justify-center p-4 overflow-hidden">
            <div className={`
                bg-[#282828] p-8 rounded-2xl shadow-2xl text-center 
                w-full mx-auto max-h-[90vh] overflow-y-auto transition-all duration-300
                md:max-w-300
              `}>
                <div className="flex flex-col md:flex-row gap-10 items-start text-left">
                    <div className="w-full md:w-[320px]">
                        <History history={data} currentIndex={index} seek={seek}/>
                        <PlayerCard currentTrack={selectedTrack}/>
                    </div>
                    <Insights analysis={selectedTrack?.analysis} loading={selectedTrack?.loading} />
                </div>
            </div>
        </div>
    )
}