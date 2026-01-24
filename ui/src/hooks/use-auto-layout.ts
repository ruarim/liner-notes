import { useCallback } from 'react';
import {
    type Node,
    type Edge,
    useReactFlow,
    Position
} from '@xyflow/react';
import dagre from 'dagre';

export type LayoutDirection = 'TB' | 'LR' | 'BT' | 'RL';

interface LayoutOptions {
    direction?: LayoutDirection;
    nodeWidth?: number;
    nodeHeight?: number;
    nodes?: Node[];
    edges?: Edge[];
}

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

export const useAutoLayout = () => {
    const { getNodes, getEdges } = useReactFlow();

    const layout = useCallback(
        (options: LayoutOptions = {}) => {
            const { direction = 'TB', nodeWidth = 250, nodeHeight = 83 } = options;

            const nodesToLayout = options.nodes ?? getNodes();
            const edgesToLayout = options.edges ?? getEdges();

            dagreGraph.setGraph({ rankdir: direction });

            nodesToLayout.forEach((node) => {
                const width = node.measured?.width ?? node.width ?? nodeWidth;
                const height = node.measured?.height ?? node.height ?? nodeHeight;
                dagreGraph.setNode(node.id, { width, height });
            });

            edgesToLayout.forEach((edge) => {
                dagreGraph.setEdge(edge.source, edge.target);
            });

            dagre.layout(dagreGraph);

            const layoutedNodes: Node[] = nodesToLayout.map((node) => {
                const nodeWithPosition = dagreGraph.node(node.id);

                const isHorizontal = direction === 'LR' || direction === 'RL';

                return {
                    ...node,
                    targetPosition: isHorizontal ? Position.Left : Position.Top,
                    sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
                    position: {
                        x: nodeWithPosition.x - (node.measured?.width ?? nodeWidth) / 2,
                        y: nodeWithPosition.y - (node.measured?.height ?? nodeHeight) / 2,
                    },
                };
            });

            return { nodes: layoutedNodes, edges: edgesToLayout };
        },
        [getNodes, getEdges]
    );

    return { layout };
};