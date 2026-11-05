// Round profile picture. Shows the first letter of the name when there is no photo yet
export default function ProfilePhoto(props: { src?: string; name: string; size?: "sm" | "lg" }) {
    const sizeClass = props.size === "lg" ? "w-28 h-28 text-4xl" : "w-10 h-10 text-base";

    if (props.src) {
        return (
            <div className="avatar">
                <div className={sizeClass + " rounded-full ring-2 ring-[#f8d7df]"}>
                    <img src={props.src} alt={props.name} />
                </div>
            </div>
        );
    }

    return (
        <div className="avatar avatar-placeholder">
            <div className={sizeClass + " rounded-full bg-[#f8d7df] text-gray-700 font-bold"}>
                <span>{props.name ? props.name.charAt(0).toUpperCase() : "?"}</span>
            </div>
        </div>
    );
}
