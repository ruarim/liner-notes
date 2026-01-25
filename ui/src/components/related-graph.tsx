import '@xyflow/react/dist/style.css';
import '@xyflow/react/dist/base.css';
import { ReactFlow, type Node, Controls, Background, BackgroundVariant, type Edge, useNodesState, useEdgesState, ConnectionLineType, Handle, Position, useReactFlow } from '@xyflow/react';
import type { TrackDetails } from '../../../src/types';
import { useEffect, useState } from 'react';
import { TrackItem } from './track';
import * as Api from '../lib/api';
import { cn } from '../lib/utils';
import { useAutoLayout } from '../hooks/use-auto-layout';
import { Loader2 } from 'lucide-react';

const NODE_WIDTH = 200;
const NODE_HEIGHT = 67;
const RELATED_NODE_HEIGHT = 100;

interface TrackNodeData {
    track: TrackDetails;
    onClick: () => void;
    selected: boolean;
    commonTags?: string[];
}

const TrackNode = ({ data }: { data: TrackNodeData }) => {
    return (
        <div
            className={cn(
                'border border flex p-2 rounded-md gap-2 bg-background hover:bg-accent',
                data.selected && 'border-primary'
            )}
            style={{ width: NODE_WIDTH, height: data.commonTags ? RELATED_NODE_HEIGHT : NODE_HEIGHT }}
            onClick={data.onClick}
        >
            <Handle
                type="target"
                position={Position.Left}
                className="!opacity-0"
            />
            <div className="flex flex-col gap-2 flex-1 min-w-0">
                <div className="flex gap-2">
                    <TrackItem track={data.track} selected={data.selected} />
                </div>
                {data.commonTags && <div className="flex gap-1 overflow-hidden">
                    {data.commonTags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 h-6 bg-primary/10 text-primary rounded-full text-xs whitespace-nowrap flex-shrink-0">
                            {tag}
                        </span>
                    ))}
                </div>}
            </div>
            <Handle
                type="source"
                position={Position.Right}
                className="!opacity-0"
            />
        </div>
    );
};

const arrayIntersect = (a: string[], b: string[]) => {
    return a.filter((value) => b.includes(value));
};

export function RelatedGraph({
    track,
    onNodeClick
}: {
    track: TrackDetails,
    onNodeClick: (track: TrackDetails) => void
}) {
    const { layout } = useAutoLayout();
    const { fitView } = useReactFlow();
    const [isLoading, setIsLoading] = useState(true);
    const [relatedTracks, setRelatedTracks] = useState<TrackDetails[]>([]);

    useEffect(() => {
        const fetchRelatedTracks = async () => {
            try {
                setIsLoading(true);
                const relatedTracks = await Api.getRelatedTracks(track.trackId);
                setRelatedTracks(relatedTracks);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching related tracks', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRelatedTracks();
    }, [track]);

    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    useEffect(() => {
        let initialNodes: Node[] = [];
        let initialEdges: Edge[] = [];

        const renderId = Math.random().toString(36).substring(2, 9);

        const selectedNode: Node = {
            id: `${renderId}-${track.trackId}`,
            type: 'track',
            position: { x: 0, y: 0 },
            measured: {
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
            },
            data: {
                track,
                onClick: () => onNodeClick(track),
                selected: true,
            },
        };

        if (relatedTracks.length > 0) {
            const relatedTrackNodes = relatedTracks.map((related) => ({
                id: `${renderId}-${related.trackId}`,
                type: 'track',
                position: { x: 0, y: 0 },
                measured: {
                    width: NODE_WIDTH,
                    height: RELATED_NODE_HEIGHT,
                },
                data: {
                    track: related,
                    onClick: () => onNodeClick(related),
                    selected: false,
                    commonTags: arrayIntersect(
                        related?.analysis?.tags || [],
                        track?.analysis?.tags || []
                    ),
                },
            }));
            initialNodes = [selectedNode, ...relatedTrackNodes];
            initialEdges = relatedTracks.map((related) => ({
                id: `e-${selectedNode.id}-${related.trackId}`,
                source: selectedNode.id,
                target: `${renderId}-${related.trackId}`,
                type: ConnectionLineType.SmoothStep,
                style: { stroke: '#b1b1b7', strokeWidth: 2 },
            }));
        } else {
            initialNodes = [selectedNode];
        }

        const { nodes: layoutedNodes, edges: layoutedEdges } = layout({
            direction: 'LR',
            nodes: initialNodes,
            edges: initialEdges,
            nodeWidth: NODE_WIDTH,
            nodeHeight: RELATED_NODE_HEIGHT,
        });

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

    }, [track, relatedTracks, layout, setNodes, setEdges]);

    useEffect(() => {
        if (nodes.length === 0) return
        window.requestAnimationFrame(() => {
            fitView({ duration: 800, padding: 0.2 });
        });
    }, [track, nodes, fitView]);

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={{ track: TrackNode }}
            proOptions={{ hideAttribution: true }}
            minZoom={0.1}
            maxZoom={1.25}
            connectionLineType={ConnectionLineType.SmoothStep}
            className={cn(isLoading && 'opacity-50 pointer-events-none')}
            fitView
        >
            <Controls
                className="text-black dark:text-black hover:bg-white"
                position="bottom-right"
                showInteractive={false}
            />
            <Background
                variant={BackgroundVariant.Dots}
                gap={24}
                size={1}
            />
            {isLoading && (
                <Loader2
                    className="animate-spin absolute top-1/2 left-1/2"
                    size={48}
                />
            )}
        </ReactFlow>
    )
}
