import type { TrackData } from "../lib/types";
import PlayerCard from "./player-card";

export default function Home({ data }: { data: TrackData }) {
    return (
        <div className="h-screen w-screen bg-[#191414] text-white flex items-center justify-center p-4 overflow-hidden">
            <div className={`
                bg-[#282828] p-8 rounded-2xl shadow-2xl text-center 
                w-full mx-auto max-h-[90vh] overflow-y-auto transition-all duration-300
                md:max-w-300
              `}>
                <div className="flex flex-col md:flex-row gap-10 items-start text-left">
                    {data && <PlayerCard data={data} />}
                    {data?.analysis && (
                        // {/* <Insights insights={data.analysis}/> */}
                        <div className="w-full md:flex-1 bg-[#333] p-6 rounded-lg text-sm leading-relaxed text-[#e0e0e0] md:h-112.5 md:overflow-y-auto">
                            {data.analysis}
                            {/* <Insights insights={data.analysis}/> */}
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}