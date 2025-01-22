"use client"
import React, { useState } from 'react';

interface Branch {
    name: string;
    children?: Branch[];
}

const BranchItem = ({ branch, level = 0 }: { branch: Branch; level?: number }) => {
    const hasChildren = branch.children && branch.children.length > 0;
    const isMaxLevel = level >= 3; // 0-based index, so 4 means 5 levels

    return (
        <li>
            <div className={`
                flex items-center gap-2
                p-2 rounded-md 
                transition-all duration-200
                hover:bg-gradient-to-r from-gray-100 to-gray-200
                hover:shadow-sm
                ${level > 0 ? 'ml-4 relative before:absolute before:left-[-16px] before:top-1/2 before:w-3 before:h-px before:bg-gray-200 before:opacity-80' : ''}
            `}>
                {/* Show flow link if branch has children but at max level */}
                {hasChildren && isMaxLevel && (
                    <span className="text-xs text-blue-500 hover:text-blue-600 hover:underline transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = '/flow';
                        }}>
                        → flow
                    </span>
                )}
                <span className="text-gray-700 hover:text-gray-900 transition-colors">
                    {branch.name}
                </span>
            </div>

            {/* Always show children if not at max level */}
            {!isMaxLevel && hasChildren && (
                <ul className={`
                    relative
                    ${level > 0 ? 'border-l border-gray-200 ml-4' : ''}
                `}>
                    {branch.children && branch.children.map(child => (
                        <BranchItem
                            key={child.name}
                            branch={child}
                            level={level + 1}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

export default function SideNav() {
    const branches: Branch[] = [
        {
            name: "main",
            children: [
                {
                    name: "branch 1",
                    children: [
                        { name: "sub branch 1" },
                        { name: "sub branch 2" }
                    ]
                },
                { name: "branch 2" },
                {
                    name: "branch 3",
                    children: [
                        {
                            name: "sub branch 3",
                            children: [
                                {
                                    name: "sub branch 4",
                                    children: [
                                        {
                                            name: "sub branch 5",
                                            children: [
                                                {
                                                    name: "sub branch 6"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ];

    return (
        <div className="
            min-w-[200px] w-[20%] max-w-[300px] 
            h-screen 
            p-6 
            border-r border-gray-200 
            overflow-y-auto
            bg-gray-50/50
        ">
            <h1 className="
                text-xl font-semibold 
                text-gray-800 
                mb-6 
                px-2
            ">
                Navigation
            </h1>
            <ul className="flex flex-col gap-3">
                {branches.map(branch => (
                    <BranchItem
                        key={branch.name}
                        branch={branch}
                    />
                ))}
            </ul>
        </div>
    );
}