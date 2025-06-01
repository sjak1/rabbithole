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
import '@xyflow/react/dist/style.css';
import { useStore } from "@/store/store";
import { getBranchTitle } from "@/app/openai";
import { useEffect, useMemo } from "react";

export default function FlowPage() {
    const {
        messagesByBranch,
        branchParents,
        branchTitles,
        setBranchTitle
    } = useStore();

    /* ------------------------------------------------------------------ */
    /* 🏷️  Auto-generate missing titles ---------------------------------- */
    /* ------------------------------------------------------------------ */
    useEffect(() => {
        const generateTitles = async () => {
            const work: Promise<void>[] = [];

            Object.entries(messagesByBranch).forEach(([branchId, msgs]) => {
                if (!branchTitles[branchId] && msgs.length >= 2) {
                    work.push(
                        getBranchTitle(msgs)
                            .then((title) => setBranchTitle(branchId, title))
                            .catch((err) => {
                                console.error(`Title generation failed for ${branchId}:`, err);
                                return setBranchTitle(branchId, `branch-${branchId.slice(0, 4)}`);
                            })
                    );
                }
            });

            if (work.length) await Promise.all(work);
        };

        generateTitles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messagesByBranch, branchTitles]);

    /* ------------------------------------------------------------------ */
    /* 🖼️  Build nodes / edges ------------------------------------------- */
    /* ------------------------------------------------------------------ */
    const nodesData = useMemo(() => {
        return Object.keys(messagesByBranch).map((branchId, idx) => ({
            id: branchId,
            position: { x: idx * 250, y: 0 },
            data: { label: branchTitles[branchId] || "new-branch", url: `/branch/${branchId}` },
            style: {
                background: '#f0f9ff',
                border: '2px solid #3b82f6',
                padding: '8px',
                borderRadius: '8px',
                width: 180,
            },
        }));
    }, [messagesByBranch, branchTitles]);

    const edgesData = useMemo(() => {
        return Object.entries(branchParents).map(([childId, parentId]) => ({
            id: `${parentId}-${childId}`,
            source: parentId,
            target: childId,
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