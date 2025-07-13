export default function Test() {
    const items = [
        "Item 1",
        "Item 2",
        "Item 3"
    ];

    return (
        <div className="overflow-y-scroll h-screen">
            <h1>Test</h1>
            <ul>
                {items.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    );
}