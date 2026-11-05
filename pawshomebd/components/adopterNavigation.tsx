import Link from "next/link";

export default function AdopterNavigation(){
    // same links for the big menu and the small-screen dropdown
    const links = (
        <>
            <li><Link href="/adopter">Dashboard</Link></li>
            <li><Link href="/adopter/pets">Available Pets</Link></li>
            <li><Link href="/adopter/adopters">All Adopters</Link></li>
            <li><Link href="/adopter/vet">My Vet</Link></li>
            <li><Link href="/adopter/lister">My Lister</Link></li>
            <li><Link href="/">Home</Link></li>
        </>
    );

    return(
        <div className="navbar bg-[#f8d7df] shadow-md px-4 lg:px-8">
            <div className="navbar-start">
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                        ☰
                    </div>
                    <ul tabIndex={0} className="menu menu-sm dropdown-content bg-[#fffaf2] text-gray-700 rounded-box z-10 mt-3 w-56 p-2 shadow">
                        {links}
                    </ul>
                </div>

                <Link
                    href="/"
                    className="text-xl lg:text-2xl font-bold text-gray-800 whitespace-nowrap"
                >
                    PawsHome BD
                </Link>
            </div>

            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1 font-medium text-gray-700">
                    {links}
                </ul>
            </div>

            <div className="navbar-end">
                <span className="badge badge-primary">🏠 Adopter</span>
            </div>
        </div>
    );
}
