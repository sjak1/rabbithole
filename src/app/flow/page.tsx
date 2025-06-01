"use client";
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    BackgroundVariant
} from '@xyflow/react';
import { useStore } from "@/store/store";
import '@xyflow/react/dist/style.css';
import { useEffect } from 'react';
import { getBranchTitle } from "@/app/openai";

export default function FlowPage() {
    const {
        messagesByBranch,
        branchParents,
        branchTitles,
        setBranchTitle
    } = useStore();

    // Simplified title generation
    useEffect(() => {
        Object.entries(messagesByBranch).forEach(async ([branchId, messages]) => {
            if (!branchTitles[branchId] && messages.length >= 2) {
                try {
                    const title = await getBranchTitle(messages);
                    await setBranchTitle(branchId, title);
                } catch (error) {
                    console.error(`Error generating title for branch ${branchId}:`, error);
                    await setBranchTitle(branchId, `Branch ${branchId.slice(0, 4)}...`);
                }
            }
        });
    }, [messagesByBranch, branchTitles, setBranchTitle]);

    // Create nodes and edges directly from data
    const nodes = Object.keys(messagesByBranch).map((branchId, index) => ({
        id: branchId,
        position: { x: index * 250, y: 0 }, // Simple horizontal layout
        data: {
            label: branchTitles[branchId] || 'New Branch',
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

    const edges = Object.entries(branchParents).map(([branchId, parentId]) => ({
        id: `${parentId}-${branchId}`,
        source: parentId,
        target: branchId,
    }));

    const [layoutedNodes, _, onNodesChange] = useNodesState(nodes);
    const [layoutedEdges, __, onEdgesChange] = useEdgesState(edges);

    return (
        <div className="h-screen w-full">
            <ReactFlow
                nodes={layoutedNodes}
                edges={layoutedEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodesDraggable={true}
                fitView
                onNodeClick={(_, node) => {
                    window.location.href = `/branch/${node.id}`;
                }}
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