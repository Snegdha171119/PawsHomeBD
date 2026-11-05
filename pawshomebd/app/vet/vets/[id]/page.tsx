"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import VetNavigation from "@/components/vetNavigation";
import ProfilePhoto from "@/components/profilePhoto";
import PhotoUpload from "@/components/photoUpload";

type Vet = {
    id: number;
    name: string;
    fullName: string;
    email: string;
    phone: string;
    status: string;
    profileImage: string;
};

export default function VetDetailsPage() {
    const params = useParams();
    const router = useRouter();

    const [vet, setVet] = useState<Vet | null>(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("vet_token");

        if (!token) {
            router.push("/vet/login");
            return;
        }

        getVetById();
    }, []);

    const getVetById = async () => {
        try {
            const response = await axios.get(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/vet/getvetbyid/" +
                params.id
            );

            setVet(response.data);
        } catch (error) {
            console.error(error);
            setError("Vet not found");
        }
    };

    // toggle active <-> inactive
    const changeStatus = async () => {
        if (!vet) {
            return;
        }

        try {
            const token = localStorage.getItem("vet_token");

            const newStatus = vet.status === "active" ? "inactive" : "active";

            await axios.patch(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/vet/changestatus/" +
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

            alert("Vet status changed successfully");

            getVetById();
        } catch (error) {
            console.error(error);
            setError("Failed to change status");
        }
    };

    const sendWelcomeEmail = async () => {
        if (!vet) {
            return;
        }

        try {
            const token = localStorage.getItem("vet_token");

            const response = await axios.post(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/vet/send-welcome-email",
                {
                    email: vet.email,
                    name: vet.fullName
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

    const deleteVet = async () => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this vet?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            const token = localStorage.getItem("vet_token");

            await axios.delete(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/vet/remove/" +
                params.id,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Vet deleted successfully");

            router.push("/vet/vets");
        } catch (error) {
            console.error(error);
            setError("Failed to delete vet");
        }
    };

    return (
        <div data-theme="valentine" className="min-h-screen bg-[#fff7f2]">
            <VetNavigation />

            <div className="max-w-3xl mx-auto px-6 py-8">
                <div className="card bg-[#fffaf2] text-black shadow-md">
                    <div className="card-body">
                        <h1 className="card-title text-3xl">
                            Vet Details
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

                        {vet ? (
                            <div className="mt-3">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-5">
                                    <ProfilePhoto
                                        src={vet.profileImage ? process.env.NEXT_PUBLIC_API_ENDPOINT + "/vet/getimage/" + vet.profileImage : undefined}
                                        name={vet.fullName}
                                        size="lg"
                                    />
                                    <PhotoUpload
                                        uploadPath={"/vet/uploadphoto/" + vet.id}
                                        tokenKey="vet_token"
                                        onUploaded={getVetById}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <p><span className="font-semibold">ID:</span> {vet.id}</p>
                                    <p><span className="font-semibold">Name:</span> {vet.name}</p>
                                    <p><span className="font-semibold">Full Name:</span> {vet.fullName}</p>
                                    <p><span className="font-semibold">Email:</span> {vet.email}</p>
                                    <p><span className="font-semibold">Phone:</span> {vet.phone}</p>
                                    <p>
                                        <span className="font-semibold">Status:</span>{" "}
                                        <span className="badge badge-primary">
                                            {vet.status}
                                        </span>
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3 mt-5">
                                    <Link
                                        href={"/vet/vets/" + vet.id + "/edit"}
                                        className="btn btn-primary btn-sm"
                                    >
                                        Update Vet
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
                                        {vet.status === "active"
                                            ? "Make Inactive"
                                            : "Make Active"}
                                    </button>

                                    <button
                                        onClick={deleteVet}
                                        className="btn btn-error btn-sm"
                                    >
                                        Delete Vet
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
