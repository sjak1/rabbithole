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
    const baseRadius = 400; // Distance from parent

    // Position root nodes (nodes without parents)
    const rootNodes = Object.keys(messagesByBranch).filter(id => !branchParents[id]);
    rootNodes.forEach((id, i) => {
        nodePositions[id] = { x: i * 500, y: 100 };
    });

    // Position child nodes
    Object.entries(childrenByParent).forEach(([parentId, children]) => {
        const parentPos = nodePositions[parentId] || { x: 0, y: 0 };

        children.forEach((childId, index) => {
            // Calculate angle based on number of siblings
            const angle = (Math.PI / Math.max(1, children.length + 1)) * (index + 1);

            nodePositions[childId] = {
                x: parentPos.x + Math.cos(angle) * baseRadius,
                y: parentPos.y + Math.sin(angle) * baseRadius
            };
        });
    });

    // Create nodes with calculated positions
    const nodes = Object.keys(messagesByBranch).map((branchId) => ({
        id: branchId,
        position: nodePositions[branchId] || { x: 0, y: 0 },
        data: { label: `Branch ${branchId.slice(0, 4)}...`, url: `/branch/${branchId}` },
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
                    window.location.href = `/branch/${node.id}`;
                }}
            >
                <Controls />
                <MiniMap />
                <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
        </div>
    );
}