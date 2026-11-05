"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import VetNavigation from "@/components/vetNavigation";

type Adopter = {
    id: number;
    name: string;
    email: string;
    phone: string;
    status: string;
};

export default function VetAdoptersPage() {
    const router = useRouter();

    const [vetId, setVetId] = useState("");
    const [adopterId, setAdopterId] = useState("");
    const [adopters, setAdopters] = useState<Adopter[]>([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("vet_token");

        if (!token) {
            router.push("/vet/login");
            return;
        }

        // start with the logged in vet's own id
        const payload = JSON.parse(atob(token.split(".")[1]));
        setVetId(String(payload.id));
    }, []);

    const assignAdopter = async (e: React.FormEvent) => {
        e.preventDefault();

        setMessage("");

        if (vetId === "" || adopterId === "") {
            setMessage("Vet ID and Adopter ID are required");
            return;
        }

        try {
            const token = localStorage.getItem("vet_token");

            await axios.post(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/vet/assign-adopter",
                {
                    vetId: Number(vetId),
                    adopterId: Number(adopterId)
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Adopter assigned successfully");

            setAdopterId("");

            getAssignedAdopters();
        } catch (error: any) {
            console.error(error);
            setMessage(error.response?.data?.message || "Failed to assign adopter");
        }
    };

    const getAssignedAdopters = async () => {
        setMessage("");

        if (vetId === "") {
            setMessage("Vet ID is required");
            return;
        }

        try {
            const token = localStorage.getItem("vet_token");

            const response = await axios.get(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/vet/" +
                vetId +
                "/adopters",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setAdopters(response.data);
        } catch (error: any) {
            console.error(error);
            setMessage(error.response?.data?.message || "Failed to load assigned adopters");
        }
    };

    const removeAdopter = async (id: number) => {
        const confirmRemove = window.confirm(
            "Are you sure you want to remove this adopter?"
        );

        if (!confirmRemove) {
            return;
        }

        try {
            const token = localStorage.getItem("vet_token");

            await axios.delete(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/vet/remove-adopter/" +
                id,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Adopter removed successfully");

            getAssignedAdopters();
        } catch (error) {
            console.error(error);
            setMessage("Failed to remove adopter");
        }
    };

    return (
        <div data-theme="valentine" className="min-h-screen bg-[#fff7f2]">
            <VetNavigation />

            <div className="max-w-5xl mx-auto px-6 py-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Vet Adopter Management
                </h1>
                <p className="text-gray-500 mt-1 mb-5">
                    Assign adopters to a vet for pet care
                </p>

                {message && (
                    <div className="alert alert-error mb-5">
                        <span>{message}</span>
                    </div>
                )}

                <div className="card bg-[#fffaf2] text-black shadow-md mb-6">
                    <div className="card-body">
                        <h2 className="card-title">Assign Adopter</h2>

                        <form onSubmit={assignAdopter}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 font-medium">Vet ID</label>
                                    <input
                                        className="input input-bordered bg-white w-full"
                                        type="number"
                                        value={vetId}
                                        onChange={(e) => setVetId(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 font-medium">Adopter ID</label>
                                    <input
                                        className="input input-bordered bg-white w-full"
                                        type="number"
                                        value={adopterId}
                                        onChange={(e) => setAdopterId(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button type="submit" className="btn btn-primary btn-sm">
                                    Assign Adopter
                                </button>

                                <button
                                    type="button"
                                    onClick={getAssignedAdopters}
                                    className="btn btn-outline btn-primary btn-sm"
                                >
                                    View Assigned Adopters
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Assigned Adopters
                </h2>

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
                                                <td>{adopter.name}</td>
                                                <td>{adopter.email}</td>
                                                <td>{adopter.phone}</td>
                                                <td>{adopter.status}</td>
                                                <td>
                                                    <button
                                                        onClick={() => removeAdopter(adopter.id)}
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
                            <p className="text-gray-500">No assigned adopters found</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
