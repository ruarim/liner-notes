import type { AnalysisData } from '../../../src/types';
import { cn } from '../lib/utils';
import { Disc3, Music, BookOpen, Film } from 'lucide-react'
import { Button } from './ui/button';
import * as Api from '../lib/api';

export default function Insights({
    analysis,
    loading,
    error,
    trackId
}: {
    analysis?: AnalysisData,
    loading?: boolean,
    error?: string,
    trackId?: string
}) {
    return (
        <div className={cn(
            "w-full h-full bg-card border border-border p-6 rounded-xl text-sm leading-relaxed text-card-foreground shadow-lg",
            loading && 'flex items-center justify-center animate-pulse min-h-[500px] bg-muted/50'
        )}>
            {analysis && <AnalysisView data={analysis} />}
            {loading && (
                <div className='opacity-50 flex flex-col items-center gap-2'>
                    <>Researching Track...</>
                </div>
            )}
            {!analysis && !loading && error && (
                <div className='flex items-center justify-center min-h-[500px] text-muted-foreground'>
                    <div className='flex flex-col items-center gap-3'>
                        <p>{error}</p>
                        {trackId && (
                            <Button onClick={() => Api.analyseTrack(trackId)}>
                                Try Again
                            </Button>
                        )}
                    </div>
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

type MediaType = 'album' | 'track' | 'book' | 'filmAndTV';

interface RecommendationWithType {
    name: string;
    creator: string;
    reasoning: string;
    type: MediaType;
}

const getMediaIcon = (type: MediaType) => {
    const iconSize = 28;
    switch (type) {
        case 'album':
            return <Disc3 size={iconSize} className="text-primary flex-shrink-0" />;
        case 'track':
            return <Music size={iconSize} className="text-primary flex-shrink-0" />;
        case 'book':
            return <BookOpen size={iconSize} className="text-primary flex-shrink-0" />;
        case 'filmAndTV':
            return <Film size={iconSize} className="text-primary flex-shrink-0" />;
    }
};

export const AnalysisView = ({ data }: { data: AnalysisData; }) => {
    if (!data) return null;

    const recommendations: RecommendationWithType[] = [
        data?.recommendations?.albums?.map(i => ({ ...i, type: 'album' as MediaType })) || [],
        data?.recommendations?.tracks?.map(i => ({ ...i, type: 'track' as MediaType })) || [],
        data?.recommendations?.books?.map(i => ({ ...i, type: 'book' as MediaType })) || [],
        data?.recommendations?.filmsAndTV?.map(i => ({ ...i, type: 'filmAndTV' as MediaType })) || [],
    ].flat().filter((item) => !!item);

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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recommendations && recommendations.map((item, index) => (
                            <div key={index} className="text-card-foreground text-sm leading-relaxed">
                                <div className="flex items-center gap-2">
                                    {getMediaIcon(item.type)}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold line-clamp-2" title={item.name}>{item.name}</p>
                                        <p className="text-muted-foreground text-xs line-clamp-2" title={item.creator}>{item.creator}</p>
                                    </div>
                                </div>
                                <p className="mt-1">{item.reasoning}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};