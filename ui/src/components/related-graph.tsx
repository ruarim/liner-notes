import { ReactFlow, type Node, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '@xyflow/react/dist/base.css';
import type { TrackDetails } from '../../../src/types';
import { useMemo } from 'react';
import { TrackItem } from './track';

const TrackNode = ({ data }: { data: { track: TrackDetails } }) => {
    return (
        <div className='border border flex p-2 rounded-md gap-2'>
            <TrackItem track={data.track} selected={true} />
        </div>
    );
};

const nodeTypes = {
    track: TrackNode,
};



export function RelatedGraph({ track }: { track: TrackDetails }) {
    // based on trackId get items with at least one tag in common
    // then rank by number of tags in common 
    // return top 10

    // const [relatedTracks, setRelatedTracks] = useState<TrackDetails[]>([]);

    const nodes: Node[] = useMemo(() => [
        {
            id: 'current-track',
            type: 'track',
            position: { x: 0, y: 0 },
            data: { track: track },
        },
        // TODO: Fetch related tracks
    ], [track]);

    return (
        <ReactFlow
            nodes={nodes}
            edges={[]}
            nodeTypes={nodeTypes}
            defaultViewport={{ x: 0, y: 0, zoom: 0.75 }}
            proOptions={{ hideAttribution: true }}
            minZoom={0.1}
            maxZoom={1.5}
            fitView
        >
            <Controls className="text-black dark:text-black hover:bg-white" />
        </ReactFlow>
    )
}
