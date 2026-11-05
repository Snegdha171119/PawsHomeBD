import Link from "next/link";

export default function NotFound() {
    return (
        <div data-theme="valentine" className="min-h-screen bg-[#fff7f2] flex items-center justify-center px-4">
            <div className="card bg-[#fffaf2] text-gray-800 shadow-xl max-w-md w-full">
                <div className="card-body items-center text-center">
                    <div className="text-6xl">🐾</div>
                    <h2 className="text-3xl font-bold">404 - Page Not Found</h2>
                    <p className="text-gray-500">The page you are looking for does not exist.</p>

                    <Link href="/" className="btn btn-primary mt-3">
                        Go Back Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
