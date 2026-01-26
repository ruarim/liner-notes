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
    analysis: AnalysisData,
    loading?: boolean,
    error?: string,
    trackId?: string
}) {
    return (
        <div className={cn(
            "w-full h-full bg-card border border-border p-6 rounded-xl text-sm leading-relaxed text-card-foreground shadow-lg",
        )}>
            <AnalysisView data={analysis} />
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

const Section = ({ title, children }: { title: string; children: React.ReactNode; }) => (
    <div className="mb-5">
        <h3 className="text-primary font-bold text-lg border-b border-border pb-2 mb-3">
            {title}
        </h3>
        <p className="text-card-foreground text-sm leading-relaxed whitespace-pre-wrap">
            {children}
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

export const AnalysisView = ({ data }: { data: AnalysisData }) => {
    const recommendations: RecommendationWithType[] = [
        data?.recommendations?.albums?.map(i => ({ ...i, type: 'album' as MediaType })) || [],
        data?.recommendations?.tracks?.map(i => ({ ...i, type: 'track' as MediaType })) || [],
        data?.recommendations?.books?.map(i => ({ ...i, type: 'book' as MediaType })) || [],
        data?.recommendations?.filmsAndTV?.map(i => ({ ...i, type: 'filmAndTV' as MediaType })) || [],
    ].flat().filter((item) => !!item);

    const LoadingSection = () => (
        <div className="opacity-50 flex flex-col items-center h-[140px] bg-muted/50 animate-pulse rounded-md" />
    );
    return (
        <div className="w-full h-full overflow-y-auto pr-2">
            <div className="space-y-2">
                <Section title="The Track">
                    {data?.trackAnalysis 
                        ? data.trackAnalysis 
                        : <LoadingSection />
                    }
                </Section>
                <Section title="The Album">
                    {data?.albumAnalysis 
                        ? data.albumAnalysis 
                        : <LoadingSection />
                    }
                </Section>
                <Section title="Personnel & Places">
                    {data?.personnelAndPlaces 
                        ? data.personnelAndPlaces 
                        : <LoadingSection />
                    }
                </Section>
                <Section title="The Artist">
                    {data?.artistBiography 
                        ? data.artistBiography 
                        : <LoadingSection />
                    }
                </Section>
                <Section title="The Context">
                    {data?.culturalContext 
                        ? data.culturalContext 
                        : <LoadingSection />
                    }
                </Section>
                <Section title="Where to Look Next">
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
                        {!recommendations.length && (
                            Array.from({ length: 3 }, (_, index) => (
                                <div 
                                    key={index} 
                                    className="opacity-50 flex flex-col items-center h-[140px] bg-muted/50 animate-pulse rounded-md" 
                                />
                            ))
                        )}
                    </div>
                </Section>
            </div>
        </div>
    );
};