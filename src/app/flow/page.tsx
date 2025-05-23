"use client";
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState
} from '@xyflow/react';
import { useStore } from "@/store/store";
import '@xyflow/react/dist/style.css';
import { useMemo, useState, useEffect, useRef } from 'react';
import { BackgroundVariant } from '@xyflow/react';
import { getBranchTitle } from "@/app/openai";

export default function FlowPage() {
    const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
    const {
        messagesByBranch,
        branchParents,
        branchTitles,
        setBranchTitle
    } = useStore();
    const processedBranches = useRef<Set<string>>(new Set());

    // Process only new branches
    useEffect(() => {
        const processNewBranches = async () => {
            const newBranches = Object.entries(messagesByBranch)
                .filter(([branchId]) =>
                    !processedBranches.current.has(branchId) &&
                    !branchTitles[branchId]
                );

            if (newBranches.length === 0) return;

            for (const [branchId, messages] of newBranches) {
                processedBranches.current.add(branchId);

                if (messages.length >= 2) {
                    try {
                        const title = await getBranchTitle(messages);
                        await setBranchTitle(branchId, title);
                    } catch (error) {
                        console.error(`Error loading title for branch ${branchId}:`, error);
                        await setBranchTitle(branchId, `Branch ${branchId.slice(0, 4)}...`);
                    }
                } else {
                    await setBranchTitle(branchId, `New Branch ${branchId.slice(0, 4)}...`);
                }
            }
        };

        processNewBranches();
    }, [messagesByBranch, branchTitles, setBranchTitle]);

    const { initialNodes, initialEdges } = useMemo(() => {
        // Group branches by their parent
        const childrenByParent: Record<string, string[]> = {};
        Object.entries(branchParents).forEach(([branchId, parentId]) => {
            if (!childrenByParent[parentId]) {
                childrenByParent[parentId] = [];
            }
            childrenByParent[parentId].push(branchId);
        });

        // Calculate node positions
        const nodePositions: Record<string, { x: number, y: number }> = {};
        const baseRadius = 300;

        // Position root nodes
        const rootNodes = Object.keys(messagesByBranch).filter(id => !branchParents[id]);
        rootNodes.forEach((id, i) => {
            nodePositions[id] = { x: i * 800, y: 0 };
        });

        // Position child nodes
        Object.entries(childrenByParent).forEach(([parentId, children]) => {
            const parentPos = nodePositions[parentId] || { x: 0, y: 0 };
            const dynamicRadius = baseRadius + (Math.sqrt(children.length) * 100);

            children.forEach((childId, index) => {
                const angle = (Math.PI / Math.max(1, children.length + 1)) * (index + 1);
                nodePositions[childId] = {
                    x: parentPos.x + Math.cos(angle) * dynamicRadius,
                    y: parentPos.y + Math.sin(angle) * dynamicRadius
                };
            });
        });

        // Create nodes
        const nodes = Object.keys(messagesByBranch).map((branchId) => ({
            id: branchId,
            position: nodePositions[branchId] || { x: 0, y: 0 },
            data: {
                label: branchTitles[branchId] || `New Branch`,
                url: `/branch/${branchId}`
            },
            style: {
                background: '#f0f9ff',
                border: '2px solid #3b82f6',
                padding: '8px',
                borderRadius: '8px',
                width: 180,
            },
        }));

        // Create edges
        const edges = Object.entries(branchParents).map(([branchId, parentId]) => ({
            id: `${parentId}-${branchId}`,
            source: parentId,
            target: branchId,
        }));

        return { initialNodes: nodes, initialEdges: edges };
    }, [messagesByBranch, branchParents, branchTitles]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    return (
        <div className="h-screen w-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodesDraggable={true}
                fitView
                onNodeClick={(event, node) => {
                    window.location.href = `/branch/${node.id}`;
                }}
                maxZoom={2}
                minZoom={0.1}
                onViewportChange={setViewport}
                viewport={viewport}
            >
                <Controls />
                <MiniMap />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </div>
    );
}