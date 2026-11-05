"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import AdopterNavigation from "@/components/adopterNavigation";

type Lister = {
    id: number;
    name: string;
    fullName: string;
    email: string;
    username: string;
    status: string;
};

export default function AdopterListerPage() {
    const router = useRouter();

    const [adopterId, setAdopterId] = useState("");
    const [listerId, setListerId] = useState("");
    const [lister, setLister] = useState<Lister | null>(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("adopter_token");

        if (!token) {
            router.push("/adopter/login");
            return;
        }

        // start with the logged in adopter's own id
        const payload = JSON.parse(atob(token.split(".")[1]));
        setAdopterId(String(payload.id));
    }, []);

    const assignLister = async (e: React.FormEvent) => {
        e.preventDefault();

        setMessage("");

        if (adopterId === "" || listerId === "") {
            setMessage("Adopter ID and Lister ID are required");
            return;
        }

        try {
            const token = localStorage.getItem("adopter_token");

            await axios.post(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/adopter/assign-lister",
                {
                    adopterId: Number(adopterId),
                    listerId: Number(listerId)
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Lister assigned successfully");

            getAssignedLister();
        } catch (error: any) {
            console.error(error);
            setMessage(error.response?.data?.message || "Failed to assign lister");
        }
    };

    const getAssignedLister = async () => {
        setMessage("");

        if (adopterId === "") {
            setMessage("Adopter ID is required");
            return;
        }

        try {
            const token = localStorage.getItem("adopter_token");

            const response = await axios.get(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/adopter/" +
                adopterId +
                "/lister",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setLister(response.data);
        } catch (error: any) {
            console.error(error);
            setLister(null);
            setMessage(error.response?.data?.message || "Failed to load assigned lister");
        }
    };

    const removeLister = async () => {
        const confirmRemove = window.confirm(
            "Are you sure you want to remove this lister?"
        );

        if (!confirmRemove) {
            return;
        }

        try {
            const token = localStorage.getItem("adopter_token");

            await axios.delete(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/adopter/remove-lister/" +
                adopterId,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Lister removed successfully");

            setLister(null);
        } catch (error) {
            console.error(error);
            setMessage("Failed to remove lister");
        }
    };

    return (
        <div data-theme="valentine" className="min-h-screen bg-[#fff7f2]">
            <AdopterNavigation />

            <div className="max-w-5xl mx-auto px-6 py-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    My Lister
                </h1>
                <p className="text-gray-500 mt-1 mb-5">
                    Assign the pet lister you are adopting from
                </p>

                {message && (
                    <div className="alert alert-error mb-5">
                        <span>{message}</span>
                    </div>
                )}

                <div className="card bg-[#fffaf2] text-black shadow-md mb-6">
                    <div className="card-body">
                        <h2 className="card-title">Assign Lister</h2>

                        <form onSubmit={assignLister}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 font-medium">Adopter ID</label>
                                    <input
                                        className="input input-bordered bg-white w-full"
                                        type="number"
                                        value={adopterId}
                                        onChange={(e) => setAdopterId(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 font-medium">Lister ID</label>
                                    <input
                                        className="input input-bordered bg-white w-full"
                                        type="number"
                                        value={listerId}
                                        onChange={(e) => setListerId(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button type="submit" className="btn btn-primary btn-sm">
                                    Assign Lister
                                </button>

                                <button
                                    type="button"
                                    onClick={getAssignedLister}
                                    className="btn btn-outline btn-primary btn-sm"
                                >
                                    View Assigned Lister
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {lister && (
                    <div className="card bg-[#fffaf2] text-black shadow-md">
                        <div className="card-body">
                            <h2 className="card-title">Assigned Lister</h2>
                            <p><span className="font-semibold">ID:</span> {lister.id}</p>
                            <p><span className="font-semibold">Name:</span> {lister.fullName}</p>
                            <p><span className="font-semibold">Email:</span> {lister.email}</p>
                            <p><span className="font-semibold">Username:</span> {lister.username}</p>
                            <p><span className="font-semibold">Status:</span> {lister.status}</p>

                            <button onClick={removeLister} className="btn btn-error btn-sm w-fit mt-3">
                                Remove Lister
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
