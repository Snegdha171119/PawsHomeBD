"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { z } from "zod";
import ListerNavigation from "@/components/listerNavigation";

type Pet = {
    id: number;
    name: string;
    species: string;
    breed: string;
    age: number;
    gender: string;
    status: string;
    image: string;
};

// same rules as PetDTO and the upload filter in the backend
const petSchema = z.object({
    name: z.string().min(1, "Pet name is required"),
    species: z.string().min(1, "Species is required"),
    breed: z.string(),
    age: z.number().int("Age must be a whole number").min(0, "Age cannot be negative").optional(),
    gender: z.string().regex(/^(male|female)$/, "Please select a gender"),
    description: z.string(),
    image: z.custom<File>((value) => value instanceof File, "Please choose a pet photo")
        .refine((file) => /\.(jpg|jpeg|png|webp)$/i.test(file.name), "Only jpg, jpeg, png or webp images are allowed")
        .refine((file) => file.size <= 2000000, "Image must be 2 MB or smaller"),
});

export default function ListerPetsPage() {
    const router = useRouter();

    const [pets, setPets] = useState<Pet[]>([]);

    const [name, setName] = useState("");
    const [species, setSpecies] = useState("");
    const [breed, setBreed] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<File | null>(null);

    const [formErrors, setFormErrors] = useState<string[]>([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("lister_token");

        if (!token) {
            router.push("/lister/login");
            return;
        }

        getMyPets();
    }, []);

    const getMyPets = async () => {
        try {
            const token = localStorage.getItem("lister_token");

            const response = await axios.get(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/lister/getmypets",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setPets(response.data);
        } catch (error) {
            console.error(error);
            setMessage("Failed to load pets");
        }
    };

    const addPet = async (e: React.FormEvent) => {
        e.preventDefault();

        setFormErrors([]);
        setMessage("");

        const result = petSchema.safeParse({
            name,
            species,
            breed,
            // empty age means "unknown", not 0
            age: age === "" ? undefined : Number(age),
            gender,
            description,
            image
        });

        if (!result.success) {
            setFormErrors(result.error.issues.map((issue) => issue.message));
            return;
        }

        // a file can't go as JSON, so send everything as form-data
        const formData = new FormData();
        formData.append("name", result.data.name);
        formData.append("species", result.data.species);
        formData.append("breed", result.data.breed);
        if (result.data.age !== undefined) {
            formData.append("age", String(result.data.age));
        }
        formData.append("gender", result.data.gender);
        formData.append("description", result.data.description);
        formData.append("image", result.data.image);

        try {
            const token = localStorage.getItem("lister_token");

            const response = await axios.post(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/lister/addpet",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert(response.data.message);

            // clear the form for the next pet (reset() also empties the file input)
            (e.target as HTMLFormElement).reset();
            setName("");
            setSpecies("");
            setBreed("");
            setAge("");
            setGender("");
            setDescription("");
            setImage(null);

            getMyPets();
        } catch (error: any) {
            console.error(error);

            if (Array.isArray(error.response?.data?.message)) {
                setMessage(error.response.data.message[0]);
            } else {
                setMessage(error.response?.data?.message || "Failed to add pet");
            }
        }
    };

    const removePet = async (id: number) => {
        const confirmRemove = window.confirm(
            "Are you sure you want to remove this pet?"
        );

        if (!confirmRemove) {
            return;
        }

        try {
            const token = localStorage.getItem("lister_token");

            await axios.delete(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/lister/removepet/" +
                id,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Pet removed successfully");

            getMyPets();
        } catch (error) {
            console.error(error);
            setMessage("Failed to remove pet");
        }
    };

    return (
        <div data-theme="valentine" className="min-h-screen bg-[#fff7f2]">
            <ListerNavigation />

            <div className="max-w-5xl mx-auto px-6 py-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    My Pets
                </h1>
                <p className="text-gray-500 mt-1 mb-5">
                    New pets stay pending until an admin approves them
                </p>

                {message && (
                    <div className="alert alert-error mb-5">
                        <span>{message}</span>
                    </div>
                )}

                <div className="card bg-[#fffaf2] text-black shadow-md mb-6">
                    <div className="card-body">
                        <h2 className="card-title">Add a Pet</h2>

                        {formErrors.length > 0 && (
                            <div className="text-error text-sm">
                                {formErrors.map((err) => (
                                    <p key={err}>{err}</p>
                                ))}
                            </div>
                        )}

                        <form onSubmit={addPet} noValidate>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block mb-1 font-medium">Name</label>
                                    <input
                                        className="input input-bordered bg-white w-full"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 font-medium">Species</label>
                                    <input
                                        className="input input-bordered bg-white w-full"
                                        type="text"
                                        placeholder="dog, cat, bird..."
                                        value={species}
                                        onChange={(e) => setSpecies(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 font-medium">Breed</label>
                                    <input
                                        className="input input-bordered bg-white w-full"
                                        type="text"
                                        value={breed}
                                        onChange={(e) => setBreed(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 font-medium">Age (years)</label>
                                    <input
                                        className="input input-bordered bg-white w-full"
                                        type="number"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 font-medium">Gender</label>
                                    <select
                                        className="select select-bordered bg-white w-full"
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                    >
                                        <option value="">Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block mb-1 font-medium">Description</label>
                                    <input
                                        className="input input-bordered bg-white w-full"
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>

                                <div className="md:col-span-3">
                                    <label className="block mb-1 font-medium">Pet Photo</label>
                                    <input
                                        className="file-input file-input-bordered file-input-primary bg-white w-full"
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.webp"
                                        onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">jpg, jpeg, png or webp, up to 2 MB</p>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary btn-sm mt-4">
                                Add Pet
                            </button>
                        </form>
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
                                            <th>Status</th>
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
                                                <td>
                                                    <span className="badge badge-primary">{pet.status}</span>
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => removePet(pet.id)}
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
                            <p className="text-gray-500">You have not added any pets yet</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
