import axios from "axios";
import Link from "next/link";
import AdminNavigation from "@/components/adminNavigation";
import ProfilePhoto from "@/components/profilePhoto";

// SSR: render on every request so the list is always fresh
export const dynamic = "force-dynamic";

type Admin = {
    id: number;
    fullName: string;
    email: string;
    gender: string;
    phone: string;
    age?: number;
    status: string;
    profileImage?: string;
};

export default async function AllAdminsPage() {
    let admins: Admin[] = [];
    let error = "";

    try {
        const response = await axios.get(
            process.env.NEXT_PUBLIC_API_ENDPOINT +
            "/admin/getallusers"
        );

        admins = response.data;
    } catch (err) {
        console.error(err);
        error = "Failed to load admins";
    }

    return (
        <div data-theme="valentine" className="min-h-screen bg-[#fff7f2]">
            <AdminNavigation />

            <div className="max-w-6xl mx-auto px-6 py-10">
                <h1 className="text-3xl font-bold text-gray-800">
                    All Admins
                </h1>
                <p className="text-gray-500 mt-1 mb-6">
                    View and manage admin users
                </p>

                {error && (
                    <div className="alert alert-error mb-6">
                        <span>{error}</span>
                    </div>
                )}

                {admins.length > 0 ? (
                    <div className="card bg-[#fffaf2] text-black shadow-md">
                        <div className="card-body">
                            <div className="overflow-x-auto">
                                <table className="table text-black">
                                    <thead>
                                        <tr className="text-black">
                                            <th>ID</th>
                                            <th>Full Name</th>
                                            <th>Email</th>
                                            <th>Gender</th>
                                            <th>Phone</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {admins.map((admin) => (
                                            <tr key={admin.id}>
                                                <td>{admin.id}</td>
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <ProfilePhoto
                                                            src={admin.profileImage ? process.env.NEXT_PUBLIC_API_ENDPOINT + "/admin/getimage/" + admin.profileImage : undefined}
                                                            name={admin.fullName}
                                                        />
                                                        <span>{admin.fullName}</span>
                                                    </div>
                                                </td>
                                                <td>{admin.email}</td>
                                                <td>{admin.gender}</td>
                                                <td>{admin.phone}</td>
                                                <td>
                                                    <span className="badge badge-primary">
                                                        {admin.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <Link
                                                        href={"/admin/users/" + admin.id}
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
                                <p className="text-gray-500">
                                    No admins found
                                </p>
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}