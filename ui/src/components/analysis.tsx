import type { AnalysisData } from '../../../src/types';
import { cn } from '../lib/utils';
import { Disc3, Music, BookOpen, Film } from 'lucide-react'

export function AnalysisCard({
    analysis,
}: {
    analysis: AnalysisData,
}) {
    const recommendations: RecommendationWithType[] = [
        analysis?.recommendations?.albums?.map(i => ({ ...i, type: 'album' as MediaType })) || [],
        analysis?.recommendations?.tracks?.map(i => ({ ...i, type: 'track' as MediaType })) || [],
        analysis?.recommendations?.books?.map(i => ({ ...i, type: 'book' as MediaType })) || [],
        analysis?.recommendations?.filmsAndTV?.map(i => ({ ...i, type: 'filmAndTV' as MediaType })) || [],
    ].flat().filter((item) => !!item);

    return (
        <div className={cn(
            "w-full h-full bg-card border border-border p-6 rounded-xl text-sm leading-relaxed text-card-foreground shadow-lg",
        )}>
            <div className="w-full h-full overflow-y-auto pr-2">
                <div className="space-y-2">
                    <Section title="The Track">
                        {analysis?.trackAnalysis
                            ? analysis.trackAnalysis
                            : <LoadingSection />
                        }
                    </Section>
                    <Section title="The Album">
                        {analysis?.albumAnalysis
                            ? analysis.albumAnalysis
                            : <LoadingSection />
                        }
                    </Section>
                    <Section title="Personnel & Places">
                        {analysis?.personnelAndPlaces
                            ? analysis.personnelAndPlaces
                            : <LoadingSection />
                        }
                    </Section>
                    <Section title="The Artist">
                        {analysis?.artistBiography
                            ? analysis.artistBiography
                            : <LoadingSection />
                        }
                    </Section>
                    <Section title="The Context">
                        {analysis?.culturalContext
                            ? analysis.culturalContext
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

const LoadingSection = () => (
    <div className="opacity-50 flex flex-col items-center h-[140px] bg-muted/50 animate-pulse rounded-md" />
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
            return <Disc3 size={iconSize} className="text-primary shrink-0" />;
        case 'track':
            return <Music size={iconSize} className="text-primary shrink-0" />;
        case 'book':
            return <BookOpen size={iconSize} className="text-primary shrink-0" />;
        case 'filmAndTV':
            return <Film size={iconSize} className="text-primary shrink-0" />;
    }
};
