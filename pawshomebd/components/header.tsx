export default function Header(props: { name: string; message: string }) {
    return (
        <>
            <h1>{props.name}</h1>
            <p>{props.message}</p>
        </>
    );
}