import Link from "next/link";

export default function ListerNavigation(){
    // same links for the big menu and the small-screen dropdown
    const links = (
        <>
            <li><Link href="/lister">Dashboard</Link></li>
            <li><Link href="/lister/pets">My Pets</Link></li>
            <li><Link href="/lister/listers">All Listers</Link></li>
            <li><Link href="/lister/search">Search</Link></li>
            <li><Link href="/lister/adopters">Adopter Management</Link></li>
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
                <span className="badge badge-primary">🐶 Pet Lister</span>
            </div>
        </div>
    );
}
