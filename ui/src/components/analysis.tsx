import type { AnalysisData } from '../../../src/types';
import { cn } from '../lib/utils';
import { Loader2 } from 'lucide-react'

export default function Insights(
    { analysis, loading }:
    { analysis?: AnalysisData, loading?: boolean }
) {
    return (
        <div className={cn(
            "w-full bg-card border border-border p-6 rounded-xl text-sm leading-relaxed text-card-foreground shadow-lg",
            loading && 'flex items-center justify-center animate-pulse min-h-[500px]'
        )}>
            {analysis && <AnalysisView data={analysis} />}
            {loading && (
                <div className='opacity-50 flex flex-col items-center gap-2'>
                    <Loader2 size={100} className='animate-spin text-primary' />
                    <>Researching Track...</>
                </div>
            )}
            {!analysis && !loading && (
                <div className='flex items-center justify-center min-h-[500px] text-muted-foreground'>
                    <p>Select a track to view analysis</p>
                </div>
            )}
        </div>
    )
}

const Section = ({ title, content }: { title: string; content: string }) => (
    <div className="mb-6">
        <h3 className="text-primary font-bold text-lg border-b border-border pb-2 mb-3">
            {title}
        </h3>
        <p className="text-card-foreground text-sm leading-relaxed whitespace-pre-wrap">
            {content}
        </p>
    </div>
);

export const AnalysisView = ({ data }: { data: AnalysisData; }) => {
    if (!data) return null;

    return (
        <div className="w-full h-full overflow-y-auto pr-2">
            <div className="space-y-2">
                <Section title="The Album" content={data.albumAnalysis} />
                <Section title="Personnel & Places" content={data.personnelAndPlaces} />
                <Section title="The Artist" content={data.artistBiography} />
                <Section title="The Context" content={data.culturalContext} />
                <div className="mb-4">
                    <h3 className="text-primary font-bold text-lg border-b border-border pb-2 mb-3">
                        Where to Look Next
                    </h3>
                    <ul className="list-disc pl-5 space-y-2">
                        {data.recommendations.map((item, index) => (
                            <li key={index} className="text-card-foreground text-sm leading-relaxed">
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

            </div>
        </div>
    );
};