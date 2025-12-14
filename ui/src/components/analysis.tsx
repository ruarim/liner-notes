import type { AnalysisData } from '../../../src/types';
import { cn } from '../lib/utils';

export default function Insights({ analysis }: { analysis?: AnalysisData }) {
    return (
        <div className={cn(
            "w-full md:flex-1 bg-[#333] p-6 rounded-lg text-sm leading-relaxed text-[#e0e0e0] md:h-175 md:overflow-y-auto",
            !analysis && 'animate-pulse'
        )}>
            {analysis && <AnalysisView data={analysis} />}
        </div>
    )
}

const Section = ({ title, content }: { title: string; content: string }) => (
    <div className="mb-6">
        <h3 className="text-[#1DB954] font-bold text-lg border-b border-[#555] pb-1 mb-2">
            {title}
        </h3>
        <p className="text-[#e0e0e0] text-sm leading-relaxed whitespace-pre-wrap">
            {content}
        </p>
    </div>
);

export const AnalysisView = ({ data }: { data: AnalysisData; }) => {
    if (!data) return null;

    return (
        <div className="w-full h-full overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-2">
                <Section title="The Album" content={data.albumAnalysis} />
                <Section title="Personnel & Places" content={data.personnelAndPlaces} />
                <Section title="The Artist" content={data.artistBiography} />
                <Section title="The Context" content={data.culturalContext} />
                <div className="mb-4">
                    <h3 className="text-[#1DB954] font-bold text-lg border-b border-[#555] pb-1 mb-2">
                        Where to Look Next
                    </h3>
                    <ul className="list-disc pl-5 space-y-2">
                        {data.recommendations.map((item, index) => (
                            <li key={index} className="text-[#e0e0e0] text-sm leading-relaxed">
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

            </div>
        </div>
    );
};