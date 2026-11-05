"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import AdminNavigation from "@/components/adminNavigation";

type Pet = {
    id: number;
    name: string;
    species: string;
    breed: string;
    age: number;
    gender: string;
    description: string;
    image: string;
};

export default function AdminPendingPetsPage() {
    const router = useRouter();

    const [species, setSpecies] = useState("");
    const [pets, setPets] = useState<Pet[]>([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("access_token");

        if (!token) {
            router.push("/login");
            return;
        }

        getPendingPets();
    }, []);

    // species is optional, empty means all pending pets
    const getPendingPets = async () => {
        setMessage("");

        try {
            const response = await axios.get(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/admin/getpendingpets?species=" +
                species
            );

            setPets(response.data);
        } catch (error) {
            console.error(error);
            setMessage("Failed to load pending pets");
        }
    };

    const changePetStatus = async (id: number, status: string) => {
        try {
            const token = localStorage.getItem("access_token");

            await axios.patch(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/admin/changepetstatus/" +
                id,
                {
                    status: status
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Pet " + status + " successfully");

            getPendingPets();
        } catch (error) {
            console.error(error);
            setMessage("Failed to change pet status");
        }
    };

    return (
        <div data-theme="valentine" className="min-h-screen bg-[#fff7f2]">
            <AdminNavigation />

            <div className="max-w-6xl mx-auto px-6 py-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Pending Pets
                </h1>
                <p className="text-gray-500 mt-1 mb-5">
                    Approve pets before adopters can see them
                </p>

                {message && (
                    <div className="alert alert-error mb-5">
                        <span>{message}</span>
                    </div>
                )}

                <div className="card bg-[#fffaf2] text-black shadow-md mb-6">
                    <div className="card-body">
                        <div className="flex gap-3">
                            <input
                                className="input input-bordered bg-white w-full"
                                type="text"
                                placeholder="Filter by species (dog, cat...)"
                                value={species}
                                onChange={(e) => setSpecies(e.target.value)}
                            />

                            <button onClick={getPendingPets} className="btn btn-primary">
                                Filter
                            </button>
                        </div>
                    </div>
                </div>

                {pets.length > 0 ? (
                    <div className="card bg-[#fffaf2] text-black shadow-md">
                        <div className="card-body">
                            <div className="overflow-x-auto">
                                <table className="table text-black">
                                    <thead>
                                        <tr className="text-black">
                                            <th>Photo</th>
                                            <th>Name</th>
                                            <th>Species</th>
                                            <th>Breed</th>
                                            <th>Age</th>
                                            <th>Gender</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {pets.map((pet) => (
                                            <tr key={pet.id}>
                                                <td>
                                                    {pet.image ? (
                                                        <img
                                                            src={process.env.NEXT_PUBLIC_API_ENDPOINT + "/lister/getimage/" + pet.image}
                                                            alt={pet.name}
                                                            className="w-14 h-14 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-2xl">🐾</span>
                                                    )}
                                                </td>
                                                <td>{pet.name}</td>
                                                <td>{pet.species}</td>
                                                <td>{pet.breed}</td>
                                                <td>{pet.age}</td>
                                                <td>{pet.gender}</td>
                                                <td className="flex gap-2">
                                                    <button
                                                        onClick={() => changePetStatus(pet.id, "approved")}
                                                        className="btn btn-success btn-sm"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => changePetStatus(pet.id, "rejected")}
                                                        className="btn btn-error btn-sm"
                                                    >
                                                        Reject
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
                            <p className="text-gray-500">No pending pets</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
