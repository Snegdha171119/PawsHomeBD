"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import ListerNavigation from "@/components/listerNavigation";
import ProfilePhoto from "@/components/profilePhoto";
import PhotoUpload from "@/components/photoUpload";

type Lister = {
    id: number;
    username: string;
    fullName: string;
    name: string;
    email: string;
    nid: string;
    status: string;
    profileImage: string;
};

export default function ListerDetailsPage() {
    const params = useParams();
    const router = useRouter();

    const [lister, setLister] = useState<Lister | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("lister_token");

        if (!token) {
            router.push("/lister/login");
            return;
        }

        getListerById();
    }, []);

    const getListerById = async () => {
        try {
            const response = await axios.get(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/lister/getlisterbyid/" +
                params.id
            );

            setLister(response.data);
        } catch (error) {
            console.error(error);
            setError("Lister not found");
        }
    };

    // toggle active <-> inactive
    const changeStatus = async () => {
        if (!lister) {
            return;
        }

        try {
            const token = localStorage.getItem("lister_token");

            const newStatus = lister.status === "active" ? "inactive" : "active";

            await axios.patch(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/lister/changestatus/" +
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

            alert("Lister status changed successfully");

            getListerById();
        } catch (error) {
            console.error(error);
            setError("Failed to change status");
        }
    };

    const deleteLister = async () => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this lister? Their pets will be removed too."
        );

        if (!confirmDelete) {
            return;
        }

        try {
            const token = localStorage.getItem("lister_token");

            await axios.delete(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/lister/remove/" +
                params.id,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Lister deleted successfully");

            router.push("/lister/listers");
        } catch (error) {
            console.error(error);
            setError("Failed to delete lister");
        }
    };

    return (
        <div data-theme="valentine" className="min-h-screen bg-[#fff7f2]">
            <ListerNavigation />

            <div className="max-w-3xl mx-auto px-6 py-8">
                <div className="card bg-[#fffaf2] text-black shadow-md">
                    <div className="card-body">
                        <h1 className="card-title text-3xl">
                            Lister Details
                        </h1>

                        {error && (
                            <div className="alert alert-error mt-2">
                                <span>{error}</span>
                            </div>
                        )}

                        {lister ? (
                            <div className="mt-3">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-5">
                                    <ProfilePhoto
                                        src={lister.profileImage ? process.env.NEXT_PUBLIC_API_ENDPOINT + "/lister/getimage/" + lister.profileImage : undefined}
                                        name={lister.fullName}
                                        size="lg"
                                    />
                                    <PhotoUpload
                                        uploadPath={"/lister/uploadphoto/" + lister.id}
                                        tokenKey="lister_token"
                                        onUploaded={getListerById}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <p><span className="font-semibold">ID:</span> {lister.id}</p>
                                    <p><span className="font-semibold">Username:</span> {lister.username}</p>
                                    <p><span className="font-semibold">Name:</span> {lister.name}</p>
                                    <p><span className="font-semibold">Full Name:</span> {lister.fullName}</p>
                                    <p><span className="font-semibold">Email:</span> {lister.email}</p>
                                    <p><span className="font-semibold">NID:</span> {lister.nid}</p>
                                    <p>
                                        <span className="font-semibold">Status:</span>{" "}
                                        <span className="badge badge-primary">
                                            {lister.status}
                                        </span>
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3 mt-5">
                                    <Link
                                        href={"/lister/listers/" + lister.id + "/edit"}
                                        className="btn btn-primary btn-sm"
                                    >
                                        Update Lister
                                    </Link>

                                    <button
                                        onClick={changeStatus}
                                        className="btn btn-warning btn-sm"
                                    >
                                        {lister.status === "active"
                                            ? "Make Inactive"
                                            : "Make Active"}
                                    </button>

                                    <button
                                        onClick={deleteLister}
                                        className="btn btn-error btn-sm"
                                    >
                                        Delete Lister
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
