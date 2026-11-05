import axios from "axios";
import Link from "next/link";
import VetNavigation from "@/components/vetNavigation";
import ProfilePhoto from "@/components/profilePhoto";

// SSR: render on every request so the list is always fresh
export const dynamic = "force-dynamic";

type Vet = {
    id: number;
    name: string;
    fullName: string;
    email: string;
    phone: string;
    status: string;
    profileImage: string;
};

export default async function AllVetsPage() {
    let vets: Vet[] = [];
    let error = "";

    try {
        const response = await axios.get(
            process.env.NEXT_PUBLIC_API_ENDPOINT +
            "/vet/getallvets"
        );

        vets = response.data;
    } catch (err) {
        console.error(err);
        error = "Failed to load vets";
    }

    return (
        <div data-theme="valentine" className="min-h-screen bg-[#fff7f2]">
            <VetNavigation />

            <div className="max-w-6xl mx-auto px-6 py-10">
                <h1 className="text-3xl font-bold text-gray-800">
                    All Vets
                </h1>
                <p className="text-gray-500 mt-1 mb-6">
                    Veterinarians registered on PawsHome BD
                </p>

                {error && (
                    <div className="alert alert-error mb-6">
                        <span>{error}</span>
                    </div>
                )}

                {vets.length > 0 ? (
                    <div className="card bg-[#fffaf2] text-black shadow-md">
                        <div className="card-body">
                            <div className="overflow-x-auto">
                                <table className="table text-black">
                                    <thead>
                                        <tr className="text-black">
                                            <th>ID</th>
                                            <th>Full Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {vets.map((vet) => (
                                            <tr key={vet.id}>
                                                <td>{vet.id}</td>
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <ProfilePhoto
                                                            src={vet.profileImage ? process.env.NEXT_PUBLIC_API_ENDPOINT + "/vet/getimage/" + vet.profileImage : undefined}
                                                            name={vet.fullName}
                                                        />
                                                        <span>{vet.fullName}</span>
                                                    </div>
                                                </td>
                                                <td>{vet.email}</td>
                                                <td>{vet.phone}</td>
                                                <td>
                                                    <span className="badge badge-primary">
                                                        {vet.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <Link
                                                        href={"/vet/vets/" + vet.id}
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
                                <p className="text-gray-500">No vets found</p>
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
