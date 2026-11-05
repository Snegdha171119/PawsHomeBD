import Link from "next/link";

export default function HomePage() {
    return (
        <div data-theme="valentine" className="min-h-screen bg-[#fff7f2]">

            <div className="navbar bg-[#f8d7df] shadow-md px-8">
                <div className="navbar-start">
                    <Link
                        href="/"
                        className="text-2xl font-bold text-gray-800"
                    >
                        PawsHome BD
                    </Link>
                </div>

                <div className="navbar-end">
                    <a
                        href="#roles"
                        className="btn btn-primary btn-sm"
                    >
                        Get Started
                    </a>
                </div>
            </div>

            <div className="carousel w-full h-[500px]">

                <div
                    id="slide1"
                    className="carousel-item relative w-full"
                >
                    <img
                        src="/p.png"
                        className="w-full object-cover"
                        alt="PawsHome BD"
                    />

                    <div className="absolute inset-0 bg-black/35"></div>

                    <div className="absolute inset-0 flex items-center">
                        <div className="ml-24 max-w-xl text-white">
                            <p className="text-lg font-medium mb-2">
                                Welcome to PawsHome BD
                            </p>

                            <h1 className="text-5xl font-bold mb-4">
                                Every Pet Deserves
                                <br />
                                A Loving Home
                            </h1>

                            <p className="text-lg mb-6">
                                Connecting adopters, pet listers and veterinarians
                                together in one caring community.
                            </p>

                            <a
                                href="#roles"
                                className="btn btn-primary"
                            >
                                Explore PawsHome
                            </a>
                        </div>
                    </div>

                    <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 justify-between">
                        <a
                            href="#slide3"
                            className="btn btn-circle"
                        >
                            ❮
                        </a>

                        <a
                            href="#slide2"
                            className="btn btn-circle"
                        >
                            ❯
                        </a>
                    </div>
                </div>

                <div
                    id="slide2"
                    className="carousel-item relative w-full bg-[#fbe4e8]"
                >
                    <div className="w-full flex items-center justify-center">
                        <div className="text-center max-w-2xl px-6">
                            <div className="text-7xl mb-5">
                                🐾
                            </div>

                            <h2 className="text-4xl font-bold text-gray-800 mb-4">
                                Find Your New Best Friend
                            </h2>

                            <p className="text-lg text-gray-600 mb-6">
                                Find pets looking for safe, caring and loving homes
                                through PawsHome BD.
                            </p>

                            <a
                                href="#roles"
                                className="btn btn-primary"
                            >
                                Start Your Journey
                            </a>
                        </div>
                    </div>

                    <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 justify-between">
                        <a
                            href="#slide1"
                            className="btn btn-circle"
                        >
                            ❮
                        </a>

                        <a
                            href="#slide3"
                            className="btn btn-circle"
                        >
                            ❯
                        </a>
                    </div>
                </div>

                <div
                    id="slide3"
                    className="carousel-item relative w-full bg-[#fff0e6]"
                >
                    <div className="w-full flex items-center justify-center">
                        <div className="text-center max-w-2xl px-6">
                            <div className="text-7xl mb-5">
                                ❤️
                            </div>

                            <h2 className="text-4xl font-bold text-gray-800 mb-4">
                                Care, Connect and Protect
                            </h2>

                            <p className="text-lg text-gray-600 mb-6">
                                Pet listing, adoption and veterinary support
                                together in one simple platform.
                            </p>

                            <a
                                href="#roles"
                                className="btn btn-primary"
                            >
                                Join PawsHome BD
                            </a>
                        </div>
                    </div>

                    <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 justify-between">
                        <a
                            href="#slide2"
                            className="btn btn-circle"
                        >
                            ❮
                        </a>

                        <a
                            href="#slide1"
                            className="btn btn-circle"
                        >
                            ❯
                        </a>
                    </div>
                </div>

            </div>

            <section
                id="roles"
                className="py-16 px-8"
            >
                <div className="text-center mb-10">
                    <p className="text-primary font-semibold mb-2">
                        Our Community
                    </p>

                    <h2 className="text-4xl font-bold text-gray-800">
                        Choose Your Role
                    </h2>

                    <p className="text-gray-500 mt-3">
                        Login to your account or register to join PawsHome BD.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">

                    <div className="card bg-[#fffaf2] shadow-xl">
                        <div className="card-body items-center text-center">
                            <div className="text-5xl">
                                🛡️
                            </div>

                            <h2 className="card-title text-gray-800">
                                Admin
                            </h2>

                            <p className="text-gray-500">
                                Manage users, listers and platform activities.
                            </p>

                            <div className="card-actions justify-center mt-3">
                                <Link
                                    href="/login"
                                    className="btn btn-primary btn-sm"
                                >
                                    Login
                                </Link>

                                <Link
                                    href="/register"
                                    className="btn btn-outline btn-primary btn-sm"
                                >
                                    Register
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-[#fffaf2] shadow-xl">
                        <div className="card-body items-center text-center">
                            <div className="text-5xl">
                                🩺
                            </div>

                            <h2 className="card-title text-gray-800">
                                Veterinarian
                            </h2>

                            <p className="text-gray-500">
                                Provide trusted veterinary support for pets.
                            </p>

                            <div className="card-actions justify-center mt-3">
                                <Link
                                    href="/vet/login"
                                    className="btn btn-primary btn-sm"
                                >
                                    Login
                                </Link>

                                <Link
                                    href="/vet/register"
                                    className="btn btn-outline btn-primary btn-sm"
                                >
                                    Register
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-[#fffaf2] shadow-xl">
                        <div className="card-body items-center text-center">
                            <div className="text-5xl">
                                🐶
                            </div>

                            <h2 className="card-title text-gray-800">
                                Pet Lister
                            </h2>

                            <p className="text-gray-500">
                                List pets and connect with responsible adopters.
                            </p>

                            <div className="card-actions justify-center mt-3">
                                <Link
                                    href="/lister/login"
                                    className="btn btn-primary btn-sm"
                                >
                                    Login
                                </Link>

                                <Link
                                    href="/lister/register"
                                    className="btn btn-outline btn-primary btn-sm"
                                >
                                    Register
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-[#fffaf2] shadow-xl">
                        <div className="card-body items-center text-center">
                            <div className="text-5xl">
                                🏠
                            </div>

                            <h2 className="card-title text-gray-800">
                                Adopter
                            </h2>

                            <p className="text-gray-500">
                                Find a pet and begin your adoption journey.
                            </p>

                            <div className="card-actions justify-center mt-3">
                                <Link
                                    href="/adopter/login"
                                    className="btn btn-primary btn-sm"
                                >
                                    Login
                                </Link>

                                <Link
                                    href="/adopter/register"
                                    className="btn btn-outline btn-primary btn-sm"
                                >
                                    Register
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            <footer className="bg-[#f8d7df] py-8 text-center">
                <h2 className="text-2xl font-bold text-gray-800">
                    PawsHome BD
                </h2>

                <p className="text-gray-600 mt-2">
                    Connecting pets with loving homes.
                </p>

                <p className="text-gray-500 text-sm mt-3">
                    © 2026 PawsHome BD
                </p>
            </footer>

        </div>
    );
}