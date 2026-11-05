import axios from "axios";
import Link from "next/link";
import AdopterNavigation from "@/components/adopterNavigation";
import ProfilePhoto from "@/components/profilePhoto";

// SSR: render on every request so the list is always fresh
export const dynamic = "force-dynamic";

type Adopter = {
    id: number;
    name: string;
    email: string;
    phone: string;
    status: string;
    profileImage: string;
};

export default async function AllAdoptersPage() {
    let adopters: Adopter[] = [];
    let error = "";

    try {
        const response = await axios.get(
            process.env.NEXT_PUBLIC_API_ENDPOINT +
            "/adopter/getalladopters"
        );

        adopters = response.data;
    } catch (err) {
        console.error(err);
        error = "Failed to load adopters";
    }

    return (
        <div data-theme="valentine" className="min-h-screen bg-[#fff7f2]">
            <AdopterNavigation />

            <div className="max-w-6xl mx-auto px-6 py-10">
                <h1 className="text-3xl font-bold text-gray-800">
                    All Adopters
                </h1>
                <p className="text-gray-500 mt-1 mb-6">
                    Adopters registered on PawsHome BD
                </p>

                {error && (
                    <div className="alert alert-error mb-6">
                        <span>{error}</span>
                    </div>
                )}

                {adopters.length > 0 ? (
                    <div className="card bg-[#fffaf2] text-black shadow-md">
                        <div className="card-body">
                            <div className="overflow-x-auto">
                                <table className="table text-black">
                                    <thead>
                                        <tr className="text-black">
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {adopters.map((adopter) => (
                                            <tr key={adopter.id}>
                                                <td>{adopter.id}</td>
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <ProfilePhoto
                                                            src={adopter.profileImage ? process.env.NEXT_PUBLIC_API_ENDPOINT + "/adopter/getimage/" + adopter.profileImage : undefined}
                                                            name={adopter.name}
                                                        />
                                                        <span>{adopter.name}</span>
                                                    </div>
                                                </td>
                                                <td>{adopter.email}</td>
                                                <td>{adopter.phone}</td>
                                                <td>
                                                    <span className="badge badge-primary">
                                                        {adopter.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <Link
                                                        href={"/adopter/adopters/" + adopter.id}
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
                                <p className="text-gray-500">No adopters found</p>
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
