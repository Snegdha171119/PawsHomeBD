"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import AdminNavigation from "@/components/adminNavigation";

type AdminProfile = {
    id: number;
    address: string;
    designation: string;
    bio?: string;
    qualification: string;
};

export default function AdminProfilePage() {
    const params = useParams();
    const router = useRouter();

    const [profile, setProfile] = useState<AdminProfile | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        getAdminProfile();
    }, []);

    const getAdminProfile = async () => {
        try {
            const token = localStorage.getItem("access_token");

            const response = await axios.get(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/admin/" +
                params.id +
                "/profile",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setProfile(response.data);
        } catch (error) {
            console.error(error);
            setError("Admin profile not found");
        }
    };

    const deleteProfile = async () => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this profile?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            const token = localStorage.getItem("access_token");

            await axios.delete(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/admin/" +
                params.id +
                "/profile",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Admin profile deleted successfully");

            router.push("/admin/users/" + params.id);
        } catch (error) {
            console.error(error);
            setError("Failed to delete profile");
        }
    };

    return (
        <div data-theme="valentine" className="min-h-screen bg-[#fff7f2]">
            <AdminNavigation />

            <div className="max-w-2xl mx-auto px-6 py-8">
                <div className="card bg-[#fffaf2] text-black shadow-md">
                    <div className="card-body">
                        <h1 className="card-title text-3xl">
                            Admin Profile
                        </h1>

                        {error && (
                            <div className="alert alert-error mt-2">
                                <span>{error}</span>
                            </div>
                        )}

                        {profile ? (
                            <div className="mt-3">
                                <div className="space-y-3">
                                    <p>
                                        <span className="font-semibold">Profile ID:</span>{" "}
                                        {profile.id}
                                    </p>

                                    <p>
                                        <span className="font-semibold">Address:</span>{" "}
                                        {profile.address}
                                    </p>

                                    <p>
                                        <span className="font-semibold">Designation:</span>{" "}
                                        {profile.designation}
                                    </p>

                                    <p>
                                        <span className="font-semibold">Bio:</span>{" "}
                                        {profile.bio || "-"}
                                    </p>

                                    <p>
                                        <span className="font-semibold">Qualification:</span>{" "}
                                        {profile.qualification}
                                    </p>
                                </div>

                                <div className="flex gap-3 mt-5">
                                    <Link
                                        href={"/admin/users/" + params.id}
                                        className="btn btn-primary"
                                    >
                                        Back
                                    </Link>

                                    <button
                                        onClick={deleteProfile}
                                        className="btn btn-error"
                                    >
                                        Delete Profile
                                    </button>
                                </div>
                            </div>
                        ) : (
                            !error && (
                                <div className="flex justify-center py-6">
                                    <span className="loading loading-spinner loading-md text-primary"></span>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}