"use client";
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
} from '@xyflow/react';
import { useStore } from "@/store/store";
import '@xyflow/react/dist/style.css';

export default function FlowPage() {
    const { messagesByBranch, branchParents } = useStore();

    // Convert your chat branches to nodes and edges
    const nodes = Object.keys(messagesByBranch).map((branchId, index) => ({
        id: branchId,
        position: { x: 500, y: index * 150 },
        data: { label: `Branch ${branchId.slice(0, 4)}...` },
        url: `/branch/${branchId}`,
    }));

    // Create edges based on branch parents
    const edges = Object.entries(branchParents).map(([branchId, parentId]) => ({
        id: `${parentId}-${branchId}`,
        source: parentId,
        target: branchId,
    }));

    return (
        <div className="h-screen w-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                fitView
                onNodeClick={(event, node) => {
                    window.location.href = node.url;
                }}
            >
                <Controls />
                <MiniMap />
                <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
        </div>
    );
}