import { useMemo, useState } from "react";
import type { TrackData } from "../../../src/types";
import Insights from "./analysis";
import PlayerCard from "./player-card";

export default function Home({ data }: { data: Array<TrackData> }) {
    const [index, _] = useState(data.length-1);
    const currentData = useMemo(() => data[index], [data]);

    // add buttons to move between history
    // const moveBack = () => setIndex(1);


    return (
        <div className="h-screen w-screen bg-[#191414] text-white flex items-center justify-center p-4 overflow-hidden">
            <div className={`
                bg-[#282828] p-8 rounded-2xl shadow-2xl text-center 
                w-full mx-auto max-h-[90vh] overflow-y-auto transition-all duration-300
                md:max-w-300
              `}>
                <div className="flex flex-col md:flex-row gap-10 items-start text-left">
                    <PlayerCard data={currentData} />
                    <Insights analysis={currentData.analysis} />
                </div>
            </div>
        </div>
    )
}