export default async function ProductDetail({ params }: { params: { id: string } }) {
    const product = await params;
    return (
        <>
            <h1>product detail</h1>
            <p>this is product{product.id}</p>

        </>

    )

}
