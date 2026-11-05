"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import AdminNavigation from "@/components/adminNavigation";

type Lister = {
    id: number;
    name: string;
    fullName: string;
    username: string;
    email: string;
    nid: string;
};

export default function AdminListersPage() {
    const router = useRouter();

    const [adminId, setAdminId] = useState("");
    const [listerId, setListerId] = useState("");
    const [listers, setListers] = useState<Lister[]>([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("access_token");

        if (!token) {
            router.push("/login");
        }
    }, []);

    const assignLister = async (e: React.FormEvent) => {
        e.preventDefault();

        setMessage("");

        if (adminId === "" || listerId === "") {
            setMessage("Admin ID and Lister ID are required");
            return;
        }

        try {
            await axios.post(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/admin/assign-lister",
                {
                    adminId: Number(adminId),
                    listerId: Number(listerId)
                }
            );

            alert("Lister assigned successfully");

            setListerId("");

            getAssignedListers();
        } catch (error: any) {
            console.error(error);

            if (error.response?.data?.message) {
                setMessage(error.response.data.message);
            } else {
                setMessage("Failed to assign lister");
            }
        }
    };

    const getAssignedListers = async () => {
        setMessage("");

        if (adminId === "") {
            setMessage("Admin ID is required");
            return;
        }

        try {
            const response = await axios.get(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/admin/" +
                adminId +
                "/listers"
            );

            setListers(response.data);
        } catch (error) {
            console.error(error);
            setMessage("Failed to load assigned listers");
        }
    };

    const removeLister = async (id: number) => {
        const confirmRemove = window.confirm(
            "Are you sure you want to remove this lister?"
        );

        if (!confirmRemove) {
            return;
        }

        try {
            await axios.delete(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/admin/remove-lister/" +
                id
            );

            alert("Lister removed successfully");

            getAssignedListers();
        } catch (error) {
            console.error(error);
            setMessage("Failed to remove lister");
        }
    };

    return (
        <div data-theme="valentine" className="min-h-screen bg-[#fff7f2]">
            <AdminNavigation />

            <div className="max-w-5xl mx-auto px-6 py-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Admin Lister Management
                </h1>
                <p className="text-gray-500 mt-1 mb-5">
                    Assign and manage listers
                </p>

                {message && (
                    <div className="alert alert-error mb-5">
                        <span>{message}</span>
                    </div>
                )}

                <div className="card bg-[#fffaf2] text-black shadow-md mb-6">
                    <div className="card-body">
                        <h2 className="card-title">
                            Assign Lister
                        </h2>

                        <form onSubmit={assignLister}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 font-medium">
                                        Admin ID
                                    </label>
                                    <input
                                        className="input input-bordered bg-white w-full"
                                        type="number"
                                        value={adminId}
                                        onChange={(e) => setAdminId(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 font-medium">
                                        Lister ID
                                    </label>
                                    <input
                                        className="input input-bordered bg-white w-full"
                                        type="number"
                                        value={listerId}
                                        onChange={(e) => setListerId(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-sm"
                                >
                                    Assign Lister
                                </button>

                                <button
                                    type="button"
                                    onClick={getAssignedListers}
                                    className="btn btn-outline btn-primary btn-sm"
                                >
                                    View Assigned Listers
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Assigned Listers
                </h2>

                {listers.length > 0 ? (
                    <div className="card bg-[#fffaf2] text-black shadow-md">
                        <div className="card-body">
                            <div className="overflow-x-auto">
                                <table className="table text-black">
                                    <thead>
                                        <tr className="text-black">
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Full Name</th>
                                            <th>Username</th>
                                            <th>Email</th>
                                            <th>NID</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {listers.map((lister) => (
                                            <tr key={lister.id}>
                                                <td>{lister.id}</td>
                                                <td>{lister.name}</td>
                                                <td>{lister.fullName}</td>
                                                <td>{lister.username}</td>
                                                <td>{lister.email}</td>
                                                <td>{lister.nid}</td>
                                                <td>
                                                    <button
                                                        onClick={() => removeLister(lister.id)}
                                                        className="btn btn-error btn-sm"
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="card bg-[#fffaf2] text-black shadow-md">
                        <div className="card-body text-center">
                            <p className="text-gray-500">
                                No assigned listers found
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}