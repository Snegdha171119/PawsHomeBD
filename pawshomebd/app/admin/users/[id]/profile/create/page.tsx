"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { z } from "zod";
import AdminNavigation from "@/components/adminNavigation";

const profileSchema = z.object({
    address: z.string().min(1, "Address is required"),
    designation: z.string().min(1, "Designation is required"),
    bio: z.string().optional(),
    qualification: z.string().min(1, "Qualification is required")
});

export default function CreateAdminProfile() {
    const params = useParams();
    const router = useRouter();

    const [address, setAddress] = useState("");
    const [designation, setDesignation] = useState("");
    const [bio, setBio] = useState("");
    const [qualification, setQualification] = useState("");

    const [addressError, setAddressError] = useState("");
    const [designationError, setDesignationError] = useState("");
    const [qualificationError, setQualificationError] = useState("");
    const [message, setMessage] = useState("");

    const createProfile = async (e: React.FormEvent) => {
        e.preventDefault();

        setAddressError("");
        setDesignationError("");
        setQualificationError("");
        setMessage("");

        const result = profileSchema.safeParse({
            address,
            designation,
            bio,
            qualification
        });

        if (!result.success) {
            result.error.issues.forEach((issue) => {
                const field = issue.path[0];

                if (field === "address") setAddressError(issue.message);
                if (field === "designation") setDesignationError(issue.message);
                if (field === "qualification") setQualificationError(issue.message);
            });

            return;
        }

        try {
            const token = localStorage.getItem("access_token");

            const profileData = {
                address,
                designation,
                bio,
                qualification
            };

            await axios.post(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/admin/" +
                params.id +
                "/profile",
                profileData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Profile created successfully");

            router.push("/admin/users/" + params.id + "/profile");
        } catch (error) {
            console.error(error);
            setMessage("Failed to create profile");
        }
    };

    return (
        <div data-theme="valentine" className="min-h-screen bg-[#fff7f2]">
            <AdminNavigation />

            <div className="max-w-2xl mx-auto px-6 py-8">
                <div className="card bg-[#fffaf2] text-black shadow-md">
                    <div className="card-body">
                        <h1 className="card-title text-3xl">
                            Create Admin Profile
                        </h1>

                        <p className="text-gray-500 mb-3">
                            Add profile information for this admin
                        </p>

                        {message && (
                            <div className="alert alert-error mb-3">
                                <span>{message}</span>
                            </div>
                        )}

                        <form onSubmit={createProfile}>
                            <div className="mb-3">
                                <label className="block mb-1 font-medium">
                                    Address
                                </label>
                                <input
                                    className="input input-bordered bg-white w-full"
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                                {addressError && (
                                    <p className="text-error text-xs mt-1">
                                        {addressError}
                                    </p>
                                )}
                            </div>

                            <div className="mb-3">
                                <label className="block mb-1 font-medium">
                                    Designation
                                </label>
                                <input
                                    className="input input-bordered bg-white w-full"
                                    type="text"
                                    value={designation}
                                    onChange={(e) => setDesignation(e.target.value)}
                                />
                                {designationError && (
                                    <p className="text-error text-xs mt-1">
                                        {designationError}
                                    </p>
                                )}
                            </div>

                            <div className="mb-3">
                                <label className="block mb-1 font-medium">
                                    Bio
                                </label>
                                <textarea
                                    className="textarea textarea-bordered bg-white w-full"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block mb-1 font-medium">
                                    Qualification
                                </label>
                                <input
                                    className="input input-bordered bg-white w-full"
                                    type="text"
                                    value={qualification}
                                    onChange={(e) => setQualification(e.target.value)}
                                />
                                {qualificationError && (
                                    <p className="text-error text-xs mt-1">
                                        {qualificationError}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                            >
                                Create Profile
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}