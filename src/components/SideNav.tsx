interface Branch {
    name: string;
    children?: Branch[];
}

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
                        { name: "sub branch 3" }
                    ]
                }
            ]
        }
    ];

    const renderBranch = (branch: Branch, level: number = 0) => (
        <li key={branch.name}>
            <div className={`
                flex items-center
                p-2 rounded-md hover:bg-gray-100
                ${level > 0 ? 'ml-4 relative before:absolute before:left-[-16px] before:top-1/2 before:w-3 before:h-px before:bg-gray-300' : ''}
            `}>
                {branch.name}
            </div>
            {branch.children && (
                <ul className={`
                    relative
                    ${level > 0 ? 'border-l border-gray-300 ml-4' : ''}
                `}>
                    {branch.children.map(child => renderBranch(child, level + 1))}
                </ul>
            )}
        </li>
    );

    return (
        <div className="w-[15%] h-screen p-4 border-r border-gray-200">
            <h1>SideNav</h1>
            <ul className="flex flex-col gap-2">
                {branches.map(branch => renderBranch(branch))}
            </ul>
        </div>
    );
}