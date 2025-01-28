"use client"
import { useStore } from '@/store/store';
import React from 'react';

// Helper function to build tree structure
const buildBranchTree = (branchParents: Record<string, string>, maxDepth: number = 4) => {
    const tree: Record<string, any> = {};
    const childrenMap: Record<string, string[]> = {};

    // Build children map
    Object.entries(branchParents).forEach(([branchId, parentId]) => {
        if (!childrenMap[parentId]) {
            childrenMap[parentId] = [];
        }
        childrenMap[parentId].push(branchId);
    });

    // Find root nodes (branches that are parents but don't appear as children)
    const allParentIds = new Set(Object.values(branchParents));
    const allBranchIds = new Set(Object.keys(branchParents));
    const rootBranches = Array.from(allParentIds).filter(id => !allBranchIds.has(id));

    // If no root found, take the first parent as root
    if (rootBranches.length === 0 && Object.keys(branchParents).length > 0) {
        const firstParentId = Object.values(branchParents)[0];
        rootBranches.push(firstParentId);
    }

    // Recursive function to build tree with depth limit
    const buildSubTree = (branchId: string, depth: number = 1): Record<string, any> => {
        if (depth >= maxDepth) return {}; // Stop recursing at max depth

        const subTree: Record<string, any> = {};
        const children = childrenMap[branchId] || [];

        children.forEach(childId => {
            subTree[childId] = buildSubTree(childId, depth + 1);
        });

        return subTree;
    };

    // Build tree starting from root branches
    rootBranches.forEach(rootBranch => {
        tree[rootBranch] = buildSubTree(rootBranch);
    });

    return tree;
};

// Helper to truncate branch ID
const truncateBranchId = (branchId: string) => {
    return branchId.slice(0, 7) + '...';
};

// Updated BranchTreeItem component
const BranchTreeItem = ({
    branchId,
    children,
    depth = 1,
    maxDepth = 4
}: {
    branchId: string,
    children: Record<string, any>,
    depth?: number,
    maxDepth?: number
}) => {
    const hasMoreChildren = Object.keys(children).length > 0;
    const isAtMaxDepth = depth >= maxDepth;

    return (
        <li>
            <div className="p-2 hover:bg-gray-100 rounded">
                {truncateBranchId(branchId)}
            </div>
            {hasMoreChildren && !isAtMaxDepth && (
                <ul className="ml-4 border-l border-gray-200">
                    {Object.entries(children).map(([childId, grandChildren]) => (
                        <BranchTreeItem
                            key={childId}
                            branchId={childId}
                            children={grandChildren}
                            depth={depth + 1}
                            maxDepth={maxDepth}
                        />
                    ))}
                </ul>
            )}
            {hasMoreChildren && isAtMaxDepth && (
                <div className="ml-4 pl-4 border-l border-gray-200">
                    <a
                        href="/flow"
                        className="block p-2 text-sm text-blue-500 hover:text-blue-600 hover:underline"
                    >
                        View full branch tree →
                    </a>
                </div>
            )}
        </li>
    );
};

export default function SideNav() {
    const { branchParents } = useStore();
    const branchTree = buildBranchTree(branchParents, 4);

    return (
        <div className="min-w-[200px] w-[20%] max-w-[300px] h-screen p-6 border-r border-gray-200 overflow-y-auto bg-gray-50/50">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-semibold text-gray-800">
                    Navigation
                </h1>
                <a
                    href="/flow"
                    className="px-3 py-1 text-sm text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-150 flex items-center gap-1"
                >
                    Flow View
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </a>
            </div>

            <div className="px-2 text-sm text-gray-500 mb-4">
                Branches found: {Object.keys(branchParents).length}
            </div>

            {Object.keys(branchParents).length === 0 ? (
                <div className="px-2 text-sm text-gray-500">
                    No branches available
                </div>
            ) : (
                <ul className="flex flex-col gap-3">
                    {Object.entries(branchTree).map(([branchId, children]) => (
                        <BranchTreeItem
                            key={branchId}
                            branchId={branchId}
                            children={children}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
}