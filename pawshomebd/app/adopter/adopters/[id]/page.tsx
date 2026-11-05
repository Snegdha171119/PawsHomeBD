"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import AdopterNavigation from "@/components/adopterNavigation";
import ProfilePhoto from "@/components/profilePhoto";
import PhotoUpload from "@/components/photoUpload";

type Adopter = {
    id: number;
    name: string;
    email: string;
    phone: string;
    status: string;
    profileImage: string;
};

export default function AdopterDetailsPage() {
    const params = useParams();
    const router = useRouter();

    const [adopter, setAdopter] = useState<Adopter | null>(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("adopter_token");

        if (!token) {
            router.push("/adopter/login");
            return;
        }

        getAdopterById();
    }, []);

    const getAdopterById = async () => {
        try {
            const response = await axios.get(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/adopter/getadopterbyid/" +
                params.id
            );

            setAdopter(response.data);
        } catch (error) {
            console.error(error);
            setError("Adopter not found");
        }
    };

    // toggle active <-> inactive
    const changeStatus = async () => {
        if (!adopter) {
            return;
        }

        try {
            const token = localStorage.getItem("adopter_token");

            const newStatus = adopter.status === "active" ? "inactive" : "active";

            await axios.patch(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/adopter/changestatus/" +
                params.id,
                {
                    status: newStatus
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Adopter status changed successfully");

            getAdopterById();
        } catch (error) {
            console.error(error);
            setError("Failed to change status");
        }
    };

    const sendWelcomeEmail = async () => {
        if (!adopter) {
            return;
        }

        try {
            const token = localStorage.getItem("adopter_token");

            const response = await axios.post(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/adopter/send-welcome-email",
                {
                    email: adopter.email,
                    name: adopter.name
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessage(response.data.message);
        } catch (error) {
            console.error(error);
            setError("Failed to send welcome email");
        }
    };

    const deleteAdopter = async () => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this adopter?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            const token = localStorage.getItem("adopter_token");

            await axios.delete(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/adopter/remove/" +
                params.id,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Adopter deleted successfully");

            router.push("/adopter/adopters");
        } catch (error) {
            console.error(error);
            setError("Failed to delete adopter");
        }
    };

    return (
        <div data-theme="valentine" className="min-h-screen bg-[#fff7f2]">
            <AdopterNavigation />

            <div className="max-w-3xl mx-auto px-6 py-8">
                <div className="card bg-[#fffaf2] text-black shadow-md">
                    <div className="card-body">
                        <h1 className="card-title text-3xl">
                            Adopter Details
                        </h1>

                        {error && (
                            <div className="alert alert-error mt-2">
                                <span>{error}</span>
                            </div>
                        )}

                        {message && (
                            <div className="alert alert-success mt-2">
                                <span>{message}</span>
                            </div>
                        )}

                        {adopter ? (
                            <div className="mt-3">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-5">
                                    <ProfilePhoto
                                        src={adopter.profileImage ? process.env.NEXT_PUBLIC_API_ENDPOINT + "/adopter/getimage/" + adopter.profileImage : undefined}
                                        name={adopter.name}
                                        size="lg"
                                    />
                                    <PhotoUpload
                                        uploadPath={"/adopter/uploadphoto/" + adopter.id}
                                        tokenKey="adopter_token"
                                        onUploaded={getAdopterById}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <p><span className="font-semibold">ID:</span> {adopter.id}</p>
                                    <p><span className="font-semibold">Name:</span> {adopter.name}</p>
                                    <p><span className="font-semibold">Email:</span> {adopter.email}</p>
                                    <p><span className="font-semibold">Phone:</span> {adopter.phone}</p>
                                    <p>
                                        <span className="font-semibold">Status:</span>{" "}
                                        <span className="badge badge-primary">
                                            {adopter.status}
                                        </span>
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3 mt-5">
                                    <Link
                                        href={"/adopter/adopters/" + adopter.id + "/edit"}
                                        className="btn btn-primary btn-sm"
                                    >
                                        Update Adopter
                                    </Link>

                                    <button
                                        onClick={sendWelcomeEmail}
                                        className="btn btn-outline btn-primary btn-sm"
                                    >
                                        Send Welcome Email
                                    </button>

                                    <button
                                        onClick={changeStatus}
                                        className="btn btn-warning btn-sm"
                                    >
                                        {adopter.status === "active"
                                            ? "Make Inactive"
                                            : "Make Active"}
                                    </button>

                                    <button
                                        onClick={deleteAdopter}
                                        className="btn btn-error btn-sm"
                                    >
                                        Delete Adopter
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
