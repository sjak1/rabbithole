"use client";
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    BackgroundVariant,
    Node
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from "@/store/store";
import { useEffect, useMemo } from "react";

export default function FlowPage() {
    const {
        messagesByBranch,
        branchParents,
        branchTitles,
        loadBranches
    } = useStore();

    // On mount load branches from backend
    useEffect(() => {
        loadBranches().catch(console.error);
    }, [loadBranches]);

    /* ------------------------------------------------------------------ */
    /* 🖼️  Build nodes / edges ------------------------------------------- */
    /* ------------------------------------------------------------------ */
    const nodesData: Node[] = useMemo(() => {
        const allNodeIds = Object.keys(messagesByBranch);
        if (allNodeIds.length === 0) return [];

        const childrenMap = new Map<string, string[]>();
        const allNodesSet = new Set(allNodeIds);

        for (const [childId, parentId] of Object.entries(branchParents)) {
            if (allNodesSet.has(parentId)) {
                if (!childrenMap.has(parentId)) {
                    childrenMap.set(parentId, []);
                }
                childrenMap.get(parentId)!.push(childId);
            }
        }

        const rootNodes = allNodeIds.filter(id => !branchParents[id]);
        
        const positions = new Map<string, { x: number, y: number }>();
        const subtreeWidths = new Map<string, number>();
        const X_SPACING = 250;
        const Y_SPACING = 150;

        function calculateSubtreeWidth(nodeId: string): number {
            if (subtreeWidths.has(nodeId)) return subtreeWidths.get(nodeId)!;

            const children = childrenMap.get(nodeId) || [];
            if (children.length === 0) {
                subtreeWidths.set(nodeId, X_SPACING);
                return X_SPACING;
            }

            let width = 0;
            for (const childId of children) {
                width += calculateSubtreeWidth(childId);
            }
            subtreeWidths.set(nodeId, width);
            return width;
        }

        for (const nodeId of allNodeIds) {
            calculateSubtreeWidth(nodeId);
        }

        function calculatePositions(nodeId: string, x: number, y: number) {
            positions.set(nodeId, { x, y });

            const children = childrenMap.get(nodeId) || [];
            if (children.length === 0) return;

            const totalWidth = subtreeWidths.get(nodeId)!;
            let currentX = x - totalWidth / 2;

            for (const childId of children) {
                const childWidth = subtreeWidths.get(childId)!;
                calculatePositions(childId, currentX + childWidth / 2, y + Y_SPACING);
                currentX += childWidth;
            }
        }

        let currentRootX = 0;
        for (const root of rootNodes) {
            calculatePositions(root, currentRootX, 0);
            currentRootX += subtreeWidths.get(root)! + X_SPACING;
        }

        return allNodeIds.map(nodeId => ({
            id: nodeId,
            position: positions.get(nodeId) || { x: 0, y: 0 },
            data: { label: branchTitles[nodeId] || `Branch ${nodeId.slice(0, 4)}`, url: `/branch/${nodeId}` },
            style: {
                background: '#f0f9ff',
                border: '2px solid #3b82f6',
                padding: '8px',
                borderRadius: '8px',
                width: 180,
                textAlign: 'center' as const,
            },
        }));
    }, [messagesByBranch, branchTitles, branchParents]);

    const edgesData = useMemo(() => {
        return Object.entries(branchParents).map(([childId, parentId]) => ({
            id: `${parentId}-${childId}`,
            source: parentId,
            target: childId,
            type: 'smoothstep',
        }));
    }, [branchParents]);

    /* ------------------------------------------------------------------ */
    /* 🔄  Keep ReactFlow state in sync ---------------------------------- */
    /* ------------------------------------------------------------------ */
    const [nodes, setNodes, onNodesChange] = useNodesState(nodesData);
    const [edges, setEdges, onEdgesChange] = useEdgesState(edgesData);

    // Whenever the underlying data changes, update ReactFlow state.
    useEffect(() => setNodes(nodesData), [nodesData, setNodes]);
    useEffect(() => setEdges(edgesData), [edgesData, setEdges]);

    /* ------------------------------------------------------------------ */
    /* 🎨  Render --------------------------------------------------------- */
    /* ------------------------------------------------------------------ */
    return (
        <div className="h-screen w-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodesDraggable
                fitView
                onNodeClick={(_, n) => (window.location.href = n.data.url as string)}
                maxZoom={2}
                minZoom={0.1}
            >
                <Controls />
                <MiniMap />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </div>
    );
}