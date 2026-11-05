export default async function ListerDetails({ params }: { params: { id: string } }) {
    const { id } = await params;

    const listers = [
        { id: 1, name: "John" },
        { id: 2, name: "David" },
        { id: 3, name: "Sarah" },
    ];

    const lister = listers.find((item) => item.id === Number(id));

    return (
        <>
            <h1>Lister Details</h1>

            {lister ? (
                <>
                    <p>Lister ID: {lister.id}</p>
                    <p>Lister Name: {lister.name}</p>
                </>
            ) : (
                <p>Lister not found</p>
            )}
        </>
    );
}