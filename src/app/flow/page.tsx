"use client";
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    BackgroundVariant,
    MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from "@/store/store";
import { useEffect, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";

export default function FlowPage() {
    const { getToken } = useAuth();
    const {
        messagesByBranch,
        branchParents,
        branchTitles,
        loadBranches
    } = useStore();

    // On mount load branches from backend
    useEffect(() => {
        const loadBranchesWithToken = async () => {
            const token = await getToken();
            if (!token) return;
            await loadBranches(token);
        };
        loadBranchesWithToken().catch(console.error);
    }, [loadBranches, getToken]);

    /* ------------------------------------------------------------------ */
    /* 🖼️  Build hierarchical layout ------------------------------------ */
    /* ------------------------------------------------------------------ */
    const nodesData = useMemo(() => {
        const branchIds = Object.keys(messagesByBranch);
        if (branchIds.length === 0) return [];

        // Find root nodes (no parent)
        const roots = branchIds.filter(id => !branchParents[id]);
        
        // Build children map
        const children: Record<string, string[]> = {};
        branchIds.forEach(id => {
            const parent = branchParents[id];
            if (parent) {
                if (!children[parent]) children[parent] = [];
                children[parent].push(id);
            }
        });

        // Layout algorithm with proper centering
        const positioned: Record<string, { x: number; y: number }> = {};
        const horizontalGap = 250;
        const verticalGap = 120;

        // Position nodes with children centered under parents
        const layoutNode = (nodeId: string, level: number, leftOffset: number): number => {
            const nodeChildren = children[nodeId] || [];
            
            if (nodeChildren.length === 0) {
                // Leaf node - position at leftOffset
                positioned[nodeId] = { 
                    x: leftOffset * horizontalGap, 
                    y: level * verticalGap 
                };
                return leftOffset + 1;
            }

            // Position children first
            let currentOffset = leftOffset;
            const childPositions: number[] = [];
            
            nodeChildren.forEach(childId => {
                const childStart = currentOffset;
                currentOffset = layoutNode(childId, level + 1, currentOffset);
                const childEnd = currentOffset - 1;
                childPositions.push((childStart + childEnd) / 2);
            });

            // Position parent centered over children
            const leftmostChild = childPositions[0];
            const rightmostChild = childPositions[childPositions.length - 1];
            const parentX = (leftmostChild + rightmostChild) / 2;
            
            positioned[nodeId] = { 
                x: parentX * horizontalGap, 
                y: level * verticalGap 
            };
            
            return currentOffset;
        };

        // Layout each root tree
        let currentOffset = 0;
        roots.forEach(rootId => {
            currentOffset = layoutNode(rootId, 0, currentOffset);
            currentOffset += 2; // Add gap between root trees
        });

        // Center the entire diagram
        const allX = Object.values(positioned).map(pos => pos.x);
        const minX = Math.min(...allX);
        const maxX = Math.max(...allX);
        const centerOffset = -(minX + maxX) / 2;

        // Create nodes with calculated positions
        return branchIds.map(branchId => ({
            id: branchId,
            position: { 
                x: positioned[branchId].x + centerOffset, 
                y: positioned[branchId].y 
            },
            data: { label: branchTitles[branchId] || "new-branch", url: `/branch/${branchId}` },
            style: {
                background: '#f0f9ff',
                border: '2px solid #3b82f6',
                padding: '8px',
                borderRadius: '8px',
                width: 180,
            },
        }));
    }, [messagesByBranch, branchTitles, branchParents]);

    const edgesData = useMemo(() => {
        return Object.entries(branchParents).map(([childId, parentId]) => ({
            id: `${parentId}-${childId}`,
            source: parentId,
            target: childId,
            style: { stroke: '#3b82f6', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
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
                onNodeClick={(_, n) => (window.location.href = `/branch/${n.id}`)}
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