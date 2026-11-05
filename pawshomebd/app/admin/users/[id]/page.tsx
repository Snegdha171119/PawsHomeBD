"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import AdminNavigation from "@/components/adminNavigation";
import ProfilePhoto from "@/components/profilePhoto";
import PhotoUpload from "@/components/photoUpload";

type Admin = {
    id: number;
    fullName: string;
    email: string;
    gender: string;
    phone: string;
    age?: number;
    status: string;
    profileImage?: string;
};

export default function AdminDetailsPage() {
    const params = useParams();
    const router = useRouter();

    const [admin, setAdmin] = useState<Admin | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        getAdminById();
    }, []);

    const getAdminById = async () => {
        try {
            const response = await axios.get(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/admin/getuserbyid/" +
                params.id
            );

            setAdmin(response.data);
        } catch (error) {
            console.error(error);
            setError("Admin not found");
        }
    };

    const changeStatus = async () => {
        try {
            if (!admin) {
                return;
            }

            const token = localStorage.getItem("access_token");

            const newStatus =
                admin.status === "active" ? "inactive" : "active";

            await axios.patch(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/admin/changestatus/" +
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

            alert("Admin status changed successfully");

            getAdminById();
        } catch (error) {
            console.error(error);
            setError("Failed to change status");
        }
    };

    const deleteAdmin = async () => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this admin?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            const token = localStorage.getItem("access_token");

            await axios.delete(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/admin/deleteadmin/" +
                params.id,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Admin deleted successfully");

            router.push("/admin/users");
        } catch (error) {
            console.error(error);
            setError("Failed to delete admin");
        }
    };

    return (
        <div data-theme="valentine" className="min-h-screen bg-[#fff7f2]">
            <AdminNavigation />

            <div className="max-w-3xl mx-auto px-6 py-8">
                <div className="card bg-[#fffaf2] text-black shadow-md">
                    <div className="card-body">
                        <h1 className="card-title text-3xl">
                            Admin Details
                        </h1>

                        {error && (
                            <div className="alert alert-error mt-2">
                                <span>{error}</span>
                            </div>
                        )}

                        {admin ? (
                            <div className="mt-3">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-5">
                                    <ProfilePhoto
                                        src={admin.profileImage ? process.env.NEXT_PUBLIC_API_ENDPOINT + "/admin/getimage/" + admin.profileImage : undefined}
                                        name={admin.fullName}
                                        size="lg"
                                    />
                                    <PhotoUpload
                                        uploadPath={"/admin/uploadphoto/" + admin.id}
                                        tokenKey="access_token"
                                        onUploaded={getAdminById}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <p><span className="font-semibold">ID:</span> {admin.id}</p>
                                    <p><span className="font-semibold">Full Name:</span> {admin.fullName}</p>
                                    <p><span className="font-semibold">Email:</span> {admin.email}</p>
                                    <p><span className="font-semibold">Gender:</span> {admin.gender}</p>
                                    <p><span className="font-semibold">Phone:</span> {admin.phone}</p>
                                    {/* <p><span className="font-semibold">Age:</span> {admin.age}</p> */}
                                    <p>
                                        <span className="font-semibold">Status:</span>{" "}
                                        <span className="badge badge-primary">
                                            {admin.status}
                                        </span>
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3 mt-5">
                                    <Link
                                        href={"/admin/users/" + admin.id + "/edit"}
                                        className="btn btn-primary btn-sm"
                                    >
                                        Update Admin
                                    </Link>

                                    <Link
                                        href={"/admin/users/" + admin.id + "/profile/create"}
                                        className="btn btn-primary btn-sm"
                                    >
                                        Create Profile
                                    </Link>

                                    <Link
                                        href={"/admin/users/" + admin.id + "/profile"}
                                        className="btn btn-primary btn-sm"
                                    >
                                        View Profile
                                    </Link>

                                    <button
                                        onClick={changeStatus}
                                        className="btn btn-warning btn-sm"
                                    >
                                        {admin.status === "active"
                                            ? "Make Inactive"
                                            : "Make Active"}
                                    </button>

                                    <button
                                        onClick={deleteAdmin}
                                        className="btn btn-error btn-sm"
                                    >
                                        Delete Admin
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