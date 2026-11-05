"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import VetNavigation from "@/components/vetNavigation";

type Vet = {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    status: string;
};

export default function VetSearchPage() {
    const [name, setName] = useState("");
    const [vets, setVets] = useState<Vet[]>([]);
    const [message, setMessage] = useState("");

    // search is CSR because the result changes with every input
    const searchVets = async (e: React.FormEvent) => {
        e.preventDefault();

        setMessage("");

        if (name.trim() === "") {
            setMessage("Please enter a name to search");
            return;
        }

        try {
            const response = await axios.get(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/vet/searchbyname/" +
                name
            );

            setVets(response.data);

            if (response.data.length === 0) {
                setMessage("No vet matched this name");
            }
        } catch (error) {
            console.error(error);
            setMessage("Search failed");
        }
    };

    return (
        <div data-theme="valentine" className="min-h-screen bg-[#fff7f2]">
            <VetNavigation />

            <div className="max-w-5xl mx-auto px-6 py-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Search Vets
                </h1>
                <p className="text-gray-500 mt-1 mb-5">
                    Find a vet by full name
                </p>

                <div className="card bg-[#fffaf2] text-black shadow-md mb-6">
                    <div className="card-body">
                        <form onSubmit={searchVets} className="flex gap-3">
                            <input
                                className="input input-bordered bg-white w-full"
                                type="text"
                                placeholder="Type part of a name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />

                            <button type="submit" className="btn btn-primary">
                                Search
                            </button>
                        </form>
                    </div>
                </div>

                {message && (
                    <div className="alert alert-info mb-5">
                        <span>{message}</span>
                    </div>
                )}

                {vets.length > 0 && (
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
                                                <td>{vet.fullName}</td>
                                                <td>{vet.email}</td>
                                                <td>{vet.phone}</td>
                                                <td>
                                                    <span className="badge badge-primary">{vet.status}</span>
                                                </td>
                                                <td>
                                                    <Link
                                                        href={"/vet/vets/" + vet.id}
                                                        className="btn btn-primary btn-sm"
                                                    >
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
