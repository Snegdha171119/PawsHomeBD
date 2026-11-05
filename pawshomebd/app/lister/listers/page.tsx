import axios from "axios";
import Link from "next/link";
import ListerNavigation from "@/components/listerNavigation";
import ProfilePhoto from "@/components/profilePhoto";

// SSR: render on every request so the list is always fresh
export const dynamic = "force-dynamic";

type Lister = {
    id: number;
    username: string;
    fullName: string;
    email: string;
    status: string;
    profileImage: string;
};

export default async function AllListersPage() {
    let listers: Lister[] = [];
    let error = "";

    try {
        const response = await axios.get(
            process.env.NEXT_PUBLIC_API_ENDPOINT +
            "/lister/getalllisters"
        );

        listers = response.data;
    } catch (err) {
        console.error(err);
        error = "Failed to load listers";
    }

    return (
        <div data-theme="valentine" className="min-h-screen bg-[#fff7f2]">
            <ListerNavigation />

            <div className="max-w-6xl mx-auto px-6 py-10">
                <h1 className="text-3xl font-bold text-gray-800">
                    All Pet Listers
                </h1>
                <p className="text-gray-500 mt-1 mb-6">
                    Pet listers registered on PawsHome BD
                </p>

                {error && (
                    <div className="alert alert-error mb-6">
                        <span>{error}</span>
                    </div>
                )}

                {listers.length > 0 ? (
                    <div className="card bg-[#fffaf2] text-black shadow-md">
                        <div className="card-body">
                            <div className="overflow-x-auto">
                                <table className="table text-black">
                                    <thead>
                                        <tr className="text-black">
                                            <th>ID</th>
                                            <th>Username</th>
                                            <th>Full Name</th>
                                            <th>Email</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {listers.map((lister) => (
                                            <tr key={lister.id}>
                                                <td>{lister.id}</td>
                                                <td>{lister.username}</td>
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <ProfilePhoto
                                                            src={lister.profileImage ? process.env.NEXT_PUBLIC_API_ENDPOINT + "/lister/getimage/" + lister.profileImage : undefined}
                                                            name={lister.fullName}
                                                        />
                                                        <span>{lister.fullName}</span>
                                                    </div>
                                                </td>
                                                <td>{lister.email}</td>
                                                <td>
                                                    <span className="badge badge-primary">
                                                        {lister.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <Link
                                                        href={"/lister/listers/" + lister.id}
                                                        className="btn btn-primary btn-sm"
                                                    >
                                                        View Details
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    !error && (
                        <div className="card bg-[#fffaf2] text-black shadow-md">
                            <div className="card-body text-center">
                                <p className="text-gray-500">No listers found</p>
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
