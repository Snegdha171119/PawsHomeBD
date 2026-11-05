export default function Loading() {
    return (
        <div data-theme="valentine" className="min-h-screen bg-[#fff7f2] flex flex-col items-center justify-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <h2 className="text-2xl font-bold text-gray-800 mt-4">Loading...</h2>
            <p className="text-gray-500">Please wait while the data is loading.</p>
        </div>
    );
}
