"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import AdopterNavigation from "@/components/adopterNavigation";

type Vet = {
    id: number;
    name: string;
    fullName: string;
    email: string;
    phone: string;
    status: string;
};

export default function AdopterVetPage() {
    const router = useRouter();

    const [adopterId, setAdopterId] = useState("");
    const [vetId, setVetId] = useState("");
    const [vet, setVet] = useState<Vet | null>(null);
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

    const assignVet = async (e: React.FormEvent) => {
        e.preventDefault();

        setMessage("");

        if (adopterId === "" || vetId === "") {
            setMessage("Adopter ID and Vet ID are required");
            return;
        }

        try {
            const token = localStorage.getItem("adopter_token");

            await axios.post(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/adopter/assign-vet",
                {
                    adopterId: Number(adopterId),
                    vetId: Number(vetId)
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Vet assigned successfully");

            getAssignedVet();
        } catch (error: any) {
            console.error(error);
            setMessage(error.response?.data?.message || "Failed to assign vet");
        }
    };

    const getAssignedVet = async () => {
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
                "/vet",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setVet(response.data);
        } catch (error: any) {
            console.error(error);
            setVet(null);
            setMessage(error.response?.data?.message || "Failed to load assigned vet");
        }
    };

    const removeVet = async () => {
        const confirmRemove = window.confirm(
            "Are you sure you want to remove this vet?"
        );

        if (!confirmRemove) {
            return;
        }

        try {
            const token = localStorage.getItem("adopter_token");

            await axios.delete(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/adopter/remove-vet/" +
                adopterId,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Vet removed successfully");

            setVet(null);
        } catch (error) {
            console.error(error);
            setMessage("Failed to remove vet");
        }
    };

    return (
        <div data-theme="valentine" className="min-h-screen bg-[#fff7f2]">
            <AdopterNavigation />

            <div className="max-w-5xl mx-auto px-6 py-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    My Vet
                </h1>
                <p className="text-gray-500 mt-1 mb-5">
                    Assign a vet to look after your pet
                </p>

                {message && (
                    <div className="alert alert-error mb-5">
                        <span>{message}</span>
                    </div>
                )}

                <div className="card bg-[#fffaf2] text-black shadow-md mb-6">
                    <div className="card-body">
                        <h2 className="card-title">Assign Vet</h2>

                        <form onSubmit={assignVet}>
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
                                    <label className="block mb-1 font-medium">Vet ID</label>
                                    <input
                                        className="input input-bordered bg-white w-full"
                                        type="number"
                                        value={vetId}
                                        onChange={(e) => setVetId(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button type="submit" className="btn btn-primary btn-sm">
                                    Assign Vet
                                </button>

                                <button
                                    type="button"
                                    onClick={getAssignedVet}
                                    className="btn btn-outline btn-primary btn-sm"
                                >
                                    View Assigned Vet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {vet && (
                    <div className="card bg-[#fffaf2] text-black shadow-md">
                        <div className="card-body">
                            <h2 className="card-title">Assigned Vet</h2>
                            <p><span className="font-semibold">ID:</span> {vet.id}</p>
                            <p><span className="font-semibold">Name:</span> {vet.fullName}</p>
                            <p><span className="font-semibold">Email:</span> {vet.email}</p>
                            <p><span className="font-semibold">Phone:</span> {vet.phone}</p>
                            <p><span className="font-semibold">Status:</span> {vet.status}</p>

                            <button onClick={removeVet} className="btn btn-error btn-sm w-fit mt-3">
                                Remove Vet
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
