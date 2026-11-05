"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import Pusher from "pusher-js";
import AdminNavigation from "@/components/adminNavigation";

type DashboardData = {
    totalUsers: number;
    totalPets: number;
    totalAdoptions: number;
    pendingApprovals: number;
    filterByRole: string;
};

export default function AdminDashboard() {
    const router = useRouter();
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [error, setError] = useState("");
    const [notification, setNotification] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            router.push("/login");
            return;
        }

        getDashboard();

        const pusher = new Pusher(
            process.env.NEXT_PUBLIC_PUSHER_KEY!,
            {
                cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
            }
        );

        const channel = pusher.subscribe("admin-channel");

        channel.bind(
            "new-admin",
            (data: { message: string; name: string }) => {
                setNotification(
                    data.message + ": " + data.name
                );
            }
        );

        // a lister added a pet, refresh the counts too
        channel.bind(
            "new-pet",
            (data: { message: string; name: string }) => {
                setNotification(
                    data.message + ": " + data.name
                );
                getDashboard();
            }
        );

        return () => {
            channel.unbind("new-pet");
            channel.unbind("new-admin");
            pusher.unsubscribe("admin-channel");
            pusher.disconnect();
        };
    }, []);

    const getDashboard = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const response = await axios.get(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/admin/dashboard?role=admin",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setDashboard(response.data);
        } catch (error) {
            console.error(error);
            setError("Failed to load dashboard");
        }
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        alert("Logout successful");
        router.push("/login");
    };

    return (
        <div data-theme="valentine" className="min-h-screen bg-[#fff7f2]">
            <AdminNavigation />
            <div className="max-w-6xl mx-auto px-6 py-10">
                {/* welcome banner */}
                <div className="hero bg-[#fbe4e8] rounded-box shadow-md mb-8">
                    <div className="hero-content w-full flex-col sm:flex-row sm:justify-between py-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                                Admin Dashboard 🛡️
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Manage your listers, users and pets
                            </p>
                        </div>
                        <button
                            onClick={logout}
                            className="btn btn-primary btn-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {notification && (
                    <div className="alert alert-success mb-6">
                        <span>{notification}</span>
                    </div>
                )}

                {error && (
                    <div className="alert alert-error mb-6">
                        <span>{error}</span>
                    </div>
                )}

                {dashboard ? (
                    <>
                        {/* numbers */}
                        <div className="stats stats-vertical md:stats-horizontal bg-[#fffaf2] shadow-md w-full">
                            <div className="stat">
                                <div className="stat-figure text-3xl">👥</div>
                                <div className="stat-title">Total Users</div>
                                <div className="stat-value text-primary">{dashboard.totalUsers}</div>
                                <div className="stat-desc">all four roles</div>
                            </div>

                            <div className="stat">
                                <div className="stat-figure text-3xl">🐾</div>
                                <div className="stat-title">Total Pets</div>
                                <div className="stat-value text-primary">{dashboard.totalPets}</div>
                                <div className="stat-desc">listed so far</div>
                            </div>

                            <div className="stat">
                                <div className="stat-figure text-3xl">🏠</div>
                                <div className="stat-title">Total Adoptions</div>
                                <div className="stat-value text-success">{dashboard.totalAdoptions}</div>
                                <div className="stat-desc">pets with a new home</div>
                            </div>

                            <div className="stat">
                                <div className="stat-figure text-3xl">⏳</div>
                                <div className="stat-title">Pending Approvals</div>
                                <div className="stat-value text-warning">{dashboard.pendingApprovals}</div>
                                <div className="stat-desc">waiting for you</div>
                            </div>
                        </div>

                        {/* quick links */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
                            <div className="card bg-[#fffaf2] shadow-md">
                                <div className="card-body">
                                    <h2 className="card-title text-gray-800">Pending Pets</h2>
                                    <p className="text-gray-500">Approve or reject new pets</p>
                                    <div className="card-actions mt-2">
                                        <Link href="/admin/pets" className="btn btn-primary btn-sm">
                                            Review Pets
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="card bg-[#fffaf2] shadow-md">
                                <div className="card-body">
                                    <h2 className="card-title text-gray-800">Admin Users</h2>
                                    <p className="text-gray-500">View, update or remove admins</p>
                                    <div className="card-actions mt-2">
                                        <Link href="/admin/users" className="btn btn-primary btn-sm">
                                            View Admins
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="card bg-[#fffaf2] shadow-md">
                                <div className="card-body">
                                    <h2 className="card-title text-gray-800">Listers</h2>
                                    <p className="text-gray-500">Logged in as: {dashboard.filterByRole}</p>
                                    <div className="card-actions mt-2">
                                        <Link href="/admin/listers" className="btn btn-outline btn-primary btn-sm">
                                            Manage Listers
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    !error && (
                        <p className="text-center text-gray-500">
                            Loading...
                        </p>
                    )
                )}
            </div>
        </div>
    );
}