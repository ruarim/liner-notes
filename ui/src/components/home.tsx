import { useMemo, useState } from "react";
import type { TrackData } from "../../../src/types";
import Insights from "./analysis";
import PlayerCard from "./player-card";

export default function Home({ data }: { data: Array<TrackData> }) {
    const [index, setIndex] = useState(data.length-1);
    const currentData = useMemo(() => data[index], [data, index]);

    const seek = (diff: number) => {
        const N = data.length-1
        let newIndex = index + diff
        if (newIndex < 0) newIndex = 0
        if (newIndex > N) newIndex = N 
        console.log(newIndex)
        setIndex(newIndex)
    }

    return (
        <div className="h-screen w-screen bg-[#191414] text-white flex items-center justify-center p-4 overflow-hidden">
            <div className={`
                bg-[#282828] p-8 rounded-2xl shadow-2xl text-center 
                w-full mx-auto max-h-[90vh] overflow-y-auto transition-all duration-300
                md:max-w-300
              `}>
                <div className="flex flex-col md:flex-row gap-10 items-start text-left">
                    <PlayerCard data={currentData} seek={seek}/>
                    <Insights analysis={currentData.analysis} />
                </div>
            </div>
        </div>
    )
}