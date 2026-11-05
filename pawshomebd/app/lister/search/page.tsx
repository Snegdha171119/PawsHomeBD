"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import ListerNavigation from "@/components/listerNavigation";

type Lister = {
    id: number;
    username: string;
    fullName: string;
    email: string;
    status: string;
};

export default function ListerSearchPage() {
    const router = useRouter();

    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [listers, setListers] = useState<Lister[]>([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("lister_token");

        if (!token) {
            router.push("/lister/login");
        }
    }, []);

    // partial match on full name, can return many listers
    const searchByFullName = async (e: React.FormEvent) => {
        e.preventDefault();

        setMessage("");

        if (fullName.trim() === "") {
            setMessage("Please enter a full name to search");
            return;
        }

        try {
            const response = await axios.get(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/lister/searchbyfullname/" +
                fullName
            );

            setListers(response.data);

            if (response.data.length === 0) {
                setMessage("No lister matched this name");
            }
        } catch (error) {
            console.error(error);
            setMessage("Search failed");
        }
    };

    // exact username, returns one lister
    const searchByUsername = async (e: React.FormEvent) => {
        e.preventDefault();

        setMessage("");

        if (username.trim() === "") {
            setMessage("Please enter a username to search");
            return;
        }

        try {
            const response = await axios.get(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/lister/byusername/" +
                username
            );

            setListers([response.data]);
        } catch (error) {
            console.error(error);
            setListers([]);
            setMessage("No lister found with this username");
        }
    };

    const deleteByUsername = async (name: string) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete " + name + "?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            const token = localStorage.getItem("lister_token");

            await axios.delete(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/lister/removebyusername/" +
                name,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Lister deleted successfully");

            setListers(listers.filter((lister) => lister.username !== name));
        } catch (error) {
            console.error(error);
            setMessage("Failed to delete lister");
        }
    };

    return (
        <div data-theme="valentine" className="min-h-screen bg-[#fff7f2]">
            <ListerNavigation />

            <div className="max-w-5xl mx-auto px-6 py-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Search Listers
                </h1>
                <p className="text-gray-500 mt-1 mb-5">
                    Find a lister by full name or username
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                    <div className="card bg-[#fffaf2] text-black shadow-md">
                        <div className="card-body">
                            <h2 className="card-title">By Full Name</h2>
                            <form onSubmit={searchByFullName} className="flex gap-3">
                                <input
                                    className="input input-bordered bg-white w-full"
                                    type="text"
                                    placeholder="Type part of a name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                                <button type="submit" className="btn btn-primary">
                                    Search
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="card bg-[#fffaf2] text-black shadow-md">
                        <div className="card-body">
                            <h2 className="card-title">By Username</h2>
                            <form onSubmit={searchByUsername} className="flex gap-3">
                                <input
                                    className="input input-bordered bg-white w-full"
                                    type="text"
                                    placeholder="Exact username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                                <button type="submit" className="btn btn-primary">
                                    Search
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {message && (
                    <div className="alert alert-info mb-5">
                        <span>{message}</span>
                    </div>
                )}

                {listers.length > 0 && (
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
                                                <td>{lister.fullName}</td>
                                                <td>{lister.email}</td>
                                                <td>
                                                    <span className="badge badge-primary">{lister.status}</span>
                                                </td>
                                                <td className="flex gap-2">
                                                    <Link
                                                        href={"/lister/listers/" + lister.id}
                                                        className="btn btn-primary btn-sm"
                                                    >
                                                        View
                                                    </Link>
                                                    <button
                                                        onClick={() => deleteByUsername(lister.username)}
                                                        className="btn btn-error btn-sm"
                                                    >
                                                        Delete
                                                    </button>
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
